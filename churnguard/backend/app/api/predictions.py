from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.db_models import PredictionLog
from app.schemas.prediction import CustomerInput, PredictionResponse, PredictionHistoryItem
from app.services.ml_service import ml_service

router = APIRouter(prefix="", tags=["Predictions"])

@router.post("/predict", response_model=PredictionResponse)
def predict_churn(customer: CustomerInput, model_key: Optional[str] = "xgboost", db: Session = Depends(get_db)):
    try:
        cust_dict = customer.model_dump()
        result = ml_service.predict_customer_churn(cust_dict, preferred_model_key=model_key)
        
        # Log to database
        log_entry = PredictionLog(
            customer_id=result["customer_id"],
            inputs=cust_dict,
            churn_probability=result["churn_probability"],
            risk_tier=result["risk_tier"],
            model_used=result["model_used"],
            key_drivers=result["key_drivers"]
        )
        db.add(log_entry)
        db.commit()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/predictions/history", response_model=List[PredictionHistoryItem])
def get_prediction_history(
    limit: int = Query(default=15, ge=1, le=100, description="Max records to return"),
    db: Session = Depends(get_db)
):
    logs = db.query(PredictionLog).order_by(PredictionLog.created_at.desc()).limit(limit).all()
    history = []
    for l in logs:
        inputs = l.inputs or {}
        history.append(PredictionHistoryItem(
            id=l.id,
            customer_id=l.customer_id or f"CUST-{l.id}",
            churn_probability=l.churn_probability,
            risk_tier=l.risk_tier,
            model_used=l.model_used,
            contract=inputs.get("Contract", "Month-to-month"),
            tenure=int(inputs.get("tenure", 0)),
            monthly_charges=float(inputs.get("MonthlyCharges", 0.0)),
            created_at=l.created_at
        ))
    return history
