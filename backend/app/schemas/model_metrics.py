from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime

class ConfusionMatrixSchema(BaseModel):
    matrix: list[list[int]]  # [[TN, FP], [FN, TP]]
    tn: int
    fp: int
    fn: int
    tp: int
    labels: list[str]

class RocPoint(BaseModel):
    fpr: float
    tpr: float

class RocCurveSchema(BaseModel):
    model_name: str
    auc: float
    points: list[RocPoint]

class KFoldResults(BaseModel):
    folds: list[float]
    mean: float
    std: float

class ModelMetricsResponse(BaseModel):
    run_id: str
    model_name: str
    model_family: str
    description: Optional[str] = None
    hyperparameters: dict[str, Any]
    accuracy: float
    precision: float
    recall: float          # Sensitivity
    specificity: float
    f1_score: float
    roc_auc: float
    log_loss: Optional[float] = None
    training_time_seconds: float
    confusion_matrix: ConfusionMatrixSchema
    roc_curve: RocCurveSchema
    kfold_scores: KFoldResults
    feature_importances: Optional[list[dict[str, Any]]] = None
    is_champion: bool = False
    created_at: datetime

class ModelTrainRequest(BaseModel):
    model_key: str  # e.g. "logistic_regression", "random_forest", "xgboost", "stacking"
    use_smote: bool = True
    hyperparameters: Optional[dict[str, Any]] = None

class ModelComparisonItem(BaseModel):
    run_id: str
    model_name: str
    model_family: str
    accuracy: float
    precision: float
    recall: float
    specificity: float
    f1_score: float
    roc_auc: float
    training_time_seconds: float
    is_champion: bool

class RecommendationResponse(BaseModel):
    champion_model: str
    champion_family: str
    champion_auc: float
    champion_f1: float
    rationale: str
    strengths: list[str]
    tradeoffs: list[str]
    comparison_summary: str
