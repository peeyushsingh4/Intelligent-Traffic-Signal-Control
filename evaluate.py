#!/usr/bin/env python3
"""
Evaluation & Comparison Pipeline — Intelligent Traffic Signal Control System.

Runs all control methods on all traffic scenarios and generates comparison reports.

Usage:
    # Evaluate a single method on a scenario
    python evaluate.py --controller dqn --scenario heavy

    # Compare all methods on all scenarios
    python evaluate.py --compare-all

    # Generate emission analysis report
    python evaluate.py --emission-report

    # Full evaluation: all methods, all scenarios, all reports
    python evaluate.py --full
"""

import argparse
import json
import os
import sys
import time
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import config, TRAFFIC_SCENARIOS


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="Evaluation & Comparison Pipeline")

    parser.add_argument("--controller", type=str,
                        choices=["fixed", "q_learning", "dqn", "ppo"],
                        help="Evaluate a single controller")
    parser.add_argument("--scenario", type=str,
                        choices=list(TRAFFIC_SCENARIOS.keys()),
                        default="medium",
                        help="Traffic scenario for single evaluation")
    parser.add_argument("--compare-all", action="store_true",
                        help="Compare all controllers on all scenarios")
    parser.add_argument("--emission-report", action="store_true",
                        help="Generate carbon emission prevention report")
    parser.add_argument("--full", action="store_true",
                        help="Full evaluation: all methods, scenarios, and reports")
    parser.add_argument("--evp", action="store_true", default=True,
                        help="Enable EVP during evaluation")
    parser.add_argument("--output", type=str, default="results",
                        help="Output directory")

    return parser.parse_args()


def evaluate_controller(controller_type: str, scenario_key: str,
                        enable_evp: bool = True) -> dict:
    """
    Evaluate a single controller on a single scenario.

    Returns:
        Dictionary of performance metrics.
    """
    from src.environment.sumo_env import SumoEnvironment
    from src.environment.traffic_signal import TrafficSignalController
    from src.emergency.detector import EmergencyVehicleDetector
    from src.emergency.preemption import PreemptionController
    from src.emissions.tracker import EmissionTracker
    from src.rl.state import StateProcessor
    import main as main_module

    scenario = TRAFFIC_SCENARIOS[scenario_key]

    # Configure
    config.sumo.config_file = scenario["config"]
    config.sumo.sumo_binary = "sumo"  # headless for evaluation

    # Initialize
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
    controller = main_module._load_controller(controller_type, config)

    env = SumoEnvironment(
        config.sumo,
        emission_tracker=emission_tracker,
        ev_detector=ev_detector,
    )

    # Tracking metrics
    total_waiting = 0.0
    total_queue = 0.0
    total_throughput = 0
    ev_delays = []
    step_count = 0
    cumulative_co2 = []  # CO2 at each step for time-series plot

    start_time = time.time()

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
                    step_count += 1
                    cumulative_co2.append(emission_tracker.total_co2_kg)
                    continue

            # Get state and act
            state = state_processor.get_state(env, ev_detector, preemption)
            action = controller.choose_action(state)
            main_module._execute_action(action, signal_controller, config)

            env.step()
            emission_tracker.collect()
            step_count += 1

            # Collect metrics
            waiting = env.get_waiting_times()
            queues = env.get_queue_lengths()
            total_waiting += sum(waiting.values()) if isinstance(waiting, dict) else waiting
            total_queue += sum(queues.values()) if isinstance(queues, dict) else queues
            total_throughput = env.get_throughput()
            cumulative_co2.append(emission_tracker.total_co2_kg)

    finally:
        env.close()

    elapsed = time.time() - start_time

    # Compile metrics
    metrics = {
        "controller": controller_type,
        "scenario": scenario_key,
        "evp_enabled": enable_evp,
        "total_steps": step_count,
        "simulation_time_sec": step_count * config.sumo.step_length,
        "wall_time_sec": elapsed,

        # Traffic metrics
        "avg_waiting_time": total_waiting / max(step_count, 1),
        "avg_queue_length": total_queue / max(step_count, 1),
        "throughput": total_throughput,

        # Emission metrics
        "total_co2_kg": emission_tracker.total_co2_kg,
        "total_fuel_liters": emission_tracker.total_fuel_liters,
        "co2_per_vehicle_g": (emission_tracker.total_co2_grams / max(total_throughput, 1)),

        # Cumulative CO2 for plotting
        "cumulative_co2": cumulative_co2,
    }

    # EVP metrics
    if preemption:
        pm = preemption.get_preemption_metrics()
        metrics.update({
            "ev_total_preemptions": pm.get("total_preemptions", 0),
            "ev_avg_response_time": pm.get("avg_response_time", 0),
            "ev_avg_delay": pm.get("avg_ev_delay", 0),
            "ev_avg_recovery_time": pm.get("avg_recovery_time", 0),
        })

    return metrics


