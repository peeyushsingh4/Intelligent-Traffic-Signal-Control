"""
Global Configuration for Intelligent Traffic Signal Control System.

This module centralizes all configurable parameters for the simulation,
ML models, RL agents, emergency vehicle priority, and emission tracking.
"""

import os
from dataclasses import dataclass, field
from typing import Dict, List, Optional


# =============================================================================
# SUMO Configuration
# =============================================================================
@dataclass
class SumoConfig:
    """Configuration for the SUMO simulation environment."""

    # SUMO binary (use "sumo" for headless, "sumo-gui" for GUI)
    sumo_binary: str = "sumo"

    # Path to SUMO configuration file
    config_file: str = "simulation/config/medium_traffic.sumocfg"

    # Simulation parameters
    step_length: float = 0.5       # seconds per simulation step
    sim_duration: int = 3600       # total simulation time (seconds)
    warmup_steps: int = 100        # steps to skip before collecting data

    # Network identifiers (for 2x2 grid, center junction)
    junction_id: str = "B0"
    tls_id: str = "B0"

    # Junction position (x, y) — matches generated network (netconvert offsets coords)
    junction_position: tuple = (500.0, 500.0)

    # Approach edges (direction → edge ID approaching the junction)
    approach_edges: Dict[str, str] = field(default_factory=lambda: {
        "NORTH": "B1B0",
        "SOUTH": "B-1B0",
        "EAST":  "C0B0",
        "WEST":  "A0B0",
    })

    # Departure edges (direction → edge ID leaving the junction)
    departure_edges: Dict[str, str] = field(default_factory=lambda: {
        "NORTH": "B0B1",
        "SOUTH": "B0B-1",
        "EAST":  "B0C0",
        "WEST":  "B0A0",
    })

    # Enable lateral resolution for rescue lane formation
    lateral_resolution: float = 0.8

    @property
    def sumo_home(self) -> str:
        """Return SUMO_HOME from environment."""
        home = os.environ.get("SUMO_HOME", "")
        if not home:
            raise EnvironmentError(
                "SUMO_HOME environment variable is not set. "
                "Please install SUMO and set SUMO_HOME."
            )
        return home


# =============================================================================
# Traffic Signal Phases
# =============================================================================
@dataclass
class TrafficSignalConfig:
    """Configuration for traffic signal phases."""

    # Phase indices (matching SUMO TLS program)
    NS_GREEN: int = 0    # North-South green
    NS_YELLOW: int = 1   # North-South yellow
    EW_GREEN: int = 2    # East-West green
    EW_YELLOW: int = 3   # East-West yellow

    # Fixed-time baseline durations (seconds)
    green_duration: float = 30.0
    yellow_duration: float = 5.0

    # Minimum/maximum green durations for RL
    min_green: float = 10.0
    max_green: float = 60.0


# =============================================================================
# Emergency Vehicle Priority
# =============================================================================
@dataclass
class EmergencyConfig:
    """Configuration for emergency vehicle priority system."""

    # Detection radius (meters from junction center)
    detection_radius: float = 200.0

    # Preemption parameters
    yellow_transition_time: float = 3.0   # seconds for safe yellow transition
    max_preemption_hold: float = 60.0     # max seconds to hold green for EV
    clearance_buffer: float = 20.0        # extra meters past junction for clearance

    # Emergency vehicle classes to detect
    ev_vehicle_classes: List[str] = field(default_factory=lambda: ["emergency"])

    # Direction → green phase mapping
    direction_to_phase: Dict[str, int] = field(default_factory=lambda: {
        "NORTH": 0,  # NS_GREEN
        "SOUTH": 0,  # NS_GREEN
        "EAST":  2,  # EW_GREEN
        "WEST":  2,  # EW_GREEN
    })


