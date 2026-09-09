import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Boolean, Text
from app.database import Base

class ModelRun(Base):
    __tablename__ = "model_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String(64), unique=True, index=True)
    model_name = Column(String(128), index=True)
    model_family = Column(String(64), index=True)  # Baseline, Bagging, Boosting, Stacking
    description = Column(Text, nullable=True)
    hyperparameters = Column(JSON, default=dict)
    
    # Core Classification Metrics
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)          # Sensitivity
    specificity = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    roc_auc = Column(Float, nullable=False)
    log_loss = Column(Float, nullable=True)
    training_time_seconds = Column(Float, default=0.0)

    # Detailed Evaluation Payloads
    confusion_matrix = Column(JSON, nullable=False)  # [[TN, FP], [FN, TP]]
    roc_curve = Column(JSON, nullable=False)         # {"fpr": [...], "tpr": [...], "thresholds": [...]}
    kfold_scores = Column(JSON, nullable=False)      # {"folds": [...], "mean": ..., "std": ...}
    feature_importances = Column(JSON, nullable=True) # [{"feature": str, "importance": float}]

    is_champion = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(64), index=True)
    inputs = Column(JSON, nullable=False)
    churn_probability = Column(Float, nullable=False)
    risk_tier = Column(String(16), nullable=False)  # LOW, MEDIUM, HIGH
    model_used = Column(String(128), nullable=False)
    key_drivers = Column(JSON, nullable=True)       # [{"feature": str, "direction": str, "impact": str}]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class DatasetSnapshot(Base):
    __tablename__ = "dataset_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    total_samples = Column(Integer, default=7043)
    feature_count = Column(Integer, default=20)
    churn_count = Column(Integer, default=1869)
    non_churn_count = Column(Integer, default=5174)
    churn_rate = Column(Float, default=0.265)
    preprocessing_summary = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
