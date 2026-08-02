#!/usr/bin/env python3
"""
Bridge Backend HTTP Server for greenlight.exe
Connects the Web Application's "1-Click Activate Diversion" button directly to the macOS SUMO-GUI Graphical Window.
"""

import os
import sys
import json
import subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 5005
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class DiversionRequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_POST(self):
        if self.path in ["/api/activate-diversion", "/api/launch-sumo-gui"]:
            print("\n  ⚡ [API RECEIVED] 1-Click Diversion Triggered from Web Application!")
            print("  🖥️ Launching SUMO-GUI Graphical Window on macOS Screen...")

            # Launch demo_diversion_gui.py as a subprocess
            cmd = [sys.executable, os.path.join(BASE_DIR, "demo_diversion_gui.py")]
            subprocess.Popen(cmd, cwd=BASE_DIR)

            response_data = {
                "status": "SUCCESS",
                "message": "SUMO-GUI Graphical Simulation Launched Successfully on Screen!",
                "diversionRoute": "LBS Marg & Eastern Expressway Detour",
                "vmsMessage": "HEAVY QUEUE WEH. DIVERSION: USE LBS MARG & EASTERN EXPWY. SAVINGS 24 MINS."
            }

            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == "/api/health":
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ONLINE", "sumoHome": os.getenv("SUMO_HOME", "OK")}).encode("utf-8"))

def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, DiversionRequestHandler)
    print("=" * 75)
    print(f"  🟢 GREENLIGHT BRIDGE API SERVER ONLINE: http://localhost:{PORT}")
    print("  Listening for Web Application 1-Click Diversion Activation...")
    print("=" * 75)
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()
