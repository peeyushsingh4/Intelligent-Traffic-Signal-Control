from pydantic import BaseModel
from typing import Any, Optional

class FeatureDetail(BaseModel):
    name: str
    dtype: str
    null_count: int
    unique_count: int
    sample_values: list[Any]

class ClassBalance(BaseModel):
    label: str
    count: int
    percentage: float

class DatasetSummaryResponse(BaseModel):
    total_rows: int
    total_columns: int
    target_column: str
    class_balance_raw: list[ClassBalance]
    class_balance_resampled: list[ClassBalance]
    missing_values_handled: dict[str, Any]
    numerical_features: list[str]
    categorical_features: list[str]
    sample_rows: list[dict[str, Any]]
    preprocessing_steps: list[dict[str, str]]