def compare_all(enable_evp: bool = True):
    """
    Run all controllers on all scenarios and generate comparison tables.

    Returns:
        DataFrame with all results.
    """
    controllers = ["fixed", "q_learning", "dqn", "ppo"]
    scenarios = list(TRAFFIC_SCENARIOS.keys())
    all_results = []

    total = len(controllers) * len(scenarios)
    count = 0

    for scenario in scenarios:
        for ctrl in controllers:
            count += 1
            print(f"\n[{count}/{total}] Evaluating {ctrl.upper()} on {scenario}...")

            try:
                metrics = evaluate_controller(ctrl, scenario, enable_evp)
                # Remove cumulative CO2 for table (too large)
                table_metrics = {k: v for k, v in metrics.items()
                                 if k != "cumulative_co2"}
                all_results.append(table_metrics)
                print(f"  ✅ Done | CO₂: {metrics['total_co2_kg']:.2f} kg | "
                      f"Waiting: {metrics['avg_waiting_time']:.2f}s")
            except Exception as e:
                print(f"  ❌ Failed: {e}")
                all_results.append({
                    "controller": ctrl,
                    "scenario": scenario,
                    "error": str(e),
                })

    # Create DataFrame
    df = pd.DataFrame(all_results)

    # Save results
    os.makedirs(config.results_dir, exist_ok=True)
    csv_path = os.path.join(config.results_dir, "comparison_results.csv")
    df.to_csv(csv_path, index=False)
    print(f"\n✅ Comparison results saved to {csv_path}")

    # Print summary table
    print(f"\n{'='*80}")
    print("  COMPARISON SUMMARY")
    print(f"{'='*80}")

    summary_cols = [
        "controller", "scenario", "avg_waiting_time", "avg_queue_length",
        "throughput", "total_co2_kg",
    ]
    available_cols = [c for c in summary_cols if c in df.columns]
    print(df[available_cols].to_string(index=False))

    return df


