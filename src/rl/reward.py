from typing import Dict, Union, Any

class RewardCalculator:
    """Computes reward based on waiting times, queues, throughput, and EV priorities.
    Formula: R = -α*W_avg - β*Q_avg + γ*T - δ*W_emergency
    """
    
    def __init__(self, alpha: float = 0.4, beta: float = 0.3, gamma: float = 0.2, delta: float = 5.0):
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma
        self.delta = delta
        self.last_components = {}
        
    def calculate(self, 
                  waiting_times: Union[float, Dict[str, float]], 
                  queue_lengths: Union[float, Dict[str, float]], 
                  throughput: float, 
                  ev_waiting_time: float = 0.0) -> float:
        """
        Computes reward: R = -α*W_avg - β*Q_avg + γ*T - δ*W_emergency
        """
        if isinstance(waiting_times, dict):
            w_val = float(sum(waiting_times.values()))
        else:
            w_val = float(waiting_times)

        if isinstance(queue_lengths, dict):
            q_val = float(sum(queue_lengths.values()))
        else:
            q_val = float(queue_lengths)

        t_val = float(throughput)
        ev_val = float(ev_waiting_time)

        w_penalty = -self.alpha * w_val
        q_penalty = -self.beta * q_val
        t_reward = self.gamma * t_val
        ev_penalty = -self.delta * ev_val
        
        self.last_components = {
            "w_penalty": w_penalty,
            "q_penalty": q_penalty,
            "t_reward": t_reward,
            "ev_penalty": ev_penalty
        }
        
        return float(w_penalty + q_penalty + t_reward + ev_penalty)

    def get_components(self) -> Dict[str, float]:
        """Returns dict of individual reward components for logging."""
        return self.last_components
