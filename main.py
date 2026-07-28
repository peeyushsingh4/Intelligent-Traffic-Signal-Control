#!/usr/bin/env python3
"""
Main Entry Point — Intelligent Traffic Signal Control System.

Usage:
    python main.py --mode collect --scenario medium
    python main.py --mode run --controller fixed --scenario heavy
    python main.py --mode run --controller dqn --scenario emergency
    python main.py --mode demo --scenario emergency

Modes:
    collect  — Run simulation and collect traffic data for ML training
    run      — Run simulation with a specific controller
    demo     — Run with GUI (sumo-gui) to visually demonstrate the system
"""

import argparse
import os
import sys
import time

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import config, TRAFFIC_SCENARIOS


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Intelligent Traffic Signal Control System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py --mode collect --scenario medium
  python main.py --mode run --controller dqn --scenario heavy
  python main.py --mode demo --scenario emergency
        """,
    )

    parser.add_argument(
        "--mode",
        type=str,
        choices=["collect", "run", "demo"],
        required=True,
        help="Operating mode: collect data, run controller, or demo with GUI",
    )

    parser.add_argument(
        "--scenario",
        type=str,
        choices=list(TRAFFIC_SCENARIOS.keys()),
        default="medium",
        help="Traffic scenario to simulate (default: medium)",
    )

    parser.add_argument(
        "--controller",
        type=str,
        choices=["fixed", "q_learning", "dqn", "ppo"],
        default="fixed",
        help="Traffic controller to use (default: fixed)",
    )

    parser.add_argument(
        "--episodes",
        type=int,
        default=1,
        help="Number of episodes to run (default: 1)",
    )

    parser.add_argument(
        "--output",
        type=str,
        default="results",
        help="Output directory for results (default: results)",
    )

    parser.add_argument(
        "--gui",
        action="store_true",
        help="Use SUMO GUI (sumo-gui) instead of headless",
    )

    parser.add_argument(
        "--evp",
        action="store_true",
        default=True,
        help="Enable Emergency Vehicle Priority (default: enabled)",
    )

    parser.add_argument(
        "--no-evp",
        action="store_true",
        help="Disable Emergency Vehicle Priority",
    )

    return parser.parse_args()


def collect_data(scenario_key: str, gui: bool = False):
    """
    Run simulation and collect traffic data for ML model training.

    Args:
        scenario_key: Key from TRAFFIC_SCENARIOS dict
        gui: Whether to use SUMO GUI
    """
    from src.environment.sumo_env import SumoEnvironment
    from src.emissions.tracker import EmissionTracker
    from src.ml.data_collector import TrafficDataCollector

    scenario = TRAFFIC_SCENARIOS[scenario_key]
    print(f"\n{'='*60}")
    print(f"  Data Collection Mode")
    print(f"  Scenario: {scenario['name']} ({scenario['veh_per_hour']} veh/hr)")
    print(f"{'='*60}\n")

    # Configure SUMO
    config.sumo.config_file = scenario["config"]
    config.sumo.sumo_binary = "sumo-gui" if gui else "sumo"

    # Initialize components
    emission_tracker = EmissionTracker(step_length=config.sumo.step_length)
    data_collector = TrafficDataCollector(config)

    # Create environment
    env = SumoEnvironment(config.sumo, emission_tracker=emission_tracker)

    try:
        env.reset()
        step = 0
        print("Collecting data...")

        while env.is_running():
            env.step()
            data_collector.collect_step(step * config.sumo.step_length)
            emission_tracker.collect()
            step += 1

            if step % 1000 == 0:
                print(f"  Step {step} | Time: {step * config.sumo.step_length:.0f}s")

    finally:
        env.close()

    # Save collected data
    os.makedirs(config.results_dir, exist_ok=True)
    csv_path = os.path.join(config.results_dir, f"traffic_data_{scenario_key}.csv")
    data_collector.save_to_csv(csv_path)
    print(f"\n✅ Data saved to {csv_path}")
    print(f"   Total steps collected: {step}")
    print(f"   Total CO₂: {emission_tracker.total_co2_kg:.3f} kg")


def run_simulation(
    scenario_key: str,
    controller_type: str,
    enable_evp: bool = True,
    gui: bool = False,
):
    """
    Run simulation with a specific traffic controller.

    Args:
        scenario_key: Key from TRAFFIC_SCENARIOS dict
        controller_type: One of 'fixed', 'q_learning', 'dqn', 'ppo'
        enable_evp: Whether to enable Emergency Vehicle Priority
        gui: Whether to use SUMO GUI
    """
    from src.environment.sumo_env import SumoEnvironment
    from src.environment.traffic_signal import TrafficSignalController
    from src.emergency.detector import EmergencyVehicleDetector
    from src.emergency.preemption import PreemptionController
    from src.emissions.tracker import EmissionTracker
    from src.rl.state import StateProcessor
    from src.rl.reward import RewardCalculator

    scenario = TRAFFIC_SCENARIOS[scenario_key]
    print(f"\n{'='*60}")
    print(f"  Running Simulation")
    print(f"  Scenario: {scenario['name']}")
    print(f"  Controller: {controller_type.upper()}")
    print(f"  EVP: {'Enabled' if enable_evp else 'Disabled'}")
    print(f"{'='*60}\n")

    # Configure
    config.sumo.config_file = scenario["config"]
    config.sumo.sumo_binary = "sumo-gui" if gui else "sumo"

    # Initialize components
    emission_tracker = EmissionTracker(step_length=config.sumo.step_length)
    ev_detector = EmergencyVehicleDetector(
        junction_position=config.sumo.junction_position,
        approach_edges=config.sumo.approach_edges,
        detection_radius=config.emergency.detection_radius,
    )
    signal_controller = TrafficSignalController(tls_id=config.sumo.tls_id)
    preemption = PreemptionController(
        signal_controller=signal_controller,
        ev_detector=ev_detector,
        config=config.emergency,
    ) if enable_evp else None

    state_processor = StateProcessor(config)
    reward_calculator = RewardCalculator(
        alpha=config.rl.alpha,
        beta=config.rl.beta,
        gamma=config.rl.gamma_reward,
        delta=config.rl.delta,
    )

    # Load controller
    controller = _load_controller(controller_type, config)

    # Create environment
    env = SumoEnvironment(
        config.sumo,
        emission_tracker=emission_tracker,
        ev_detector=ev_detector,
    )

    # Run simulation
    metrics = {
        "total_waiting_time": 0.0,
        "total_queue_length": 0.0,
        "throughput": 0,
        "ev_delays": [],
        "steps": 0,
    }

    try:
        env.reset()
        step = 0

        while env.is_running():
            # Check emergency preemption first
            if preemption:
                preemption.check_and_preempt()
                if preemption.is_active:
                    # During preemption, skip RL control
                    env.step()
                    emission_tracker.collect()
                    preemption.check_clearance()
                    step += 1
                    continue

            # Get state and choose action (RL control)
            state = state_processor.get_state(env, ev_detector, preemption)
            action = controller.choose_action(state)

            # Execute action
            _execute_action(action, signal_controller, config)

            # Step environment
            env.step()
            emission_tracker.collect()
            step += 1

            # Log progress
            if step % 2000 == 0:
                print(
                    f"  Step {step} | "
                    f"CO₂: {emission_tracker.total_co2_kg:.2f} kg | "
                    f"EVP: {'ACTIVE' if preemption and preemption.is_active else 'idle'}"
                )

        metrics["steps"] = step

    finally:
        env.close()

    # Print results
    print(f"\n{'='*60}")
    print(f"  Results — {controller_type.upper()}")
    print(f"{'='*60}")
    print(f"  Total Steps:    {metrics['steps']}")
    print(f"  Total CO₂:      {emission_tracker.total_co2_kg:.3f} kg")
    print(f"  Total Fuel:     {emission_tracker.total_fuel_liters:.3f} liters")
    if preemption:
        pm = preemption.get_preemption_metrics()
        print(f"  EV Preemptions: {pm.get('total_preemptions', 0)}")
        print(f"  Avg EV Delay:   {pm.get('avg_ev_delay', 0):.2f} sec")
    print(f"{'='*60}\n")

    return emission_tracker.get_summary()


def _load_controller(controller_type: str, cfg):
    """Load the appropriate traffic controller."""
    if controller_type == "fixed":
        from src.baselines.fixed_time import FixedTimeController
        return FixedTimeController(
            ns_green=cfg.signal.green_duration,
            ew_green=cfg.signal.green_duration,
            yellow=cfg.signal.yellow_duration,
        )
    elif controller_type == "q_learning":
        from src.rl.q_learning import QLearningAgent
        agent = QLearningAgent(
            state_dim=cfg.rl.state_dim,
            action_dim=cfg.rl.action_dim,
            alpha=cfg.rl.ql_alpha,
            gamma=cfg.rl.ql_gamma,
        )
        model_path = os.path.join(cfg.rl.model_dir, "q_learning.pkl")
        if os.path.exists(model_path):
            agent.load(model_path)
            print(f"  Loaded Q-Learning model from {model_path}")
        return agent
    elif controller_type == "dqn":
        from src.rl.dqn_agent import DQNAgent
        agent = DQNAgent(
            state_dim=cfg.rl.state_dim,
            action_dim=cfg.rl.action_dim,
            lr=cfg.rl.dqn_learning_rate,
            gamma=cfg.rl.dqn_gamma,
        )
        model_path = os.path.join(cfg.rl.model_dir, "dqn_model.pth")
        if os.path.exists(model_path):
            agent.load(model_path)
            print(f"  Loaded DQN model from {model_path}")
        return agent
    elif controller_type == "ppo":
        from src.rl.ppo_agent import PPOAgent
        agent = PPOAgent(
            state_dim=cfg.rl.state_dim,
            action_dim=cfg.rl.action_dim,
            lr_actor=cfg.rl.ppo_lr_actor,
            lr_critic=cfg.rl.ppo_lr_critic,
        )
        model_path = os.path.join(cfg.rl.model_dir, "ppo_model.pth")
        if os.path.exists(model_path):
            agent.load(model_path)
            print(f"  Loaded PPO model from {model_path}")
        return agent
    else:
        raise ValueError(f"Unknown controller type: {controller_type}")


def _execute_action(action: int, signal_controller, cfg):
    """Execute an RL action on the traffic signal."""
    import traci

    if action == 0:
        # Keep current phase — do nothing
        pass
    elif action == 1:
        # Switch to NS green
        signal_controller.set_phase(cfg.signal.NS_GREEN)
    elif action == 2:
        # Switch to EW green
        signal_controller.set_phase(cfg.signal.EW_GREEN)
    elif action == 3:
        # Extend current green by 5 seconds
        current_duration = signal_controller.get_phase_duration()
        new_duration = min(current_duration + 5.0, cfg.signal.max_green)
        signal_controller.set_phase_duration(new_duration)


def main():
    """Main entry point."""
    args = parse_args()

    # Ensure output directories exist
    config.ensure_directories()

    enable_evp = args.evp and not args.no_evp
    gui = args.gui or args.mode == "demo"

    if args.mode == "collect":
        collect_data(args.scenario, gui=gui)

    elif args.mode in ("run", "demo"):
        run_simulation(
            scenario_key=args.scenario,
            controller_type=args.controller,
            enable_evp=enable_evp,
            gui=gui,
        )


if __name__ == "__main__":
    main()
