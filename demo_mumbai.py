#!/usr/bin/env python3
"""
Interactive SUMO Presentation Showcase for Mumbai & Navi Mumbai.

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
    parser = argparse.ArgumentParser(description="SUMO Showcase for Mumbai & Navi Mumbai")
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
    parser.add_argument("--gui", action="store_true", default=False,
                        help="Force SUMO-GUI mode (requires X11/XQuartz on macOS)")
    parser.add_argument("--delay", type=float, default=0.01,
                        help="Visualization delay step in seconds")
    return parser.parse_args()


def load_dqn_agent():
    try:
        from src.rl.dqn_agent import DQNAgent
        agent = DQNAgent(state_dim=11, action_dim=4)
        model_path = os.path.join(config.rl.model_dir, "dqn_model.pth")
        if os.path.exists(model_path):
            agent.load(model_path)
            agent.epsilon = 0.0  # Exploitation mode
            print(f"  🧠 Loaded pre-trained Deep RL (DQN) model from {model_path}")
        return agent
    except Exception as e:
        print(f"  ⚠ Fallback to FixedTimeController ({e})")
        return FixedTimeController()


def main():
    args = parse_args()
    loc_info = LOCATIONS[args.location]

    print("=" * 75)
    print(f"  🌆 SUMO SHOWCASE: {loc_info['name'].upper()}")
    print(f"  🌧️ Weather: {args.weather.upper()} | 🚧 Road Hazard: {args.road_condition.upper()}")
    print(f"  🎮 Controller: {args.controller.upper()} | 🚑 EVP: {'ENABLED' if args.evp else 'DISABLED'}")
    print("=" * 75)

    # 1. Initialize SUMO Environment
    env = SumoEnvironment(
        config_or_path=loc_info["sumocfg"],
        use_gui=args.gui,
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

    print("\n🚀 Launching simulation... (Press Ctrl+C to stop)")
    env.reset()

    # Apply Weather
    weather_map = {"clear": "CLEAR", "light_rain": "LIGHT_RAIN", "monsoon": "HEAVY_MONSOON"}
    weather_controller.set_weather(weather_map[args.weather])

    step = 0
    phase_names = {0: "NS Green", 1: "NS Yellow", 2: "EW Green", 3: "EW Yellow"}

    try:
        while env.is_running() and step < 1000:
            step += 1
            current_time = step * 0.5

            # Get 11-dimensional RL state
            state = state_processor.get_state(env, ev_detector, preemption_controller)

            # Apply road hazards dynamically at step 20
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

            # Step simulation
            env.step()

            # Dashboard progress output every 100 steps (50s)
            if step % 100 == 0:
                queues = env.get_queue_lengths()
                total_q = sum(queues.values())
                phase_idx = int(signal_controller.get_current_phase())
                phase_str = phase_names.get(phase_idx, f"Phase {phase_idx}")
                evp_str = "🚑 PREEMPTION ACTIVE" if (preemption_controller and preemption_controller.is_active) else "Normal"

                print(f"  ⏱️ Step {step:4d} ({current_time:5.1f}s) | "
                      f"Signal: {phase_str:<10} | Total Queue: {total_q:2d} veh | "
                      f"EVP: {evp_str}")

            if args.delay > 0:
                time.sleep(args.delay)

    except KeyboardInterrupt:
        print("\n  Demo stopped by user.")
    finally:
        env.close()
        print("\n🎉 Showcase simulation run complete!")


if __name__ == "__main__":
    main()
