#!/usr/bin/env python3
"""
Interactive SUMO-GUI Presentation Showcase for Mumbai & Navi Mumbai.

Usage:
  python demo_mumbai.py --location bkc --weather monsoon --evp
  python demo_mumbai.py --location palm_beach --road-condition waterlogged
  python demo_mumbai.py --location vashi --controller dqn
"""

import os
import sys
import argparse
import time
import shutil

# Ensure project root in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.environment.sumo_env import SumoEnvironment
from src.environment.weather_road import WeatherRoadController
from src.emergency.detector import EmergencyVehicleDetector
from src.emergency.preemption import PreemptionController
from src.environment.traffic_signal import TrafficSignalController
from src.baselines.fixed_time import FixedTimeController
from src.rl.state import StateProcessor
from config import config

LOCATIONS = {
    "bkc": {
        "name": "BKC Junction (Bandra East, Mumbai)",
        "sumocfg": "simulation/config/bkc_mumbai.sumocfg",
    },
    "vashi": {
        "name": "Vashi Highway Interchange (Sion-Panvel Hwy, Navi Mumbai)",
        "sumocfg": "simulation/config/vashi_navimumbai.sumocfg",
    },
    "palm_beach": {
        "name": "Palm Beach Road (Nerul, Navi Mumbai)",
        "sumocfg": "simulation/config/palm_beach_nerul.sumocfg",
    }
}


def parse_args():
    parser = argparse.ArgumentParser(description="SUMO-GUI Showcase for Mumbai & Navi Mumbai")
    parser.add_argument("--location", choices=["bkc", "vashi", "palm_beach"], default="bkc",
                        help="Location: bkc (Mumbai), vashi (Navi Mumbai), palm_beach (Navi Mumbai)")
    parser.add_argument("--weather", choices=["clear", "light_rain", "monsoon"], default="monsoon",
                        help="Weather profile: clear, light_rain, monsoon")
    parser.add_argument("--road-condition", choices=["normal", "potholes", "waterlogged", "flooded"], default="normal",
                        help="Road condition hazard")
    parser.add_argument("--controller", choices=["fixed", "dqn"], default="dqn",
                        help="Traffic light controller")
    parser.add_argument("--evp", action="store_true", default=True,
                        help="Enable Emergency Vehicle Priority preemption")
    parser.add_argument("--delay", type=float, default=0.1,
                        help="Visualization delay step in seconds for presentation viewing")
    return parser.parse_args()


def load_dqn_agent():
    try:
        from src.rl.dqn_agent import DQNAgent
        agent = DQNAgent(state_dim=11, action_dim=4)
        model_path = os.path.join(config.rl.model_dir, "dqn_model.pth")
        if os.path.exists(model_path):
            agent.load(model_path)
            agent.epsilon = 0.0  # Greedy exploitation mode
            print(f"  🧠 Loaded pre-trained Deep RL (DQN) model from {model_path}")
        return agent
    except Exception as e:
        print(f"  ⚠ Fallback to FixedTimeController ({e})")
        return FixedTimeController()


def main():
    args = parse_args()
    loc_info = LOCATIONS[args.location]

    print("=" * 75)
    print(f"  🌆 SUMO-GUI SHOWCASE: {loc_info['name'].upper()}")
    print(f"  🌧️ Weather: {args.weather.upper()} | 🚧 Road Hazard: {args.road_condition.upper()}")
    print(f"  🎮 Controller: {args.controller.upper()} | 🚑 EVP: {'ENABLED' if args.evp else 'DISABLED'}")
    print("=" * 75)

    # 1. Initialize SUMO GUI Environment
    env = SumoEnvironment(
        config_or_path=loc_info["sumocfg"],
        use_gui=True,
        step_length=0.5,
        junction_id="B0",
        tls_id="B0"
    )

    state_processor = StateProcessor(config)
    weather_controller = WeatherRoadController()
    signal_controller = TrafficSignalController(tls_id="B0")

    ev_detector = EmergencyVehicleDetector(
        junction_position=(500.0, 500.0),
        detection_radius=200.0
    ) if args.evp else None

    preemption_controller = PreemptionController(
        signal_controller=signal_controller,
        ev_detector=ev_detector
    ) if args.evp else None

    # Load agent
    if args.controller == "dqn":
        agent = load_dqn_agent()
    else:
        agent = FixedTimeController()

    print("\n🚀 Starting SUMO-GUI... (Close GUI window to finish demo)")
    state = env.reset()

    # Apply Weather
    weather_map = {"clear": "CLEAR", "light_rain": "LIGHT_RAIN", "monsoon": "HEAVY_MONSOON"}
    weather_controller.set_weather(weather_map[args.weather])

    # Apply Road Hazards after step 10
    step = 0

    try:
        while env.is_running():
            step += 1
            current_time = step * 0.5

            # Apply hazards dynamically
            if step == 20:
                if args.road_condition == "potholes":
                    weather_controller.apply_potholes("A0B0_0", max_speed_kmh=15.0)
                elif args.road_condition == "waterlogged":
                    weather_controller.apply_waterlogging("C0B0_0")
                elif args.road_condition == "flooded":
                    weather_controller.apply_flood_road_closure("A0B0")

            # EVP Check
            if args.evp and preemption_controller:
                preemption_controller.check_and_preempt(current_time)
                preemption_controller.check_clearance(current_time)

            # Signal Control Action (if not preempted)
            if not (args.evp and preemption_controller and preemption_controller.is_active):
                if hasattr(agent, 'choose_action'):
                    action = agent.choose_action(state)
                else:
                    action = agent.get_action(int(current_time))
                signal_controller.apply_action(action)

            # Advance simulation step
            state = env.step()

            # Presentation viewing pace
            if args.delay > 0:
                time.sleep(args.delay)

    except KeyboardInterrupt:
        print("\n  Demo stopped by user.")
    finally:
        env.close()
        print("\n✅ Demo session closed.")


if __name__ == "__main__":
    main()
