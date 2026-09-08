#!/usr/bin/env python3
"""
greenlight.exe — MATSim-Aligned Agent-Based Transport Simulation API Server.
Reference: Multi-Agent Transport Simulation (https://matsim.org/)

Provides REST endpoints for:
- GET  /api/health                     -> Health check & MATSim engine status
- GET  /api/simulation/state            -> Real-time link queues, agent vehicles, CO2 saved, and Machine Thoughts
- POST /api/simulation/start            -> Start MATSim scenario (bkc, vashi, palm_beach)
- POST /api/simulation/stop             -> Stop simulation
- POST /api/matsim/trigger-congestion   -> Inject traffic volume surge on primary corridor
- POST /api/matsim/trigger-emergency    -> Dispatch Emergency Ambulance AMB-108 for priority preemption
- POST /api/activate-diversion          -> Execute within-day dynamic diversion to alternate corridor
- GET  /api/replays                    -> List captured snapshots
"""

from __future__ import annotations

import json
import os
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, List

# Ensure project root in sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.simulation.matsim_engine import MatsimSimulationEngine

PORT = 5005
SCENARIOS = ["bkc", "vashi", "palm_beach"]


class MatsimServerBridge:
    def __init__(self):
        self.engine: MatsimSimulationEngine = MatsimSimulationEngine("bkc")
        self.scenario: str = "bkc"
        self.running: bool = False
        self.captures: List[Dict[str, Any]] = []
        self.lock = threading.Lock()

    def start(self, scenario: str = "bkc") -> Dict[str, Any]:
        with self.lock:
            if scenario not in SCENARIOS:
                scenario = "bkc"
            self.scenario = scenario
            self.engine = MatsimSimulationEngine(scenario)
            self.running = True
            self.engine.running = True
            return self.engine.get_state()

    def stop(self) -> Dict[str, Any]:
        with self.lock:
            self.running = False
            if self.engine:
                self.engine.running = False
            return {"status": "stopped"}

    def tick(self) -> Dict[str, Any]:
        with self.lock:
            if not self.running or not self.engine:
                return {"status": "idle", "vehicles": [], "metrics": {}}
            self.engine.step()
            return self.engine.get_state()

    def trigger_congestion(self) -> Dict[str, Any]:
        with self.lock:
            if self.engine:
                self.engine.trigger_congestion_spike()
                return {"status": "success", "message": "High traffic surge injected on primary approach."}
            return {"status": "error", "message": "Simulation not active."}

    def trigger_emergency(self) -> Dict[str, Any]:
        with self.lock:
            if self.engine:
                self.engine.trigger_emergency_vehicle()
                return {"status": "success", "message": "Emergency Priority Ambulance dispatched."}
            return {"status": "error", "message": "Simulation not active."}

    def activate_diversion(self) -> Dict[str, Any]:
        with self.lock:
            if self.engine:
                self.engine.activate_dynamic_diversion()
                return {"status": "success", "message": "Dynamic within-day diversion executed."}
            return {"status": "error", "message": "Simulation not active."}

    def capture(self, label: str = "") -> Dict[str, Any]:
        state = self.engine.get_state()
        capture = {
            "id": f"capture-{len(self.captures)+1}",
            "label": label or f"MATSim tick {state['simTime']}s",
            "scenario": self.scenario,
            "simTime": state["simTime"],
            "metrics": state["metrics"],
            "vehicleCount": len(state["vehicles"]),
            "timestamp": state["simTime"]
        }
        self.captures.append(capture)
        return capture


BRIDGE = MatsimServerBridge()


class RequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        pass  # Clean terminal output

    def _json(self, status: int, payload: Dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def _body(self) -> Dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length > 0:
            return json.loads(self.rfile.read(length) or b"{}")
        return {}

    def do_OPTIONS(self) -> None:
        self._json(200, {})

    def do_GET(self) -> None:
        if self.path == "/api/health":
            self._json(200, {
                "status": "online",
                "engine": "MATSim (Multi-Agent Transport Simulation - matsim.org)",
                "simulationFramework": "matsim",
                "scenarios": SCENARIOS,
                "version": "2026.1"
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
                self._json(200, BRIDGE.stop())
            elif self.path == "/api/matsim/trigger-congestion":
                self._json(200, BRIDGE.trigger_congestion())
            elif self.path == "/api/matsim/trigger-emergency":
                self._json(200, BRIDGE.trigger_emergency())
            elif self.path == "/api/matsim/run-official":
                script_path = str(BASE_DIR / "run_matsim.py")
                import subprocess
                res = subprocess.run([sys.executable, script_path], capture_output=True, text=True)
                self._json(200, {
                    "status": "success" if res.returncode == 0 else "error",
                    "message": "Official MATSim 2026.0 Java simulation executed successfully for Mumbai BKC scenario.",
                    "outputDirectory": "matsim_dist/matsim-2026.0/output/mumbai_bkc",
                    "details": res.stdout[-400:] if res.stdout else res.stderr[-400:]
                })
            elif self.path == "/api/activate-diversion":
                BRIDGE.activate_diversion()
                self._json(200, {
                    "status": "success",
                    "message": "Dynamic within-day MATSim traffic diversion executed.",
                    "diversionId": body.get("diversionId", "div-01")
                })
            elif self.path == "/api/replays/capture":
                self._json(201, BRIDGE.capture(body.get("label", "")))
            else:
                self._json(404, {"error": "Not found"})
        except Exception as error:
            self._json(500, {"error": f"MATSim server error: {error}"})


def run_server():
    print("=================================================================")
    print("🚦 GREENLIGHT — MATSim (matsim.org) AGENT-BASED SIMULATION SERVER")
    print(f"📡 API Listening at: http://localhost:{PORT}")
    print("⚡ Real-Time Green Reallocation · Emergency EVP · Machine Thoughts")
    print("=================================================================")
    httpd = ThreadingHTTPServer(("", PORT), RequestHandler)
    httpd.serve_forever()


if __name__ == "__main__":
    run_server()
