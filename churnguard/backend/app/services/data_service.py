import os
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
import joblib
from app.config import settings

class DataService:
    def __init__(self):
        self.dataset_path = settings.DATASET_PATH
        self.scaler = None
        self.feature_columns = None
        self.raw_df = None
        self.cleaned_df = None
        self.artifacts_dir = settings.MODELS_DIR
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)
        self.scaler_path = self.artifacts_dir / "scaler.joblib"
        self.feature_cols_path = self.artifacts_dir / "feature_columns.joblib"

    def load_raw_data(self) -> pd.DataFrame:
        """Loads raw IBM Telco Customer Churn dataset."""
        if not self.dataset_path.exists():
            raise FileNotFoundError(f"Dataset not found at {self.dataset_path}")
        df = pd.read_csv(self.dataset_path)
        self.raw_df = df
        return df

    def get_dataset_summary(self) -> dict:
        """Returns statistical overview and class balance for UI presentation."""
        df = self.load_raw_data()
        
        # Clean TotalCharges for statistics
        total_charges_clean = pd.to_numeric(df["TotalCharges"].str.strip(), errors="coerce")
        missing_total_charges = int(total_charges_clean.isna().sum())

        churn_counts = df["Churn"].value_counts().to_dict()
        total_rows = len(df)
        raw_balance = [
            {
                "label": "Retained (No)",
                "count": int(churn_counts.get("No", 0)),
                "percentage": round((churn_counts.get("No", 0) / total_rows) * 100, 2)
            },
            {
                "label": "Churned (Yes)",
                "count": int(churn_counts.get("Yes", 0)),
                "percentage": round((churn_counts.get("Yes", 0) / total_rows) * 100, 2)
            }
        ]

        # Resampled projection balance (50/50 after SMOTE)
        majority_count = max(churn_counts.values())
        resampled_balance = [
            {
                "label": "Retained (No)",
                "count": int(majority_count),
                "percentage": 50.0
            },
            {
                "label": "Churned (Yes - SMOTE)",
                "count": int(majority_count),
                "percentage": 50.0
            }
        ]

        numerical_features = ["tenure", "MonthlyCharges", "TotalCharges"]
        categorical_features = [
            col for col in df.columns 
            if col not in numerical_features and col not in ["customerID", "Churn", "SeniorCitizen"]
        ] + ["SeniorCitizen"]

        sample_records = df.head(10).fillna("").to_dict(orient="records")

        preprocessing_steps = [
            {
                "step": "1. Data Cleaning & Type Casting",
                "detail": f"Identified {missing_total_charges} whitespace blanks in TotalCharges where tenure=0. Imputed with 0.0 and cast to float64."
            },
            {
                "step": "2. Categorical Dummy Encoding",
                "detail": "Applied One-Hot Encoding across 16 categorical dimensions (Contract, InternetService, PaymentMethod, etc.) using drop_first=True to avoid collinearity."
            },
            {
                "step": "3. Standard Feature Scaling",
                "detail": "StandardScaler applied to continuous variables (tenure, MonthlyCharges, TotalCharges) to maintain zero mean and unit variance for regularized models."
            },
            {
                "step": "4. Stratified Train/Test Partition",
                "detail": f"Split into 80% Training ({int(total_rows * 0.8)} rows) and 20% Holdout Test ({int(total_rows * 0.2)} rows) maintaining exact class ratios."
            },
            {
                "step": "5. Class Imbalance Mitigation (SMOTE)",
                "detail": "Synthetic Minority Over-sampling Technique (SMOTE) synthesizes realistic feature space vectors along k-nearest neighbors for the minority churn class."
            }
        ]

        return {
            "total_rows": total_rows,
            "total_columns": len(df.columns),
            "target_column": "Churn",
            "class_balance_raw": raw_balance,
            "class_balance_resampled": resampled_balance,
            "missing_values_handled": {
                "TotalCharges_missing": missing_total_charges,
                "strategy": "Imputed with 0.0 (aligned with tenure=0 new signups)"
            },
            "numerical_features": numerical_features,
            "categorical_features": categorical_features,
            "sample_rows": sample_records,
            "preprocessing_steps": preprocessing_steps
        }

    def prepare_pipeline_data(self, use_smote: bool = True):
        """
        Executes complete preprocessing pipeline:
        1. Cleans missing values
        2. Encodes target (Yes=1, No=0)
        3. Encodes categorical variables (OHE)
        4. StandardScales numeric columns
        5. Stratified 80/20 train/test split
        6. Optional SMOTE on train split
        """
        df = self.load_raw_data().copy()

        # 1. Clean TotalCharges
        df["TotalCharges"] = pd.to_numeric(df["TotalCharges"].str.strip(), errors="coerce").fillna(0.0)

        # 2. Target Encoding
        df["Churn"] = (df["Churn"].str.strip() == "Yes").astype(int)

        # 3. Drop customerID
        df = df.drop(columns=["customerID"])

        # Categorical columns to dummy encode
        cat_cols = [
            "gender", "Partner", "Dependents", "PhoneService", "MultipleLines",
            "InternetService", "OnlineSecurity", "OnlineBackup", "DeviceProtection",
            "TechSupport", "StreamingTV", "StreamingMovies", "Contract",
            "PaperlessBilling", "PaymentMethod"
        ]

        df_encoded = pd.get_dummies(df, columns=cat_cols, drop_first=True, dtype=float)

        # Feature matrix X and target y
        y = df_encoded["Churn"].values
        X = df_encoded.drop(columns=["Churn"])
        feature_names = list(X.columns)
        self.feature_columns = feature_names
        joblib.dump(feature_names, self.feature_cols_path)

        # 4. Train / Test Split (Stratified 80/20)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=settings.TEST_SIZE,
            random_state=settings.RANDOM_STATE,
            stratify=y
        )

        # 5. Scaling Numerical Features
        num_cols = ["tenure", "MonthlyCharges", "TotalCharges"]
        self.scaler = StandardScaler()
        X_train_scaled = X_train.copy()
        X_test_scaled = X_test.copy()

        X_train_scaled[num_cols] = self.scaler.fit_transform(X_train[num_cols])
        X_test_scaled[num_cols] = self.scaler.transform(X_test[num_cols])
        joblib.dump(self.scaler, self.scaler_path)

        # 6. Optional SMOTE for training set only
        if use_smote:
            smote = SMOTE(random_state=settings.RANDOM_STATE)
            X_train_final, y_train_final = smote.fit_resample(X_train_scaled, y_train)
        else:
            X_train_final, y_train_final = X_train_scaled, y_train

        return {
            "X_train": X_train_final,
            "y_train": y_train_final,
            "X_test": X_test_scaled,
            "y_test": y_test,
            "feature_names": feature_names,
            "raw_test_df": df.iloc[X_test.index]
        }

    def transform_single_customer(self, customer_dict: dict) -> np.ndarray:
        """Transforms a single customer input dictionary into model-ready vector."""
        if not self.feature_cols_path.exists() or not self.scaler_path.exists():
            self.prepare_pipeline_data()

        feature_names = joblib.load(self.feature_cols_path)
        scaler = joblib.load(self.scaler_path)

        # Compute TotalCharges if not provided
        tenure = int(customer_dict.get("tenure", 1))
        monthly_charges = float(customer_dict.get("MonthlyCharges", 50.0))
        total_charges = customer_dict.get("TotalCharges")
        if total_charges is None or total_charges == "":
            total_charges = round(tenure * monthly_charges, 2)
        else:
            total_charges = float(total_charges)

        cust_data = {**customer_dict, "TotalCharges": total_charges}
        cust_df = pd.DataFrame([cust_data])

        # Categorical columns
        cat_cols = [
            "gender", "Partner", "Dependents", "PhoneService", "MultipleLines",
            "InternetService", "OnlineSecurity", "OnlineBackup", "DeviceProtection",
            "TechSupport", "StreamingTV", "StreamingMovies", "Contract",
            "PaperlessBilling", "PaymentMethod"
        ]

        cust_encoded = pd.get_dummies(cust_df, columns=cat_cols, drop_first=True, dtype=float)

        # Align with training features (pad missing columns with 0.0)
        aligned_df = pd.DataFrame(0.0, index=[0], columns=feature_names)
        for col in cust_encoded.columns:
            if col in aligned_df.columns:
                aligned_df[col] = cust_encoded[col].values

        # Scale numericals
        num_cols = ["tenure", "MonthlyCharges", "TotalCharges"]
        aligned_df[num_cols] = scaler.transform(aligned_df[num_cols])

        return aligned_df.values, aligned_df

data_service = DataService()
