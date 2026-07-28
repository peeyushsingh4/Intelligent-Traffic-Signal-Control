import os
import xgboost as xgb
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

class TrafficPredictorXGBoost:
    """Wraps XGBoost for traffic density prediction."""
    
    def __init__(self, n_estimators: int = 100, max_depth: int = 6, learning_rate: float = 0.1, objective: str = 'reg:squarederror'):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.learning_rate = learning_rate
        self.model = xgb.XGBRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            learning_rate=learning_rate,
            objective=objective
        )
        self.feature_names = []
        
    def prepare_features(self, df: pd.DataFrame, target_col: str = "vehicle_count", horizon: int = 10) -> Tuple[pd.DataFrame, pd.Series]:
        """Feature engineering from raw data."""
        if df.empty:
            return pd.DataFrame(), pd.Series()
            
        features = df.copy()
        
        # Target: predict vehicle_count N steps ahead
        target = features[target_col].shift(-horizon)
        
        # Drop rows with NaN targets
        valid_idx = target.notna()
        features = features[valid_idx]
        target = target[valid_idx]
        
        # Drop non-numeric / metadata columns
        drop_cols = [c for c in ['step_time'] if c in features.columns]
        if drop_cols:
            features = features.drop(columns=drop_cols)

        # Keep numeric features
        features = features.select_dtypes(include=[np.number])
        self.feature_names = list(features.columns)
            
        return features, target

    def train(self, X_train: pd.DataFrame, y_train: pd.Series) -> None:
        """Train XGBoost regressor."""
        self.model.fit(X_train, y_train)

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Predict traffic density/vehicle count."""
        return self.model.predict(X)

    def evaluate(self, X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, float]:
        """Returns MAE, RMSE, R² metrics."""
        y_pred = self.predict(X_test)
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))
        
        return {
            "mae": mae,
            "rmse": rmse,
            "r2": r2,
            "MAE": mae,
            "RMSE": rmse,
            "R2": r2
        }

    def save_model(self, path: str) -> None:
        """Save model to file."""
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        self.model.save_model(path)

    def load_model(self, path: str) -> None:
        """Load model from file."""
        self.model.load_model(path)

    def feature_importance(self) -> Dict[str, float]:
        """Returns feature importance dict."""
        importances = self.model.feature_importances_
        if len(self.feature_names) == len(importances):
            return dict(zip(self.feature_names, [float(x) for x in importances]))
        booster = self.model.get_booster()
        score = booster.get_score(importance_type='weight')
        return {k: float(v) for k, v in score.items()}
