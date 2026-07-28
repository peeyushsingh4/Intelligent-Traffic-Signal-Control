import os
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List, Optional
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from torch.utils.data import DataLoader, TensorDataset

class LSTMModel(nn.Module):
    """LSTM network for traffic prediction."""
    def __init__(self, input_size: int, hidden_size: int = 64, num_layers: int = 2, dropout: float = 0.2):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(
            input_size, 
            hidden_size, 
            num_layers, 
            batch_first=True, 
            dropout=dropout if num_layers > 1 else 0.0
        )
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_size, 1)
        
    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.dropout(out[:, -1, :])
        out = self.fc(out)
        return out

class TrafficPredictorLSTM:
    """Uses PyTorch for LSTM-based traffic prediction."""
    def __init__(self, input_size: int = 11, hidden_size: int = 64, num_layers: int = 2, dropout: float = 0.2):
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.dropout = dropout
        self.model = LSTMModel(input_size, hidden_size, num_layers, dropout)
        self.scaler = MinMaxScaler()
        self.criterion = nn.MSELoss()
        
    def prepare_sequences(
        self, 
        data: Any, 
        feature_cols: Optional[List[str]] = None,
        target_col: str = "vehicle_count",
        window_size: int = 10, 
        batch_size: int = 32,
        test_size: float = 0.2
    ) -> Tuple[DataLoader, DataLoader]:
        """Creates sliding window sequences, splits into train/test."""
        if isinstance(data, pd.DataFrame):
            if feature_cols:
                cols = [c for c in feature_cols if c in data.columns]
            else:
                cols = list(data.select_dtypes(include=[np.number]).columns)
            
            if target_col in cols:
                # Put target_col first
                cols.remove(target_col)
                cols = [target_col] + cols
            
            self.input_size = len(cols)
            # Recreate model if input_size changed
            if self.model.lstm.input_size != self.input_size:
                self.model = LSTMModel(self.input_size, self.hidden_size, self.num_layers, self.dropout)
                
            raw_values = data[cols].values
        else:
            raw_values = np.array(data)

        if len(raw_values) <= window_size:
            dummy_dl = DataLoader(TensorDataset(torch.zeros(0, window_size, self.input_size), torch.zeros(0)))
            return dummy_dl, dummy_dl
            
        scaled_data = self.scaler.fit_transform(raw_values)
        
        X, y = [], []
        for i in range(len(scaled_data) - window_size):
            X.append(scaled_data[i:(i + window_size)])
            y.append(scaled_data[i + window_size, 0]) # Predict target at col 0
            
        X = np.array(X, dtype=np.float32)
        y = np.array(y, dtype=np.float32)
        
        split_idx = int(len(X) * (1.0 - test_size))
        
        X_train, y_train = X[:split_idx], y[:split_idx]
        X_test, y_test = X[split_idx:], y[split_idx:]
        
        train_dataset = TensorDataset(torch.FloatTensor(X_train), torch.FloatTensor(y_train))
        test_dataset = TensorDataset(torch.FloatTensor(X_test), torch.FloatTensor(y_test))
        
        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
        test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
        
        return train_loader, test_loader

    def train(self, train_loader: DataLoader, epochs: int = 50, lr: float = 0.001) -> list:
        """Training loop with loss tracking."""
        optimizer = optim.Adam(self.model.parameters(), lr=lr)
        self.model.train()
        losses = []
        
        for epoch in range(epochs):
            epoch_loss = 0.0
            steps = 0
            for X_batch, y_batch in train_loader:
                if len(X_batch) == 0:
                    continue
                optimizer.zero_grad()
                y_pred = self.model(X_batch).squeeze(-1)
                loss = self.criterion(y_pred, y_batch)
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item()
                steps += 1
            if steps > 0:
                losses.append(epoch_loss / steps)
            else:
                losses.append(0.0)
            
        return losses

    def predict(self, sequence: np.ndarray) -> float:
        """Predict next value."""
        self.model.eval()
        with torch.no_grad():
            seq_tensor = torch.FloatTensor(sequence).unsqueeze(0)
            pred = self.model(seq_tensor).item()
            
            dummy = np.zeros((1, getattr(self.scaler, 'n_features_in_', 1)))
            dummy[0, 0] = pred
            return float(self.scaler.inverse_transform(dummy)[0, 0])

    def evaluate(self, test_loader: DataLoader) -> Dict[str, float]:
        """Returns MAE, RMSE, R²."""
        self.model.eval()
        predictions = []
        actuals = []
        
        with torch.no_grad():
            for X_batch, y_batch in test_loader:
                if len(X_batch) == 0:
                    continue
                y_pred = self.model(X_batch).squeeze(-1)
                predictions.extend(y_pred.cpu().numpy().tolist())
                actuals.extend(y_batch.cpu().numpy().tolist())
                
        if not predictions:
            return {"mae": 0.0, "rmse": 0.0, "r2": 0.0, "MAE": 0.0, "RMSE": 0.0, "R2": 0.0}

        mae = float(mean_absolute_error(actuals, predictions))
        rmse = float(np.sqrt(mean_squared_error(actuals, predictions)))
        r2 = float(r2_score(actuals, predictions))
        
        return {
            "mae": mae,
            "rmse": rmse,
            "r2": r2,
            "MAE": mae,
            "RMSE": rmse,
            "R2": r2
        }

    def save_model(self, path: str) -> None:
        """Save model."""
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'scaler': self.scaler,
            'input_size': self.input_size,
            'hidden_size': self.hidden_size,
            'num_layers': self.num_layers,
            'dropout': self.dropout
        }, path)

    def load_model(self, path: str) -> None:
        """Load model."""
        checkpoint = torch.load(path)
        self.input_size = checkpoint.get('input_size', 11)
        self.hidden_size = checkpoint.get('hidden_size', 64)
        self.num_layers = checkpoint.get('num_layers', 2)
        self.dropout = checkpoint.get('dropout', 0.2)
        self.model = LSTMModel(self.input_size, self.hidden_size, self.num_layers, self.dropout)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.scaler = checkpoint['scaler']
