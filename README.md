# Intelligent Traffic Signal Control Using ML and Deep RL

An AI-powered adaptive traffic signal controller that combines **Machine Learning** (traffic prediction) and **Deep Reinforcement Learning** (signal control) with **Emergency Vehicle Priority** to optimize urban traffic flow while reducing emissions.

## 🏗️ Architecture

```
Traffic Simulation (SUMO)
        │
        ▼
Traffic Data Collection (TraCI)
        │
        ├──► Emergency Vehicle Detection
        │           │
        │    ┌──────┴──────┐
        │    │  Preemption  │──► Force Green for EV
        │    └─────────────┘
        │
        ├──► ML Prediction Module
        │    (XGBoost / LSTM)
        │           │
        │    Predicted Traffic Density
        │           │
        │           ▼
        ├──► Deep RL Agent
        │    (Q-Learning / DQN / PPO)
        │           │
        │    Signal Timing Decision
        │           │
        │           ▼
        │    Traffic Light Control
        │
        └──► Emission Tracker
             (CO₂, Fuel, NOx)
                    │
             Environmental Report
```

## 📁 Project Structure

```
Major Project/
├── config.py                      # Global configuration
├── main.py                        # Main entry point
├── train.py                       # Training pipeline
├── evaluate.py                    # Evaluation & comparison
├── requirements.txt               # Python dependencies
│
├── simulation/                    # SUMO simulation files
│   ├── network/                   # Road network (.net.xml)
│   ├── routes/                    # Traffic demand & routes
│   ├── config/                    # SUMO configuration files
│   ├── additional/                # Detectors, etc.
│   └── output/                    # Simulation outputs
│
├── src/                           # Source code
│   ├── environment/               # SUMO environment wrapper
│   │   ├── sumo_env.py           # Environment class
│   │   └── traffic_signal.py     # Signal controller
│   ├── emergency/                 # Emergency Vehicle Priority
│   │   ├── detector.py           # EV detection via TraCI
│   │   └── preemption.py         # Signal preemption logic
│   ├── emissions/                 # Carbon emission tracking
│   │   ├── tracker.py            # Per-step emission tracking
│   │   └── analyzer.py           # Comparison & reporting
│   ├── ml/                        # Traffic prediction
│   │   ├── data_collector.py     # Data collection from SUMO
│   │   ├── xgboost_predictor.py  # XGBoost model
│   │   └── lstm_predictor.py     # LSTM model
│   ├── rl/                        # Signal control agents
│   │   ├── state.py              # State representation
│   │   ├── reward.py             # Reward function
│   │   ├── q_learning.py         # Q-Learning agent
│   │   ├── dqn_agent.py          # DQN agent
│   │   └── ppo_agent.py          # PPO agent
│   ├── baselines/                 # Baseline controllers
│   │   └── fixed_time.py         # Fixed-time signal
│   └── visualization/            # Plots & charts
│       └── plots.py              # Matplotlib/Plotly visualizations
│
├── models/                        # Saved model weights
│   ├── ml/                        # ML models
│   └── rl/                        # RL models
│
└── results/                       # Output results
    ├── emissions/                 # Emission comparison data
    ├── plots/                     # Generated charts
    └── reports/                   # Analysis reports
```

## 🚀 Quick Start

### Prerequisites

1. **Install SUMO** (Simulation of Urban Mobility):
   ```bash
   # macOS
   brew install sumo

   # Ubuntu/Debian
   sudo add-apt-repository ppa:sumo/stable
   sudo apt-get update
   sudo apt-get install sumo sumo-tools sumo-doc

   # Windows: Download from https://sumo.dlr.de/docs/Installing/index.html
   ```

2. **Set SUMO_HOME**:
   ```bash
   export SUMO_HOME="/usr/share/sumo"  # Linux
   export SUMO_HOME="/opt/homebrew/opt/sumo/share/sumo"  # macOS (Homebrew)
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Generate Road Network

```bash
netgenerate --grid \
  --grid.x-number 2 --grid.y-number 2 \
  --grid.x-length 500 --grid.y-length 500 \
  --default.lanenumber 2 --default.speed 13.89 \
  --tls.guess true --tls.default-type static \
  --junctions.corner-detail 5 \
  --output-file simulation/network/intersection.net.xml
```

### Run Simulation

```bash
# Collect training data
python main.py --mode collect --scenario medium

# Train ML models
python train.py --model xgboost
python train.py --model lstm

# Train RL agents
python train.py --agent dqn --episodes 100
python train.py --agent ppo --episodes 100

# Evaluate and compare all methods
python evaluate.py --scenarios all --output results/
```

## 📊 Evaluation Metrics

| Category | Metric | Goal |
|---|---|---|
| **Traffic** | Average Waiting Time | ↓ Lower |
| **Traffic** | Average Queue Length | ↓ Lower |
| **Traffic** | Throughput (veh/hr) | ↑ Higher |
| **Traffic** | Average Travel Time | ↓ Lower |
| **Emergency** | EV Response Time | < 5 sec |
| **Emergency** | EV Total Delay | ≈ 0 |
| **Environment** | CO₂ Emissions | ↓ Lower |
| **Environment** | CO₂ Prevented vs Baseline | ↑ Higher |
| **Environment** | Fuel Saved | ↑ Higher |

## 🚑 Emergency Vehicle Priority

The system uses a **hybrid two-layer architecture**:
- **Layer 1 (Rule-Based):** Immediately forces green for approaching emergency vehicles
- **Layer 2 (RL-Aware):** RL agent learns to anticipate and accommodate emergencies

## 🌍 Environmental Impact

Carbon emissions are tracked via SUMO's HBEFA3 emission model and compared against fixed-time baselines. Results are presented with real-world equivalences (trees saved, fuel gallons, cars off road).

## 👥 Team

| Member | Role | Responsibility |
|---|---|---|
| Member 1 | Simulation Engineer | SUMO setup, scenarios, data collection |
| Member 2 | ML Engineer | XGBoost, LSTM, emission analysis |
| Member 3 | RL Engineer | Q-Learning, DQN, PPO, EVP |

## 📄 License

This project is developed as a final-year major project for academic purposes.
