import numpy as np
import pickle
import os
from typing import Dict, Any

class QLearningAgent:
    """Basic tabular Q-learning agent."""
    
    def __init__(self, state_dim: int = 11, action_dim: int = 4, alpha: float = 0.1, gamma: float = 0.95, 
                 epsilon: float = 1.0, epsilon_decay: float = 0.995, epsilon_min: float = 0.01,
                 n_bins: int = 10):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min
        self.n_bins = n_bins
        
        self.q_table: Dict[str, np.ndarray] = {}
        # Actions: 0=keep_phase, 1=switch_to_NS, 2=switch_to_EW, 3=extend_green
        
    def _discretize_state(self, state: np.ndarray) -> str:
        """Discretizes continuous state space into string key."""
        # Simple discretization: round to nearest integer or specific bins
        # Adjust bins based on actual state normalization
        discrete = np.digitize(state, bins=np.linspace(0, 1, 5))
        return str(discrete.tolist())

    def choose_action(self, state: np.ndarray) -> int:
        """Epsilon-greedy action selection."""
        state_key = self._discretize_state(state)
        
        if state_key not in self.q_table:
            self.q_table[state_key] = np.zeros(self.action_dim)
            
        if np.random.rand() < self.epsilon:
            return np.random.randint(self.action_dim)
            
        return int(np.argmax(self.q_table[state_key]))

    def update(self, state: np.ndarray, action: int, reward: float, next_state: np.ndarray) -> None:
        """Q-learning update."""
        state_key = self._discretize_state(state)
        next_state_key = self._discretize_state(next_state)
        
        if state_key not in self.q_table:
            self.q_table[state_key] = np.zeros(self.action_dim)
        if next_state_key not in self.q_table:
            self.q_table[next_state_key] = np.zeros(self.action_dim)
            
        best_next_q = np.max(self.q_table[next_state_key])
        current_q = self.q_table[state_key][action]
        
        # Q-learning equation
        new_q = current_q + self.alpha * (reward + self.gamma * best_next_q - current_q)
        self.q_table[state_key][action] = new_q

    def decay_epsilon(self) -> None:
        """Decays epsilon."""
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

    def save(self, path: str) -> None:
        """Save Q-table."""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'wb') as f:
            pickle.dump({
                'q_table': self.q_table,
                'epsilon': self.epsilon
            }, f)

    def load(self, path: str) -> None:
        """Load Q-table."""
        with open(path, 'rb') as f:
            data = pickle.load(f)
            self.q_table = data['q_table']
            self.epsilon = data['epsilon']
