#!/usr/bin/env python3
"""
Interactive SUMO-GUI Graphical Simulation for Dynamic Traffic Diversion.
Launches the graphical SUMO-GUI window on macOS, demonstrating vehicles queuing on
Western Express Highway (BKC) and dynamic rerouting onto LBS Marg upon 1-click activation.
"""

import os
import sys
import time
import subprocess

# Ensure project root in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

# Set SUMO_HOME environment variable
os.environ["SUMO_HOME"] = os.path.join(BASE_DIR, "venv/lib/python3.14/site-packages/sumo")
sumo_gui_bin = os.path.join(os.environ["SUMO_HOME"], "bin/sumo-gui")

import traci
from src.environment.weather_road import WeatherRoadController

def run_sumo_gui_diversion(location="bkc"):
    config_path = os.path.join(BASE_DIR, f"simulation/config/{location}_mumbai.sumocfg")
    gui_settings_path = os.path.join(BASE_DIR, "simulation/config/gui_settings.xml")

    print("=" * 75)
    print("  🚀 LAUNCHING SUMO-GUI GRAPHICAL SIMULATION ON macOS SCREEN")
    print(f"  🌆 Location: {location.upper()} Junction (Mumbai)")
    print("  ⚡ Feature: 1-Click AI Traffic Diversion & Dynamic TraCI Rerouting")
    print("=" * 75)

    sumo_cmd = [
        sumo_gui_bin,
        "-c", config_path,
        "-g", gui_settings_path,
        "--start", "true",
        "--quit-on-end", "false",
        "--step-length", "0.2"
    ]

    try:
        traci.start(sumo_cmd)
        weather_controller = WeatherRoadController()
        
        step = 0
        diversion_activated = False

        while traci.simulation.getMinExpectedNumber() > 0 and step < 1200:
            traci.simulationStep()
            step += 1
            time.sleep(0.02) # Smooth 50 FPS animation step in GUI

            # Step 100: Incident & Waterlogging on primary approach A0B0
            if step == 100:
                print("\n  🚨 [GUI SIMULATION] Incident & Waterlogging on Primary Corridor 'A0B0'")
                weather_controller.apply_waterlogging("A0B0_1")

            # Step 200: Trigger AI Diversion
            if step == 200 and not diversion_activated:
                diversion_activated = True
                print("\n  ⚡ [GUI SIMULATION] 1-CLICK DIVERSION ACTIVATED!")
                print("  🔀 Coloring rerouted vehicles (YELLOW) & dispatching to LBS Marg...")

                for veh_id in traci.vehicle.getIDList():
                    try:
                        # Highlight rerouted vehicles in bright yellow/amber in SUMO-GUI
                        traci.vehicle.setColor(veh_id, (245, 158, 11, 255))
                        traci.vehicle.rerouteTraveltime(veh_id)
                    except (traci.exceptions.TraCIException, traci.exceptions.FatalTraCIError):
                        pass

    except Exception as e:
        print(f"  ⚠ SUMO-GUI Window Status: {e}")
    finally:
        try:
            traci.close()
        except Exception:
            pass

if __name__ == "__main__":
    run_sumo_gui_diversion("bkc")
