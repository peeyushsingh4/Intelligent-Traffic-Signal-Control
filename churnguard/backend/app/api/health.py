from fastapi import APIRouter
from app.config import settings
import datetime

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def get_health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
