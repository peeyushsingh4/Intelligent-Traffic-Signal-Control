import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.services.seed_service import seed_database_if_empty
from app.api import health, dataset, models, predictions, insights

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("churnguard.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure DB tables exist and seed models if fresh install
    logger.info("Starting up ChurnGuard backend...")
    seed_database_if_empty()
    logger.info("ChurnGuard backend initialization complete.")
    yield
    # Shutdown
    logger.info("Shutting down ChurnGuard backend...")

app = FastAPI(
    title="ChurnGuard API",
    description="Customer Churn Intelligence Platform API powered by Ensemble Machine Learning",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(dataset.router, prefix=settings.API_PREFIX)
app.include_router(models.router, prefix=settings.API_PREFIX)
app.include_router(predictions.router, prefix=settings.API_PREFIX)
app.include_router(insights.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_prefix": settings.API_PREFIX
    }
