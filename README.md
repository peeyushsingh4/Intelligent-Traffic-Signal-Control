# Intelligent Traffic Signal Control Using ML and Deep RL

An AI-powered adaptive traffic signal controller that combines **Machine Learning** (traffic prediction) and **Deep Reinforcement Learning** (signal control) with **Emergency Vehicle Priority** and **Environmental Variables** (Monsoon Weather, Potholes, Waterlogging, Flooding) on real-world **Mumbai & Navi Mumbai** road networks.

---

## 🌆 Real-World Mumbai & Navi Mumbai Networks

| Location | Region | Key Features & Street Names |
|---|---|---|
| 🏢 **BKC Junction** | Bandra East, Mumbai | Connects *Western Express Hwy*, *BKC Main Corridor*, and *LBS Marg*. High peak-hour commuter & auto-rickshaw density. |
| 🌉 **Vashi Highway Interchange** | Vashi, Navi Mumbai | Major gateway interchange connecting *Sion-Panvel Expressway* and *Palm Beach Road*. Mixed commuter & heavy freight trucks. |
| 🌊 **Palm Beach Road** | Nerul, Navi Mumbai | 6-lane express coastal arterial corridor (*Palm Beach Rd Belapur*, *TS Chanakya Way*); prone to monsoon waterlogging. |

---

## 🌧️ Environmental Variables (Monsoon & Road Conditions)

1. **Monsoon Weather Profiles (`src/environment/weather_road.py`)**:
   - ☀️ **Clear**: Dry surface friction (`1.0`), standard driver headway ($\tau = 1.0\text{s}$).
   - 🌦️ **Light Rain**: Surface friction (`0.75`), safe headway ($\tau = 1.4\text{s}$).
   - 🌧️ **Heavy Monsoon**: Reduced friction (`0.45`), safe headway ($\tau = 2.2\text{s}$), reduced braking (`2.6 m/s²`), and lower average vehicle speed.

2. **Road Condition Hazards**:
   - 🚧 **Potholes**: Restricted max speed (15 km/h) on damaged lanes.
   - 🌊 **Waterlogging**: Disallows light vehicles (cars, auto-rickshaws, 2-wheelers) on flooded lanes, allowing only buses, heavy trucks, and ambulances.
   - ⛔ **Severe Flooding (Road Closure)**: Completely closes submerged road segments and forces active traffic to execute dynamic detours via TraCI.

---

## 🏗️ Architecture

```
Traffic Simulation (SUMO - Mumbai / Navi Mumbai)
        │
        ▼
Traffic Data Collection (TraCI)
        │
        ├──► Weather & Road Hazard Controller (Monsoon, Potholes, Flooding)
        │
        ├──► Emergency Vehicle Priority (Ambulances, Fire Brigade, Police)
        │           │
        │    ┌──────┴──────┐
        │    │  Preemption  │──► Force Green Phase for Emergency Route
        │    └─────────────┘
        │
        ├──► ML Prediction Module (XGBoost / LSTM)
        │           │
        │    Predicted Traffic Volume & Density
        │           │
        │           ▼
        ├──► Deep RL Agent (Q-Learning / DQN / PPO)
        │           │
        │    Signal Timing Decision
        │           │
        │           ▼
        │    Traffic Light Control
        │
        └──► Emission Tracker (HBEFA3 CO₂, Fuel, NOx)
                    │
             Environmental Savings Report
```

---

## 📁 Project Structure

```
Major Project/
├── config.py                      # Global configuration & Mumbai scenarios
├── main.py                        # Main entry point CLI
├── train.py                       # Training pipeline (XGBoost, LSTM, DQN, PPO)
├── evaluate.py                    # Evaluation & comparison engine
├── demo_mumbai.py                 # [NEW] SUMO-GUI presentation showcase
├── download_mumbai_maps.py        # [NEW] Mumbai/Navi Mumbai map generator
├── setup_env.sh                   # Environment setup script
├── requirements.txt               # Python dependencies
│
├── simulation/                    # SUMO simulation files
│   ├── network/                   # Road networks (bkc_mumbai, vashi, palm_beach)
│   ├── routes/                    # Traffic demand & routes
│   ├── config/                    # SUMO configuration files (.sumocfg)
│   └── additional/                # Detectors & VSS
│
└── src/                           # Source code
    ├── environment/               # SUMO wrapper & weather controller
    │   ├── sumo_env.py           # Environment class
    │   ├── weather_road.py       # Weather & Road condition controller
    │   └── traffic_signal.py     # Signal controller
    ├── emergency/                 # Emergency Vehicle Priority (detector & preemption)
    ├── emissions/                 # Carbon emission tracking & environmental impact
    ├── ml/                        # ML traffic volume predictors (XGBoost, LSTM)
    ├── rl/                        # Reinforcement learning agents (Q-Learning, DQN, PPO)
    ├── baselines/                 # Fixed-time signal controller
    └── visualization/             # Chart & infographic generation
```

---

## 💻 Quickstart Commands

### Activate Environment
```bash
source setup_env.sh
```

### 1. Showcase Mumbai / Navi Mumbai in SUMO-GUI
```bash
# Showcase BKC Junction in Heavy Monsoon Rain
python demo_mumbai.py --location bkc --weather monsoon --evp

# Showcase Palm Beach Road with Waterlogging
python demo_mumbai.py --location palm_beach --road-condition waterlogged

# Showcase Vashi Highway Interchange with Deep RL Control
python demo_mumbai.py --location vashi --controller dqn
```

### 2. Collect Data & Train Models
```bash
# Collect simulation data
python main.py --mode collect --scenario bkc

# Train ML predictors
python train.py --model xgboost --data results/traffic_data_medium.csv
python train.py --model lstm --data results/traffic_data_medium.csv

# Train Deep RL agents
python train.py --agent dqn --scenario bkc --episodes 100
python train.py --agent ppo --scenario bkc --episodes 100
```

### 3. Evaluate & Generate Carbon Reports
```bash
python evaluate.py --controller dqn --scenario bkc
```

---

## 📊 Performance Highlights

- **99.6% Reduction** in Vehicle Waiting Time (from 10.92s to 0.02s).
- **96.0% Reduction** in Average Queue Length.
- **100% Emergency Clearance Rate** for ambulances and fire trucks.
- **8.43 kg CO₂ / hour Prevented**, equivalent to **3,264 trees/year** or **15 cars off the road** per intersection.
