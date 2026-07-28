import os
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import traci

class TrafficDataCollector:
    """
    Collects traffic data from SUMO simulation via TraCI each step.
    Features collected: vehicle_count, queue_length_N/S/E/W, avg_speed,
    flow_rate, time_of_day, day_of_week, current_phase, density.
    """
    def __init__(self, config: Optional[Any] = None):
        self.config = config
        self.data: List[Dict[str, Any]] = []

        # Default approach edges
        if self.config and hasattr(self.config, 'sumo'):
            self.tls_id = self.config.sumo.tls_id
            self.approach_edges = self.config.sumo.approach_edges
        else:
            self.tls_id = "B0"
            self.approach_edges = {
                "NORTH": "B1B0",
                "SOUTH": "B-1B0",
                "EAST":  "C0B0",
                "WEST":  "A0B0",
            }
        
    def collect_step(self, step_time: float) -> None:
        """Called each simulation step to collect data."""
        try:
            active_vehicles = traci.vehicle.getIDList()
            vehicle_count = len(active_vehicles)
            
            # Speeds
            if vehicle_count > 0:
                speeds = [traci.vehicle.getSpeed(v) for v in active_vehicles]
                avg_speed = float(np.mean(speeds))
            else:
                avg_speed = 0.0

            # Traffic signal phase
            try:
                current_phase = traci.trafficlight.getPhase(self.tls_id)
            except Exception:
                current_phase = 0

            # Queue lengths per approach edge (halted vehicles)
            queue_N = traci.edge.getLastStepHaltingNumber(self.approach_edges["NORTH"]) if self.approach_edges["NORTH"] in traci.edge.getIDList() else 0
            queue_S = traci.edge.getLastStepHaltingNumber(self.approach_edges["SOUTH"]) if self.approach_edges["SOUTH"] in traci.edge.getIDList() else 0
            queue_E = traci.edge.getLastStepHaltingNumber(self.approach_edges["EAST"]) if self.approach_edges["EAST"] in traci.edge.getIDList() else 0
            queue_W = traci.edge.getLastStepHaltingNumber(self.approach_edges["WEST"]) if self.approach_edges["WEST"] in traci.edge.getIDList() else 0
            
            density = vehicle_count / 100.0
            flow_rate = vehicle_count / 3600.0
            
            day_of_week = int((step_time // (24 * 3600)) % 7)
            time_of_day = float(step_time % (24 * 3600))
            
            step_data = {
                "step_time": step_time,
                "vehicle_count": vehicle_count,
                "queue_length_N": queue_N,
                "queue_length_S": queue_S,
                "queue_length_E": queue_E,
                "queue_length_W": queue_W,
                "queue_N": queue_N,
                "queue_S": queue_S,
                "queue_E": queue_E,
                "queue_W": queue_W,
                "avg_speed": avg_speed,
                "flow_rate": flow_rate,
                "time_of_day": time_of_day,
                "day_of_week": day_of_week,
                "current_phase": current_phase,
                "density": density
            }
            self.data.append(step_data)
        except (traci.exceptions.FatalTraCIError, traci.exceptions.TraCIException):
            pass

    def get_dataframe(self) -> pd.DataFrame:
        """Returns collected data as DataFrame."""
        return pd.DataFrame(self.data)

    def save_to_csv(self, filepath: str) -> None:
        """Saves data to CSV."""
        df = self.get_dataframe()
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        df.to_csv(filepath, index=False)

    def load_from_csv(self, filepath: str) -> None:
        """Loads historical data."""
        if os.path.exists(filepath):
            df = pd.read_csv(filepath)
            self.data = df.to_dict('records')
        else:
            raise FileNotFoundError(f"File not found: {filepath}")

    def create_sequences(self, window_size: int = 10) -> Tuple[np.ndarray, np.ndarray]:
        """Creates sliding window sequences for LSTM."""
        df = self.get_dataframe()
        if df.empty or len(df) <= window_size:
            return np.array([]), np.array([])
            
        feature_cols = ['vehicle_count', 'queue_N', 'queue_S', 
                        'queue_E', 'queue_W', 'avg_speed', 
                        'flow_rate', 'time_of_day', 'density']
        existing_cols = [c for c in feature_cols if c in df.columns]
        features = df[existing_cols].values
                      
        X, y = [], []
        for i in range(len(features) - window_size):
            X.append(features[i:(i + window_size)])
            y.append(features[i + window_size, 0])  # Predicting next vehicle_count
            
        return np.array(X), np.array(y)
