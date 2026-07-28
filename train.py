#!/usr/bin/env python3
"""
Training Pipeline — Intelligent Traffic Signal Control System.

Trains ML prediction models and RL control agents.

Usage:
    # Train ML models
    python train.py --model xgboost --data results/traffic_data_medium.csv
    python train.py --model lstm --data results/traffic_data_medium.csv

    # Train RL agents
    python train.py --agent q_learning --scenario medium --episodes 100
    python train.py --agent dqn --scenario medium --episodes 100
    python train.py --agent ppo --scenario medium --episodes 100
"""

import argparse
import os
import sys
import time
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import config, TRAFFIC_SCENARIOS


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="Training Pipeline")

    # ML model training
    parser.add_argument("--model", type=str, choices=["xgboost", "lstm"],
                        help="ML model to train")
    parser.add_argument("--data", type=str, help="Path to training data CSV")

    # RL agent training
    parser.add_argument("--agent", type=str,
                        choices=["q_learning", "dqn", "ppo"],
                        help="RL agent to train")
    parser.add_argument("--scenario", type=str,
                        choices=list(TRAFFIC_SCENARIOS.keys()),
                        default="medium",
                        help="Traffic scenario for RL training")
    parser.add_argument("--episodes", type=int, default=100,
                        help="Number of training episodes")

    # Common options
    parser.add_argument("--gui", action="store_true",
                        help="Use SUMO GUI during training")
    parser.add_argument("--evp", action="store_true", default=True,
                        help="Enable EVP during RL training")

    return parser.parse_args()


# =========================================================================
# ML MODEL TRAINING
# =========================================================================

def train_xgboost(data_path: str):
    """Train XGBoost traffic prediction model."""
    from src.ml.xgboost_predictor import TrafficPredictorXGBoost
    from src.ml.data_collector import TrafficDataCollector
    import pandas as pd

    print(f"\n{'='*60}")
    print(f"  Training XGBoost Traffic Predictor")
    print(f"  Data: {data_path}")
    print(f"{'='*60}\n")

    # Load data
    df = pd.read_csv(data_path)
    print(f"  Loaded {len(df)} samples")

    # Initialize and train
    predictor = TrafficPredictorXGBoost(
        n_estimators=config.ml.xgb_n_estimators,
        max_depth=config.ml.xgb_max_depth,
        learning_rate=config.ml.xgb_learning_rate,
    )

    # Prepare features
    X, y = predictor.prepare_features(df, target_col=config.ml.target_column,
                                       horizon=config.ml.prediction_horizon)
    print(f"  Features shape: {X.shape}")
    print(f"  Target shape:   {y.shape}")

    # Train/test split
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=config.ml.test_size, random_state=42
    )

    # Train
    print("\n  Training...")
    start_time = time.time()
    predictor.train(X_train, y_train)
    train_time = time.time() - start_time
    print(f"  Training time: {train_time:.2f}s")

    # Evaluate
    metrics = predictor.evaluate(X_test, y_test)
    print(f"\n  📊 Evaluation Results:")
    print(f"     MAE:  {metrics['mae']:.4f}")
    print(f"     RMSE: {metrics['rmse']:.4f}")
    print(f"     R²:   {metrics['r2']:.4f}")

    # Feature importance
    importance = predictor.feature_importance()
    print(f"\n  📋 Top Features:")
    for feat, imp in sorted(importance.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"     {feat}: {imp:.4f}")

    # Save model
    os.makedirs(config.ml.model_dir, exist_ok=True)
    model_path = os.path.join(config.ml.model_dir, "xgboost_model.json")
    predictor.save_model(model_path)
    print(f"\n  ✅ Model saved to {model_path}")

    return metrics


def train_lstm(data_path: str):
    """Train LSTM traffic prediction model."""
    from src.ml.lstm_predictor import TrafficPredictorLSTM
    import pandas as pd

    print(f"\n{'='*60}")
    print(f"  Training LSTM Traffic Predictor")
    print(f"  Data: {data_path}")
    print(f"{'='*60}\n")

    # Load data
    df = pd.read_csv(data_path)
    print(f"  Loaded {len(df)} samples")

    # Initialize
    predictor = TrafficPredictorLSTM(
        input_size=len(config.ml.feature_columns),
        hidden_size=config.ml.lstm_hidden_size,
        num_layers=config.ml.lstm_num_layers,
        dropout=config.ml.lstm_dropout,
    )

    # Prepare sequences
    train_loader, test_loader = predictor.prepare_sequences(
        df,
        feature_cols=config.ml.feature_columns,
        target_col=config.ml.target_column,
        window_size=config.ml.lstm_window_size,
        batch_size=config.ml.lstm_batch_size,
        test_size=config.ml.test_size,
    )
    print(f"  Training batches: {len(train_loader)}")
    print(f"  Test batches:     {len(test_loader)}")

    # Train
    print("\n  Training...")
    start_time = time.time()
    losses = predictor.train(
        train_loader,
        epochs=config.ml.lstm_epochs,
        lr=config.ml.lstm_learning_rate,
    )
    train_time = time.time() - start_time
    print(f"  Training time: {train_time:.2f}s")
    print(f"  Final loss:    {losses[-1]:.6f}")

    # Evaluate
    metrics = predictor.evaluate(test_loader)
    print(f"\n  📊 Evaluation Results:")
    print(f"     MAE:  {metrics['mae']:.4f}")
    print(f"     RMSE: {metrics['rmse']:.4f}")
    print(f"     R²:   {metrics['r2']:.4f}")

    # Save model
    os.makedirs(config.ml.model_dir, exist_ok=True)
    model_path = os.path.join(config.ml.model_dir, "lstm_model.pth")
    predictor.save_model(model_path)
    print(f"\n  ✅ Model saved to {model_path}")

    return metrics


