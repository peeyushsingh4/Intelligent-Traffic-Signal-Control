import numpy as np
from typing import Any, List, Optional

class StateProcessor:
    """Processes raw SUMO observations into 11-dimensional RL state vector."""
    
    def __init__(self, config: Optional[Any] = None):
        self.config = config
        self.state_dim = 11

    def get_state(self, env: Any, ev_detector: Optional[Any] = None, 
                  preemption_controller: Optional[Any] = None, 
                  predictor: Optional[Any] = None) -> np.ndarray:
        """Builds full 11-dim normalized state vector.
        
        State vector layout:
        [0-3]: Queue lengths (N, S, E, W)
        [4]: Current phase index (0..3)
        [5]: Predicted density (0.0..1.0)
        [6]: EV present flag (0 or 1)
        [7]: EV direction code (0=none, 1=North, 2=South, 3=East, 4=West)
        [8]: EV normalized distance (0.0..1.0)
        [9]: EV normalized speed (0.0..1.0)
        [10]: Preemption active flag (0 or 1)
        """
        # 1. Base queues from env
        if hasattr(env, 'get_queue_lengths'):
            queues = env.get_queue_lengths()
            n_q = float(queues.get("B1B0", queues.get("NORTH", 0)))
            s_q = float(queues.get("B-1B0", queues.get("SOUTH", 0)))
            e_q = float(queues.get("C0B0", queues.get("EAST", 0)))
            w_q = float(queues.get("A0B0", queues.get("WEST", 0)))
        else:
            n_q, s_q, e_q, w_q = 0.0, 0.0, 0.0, 0.0
            
        # 2. Current phase
        if hasattr(env, 'tls_id'):
            import traci
            try:
                current_phase = float(traci.trafficlight.getPhase(env.tls_id))
            except Exception:
                current_phase = 0.0
        else:
            current_phase = 0.0

        # 3. Predicted density
        predicted_density = 0.0
        if predictor is not None and hasattr(predictor, 'predict_current'):
            try:
                predicted_density = float(predictor.predict_current())
            except Exception:
                predicted_density = 0.0
                
        # 4. EV Info
        ev_present = 0.0
        ev_direction = 0.0
        ev_distance = 0.0
        ev_speed = 0.0
        
        if ev_detector is not None:
            try:
                closest = ev_detector.get_closest_ev() if hasattr(ev_detector, 'get_closest_ev') else None
                if closest:
                    ev_present = 1.0
                    dir_map = {"NORTH": 1.0, "SOUTH": 2.0, "EAST": 3.0, "WEST": 4.0}
                    ev_direction = dir_map.get(closest.get("direction", ""), 0.0)
                    ev_distance = float(closest.get("distance", 0.0))
                    ev_speed = float(closest.get("speed", 0.0))
            except Exception:
                pass
                
        # 5. Preemption active
        preemption_active = 0.0
        if preemption_controller is not None:
            if hasattr(preemption_controller, 'is_active'):
                val = preemption_controller.is_active
                preemption_active = 1.0 if (callable(val) and val()) or val is True else 0.0

        raw_state = np.array([
            n_q, s_q, e_q, w_q,
            current_phase, predicted_density,
            ev_present, ev_direction, ev_distance, ev_speed,
            preemption_active
        ], dtype=np.float32)
        
        return self.normalize_state(raw_state)

    def normalize_state(self, state: np.ndarray) -> np.ndarray:
        """Normalizes raw state values to [0, 1] range."""
        max_vals = np.array([
            50.0, 50.0, 50.0, 50.0,    # queues
            3.0,                        # max phase index
            1.0,                        # density
            1.0,                        # ev present (0 or 1)
            4.0,                        # direction code (1..4)
            500.0,                      # max distance (meters)
            30.0,                       # max speed (m/s)
            1.0                         # preemption active (0 or 1)
        ], dtype=np.float32)
        
        max_vals[max_vals == 0] = 1.0
        normalized = np.clip(state / max_vals, 0.0, 1.0)
        return normalized
