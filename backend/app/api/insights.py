from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.db_models import ModelRun

router = APIRouter(prefix="/insights", tags=["Insights"])

@router.get("")
def get_insights(db: Session = Depends(get_db)):
    # Find champion or top tree model
    run = db.query(ModelRun).filter(ModelRun.model_name.ilike("%xgboost%")).first()
    if not run:
        run = db.query(ModelRun).filter(ModelRun.model_name.ilike("%forest%")).first()
    if not run:
        run = db.query(ModelRun).order_by(ModelRun.roc_auc.desc()).first()

    feature_importances = run.feature_importances if run else []

    narrative_insights = [
        {
            "id": "contract_duration",
            "title": "Contract Duration is the #1 Retention Predictor",
            "metric": "42.7% vs 2.8%",
            "metric_label": "Churn Rate (Month-to-month vs Two-Year)",
            "summary": "Customers on Month-to-Month contracts exhibit more than 15x higher propensity to churn compared to customers committed to a Two-Year agreement.",
            "action": "Automate proactive incentives (e.g. 15% discount on annual renewal) starting at Month 9 for monthly subscribers.",
            "impact_level": "Critical"
        },
        {
            "id": "tenure_hazard",
            "title": "The First 12 Months Vulnerability Window",
            "metric": "47.4%",
            "metric_label": "First-Year Churn Concentration",
            "summary": "Nearly half of all customer churn events occur within the first 12 months of tenure. Retention stabilizes exponentially after month 24.",
            "action": "Deploy high-touch customer onboarding sequences, milestone celebrations at Day 30/90/180, and early satisfaction pulse checks.",
            "impact_level": "High"
        },
        {
            "id": "fiber_optic_paradox",
            "title": "Fiber Optic Service Experience Disconnect",
            "metric": "41.9%",
            "metric_label": "Fiber Optic Churn Rate",
            "summary": "Despite generating higher ARPU ($80-$110/mo), Fiber Optic accounts show disproportionately high churn, largely clustered among users without Tech Support or Online Security.",
            "action": "Bundle complimentary 6-month Tech Support and security suites with every new Fiber Optic activation.",
            "impact_level": "High"
        },
        {
            "id": "payment_friction",
            "title": "Payment Method Friction & Renewal Failure",
            "metric": "45.3%",
            "metric_label": "Electronic Check Churn Rate",
            "summary": "Customers paying via Electronic Check churn at roughly triple the rate of users with Automated Credit Card or Bank Transfer (15.2%).",
            "action": "Offer a recurring $5 monthly bill credit for migrating to ACH auto-pay or card tokenization.",
            "impact_level": "Medium"
        }
    ]

    return {
        "model_source": run.model_name if run else "Default XGBoost",
        "feature_importances": feature_importances,
        "narrative_insights": narrative_insights
    }