# =========================================================================
# RL AGENT TRAINING
# =========================================================================

def train_rl_agent(agent_type: str, scenario_key: str, n_episodes: int,
                   enable_evp: bool = True, gui: bool = False):
    """
    Train an RL agent for traffic signal control.

    Args:
        agent_type: One of 'q_learning', 'dqn', 'ppo'
        scenario_key: Traffic scenario key
        n_episodes: Number of training episodes
        enable_evp: Enable Emergency Vehicle Priority
        gui: Use SUMO GUI
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
    print(f"  Training {agent_type.upper()} Agent")
    print(f"  Scenario: {scenario['name']}")
    print(f"  Episodes: {n_episodes}")
    print(f"  EVP: {'Enabled' if enable_evp else 'Disabled'}")
    print(f"{'='*60}\n")

    # Configure
    config.sumo.config_file = scenario["config"]
    config.sumo.sumo_binary = "sumo-gui" if gui else "sumo"

    # Initialize RL agent
    agent = _create_agent(agent_type, config)

    # Initialize components
    state_processor = StateProcessor(config)
    reward_calculator = RewardCalculator(
        alpha=config.rl.alpha,
        beta=config.rl.beta,
        gamma=config.rl.gamma_reward,
        delta=config.rl.delta,
    )

    # Training loop
    episode_rewards = []
    episode_metrics = []

    for episode in range(n_episodes):
        # Fresh components per episode
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

        env = SumoEnvironment(
            config.sumo,
            emission_tracker=emission_tracker,
            ev_detector=ev_detector,
        )

        total_reward = 0.0
        step = 0

        try:
            env.reset()

            while env.is_running():
                # Handle preemption
                if preemption:
                    preemption.check_and_preempt()
                    if preemption.is_active:
                        env.step()
                        emission_tracker.collect()
                        preemption.check_clearance()
                        step += 1
                        continue

                # RL control loop
                state = state_processor.get_state(env, ev_detector, preemption)

                # Choose action
                action = agent.choose_action(state)

                # Execute action
                _execute_action_training(action, signal_controller, config)

                # Step simulation (multiple steps per decision for stability)
                for _ in range(5):  # 5 steps = 2.5 seconds decision interval
                    if not env.is_running():
                        break
                    env.step()
                    emission_tracker.collect()
                    step += 1

                # Get next state
                next_state = state_processor.get_state(env, ev_detector, preemption)

                # Calculate reward
                reward = reward_calculator.calculate(
                    waiting_times=env.get_waiting_times(),
                    queue_lengths=env.get_queue_lengths(),
                    throughput=env.get_throughput(),
                    ev_waiting_time=env.get_ev_waiting_time() if enable_evp else 0.0,
                )

                # Store transition and learn
                done = not env.is_running()

                if agent_type == "q_learning":
                    agent.update(state, action, reward, next_state)
                elif agent_type == "dqn":
                    agent.store_transition(state, action, reward, next_state, done)
                    agent.learn()
                elif agent_type == "ppo":
                    log_prob = agent.last_log_prob
                    value = agent.last_value
                    agent.store_transition(state, action, reward, log_prob, value, done)

                total_reward += reward

            # PPO: learn at end of episode
            if agent_type == "ppo":
                agent.learn()

        finally:
            env.close()

        # Decay exploration
        if hasattr(agent, "decay_epsilon"):
            agent.decay_epsilon()

        episode_rewards.append(total_reward)

        # Log progress
        avg_reward = np.mean(episode_rewards[-10:])
        epsilon = getattr(agent, "epsilon", 0.0)
        print(
            f"  Episode {episode + 1:3d}/{n_episodes} | "
            f"Reward: {total_reward:8.1f} | "
            f"Avg(10): {avg_reward:8.1f} | "
            f"ε: {epsilon:.3f} | "
            f"CO₂: {emission_tracker.total_co2_kg:.2f} kg"
        )

    # Save trained agent
    os.makedirs(config.rl.model_dir, exist_ok=True)
    model_path = _get_model_path(agent_type, config)
    agent.save(model_path)
    print(f"\n  ✅ Agent saved to {model_path}")

    # Save training rewards
    rewards_path = os.path.join(config.results_dir, f"training_rewards_{agent_type}.npy")
    np.save(rewards_path, np.array(episode_rewards))
    print(f"  ✅ Training rewards saved to {rewards_path}")

    # Plot training curve
    try:
        from src.visualization.plots import TrafficVisualizer
        viz = TrafficVisualizer(config.viz)
        viz.plot_training_rewards(
            episode_rewards,
            title=f"{agent_type.upper()} Training Progress",
        )
        plot_path = os.path.join(config.viz.output_dir, f"training_{agent_type}.png")
        viz.save_all_plots(config.viz.output_dir)
        print(f"  ✅ Training plot saved")
    except Exception as e:
        print(f"  ⚠ Could not save plot: {e}")

    return episode_rewards


def _create_agent(agent_type: str, cfg):
    """Create a fresh RL agent."""
    if agent_type == "q_learning":
        from src.rl.q_learning import QLearningAgent
        return QLearningAgent(
            state_dim=cfg.rl.state_dim,
            action_dim=cfg.rl.action_dim,
            alpha=cfg.rl.ql_alpha,
            gamma=cfg.rl.ql_gamma,
            epsilon=cfg.rl.ql_epsilon,
            epsilon_decay=cfg.rl.ql_epsilon_decay,
            epsilon_min=cfg.rl.ql_epsilon_min,
            n_bins=cfg.rl.ql_n_bins,
        )
    elif agent_type == "dqn":
        from src.rl.dqn_agent import DQNAgent
        return DQNAgent(
            state_dim=cfg.rl.state_dim,
            action_dim=cfg.rl.action_dim,
            lr=cfg.rl.dqn_learning_rate,
            gamma=cfg.rl.dqn_gamma,
            epsilon=cfg.rl.dqn_epsilon,
            epsilon_decay=cfg.rl.dqn_epsilon_decay,
            epsilon_min=cfg.rl.dqn_epsilon_min,
            batch_size=cfg.rl.dqn_batch_size,
            buffer_size=cfg.rl.dqn_buffer_size,
            target_update_freq=cfg.rl.dqn_target_update_freq,
        )
    elif agent_type == "ppo":
        from src.rl.ppo_agent import PPOAgent
        return PPOAgent(
            state_dim=cfg.rl.state_dim,
            action_dim=cfg.rl.action_dim,
            lr_actor=cfg.rl.ppo_lr_actor,
            lr_critic=cfg.rl.ppo_lr_critic,
            gamma=cfg.rl.ppo_gamma,
            gae_lambda=cfg.rl.ppo_gae_lambda,
            epsilon_clip=cfg.rl.ppo_epsilon_clip,
            k_epochs=cfg.rl.ppo_k_epochs,
        )
    else:
        raise ValueError(f"Unknown agent type: {agent_type}")


def _get_model_path(agent_type: str, cfg) -> str:
    """Get model save path for an agent type."""
    paths = {
        "q_learning": os.path.join(cfg.rl.model_dir, "q_learning.pkl"),
        "dqn": os.path.join(cfg.rl.model_dir, "dqn_model.pth"),
        "ppo": os.path.join(cfg.rl.model_dir, "ppo_model.pth"),
    }
    return paths[agent_type]


def _execute_action_training(action: int, signal_controller, cfg):
    """Execute an RL action on the traffic signal during training."""
    if action == 0:
        pass  # Keep current phase
    elif action == 1:
        signal_controller.set_phase(cfg.signal.NS_GREEN)
    elif action == 2:
        signal_controller.set_phase(cfg.signal.EW_GREEN)
    elif action == 3:
        current_duration = signal_controller.get_phase_duration()
        new_duration = min(current_duration + 5.0, cfg.signal.max_green)
        signal_controller.set_phase_duration(new_duration)


def main():
    """Main training entry point."""
    args = parse_args()
    config.ensure_directories()

    if args.model:
        # ML model training
        if not args.data:
            print("Error: --data is required for ML model training.")
            print("First collect data: python main.py --mode collect --scenario medium")
            sys.exit(1)

        if args.model == "xgboost":
            train_xgboost(args.data)
        elif args.model == "lstm":
            train_lstm(args.data)

    elif args.agent:
        # RL agent training
        train_rl_agent(
            agent_type=args.agent,
            scenario_key=args.scenario,
            n_episodes=args.episodes,
            enable_evp=args.evp,
            gui=args.gui,
        )
    else:
        print("Please specify --model or --agent. Use --help for options.")
        sys.exit(1)


if __name__ == "__main__":
    main()
