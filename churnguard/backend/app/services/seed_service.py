import logging
import datetime
from app.database import engine, Base, SessionLocal
from app.models.db_models import ModelRun, PredictionLog, DatasetSnapshot
from app.services.ml_service import ml_service, MODEL_CATALOG
from app.services.data_service import data_service

logger = logging.getLogger("churnguard.seed")

def seed_database_if_empty():
    """Initializes schema and runs full model training suite on initial launch."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing_runs = db.query(ModelRun).count()
        if existing_runs > 0:
            logger.info("Database already contains %d model runs. Skipping seed.", existing_runs)
            return

        logger.info("Empty database detected. Initializing ChurnGuard with full ensemble training suite...")

        # 1. Seed Dataset Snapshot
        summary = data_service.get_dataset_summary()
        snapshot = DatasetSnapshot(
            total_samples=summary["total_rows"],
            feature_count=summary["total_columns"],
            churn_count=summary["class_balance_raw"][1]["count"],
            non_churn_count=summary["class_balance_raw"][0]["count"],
            churn_rate=round(summary["class_balance_raw"][1]["count"] / summary["total_rows"], 4),
            preprocessing_summary=summary["missing_values_handled"]
        )
        db.add(snapshot)
        db.commit()

        # 2. Train all 8 models systematically
        results = []
        for key in MODEL_CATALOG.keys():
            logger.info("Training and cross-validating %s...", key)
            res = ml_service.train_and_evaluate(key, use_smote=True)
            results.append(res)

        # 3. Determine and mark Champion model (highest ROC-AUC)
        best_auc = -1.0
        best_run_id = None
        for r in results:
            if r["roc_auc"] > best_auc:
                best_auc = r["roc_auc"]
                best_run_id = r["run_id"]

        if best_run_id:
            champion = db.query(ModelRun).filter(ModelRun.run_id == best_run_id).first()
            if champion:
                champion.is_champion = True
                db.commit()
                logger.info("Selected %s as Champion Model (ROC-AUC: %.4f)", champion.model_name, champion.roc_auc)

        # 4. Seed initial realistic prediction log activities for the feed
        seed_customers = [
            {
                "customerID": "7590-VHVEG",
                "gender": "Female",
                "SeniorCitizen": 0,
                "Partner": "Yes",
                "Dependents": "No",
                "tenure": 1,
                "PhoneService": "No",
                "MultipleLines": "No phone service",
                "InternetService": "DSL",
                "OnlineSecurity": "No",
                "OnlineBackup": "Yes",
                "DeviceProtection": "No",
                "TechSupport": "No",
                "StreamingTV": "No",
                "StreamingMovies": "No",
                "Contract": "Month-to-month",
                "PaperlessBilling": "Yes",
                "PaymentMethod": "Electronic check",
                "MonthlyCharges": 29.85,
                "TotalCharges": 29.85
            },
            {
                "customerID": "5575-GNVDE",
                "gender": "Male",
                "SeniorCitizen": 0,
                "Partner": "No",
                "Dependents": "No",
                "tenure": 34,
                "PhoneService": "Yes",
                "MultipleLines": "No",
                "InternetService": "DSL",
                "OnlineSecurity": "Yes",
                "OnlineBackup": "No",
                "DeviceProtection": "Yes",
                "TechSupport": "No",
                "StreamingTV": "No",
                "StreamingMovies": "No",
                "Contract": "One year",
                "PaperlessBilling": "No",
                "PaymentMethod": "Mailed check",
                "MonthlyCharges": 56.95,
                "TotalCharges": 1889.5
            },
            {
                "customerID": "3668-QPYBK",
                "gender": "Male",
                "SeniorCitizen": 0,
                "Partner": "No",
                "Dependents": "No",
                "tenure": 2,
                "PhoneService": "Yes",
                "MultipleLines": "No",
                "InternetService": "DSL",
                "OnlineSecurity": "Yes",
                "OnlineBackup": "Yes",
                "DeviceProtection": "No",
                "TechSupport": "No",
                "StreamingTV": "No",
                "StreamingMovies": "No",
                "Contract": "Month-to-month",
                "PaperlessBilling": "Yes",
                "PaymentMethod": "Mailed check",
                "MonthlyCharges": 53.85,
                "TotalCharges": 108.15
            },
            {
                "customerID": "9237-HQITU",
                "gender": "Female",
                "SeniorCitizen": 0,
                "Partner": "No",
                "Dependents": "No",
                "tenure": 2,
                "PhoneService": "Yes",
                "MultipleLines": "No",
                "InternetService": "Fiber optic",
                "OnlineSecurity": "No",
                "OnlineBackup": "No",
                "DeviceProtection": "No",
                "TechSupport": "No",
                "StreamingTV": "No",
                "StreamingMovies": "No",
                "Contract": "Month-to-month",
                "PaperlessBilling": "Yes",
                "PaymentMethod": "Electronic check",
                "MonthlyCharges": 70.70,
                "TotalCharges": 151.65
            },
            {
                "customerID": "7795-CFOCW",
                "gender": "Male",
                "SeniorCitizen": 0,
                "Partner": "No",
                "Dependents": "No",
                "tenure": 45,
                "PhoneService": "No",
                "MultipleLines": "No phone service",
                "InternetService": "DSL",
                "OnlineSecurity": "Yes",
                "OnlineBackup": "No",
                "DeviceProtection": "Yes",
                "TechSupport": "Yes",
                "StreamingTV": "No",
                "StreamingMovies": "No",
                "Contract": "One year",
                "PaperlessBilling": "No",
                "PaymentMethod": "Bank transfer (automatic)",
                "MonthlyCharges": 42.30,
                "TotalCharges": 1840.75
            }
        ]

        for idx, cust in enumerate(seed_customers):
            pred = ml_service.predict_customer_churn(cust, preferred_model_key="xgboost")
            log = PredictionLog(
                customer_id=pred["customer_id"],
                inputs=cust,
                churn_probability=pred["churn_probability"],
                risk_tier=pred["risk_tier"],
                model_used=pred["model_used"],
                key_drivers=pred["key_drivers"],
                created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=15 * (idx + 1))
            )
            db.add(log)

        db.commit()
        logger.info("Successfully seeded ChurnGuard database with 8 trained models and initial logs.")

    except Exception as e:
        logger.error("Error seeding database: %s", str(e), exc_info=True)
        db.rollback()
    finally:
        db.close()