# =============================================================================
# Machine Learning Configuration
# =============================================================================
@dataclass
class MLConfig:
    """Configuration for ML traffic prediction models."""

    # Prediction horizon (how many steps ahead to predict)
    prediction_horizon: int = 10   # steps (= 5 seconds at step_length=0.5)

    # Data collection
    feature_columns: List[str] = field(default_factory=lambda: [
        "vehicle_count", "queue_N", "queue_S", "queue_E", "queue_W",
        "avg_speed", "flow_rate", "time_of_day", "density",
    ])
    target_column: str = "vehicle_count"

    # --- XGBoost ---
    xgb_n_estimators: int = 100
    xgb_max_depth: int = 6
    xgb_learning_rate: float = 0.1
    xgb_subsample: float = 0.8

    # --- LSTM ---
    lstm_window_size: int = 10        # number of past steps as input
    lstm_hidden_size: int = 64
    lstm_num_layers: int = 2
    lstm_dropout: float = 0.2
    lstm_epochs: int = 50
    lstm_batch_size: int = 32
    lstm_learning_rate: float = 0.001

    # Train/test split ratio
    test_size: float = 0.2

    # Model save directory
    model_dir: str = "models/ml"


# =============================================================================
# Reinforcement Learning Configuration
# =============================================================================
@dataclass
class RLConfig:
    """Configuration for RL traffic signal control agents."""

    # State space
    state_dim: int = 11   # extended state with EVP

    # Action space
    action_dim: int = 4   # keep_phase, switch_NS, switch_EW, extend_green
    action_names: List[str] = field(default_factory=lambda: [
        "keep_phase", "switch_to_NS", "switch_to_EW", "extend_green"
    ])

    # Reward weights
    alpha: float = 0.4    # waiting time penalty weight
    beta: float = 0.3     # queue length penalty weight
    gamma_reward: float = 0.2   # throughput reward weight
    delta: float = 5.0    # emergency vehicle waiting penalty (10-12x alpha)

    # --- Q-Learning ---
    ql_alpha: float = 0.1         # learning rate
    ql_gamma: float = 0.95        # discount factor
    ql_epsilon: float = 1.0       # initial exploration rate
    ql_epsilon_decay: float = 0.995
    ql_epsilon_min: float = 0.01
    ql_n_bins: int = 10           # discretization bins per feature

    # --- DQN ---
    dqn_gamma: float = 0.99
    dqn_epsilon: float = 1.0
    dqn_epsilon_decay: float = 0.995
    dqn_epsilon_min: float = 0.01
    dqn_learning_rate: float = 0.001
    dqn_batch_size: int = 64
    dqn_buffer_size: int = 10000
    dqn_target_update_freq: int = 100
    dqn_hidden_sizes: List[int] = field(default_factory=lambda: [128, 128])

    # --- PPO ---
    ppo_gamma: float = 0.99
    ppo_gae_lambda: float = 0.95
    ppo_epsilon_clip: float = 0.2
    ppo_lr_actor: float = 0.0003
    ppo_lr_critic: float = 0.001
    ppo_k_epochs: int = 4
    ppo_hidden_sizes: List[int] = field(default_factory=lambda: [128, 64])

    # Training
    n_episodes: int = 100
    max_steps_per_episode: int = 7200  # 3600 sec / 0.5 step_length

    # Model save directory
    model_dir: str = "models/rl"


# =============================================================================
# Emission Tracking Configuration
# =============================================================================
@dataclass
class EmissionConfig:
    """Configuration for emission tracking and analysis."""

    # Emission types to track
    pollutants: List[str] = field(default_factory=lambda: [
        "CO2", "CO", "HC", "NOx", "PMx", "fuel"
    ])

    # Real-world conversion factors
    co2_per_tree_per_year_kg: float = 22.0       # 1 tree absorbs ~22 kg CO2/year
    co2_per_gallon_gasoline_kg: float = 8.887     # 1 gallon gas = 8.887 kg CO2
    co2_per_car_per_year_tonnes: float = 4.6      # avg car emits 4.6 tonnes/year
    gasoline_density_mg_per_liter: float = 737000  # mg/liter

    # Output directory
    output_dir: str = "results/emissions"


