import os
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import random
from collections import deque
from typing import Tuple, List

class DQNNetwork(nn.Module):
    """Deep Q-Network."""
    def __init__(self, state_dim: int, action_dim: int):
        super(DQNNetwork, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.Linear(128, action_dim)
        )
        
    def forward(self, x):
        return self.network(x)

class DQNAgent:
    """Deep Q-Network using PyTorch."""
    def __init__(self, state_dim: int = 11, action_dim: int = 4, 
                 gamma: float = 0.99, epsilon: float = 1.0, 
                 epsilon_decay: float = 0.995, epsilon_min: float = 0.01, 
                 lr: float = 0.001, batch_size: int = 64, target_update_freq: int = 100,
                 buffer_size: int = 10000):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min
        self.batch_size = batch_size
        self.target_update_freq = target_update_freq
        self.steps = 0
        
        self.memory = deque(maxlen=buffer_size)
        
        self.q_network = DQNNetwork(state_dim, action_dim)
        self.target_network = DQNNetwork(state_dim, action_dim)
        self.target_network.load_state_dict(self.q_network.state_dict())
        self.target_network.eval()
        
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=lr)
        self.criterion = nn.MSELoss()
        
    def choose_action(self, state: np.ndarray) -> int:
        """Epsilon-greedy action selection."""
        if np.random.rand() < self.epsilon:
            return random.randint(0, self.action_dim - 1)
            
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).unsqueeze(0)
            q_values = self.q_network(state_tensor)
            return torch.argmax(q_values).item()

    def store_transition(self, state: np.ndarray, action: int, reward: float, next_state: np.ndarray, done: bool) -> None:
        """Store in replay buffer."""
        self.memory.append((state, action, reward, next_state, done))

    def learn(self) -> None:
        """Sample batch, compute loss, backprop."""
        if len(self.memory) < self.batch_size:
            return
            
        batch = random.sample(self.memory, self.batch_size)
        
        states = torch.FloatTensor(np.array([t[0] for t in batch]))
        actions = torch.LongTensor(np.array([t[1] for t in batch])).unsqueeze(1)
        rewards = torch.FloatTensor(np.array([t[2] for t in batch])).unsqueeze(1)
        next_states = torch.FloatTensor(np.array([t[3] for t in batch]))
        dones = torch.FloatTensor(np.array([t[4] for t in batch])).unsqueeze(1)
        
        # Current Q values
        current_q = self.q_network(states).gather(1, actions)
        
        # Target Q values
        with torch.no_grad():
            max_next_q = self.target_network(next_states).max(1)[0].unsqueeze(1)
            target_q = rewards + (1 - dones) * self.gamma * max_next_q
            
        loss = self.criterion(current_q, target_q)
        
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        self.steps += 1
        if self.steps % self.target_update_freq == 0:
            self.update_target_network()
            
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

    def update_target_network(self) -> None:
        """Update target network weights."""
        self.target_network.load_state_dict(self.q_network.state_dict())

    def save(self, path: str) -> None:
        """Save model."""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        torch.save({
            'q_network': self.q_network.state_dict(),
            'target_network': self.target_network.state_dict(),
            'epsilon': self.epsilon,
            'optimizer': self.optimizer.state_dict()
        }, path)

    def load(self, path: str) -> None:
        """Load model."""
        checkpoint = torch.load(path)
        self.q_network.load_state_dict(checkpoint['q_network'])
        self.target_network.load_state_dict(checkpoint['target_network'])
        self.epsilon = checkpoint['epsilon']
        self.optimizer.load_state_dict(checkpoint['optimizer'])
