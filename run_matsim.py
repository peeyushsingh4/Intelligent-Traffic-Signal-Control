#!/usr/bin/env python3
"""
Official MATSim (matsim.org) Runner for Mumbai Traffic Scenarios.
Executes the compiled MATSim 2026.0 framework via Java.
"""

import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MATSIM_DIR = BASE_DIR / "matsim_dist" / "matsim-2026.0"
MATSIM_JAR = MATSIM_DIR / "matsim-2026.0.jar"
CONFIG_FILE = BASE_DIR / "matsim_dist" / "scenarios" / "mumbai" / "bkc_config.xml"

def run_official_matsim():
    print("=================================================================")
    print("🚦 LAUNCHING OFFICIAL MATSim FRAMEWORK (https://matsim.org/)")
    print(f"📦 MATSim JAR: {MATSIM_JAR}")
    print(f"⚙️ Config File: {CONFIG_FILE}")
    print("=================================================================")

    if not MATSIM_JAR.exists():
        print(f"Error: MATSim JAR not found at {MATSIM_JAR}")
        sys.exit(1)

    cmd = [
        "java",
        "-cp", f"matsim-2026.0.jar:libs/*",
        "org.matsim.core.controler.Controler",
        str(CONFIG_FILE)
    ]

    print(f"Running command: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=str(MATSIM_DIR))
    if result.returncode == 0:
        print("\n✅ OFFICIAL MATSim SIMULATION COMPLETED SUCCESSFULLY!")
        print(f"📊 Output generated in: {MATSIM_DIR / 'output' / 'mumbai_bkc'}")
    else:
        print(f"\n❌ MATSim process exited with code {result.returncode}")

if __name__ == "__main__":
    run_official_matsim()
