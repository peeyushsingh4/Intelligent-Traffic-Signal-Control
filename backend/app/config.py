import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "ChurnGuard"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Paths
    DATA_DIR: Path = BASE_DIR / "data"
    DATASET_PATH: Path = BASE_DIR / "data" / "WA_Fn-UseC_-Telco-Customer-Churn.csv"
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'churnguard.db'}"
    
    # Model Artifacts
    MODELS_DIR: Path = BASE_DIR / "models_store"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]
    
    # Training defaults
    TEST_SIZE: float = 0.20
    RANDOM_STATE: int = 42
    N_SPLITS_KFOLD: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
