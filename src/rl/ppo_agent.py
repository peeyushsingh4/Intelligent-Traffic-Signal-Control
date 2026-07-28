import os
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from torch.distributions import Categorical

class ActorNetwork(nn.Module):
    """Outputs action probabilities."""
    def __init__(self, state_dim: int, action_dim: int):
        super(ActorNetwork, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, action_dim),
            nn.Softmax(dim=-1)
        )
        
    def forward(self, x):
        return self.network(x)

class CriticNetwork(nn.Module):
    """Outputs state value."""
    def __init__(self, state_dim: int):
        super(CriticNetwork, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1)
        )
        
    def forward(self, x):
        return self.network(x)

class PPOAgent:
    """Proximal Policy Optimization using PyTorch."""
    def __init__(self, state_dim: int = 11, action_dim: int = 4,
                 gamma: float = 0.99, gae_lambda: float = 0.95,
                 lr_actor: float = 0.0003, lr_critic: float = 0.001,
                 k_epochs: int = 4, epsilon_clip: float = 0.2):
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self.K_epochs = k_epochs
        self.epsilon_clip = epsilon_clip
        
        self.actor = ActorNetwork(state_dim, action_dim)
        self.critic = CriticNetwork(state_dim)
        
        self.optimizer_actor = optim.Adam(self.actor.parameters(), lr=lr_actor)
        self.optimizer_critic = optim.Adam(self.critic.parameters(), lr=lr_critic)
        
        self.buffer = []
        
    def choose_action(self, state: np.ndarray) -> tuple:
        """Sample from policy distribution. Returns action, log_prob, value."""
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        
        with torch.no_grad():
            action_probs = self.actor(state_tensor)
            dist = Categorical(action_probs)
            action = dist.sample()
            log_prob = dist.log_prob(action)
            value = self.critic(state_tensor)
            
        return action.item(), log_prob.item(), value.item()

    def store_transition(self, state: np.ndarray, action: int, reward: float, log_prob: float, value: float, done: bool) -> None:
        """Store in buffer."""
        self.buffer.append((state, action, reward, log_prob, value, done))

    def learn(self) -> None:
        """PPO update with clipped objective, GAE advantages."""
        if len(self.buffer) == 0:
            return
            
        states = torch.FloatTensor(np.array([t[0] for t in self.buffer]))
        actions = torch.LongTensor(np.array([t[1] for t in self.buffer]))
        rewards = [t[2] for t in self.buffer]
        old_log_probs = torch.FloatTensor(np.array([t[3] for t in self.buffer]))
        values = torch.FloatTensor(np.array([t[4] for t in self.buffer])).squeeze()
        dones = [t[5] for t in self.buffer]
        
        # Calculate advantages (GAE)
        returns = []
        advantages = []
        gae = 0
        
        for i in reversed(range(len(rewards))):
            if i == len(rewards) - 1:
                next_val = 0
            else:
                next_val = values[i + 1]
                
            delta = rewards[i] + self.gamma * next_val * (1 - int(dones[i])) - values[i]
            gae = delta + self.gamma * self.gae_lambda * (1 - int(dones[i])) * gae
            advantages.insert(0, gae)
            returns.insert(0, gae + values[i])
            
        advantages = torch.FloatTensor(advantages)
        returns = torch.FloatTensor(returns)
        
        # Normalize advantages
        advantages = (advantages - advantages.mean()) / (advantages.std() + 1e-8)
        
        for _ in range(self.K_epochs):
            # Evaluate old actions and values
            action_probs = self.actor(states)
            dist = Categorical(action_probs)
            log_probs = dist.log_prob(actions)
            state_values = self.critic(states).squeeze()
            entropy = dist.entropy()
            
            # Ratios
            ratios = torch.exp(log_probs - old_log_probs)
            
            # Surrogate Loss
            surr1 = ratios * advantages
            surr2 = torch.clamp(ratios, 1 - self.epsilon_clip, 1 + self.epsilon_clip) * advantages
            
            actor_loss = -torch.min(surr1, surr2).mean() - 0.01 * entropy.mean()
            critic_loss = nn.MSELoss()(state_values, returns)
            
            self.optimizer_actor.zero_grad()
            actor_loss.backward()
            self.optimizer_actor.step()
            
            self.optimizer_critic.zero_grad()
            critic_loss.backward()
            self.optimizer_critic.step()
            
        self.buffer.clear()

    def save(self, path: str) -> None:
        """Save models."""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        torch.save({
            'actor': self.actor.state_dict(),
            'critic': self.critic.state_dict()
        }, path)

    def load(self, path: str) -> None:
        """Load models."""
        checkpoint = torch.load(path)
        self.actor.load_state_dict(checkpoint['actor'])
        self.critic.load_state_dict(checkpoint['critic'])