# =============================================================================
# Visualization Configuration
# =============================================================================
@dataclass
class VisualizationConfig:
    """Configuration for plots and charts."""

    # Color scheme for methods
    method_colors: Dict[str, str] = field(default_factory=lambda: {
        "Fixed-Time":  "#E74C3C",   # Red
        "Q-Learning":  "#F39C12",   # Orange
        "DQN":         "#3498DB",   # Blue
        "DQN+EVP":     "#2980B9",   # Dark Blue
        "PPO":         "#2ECC71",   # Green
        "PPO+EVP":     "#27AE60",   # Dark Green
    })

    # Plot style
    figure_size: tuple = (12, 8)
    dpi: int = 150
    style: str = "seaborn-v0_8-whitegrid"
    font_size: int = 12

    # Output directory
    output_dir: str = "results/plots"


# =============================================================================
# Traffic Scenarios
# =============================================================================
TRAFFIC_SCENARIOS = {
    "low": {
        "name": "Low Traffic",
        "config": "simulation/config/low_traffic.sumocfg",
        "veh_per_hour": 200,
        "description": "Light traffic conditions",
    },
    "medium": {
        "name": "Medium Traffic",
        "config": "simulation/config/medium_traffic.sumocfg",
        "veh_per_hour": 500,
        "description": "Normal traffic conditions",
    },
    "heavy": {
        "name": "Heavy Traffic",
        "config": "simulation/config/heavy_traffic.sumocfg",
        "veh_per_hour": 1000,
        "description": "Congested traffic conditions",
    },
    "rush_hour": {
        "name": "Rush Hour",
        "config": "simulation/config/rush_hour.sumocfg",
        "veh_per_hour": 900,
        "description": "Unequal traffic distribution simulating rush hour",
    },
    "emergency": {
        "name": "Emergency Scenario",
        "config": "simulation/config/emergency.sumocfg",
        "veh_per_hour": 500,
        "description": "Medium traffic with emergency vehicles at t=120,300,500,800",
    },
    "bkc": {
        "name": "BKC Junction (Bandra East, Mumbai)",
        "config": "simulation/config/bkc_mumbai.sumocfg",
        "veh_per_hour": 800,
        "description": "Real BKC Mumbai multi-lane junction with peak traffic & monsoon conditions",
    },
    "vashi": {
        "name": "Vashi Highway Interchange (Navi Mumbai)",
        "config": "simulation/config/vashi_navimumbai.sumocfg",
        "veh_per_hour": 1000,
        "description": "Real Vashi Navi Mumbai highway interchange with commuter & heavy freight traffic",
    },
    "palm_beach": {
        "name": "Palm Beach Road (Nerul, Navi Mumbai)",
        "config": "simulation/config/palm_beach_nerul.sumocfg",
        "veh_per_hour": 600,
        "description": "Real 6-lane Palm Beach express corridor with monsoon waterlogging & flood closures",
    },
}


# =============================================================================
# Default Configuration Instance
# =============================================================================
class Config:
    """Master configuration aggregating all sub-configs."""

    def __init__(self):
        self.sumo = SumoConfig()
        self.signal = TrafficSignalConfig()
        self.emergency = EmergencyConfig()
        self.ml = MLConfig()
        self.rl = RLConfig()
        self.emission = EmissionConfig()
        self.viz = VisualizationConfig()
        self.scenarios = TRAFFIC_SCENARIOS

        # Project paths
        self.project_root = os.path.dirname(os.path.abspath(__file__))
        self.results_dir = os.path.join(self.project_root, "results")
        self.models_dir = os.path.join(self.project_root, "models")

    def ensure_directories(self):
        """Create all required output directories."""
        dirs = [
            self.results_dir,
            os.path.join(self.results_dir, "emissions"),
            os.path.join(self.results_dir, "plots"),
            os.path.join(self.results_dir, "reports"),
            self.models_dir,
            os.path.join(self.models_dir, "ml"),
            os.path.join(self.models_dir, "rl"),
        ]
        for d in dirs:
            os.makedirs(d, exist_ok=True)


# Singleton instance
config = Config()
