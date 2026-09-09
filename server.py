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

# Environment-based configuration
PORT = int(os.environ.get("PORT", "5005"))
HOST = os.environ.get("HOST", "127.0.0.1")
MAX_PAYLOAD_BYTES = int(os.environ.get("MAX_PAYLOAD_BYTES", str(1024 * 1024)))  # 1MB limit
MAX_CAPTURES_BUFFER = 100

# CORS Allowed Origins
RAW_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173")
ALLOWED_ORIGINS = {origin.strip() for origin in RAW_ORIGINS.split(",") if origin.strip()}

# Optional server-side API auth token for sensitive control commands
API_AUTH_TOKEN = os.environ.get("API_AUTH_TOKEN", "")

SCENARIOS = ["bkc", "vashi", "palm_beach", "dadar", "weh", "lbs_metro"]


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
        with self.lock:
            state = self.engine.get_state()
            clean_label = str(label)[:100].strip() or f"MATSim tick {state['simTime']}s"
            capture = {
                "id": f"capture-{len(self.captures)+1}",
                "label": clean_label,
                "scenario": self.scenario,
                "simTime": state["simTime"],
                "metrics": state["metrics"],
                "vehicleCount": len(state["vehicles"]),
                "timestamp": state["simTime"]
            }
            if len(self.captures) >= MAX_CAPTURES_BUFFER:
                self.captures.pop(0)
            self.captures.append(capture)
            return capture


BRIDGE = MatsimServerBridge()


class RequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        pass  # Clean terminal output

    def _get_allowed_origin(self) -> str:
        origin = self.headers.get("Origin", "")
        if not origin:
            return ""
        if origin in ALLOWED_ORIGINS:
            return origin
        if origin.startswith("http://localhost:") or origin.startswith("http://127.0.0.1:"):
            return origin
        return ""

    def _json(self, status: int, payload: Dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        allowed_origin = self._get_allowed_origin()
        if allowed_origin:
            self.send_header("Access-Control-Allow-Origin", allowed_origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.end_headers()
        self.wfile.write(body)

    def _body(self) -> Dict[str, Any]:
        length_header = self.headers.get("Content-Length", "0")
        try:
            length = int(length_header)
        except ValueError:
            raise ValueError("Invalid Content-Length header")

        if length < 0:
            raise ValueError("Negative Content-Length header")
        if length > MAX_PAYLOAD_BYTES:
            raise ValueError(f"Payload exceeds limit of {MAX_PAYLOAD_BYTES} bytes")

        if length > 0:
            raw_bytes = self.rfile.read(length)
            try:
                return json.loads(raw_bytes.decode("utf-8") or "{}")
            except Exception as e:
                raise ValueError(f"Malformed JSON payload: {e}")
        return {}

    def _is_authorized(self) -> bool:
        if not API_AUTH_TOKEN:
            return True
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
            return token == API_AUTH_TOKEN
        return False

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
            self._json(200, {"captures": list(BRIDGE.captures)})
        else:
            self._json(404, {"error": "Endpoint not found"})

    def do_POST(self) -> None:
        try:
            body = self._body()
        except ValueError as val_err:
            status_code = 413 if "exceeds limit" in str(val_err) else 400
            self._json(status_code, {"error": str(val_err)})
            return

        # Check authorization for control actions if token configured
        privileged_endpoints = {
            "/api/simulation/start",
            "/api/simulation/stop",
            "/api/matsim/trigger-congestion",
            "/api/matsim/trigger-emergency",
            "/api/activate-diversion",
            "/api/matsim/run-official"
        }
        if self.path in privileged_endpoints and not self._is_authorized():
            self._json(401, {"error": "Unauthorized: Invalid or missing API bearer token"})
            return

        try:
            if self.path == "/api/simulation/start":
                req_scenario = str(body.get("scenario", "bkc")).strip().lower()
                self._json(200, BRIDGE.start(req_scenario))
            elif self.path == "/api/simulation/stop":
                self._json(200, BRIDGE.stop())
            elif self.path == "/api/matsim/trigger-congestion":
                self._json(200, BRIDGE.trigger_congestion())
            elif self.path == "/api/matsim/trigger-emergency":
                self._json(200, BRIDGE.trigger_emergency())
            elif self.path == "/api/matsim/run-official":
                script_path = str(BASE_DIR / "run_matsim.py")
                import subprocess
                try:
                    res = subprocess.run(
                        [sys.executable, script_path],
                        capture_output=True,
                        text=True,
                        timeout=30
                    )
                    self._json(200, {
                        "status": "success" if res.returncode == 0 else "error",
                        "message": "Official MATSim 2026.0 Java simulation executed for Mumbai BKC scenario.",
                        "outputDirectory": "matsim_dist/matsim-2026.0/output/mumbai_bkc",
                        "details": res.stdout[-400:] if res.stdout else res.stderr[-400:]
                    })
                except subprocess.TimeoutExpired:
                    self._json(504, {"error": "MATSim execution timed out after 30 seconds."})
            elif self.path == "/api/activate-diversion":
                BRIDGE.activate_diversion()
                diversion_id = str(body.get("diversionId", "div-01"))[:50]
                self._json(200, {
                    "status": "success",
                    "message": "Dynamic within-day MATSim traffic diversion executed.",
                    "diversionId": diversion_id
                })
            elif self.path == "/api/replays/capture":
                label_val = str(body.get("label", ""))[:100]
                self._json(201, BRIDGE.capture(label_val))
            else:
                self._json(404, {"error": "Endpoint not found"})
        except Exception as error:
            self._json(500, {"error": f"Internal server error: {error}"})


def run_server():
    print("=================================================================")
    print("🚦 GREENLIGHT — MATSim (matsim.org) AGENT-BASED SIMULATION SERVER")
    print(f"📡 API Listening at: http://{HOST}:{PORT}")
    print("⚡ Real-Time Green Reallocation · Emergency EVP · Machine Thoughts")
    print("=================================================================")
    httpd = ThreadingHTTPServer((HOST, PORT), RequestHandler)
    httpd.serve_forever()


if __name__ == "__main__":
    run_server()