def generate_emission_report(results_df: pd.DataFrame = None):
    """
    Generate comprehensive carbon emission prevention report.

    Args:
        results_df: DataFrame from compare_all(). If None, loads from CSV.
    """
    from src.emissions.analyzer import EmissionAnalyzer

    print(f"\n{'='*60}")
    print("  CARBON EMISSION PREVENTION REPORT")
    print(f"{'='*60}\n")

    if results_df is None:
        csv_path = os.path.join(config.results_dir, "comparison_results.csv")
        if not os.path.exists(csv_path):
            print("Error: No comparison results found. Run --compare-all first.")
            return
        results_df = pd.read_csv(csv_path)

    analyzer = EmissionAnalyzer(config.emission)

    # Process each scenario
    for scenario in results_df["scenario"].unique():
        scenario_data = results_df[results_df["scenario"] == scenario]

        print(f"\n  📊 Scenario: {TRAFFIC_SCENARIOS.get(scenario, {}).get('name', scenario)}")
        print(f"  {'─'*50}")

        # Get baseline (fixed-time) CO2
        fixed_row = scenario_data[scenario_data["controller"] == "fixed"]
        if fixed_row.empty or "total_co2_kg" not in fixed_row.columns:
            print("  ⚠ No fixed-time baseline found for comparison")
            continue

        baseline_co2 = fixed_row["total_co2_kg"].values[0]
        sim_hours = fixed_row.get("simulation_time_sec", pd.Series([3600])).values[0] / 3600

        print(f"  Baseline (Fixed-Time) CO₂: {baseline_co2:.3f} kg")

        for _, row in scenario_data.iterrows():
            if row["controller"] == "fixed":
                continue

            ctrl = row["controller"]
            co2 = row.get("total_co2_kg", 0)
            prevented = baseline_co2 - co2
            pct = (prevented / baseline_co2 * 100) if baseline_co2 > 0 else 0

            print(f"\n  🤖 {ctrl.upper()}:")
            print(f"     CO₂ Emitted:    {co2:.3f} kg")
            print(f"     CO₂ Prevented:  {prevented:.3f} kg ({pct:.1f}% reduction)")

            # Real-world equivalences
            impact = analyzer.get_environmental_impact(prevented, sim_hours)
            trees = impact.get('trees_equivalent_yearly', impact.get('trees_equivalent', 0.0))
            fuel = impact.get('liters_gasoline_saved', impact.get('fuel_gallons_saved', 0.0))
            proj = impact.get('annual_projection_tonnes', 0.0)
            print(f"     🌳 Trees equivalent:   {trees:.2f} trees/year")
            print(f"     ⛽ Fuel saved:          {fuel:.2f} liters")
            print(f"     📈 Annual projection:   {proj:.3f} tonnes/year")

    # Save report
    report_path = os.path.join(config.results_dir, "reports", "emission_report.txt")
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    # Generate and save text report
    with open(report_path, "w") as f:
        f.write("CARBON EMISSION PREVENTION REPORT\n")
        f.write(f"Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 60 + "\n")
        f.write(results_df.to_string())
    print(f"\n  ✅ Report saved to {report_path}")


def generate_visualizations(results_df: pd.DataFrame = None):
    """Generate all comparison plots."""
    try:
        from src.visualization.plots import TrafficVisualizer
    except ImportError:
        print("⚠ Visualization module not available")
        return

    if results_df is None:
        csv_path = os.path.join(config.results_dir, "comparison_results.csv")
        if not os.path.exists(csv_path):
            print("Error: No comparison results found.")
            return
        results_df = pd.read_csv(csv_path)

    viz = TrafficVisualizer(config.viz)
    os.makedirs(config.viz.output_dir, exist_ok=True)

    print("\n  Generating visualizations...")

    # 1. Bar chart: CO2 by method (for medium scenario)
    medium_data = results_df[results_df["scenario"] == "medium"]
    if not medium_data.empty:
        co2_dict = dict(zip(medium_data["controller"], medium_data["total_co2_kg"]))
        viz.plot_comparison_bar(co2_dict, "Total CO₂ Emissions (kg)")

    # 2. Waiting time comparison
    if not medium_data.empty and "avg_waiting_time" in medium_data.columns:
        wait_dict = dict(zip(medium_data["controller"], medium_data["avg_waiting_time"]))
        viz.plot_comparison_bar(wait_dict, "Average Waiting Time (s)")

    viz.save_all_plots(config.viz.output_dir)
    print(f"  ✅ Plots saved to {config.viz.output_dir}")


def main():
    """Main evaluation entry point."""
    args = parse_args()
    config.ensure_directories()

    if args.full:
        # Full evaluation pipeline
        print("🚀 Starting Full Evaluation Pipeline\n")
        results_df = compare_all(enable_evp=args.evp)
        generate_emission_report(results_df)
        generate_visualizations(results_df)
        print("\n🎉 Full evaluation complete!")

    elif args.compare_all:
        results_df = compare_all(enable_evp=args.evp)
        generate_visualizations(results_df)

    elif args.emission_report:
        generate_emission_report()

    elif args.controller:
        metrics = evaluate_controller(
            args.controller, args.scenario, enable_evp=args.evp
        )
        # Print results
        print(f"\n{'='*60}")
        print(f"  Results: {args.controller.upper()} on {args.scenario}")
        print(f"{'='*60}")
        for key, val in metrics.items():
            if key != "cumulative_co2":
                print(f"  {key}: {val}")
    else:
        print("Please specify --controller, --compare-all, --emission-report, or --full.")
        print("Use --help for options.")
        sys.exit(1)


if __name__ == "__main__":
    main()
