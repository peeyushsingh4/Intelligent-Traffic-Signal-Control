from fastapi import APIRouter, HTTPException
from app.services.data_service import data_service
from app.schemas.dataset import DatasetSummaryResponse

router = APIRouter(prefix="/dataset", tags=["Dataset"])

@router.get("/summary", response_model=DatasetSummaryResponse)
def get_dataset_summary():
    try:
        summary = data_service.get_dataset_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load dataset summary: {str(e)}")
