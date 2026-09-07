#!/usr/bin/env python3
"""
Official MATSim (matsim.org) Java Runner for Mumbai Scenarios.
Executes the official MATSim multi-agent simulation framework via Java 25.
"""

import os
import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MATSIM_CORE = BASE_DIR / "matsim-core"
CONFIG_FILE = MATSIM_CORE / "scenarios" / "mumbai" / "bkc_config.xml"

def run_matsim():
    print("================================================================")
    print("🚀 LAUNCHING OFFICIAL MATSim FRAMEWORK (https://matsim.org/)")
    print(f"📁 Working Directory: {MATSIM_CORE}")
    print(f"⚙️ Config File: {CONFIG_FILE}")
    print("================================================================")
    
    if not CONFIG_FILE.exists():
        print(f"Error: Config file not found at {CONFIG_FILE}")
        sys.exit(1)

    # Use Maven wrapper to run MATSim or target jar
    target_jars = list((MATSIM_CORE / "target").glob("*.jar")) if (MATSIM_CORE / "target").exists() else []
    
    if target_jars:
        jar = target_jars[0]
        print(f"Running compiled MATSim JAR: {jar.name}...")
        cmd = ["java", "-jar", str(jar), str(CONFIG_FILE)]
    else:
        print("Running MATSim via Maven Wrapper...")
        cmd = [
            str(MATSIM_CORE / "mvnw"), 
            "compile", 
            "exec:java", 
            f"-Dexec.mainClass=org.matsim.project.RunMatsimModelImplementation",
            f"-Dexec.args={CONFIG_FILE}"
        ]
        
    print(f"Executing: {' '.join(cmd)}")
    process = subprocess.Popen(cmd, cwd=str(MATSIM_CORE))
    try:
        process.wait()
    except KeyboardInterrupt:
        process.terminate()

if __name__ == "__main__":
    run_matsim()
