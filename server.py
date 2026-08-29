#!/usr/bin/env python3
"""Local HTTP bridge between greenlight_app and live SUMO / TraCI simulation runs.

Provides endpoints for:
- GET  /api/health            -> Service health & SUMO availability
- GET  /api/simulation/state   -> Active simulation state & vehicles
- POST /api/simulation/start   -> Start headless simulation
- POST /api/simulation/stop    -> Stop headless simulation
- POST /api/activate-diversion -> Launch interactive SUMO-GUI desktop window
- GET  /api/replays           -> List captured replay snapshots
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import threading
from dataclasses import dataclass, field
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

PORT = 5005
BASE_DIR = Path(__file__).resolve().parent
SCENARIOS = {
    "bkc": "simulation/config/bkc_mumbai.sumocfg",
    "vashi": "simulation/config/vashi_navimumbai.sumocfg",
    "palm_beach": "simulation/config/palm_beach_nerul.sumocfg",
}
INCOMING_EDGES = ("B1B0", "B-1B0", "C0B0", "A0B0")


def find_sumo_home() -> Path | None:
    """Find a SUMO installation in virtualenv, PATH, or OS locations."""
    venv_sumo = BASE_DIR / "venv" / "lib" / f"python{sys.version_info.major}.{sys.version_info.minor}" / "site-packages" / "sumo"
    if venv_sumo.is_dir():
        return venv_sumo

    configured = os.environ.get("SUMO_HOME")
    candidates = [Path(configured)] if configured else []
    candidates += [Path("/opt/homebrew/opt/sumo"), Path("/usr/local/opt/sumo")]
    candidates += [Path(os.environ.get("ProgramFiles", "C:/Program Files")) / "Eclipse" / "Sumo"]
    for home in candidates:
        if (home / "tools").is_dir() or (home / "bin").is_dir():
            return home
    binary = shutil.which("sumo") or shutil.which("sumo.exe")
    if binary:
        return Path(binary).resolve().parent.parent
    return None


SUMO_HOME = find_sumo_home()
if SUMO_HOME:
    os.environ["SUMO_HOME"] = str(SUMO_HOME)
    tools_dir = str(SUMO_HOME / "tools")
    if os.path.isdir(tools_dir) and tools_dir not in sys.path:
        sys.path.insert(0, tools_dir)


@dataclass
class SimulationBridge:
    env: Any = None
    controller: Any = None
    scenario: str = "bkc"
    running: bool = False
    state: dict[str, Any] = field(default_factory=lambda: {"status": "idle", "vehicles": []})
    captures: list[dict[str, Any]] = field(default_factory=list)
    lock: threading.Lock = field(default_factory=threading.Lock)

    def _require_sumo(self) -> None:
        if not SUMO_HOME:
            raise RuntimeError(
                "SUMO was not found. Install SUMO or check python environment."
            )

    def start(self, scenario: str) -> dict[str, Any]:
        if scenario not in SCENARIOS:
            scenario = "bkc"
        self._require_sumo()
        from src.environment.sumo_env import SumoEnvironment
        from src.environment.traffic_signal import TrafficSignalController

        with self.lock:
            self.stop()
            self.scenario = scenario
            cfg_file = str(BASE_DIR / SCENARIOS[scenario])
            self.env = SumoEnvironment(cfg_file, step_length=0.5, junction_id="B0", tls_id="B0")
            self.controller = TrafficSignalController("B0")
            self.env.reset()
            self.running = True
            self.state = self._collect_state()
            return self.state

    def stop(self) -> None:
        self.running = False
        if self.env:
            try:
                self.env.close()
            except Exception:
                pass
        self.env = None
        self.controller = None
        self.state = {"status": "idle", "vehicles": []}
        
        # Safely ensure TraCI default connection is unloaded
        try:
            import traci
            if traci.isLoaded():
                traci.close()
        except Exception:
            pass

    def tick(self) -> dict[str, Any]:
        with self.lock:
            if not self.running or not self.env:
                return self.state
            if not self.env.is_running():
                self.running = False
                self.state = {**self.state, "status": "completed", "message": "SUMO scenario completed."}
                return self.state
            self.env.step()
            self.state = self._collect_state()
            return self.state

    def _collect_state(self) -> dict[str, Any]:
        import traci

        vehicles = []
        total_co2_mg = 0.0
        try:
            for vehicle_id in traci.vehicle.getIDList():
                x, y = traci.vehicle.getPosition(vehicle_id)
                angle = traci.vehicle.getAngle(vehicle_id)
                speed = traci.vehicle.getSpeed(vehicle_id)
                vehicle_type = traci.vehicle.getTypeID(vehicle_id)
                lane = traci.vehicle.getLaneID(vehicle_id)
                total_co2_mg += traci.vehicle.getCO2Emission(vehicle_id)
                vehicles.append({
                    "id": vehicle_id,
                    "type": vehicle_type,
                    "x": round(x, 2), "y": round(y, 2), "heading": round(angle, 1),
                    "speedMps": round(speed, 2), "speedKmh": round(speed * 3.6, 1), "lane": lane,
                })
            queues = {edge: int(traci.edge.getLastStepHaltingNumber(edge)) for edge in INCOMING_EDGES}
            waits = {edge: round(float(traci.edge.getWaitingTime(edge)), 2) for edge in INCOMING_EDGES}
            return {
                "status": "running", "scenario": self.scenario, "simTime": round(self.env.sim_time, 1),
                "vehicles": vehicles, "networkBounds": {"minX": 0, "maxX": 1000, "minY": 0, "maxY": 1000},
                "metrics": {
                    "vehicleCount": len(vehicles), "queueLength": sum(queues.values()),
                    "waitingTimeSeconds": round(sum(waits.values()), 2), "co2MgPerSecond": round(total_co2_mg, 2),
                    "signalPhase": self.controller.get_current_phase() if self.controller else None,
                },
            }
        except Exception:
            return self.state


BRIDGE = SimulationBridge()


class RequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        print("[greenlight bridge]", format % args)

    def _json(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def _body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        return json.loads(self.rfile.read(length) or b"{}")

    def do_OPTIONS(self) -> None:
        self._json(200, {})

    def do_GET(self) -> None:
        if self.path == "/api/health":
            self._json(200, {
                "status": "online",
                "sumoHome": str(SUMO_HOME) if SUMO_HOME else None,
                "sumoAvailable": bool(SUMO_HOME),
                "scenarios": list(SCENARIOS)
            })
        elif self.path == "/api/simulation/state":
            self._json(200, BRIDGE.tick())
        elif self.path == "/api/replays":
            self._json(200, {"captures": BRIDGE.captures})
        else:
            self._json(404, {"error": "Not found"})

    def do_POST(self) -> None:
        try:
            body = self._body()
            if self.path == "/api/simulation/start":
                self._json(200, BRIDGE.start(body.get("scenario", "bkc")))
            elif self.path == "/api/simulation/stop":
                BRIDGE.stop()
                self._json(200, {"status": "stopped"})
            elif self.path == "/api/activate-diversion":
                script_path = str(BASE_DIR / "demo_diversion_gui.py")
                subprocess.Popen([sys.executable, script_path], cwd=str(BASE_DIR))
                self._json(200, {
                    "status": "success",
                    "message": "SUMO-GUI Microscopic Diversion Simulation launched on desktop screen.",
                    "diversionId": body.get("diversionId", "div-01")
                })
            else:
                self._json(404, {"error": "Not found"})
        except (RuntimeError, ValueError) as error:
            self._json(400, {"error": str(error)})
        except Exception as error:
            self._json(500, {"error": f"SUMO bridge failed: {error}"})


def run_server():
    print(f"=====================================================")
    print(f"🚦 GREENLIGHT PYTHON API SERVER & SUMO BRIDGE")
    print(f"📡 Listening at: http://localhost:{PORT}")
    print(f"🔌 SUMO HOME: {SUMO_HOME}")
    print(f"=====================================================")
    httpd = ThreadingHTTPServer(("", PORT), RequestHandler)
    httpd.serve_forever()


if __name__ == "__main__":
    run_server()
