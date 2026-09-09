import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db
from app.services.seed_service import seed_database_if_empty

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()
    seed_database_if_empty()

def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "ChurnGuard"

def test_dataset_summary():
    with TestClient(app) as client:
        response = client.get("/api/dataset/summary")
        assert response.status_code == 200
        data = response.json()
        assert data["total_rows"] == 7043
        assert data["target_column"] == "Churn"
        assert len(data["class_balance_raw"]) == 2
        assert len(data["preprocessing_steps"]) >= 4

def test_models_comparison():
    with TestClient(app) as client:
        response = client.get("/api/models/comparison")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 8
        families = {item["model_family"] for item in data}
        assert "Baseline" in families
        assert "Bagging" in families
        assert "Boosting" in families
        assert "Stacking" in families

def test_roc_and_recommendation():
    with TestClient(app) as client:
        roc_res = client.get("/api/models/roc-comparison")
        assert roc_res.status_code == 200
        assert len(roc_res.json()) >= 8

        rec_res = client.get("/api/models/recommendation")
        assert rec_res.status_code == 200
        rec_data = rec_res.json()
        assert "champion_model" in rec_data
        assert rec_data["champion_auc"] > 0.70

def test_single_prediction():
    with TestClient(app) as client:
        payload = {
            "gender": "Female",
            "SeniorCitizen": 0,
            "Partner": "No",
            "Dependents": "No",
            "tenure": 3,
            "PhoneService": "Yes",
            "MultipleLines": "No",
            "InternetService": "Fiber optic",
            "OnlineSecurity": "No",
            "OnlineBackup": "No",
            "DeviceProtection": "No",
            "TechSupport": "No",
            "StreamingTV": "Yes",
            "StreamingMovies": "Yes",
            "Contract": "Month-to-month",
            "PaperlessBilling": "Yes",
            "PaymentMethod": "Electronic check",
            "MonthlyCharges": 85.50
        }
        response = client.post("/api/predict?model_key=xgboost", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "churn_probability" in data
        assert 0.0 <= data["churn_probability"] <= 1.0
        assert data["risk_tier"] in ["LOW", "MEDIUM", "HIGH"]
        assert len(data["key_drivers"]) > 0
