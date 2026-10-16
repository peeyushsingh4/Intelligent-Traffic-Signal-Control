"""
Configuration module for the Financial Fraud Detection Platform.

Loads and strictly validates all environment variables at startup using Pydantic Settings.
Fails fast if invalid configurations are supplied. Ensures sensitive values
(passwords, full connection strings) are masked and never leaked to logs or API responses.
"""

from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Server settings
    HOST: str = Field(default="0.0.0.0", description="API server host")
    PORT: int = Field(default=8000, ge=1, le=65535, description="API server port")
    ENVIRONMENT: str = Field(default="development", description="Runtime environment")
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")

    # Database settings
    MONGO_URI: str = Field(
        default="mongodb://localhost:27017",
        description="MongoDB connection string (credentials masked in logs)"
    )
    DATABASE_NAME: str = Field(
        default="fraud_detection_db",
        min_length=1,
        description="Database name for storage"
    )
    USE_MOCK_DB: bool = Field(
        default=False,
        description="Force use of in-memory mock MongoDB (mongomock-motor)"
    )

    # Ingestion & Stream Simulator
    STREAM_SPEED: int = Field(
        default=10,
        ge=1,
        le=500,
        description="Default transactions pushed per second"
    )
    DEFAULT_DATASET_PATH: str = Field(
        default="backend/data/paysim_sample.csv",
        description="Relative or absolute path to PaySim CSV dataset"
    )

    # Streaming Algorithms Parameters
    BLOOM_EXPECTED_ACCOUNTS: int = Field(
        default=100000,
        ge=1000,
        description="Expected distinct accounts for Bloom Filter sizing (n)"
    )
    BLOOM_FALSE_POSITIVE_RATE: float = Field(
        default=0.01,
        gt=0.0,
        lt=0.5,
        description="Target false positive probability for Bloom Filter (p)"
    )
    DGIM_WINDOW_SIZE: int = Field(
        default=10000,
        ge=100,
        description="Sliding window size (N) for DGIM high-value counter"
    )
    DGIM_HIGH_VALUE_THRESHOLD: float = Field(
        default=200000.0,
        gt=0.0,
        description="Transaction amount threshold considered 'large' for DGIM bit stream"
    )
    FM_HASH_COUNT: int = Field(
        default=32,
        ge=4,
        le=128,
        description="Number of hash functions used in Flajolet-Martin estimation"
    )

    # CORS origins
    CORS_ORIGINS: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        description="Comma-separated allowed CORS origins"
    )

    @field_validator("CORS_ORIGINS")
    @classmethod
    def parse_cors_origins(cls, v: str) -> str:
        # Validate that comma-separated origins are non-empty
        if not v or not v.strip():
            return "http://localhost:5173"
        return v

    def get_cors_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    def safe_dict(self) -> dict:
        """
        Returns a dictionary representation safe for logging and client inspection,
        completely masking any credentials or sensitive database connection strings.
        """
        d = self.model_dump()
        # Mask credentials in MONGO_URI if present
        uri = d.get("MONGO_URI", "")
        if "@" in uri:
            # Mask user:pass@
            prefix = uri.split("@")[0]
            suffix = uri.split("@")[1]
            scheme = prefix.split("://")[0] if "://" in prefix else "mongodb"
            d["MONGO_URI"] = f"{scheme}://***:***@{suffix}"
        return d

    model_config = SettingsConfigDict(
        env_file="backend/.env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


# Instantiate settings singleton at startup to fail-fast on misconfigurations
try:
    settings = Settings()
except Exception as exc:
    # Fail fast with safe, non-leaking message
    raise RuntimeError(f"FATAL: Application configuration validation failed: {exc}") from exc
