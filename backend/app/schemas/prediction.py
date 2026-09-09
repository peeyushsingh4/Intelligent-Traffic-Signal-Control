from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class CustomerInput(BaseModel):
    gender: str = Field(default="Female", description="Male or Female")
    SeniorCitizen: int = Field(default=0, description="0 for No, 1 for Yes")
    Partner: str = Field(default="No", description="Yes or No")
    Dependents: str = Field(default="No", description="Yes or No")
    tenure: int = Field(default=12, ge=0, le=100, description="Number of months customer has stayed with company")
    PhoneService: str = Field(default="Yes", description="Yes or No")
    MultipleLines: str = Field(default="No", description="No phone service, No, or Yes")
    InternetService: str = Field(default="Fiber optic", description="DSL, Fiber optic, or No")
    OnlineSecurity: str = Field(default="No", description="No, Yes, or No internet service")
    OnlineBackup: str = Field(default="No", description="No, Yes, or No internet service")
    DeviceProtection: str = Field(default="No", description="No, Yes, or No internet service")
    TechSupport: str = Field(default="No", description="No, Yes, or No internet service")
    StreamingTV: str = Field(default="Yes", description="No, Yes, or No internet service")
    StreamingMovies: str = Field(default="Yes", description="No, Yes, or No internet service")
    Contract: str = Field(default="Month-to-month", description="Month-to-month, One year, Two year")
    PaperlessBilling: str = Field(default="Yes", description="Yes or No")
    PaymentMethod: str = Field(default="Electronic check", description="Electronic check, Mailed check, Bank transfer (automatic), Credit card (automatic)")
    MonthlyCharges: float = Field(default=89.85, ge=10.0, le=200.0, description="Monthly recurring charge")
    TotalCharges: Optional[float] = Field(default=None, description="Total charges to date (auto-computed if None)")

class KeyDriver(BaseModel):
    feature: str
    impact: str          # "High Risk Factor", "Protective Factor", "Neutral"
    description: str

class PredictionResponse(BaseModel):
    customer_id: str
    churn_probability: float  # 0.0 to 1.0
    churn_percentage: float   # 0% to 100%
    prediction: int           # 1 (Churn) or 0 (Retain)
    risk_tier: str            # LOW, MEDIUM, HIGH
    model_used: str
    key_drivers: list[KeyDriver]
    retention_recommendations: list[str]

class PredictionHistoryItem(BaseModel):
    id: int
    customer_id: str
    churn_probability: float
    risk_tier: str
    model_used: str
    contract: str
    tenure: int
    monthly_charges: float
    created_at: datetime
