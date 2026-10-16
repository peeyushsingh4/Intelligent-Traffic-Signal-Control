"""
FastAPI REST API Routes.

Exposes endpoints for streaming controls, paginated transactions,
streaming algorithm telemetry, batch analytics, and graph community detection.
"""

import logging
from typing import Optional
from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel, Field

from backend.config import settings
from backend.storage.mongo_client import db_manager
from backend.storage.repositories import (
    TransactionRepository,
    FlaggedEventRepository,
    AccountRepository,
)
from backend.ingestion.stream_simulator import stream_simulator
from backend.analytics.batch_jobs import run_account_batch_aggregation
from backend.analytics.graph_analysis import analyze_fraud_rings

logger = logging.getLogger("fraud_detection.api")
router = APIRouter(prefix="/api")


# Request models
class SpeedRequest(BaseModel):
    speed: int = Field(..., ge=1, le=500, description="Transactions per second")


# -----------------------------------------------------------------------------
# 1. Health & Status
# -----------------------------------------------------------------------------
@router.get("/health", tags=["System"])
async def get_health():
    """Returns application health status and database connectivity mode."""
    db_status = "connected"
    is_mock = db_manager.is_mock
    try:
        db = await db_manager.get_db()
        await db.command("ping")
    except Exception:
        db_status = "degraded"

    return {
        "status": "healthy",
        "database": db_status,
        "is_mock_db": is_mock,
        "environment": settings.ENVIRONMENT,
        "stream_state": stream_simulator.state,
    }


# -----------------------------------------------------------------------------
# 2. Streaming Control Endpoints
# -----------------------------------------------------------------------------
@router.get("/stream/status", tags=["Streaming"])
async def get_stream_status():
    """Returns live stream simulator KPIs, buffer counts, and algorithm states."""
    return stream_simulator.get_stats()


@router.post("/stream/start", tags=["Streaming"])
async def start_stream():
    """Starts or resumes transaction stream simulation."""
    stream_simulator.start()
    return {"message": "Stream simulation started.", "state": stream_simulator.state}


@router.post("/stream/pause", tags=["Streaming"])
async def pause_stream():
    """Pauses transaction stream simulation."""
    stream_simulator.pause()
    return {"message": "Stream simulation paused.", "state": stream_simulator.state}


@router.post("/stream/reset", tags=["Streaming"])
async def reset_stream():
    """Resets stream simulator and all streaming algorithm data structures."""
    await stream_simulator.reset()
    return {"message": "Stream simulator reset successfully.", "state": stream_simulator.state}


@router.post("/stream/speed", tags=["Streaming"])
async def set_stream_speed(payload: SpeedRequest):
    """Dynamically adjusts transactions per second."""
    stream_simulator.set_speed(payload.speed)
    return {"message": f"Speed updated to {payload.speed} tx/s.", "speed": stream_simulator.speed}


# -----------------------------------------------------------------------------
# 3. Transactions & Flagged Events (Strictly Paginated)
# -----------------------------------------------------------------------------
@router.get("/transactions", tags=["Transactions"])
async def get_transactions(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Page size"),
    search: Optional[str] = Query(None, max_length=50, description="Search account or transaction ID"),
    flagged_only: bool = Query(False, description="Filter only flagged transactions"),
    type: Optional[str] = Query(None, description="Transaction type filter (TRANSFER, CASH_OUT, etc.)"),
):
    """Fetches paginated transactions with optional filters."""
    result = await TransactionRepository.get_transactions(
        skip=skip,
        limit=limit,
        search=search,
        flagged_only=flagged_only,
        tx_type=type,
    )

    # Fallback to recent in-memory stream buffer if database has not flushed yet
    if result["total"] == 0 and stream_simulator.recent_buffer:
        filtered = stream_simulator.recent_buffer
        if flagged_only:
            filtered = [tx for tx in filtered if tx.get("is_flagged")]
        if type and type.upper() != "ALL":
            filtered = [tx for tx in filtered if tx.get("type") == type.upper()]
        if search:
            s = search.lower()
            filtered = [
                tx for tx in filtered
                if s in tx.get("nameOrig", "").lower()
                or s in tx.get("nameDest", "").lower()
                or s in tx.get("transaction_id", "").lower()
            ]

        slice_items = filtered[skip : skip + limit]
        return {
            "items": slice_items,
            "total": len(filtered),
            "skip": skip,
            "limit": limit,
            "has_more": (skip + len(slice_items)) < len(filtered),
        }

    return result


@router.get("/flagged", tags=["Transactions"])
async def get_flagged(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM)"),
):
    """Returns paginated flagged security events and audit records."""
    return await FlaggedEventRepository.get_flagged_events(
        skip=skip, limit=limit, severity=severity
    )


@router.get("/accounts", tags=["Accounts"])
async def get_accounts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    min_risk: float = Query(0.0, ge=0.0, le=100.0),
):
    """Returns paginated accounts sorted by risk score."""
    return await AccountRepository.get_accounts(skip=skip, limit=limit, min_risk=min_risk)


# -----------------------------------------------------------------------------
# 4. Streaming Algorithms Telemetry
# -----------------------------------------------------------------------------
@router.get("/algorithms/stats", tags=["Algorithms"])
async def get_algorithms_telemetry():
    """
    Returns deep-dive theoretical and empirical verification metrics for:
    - Bloom Filter (fill rate, capacity, false positive rate bound)
    - Flajolet-Martin (distinct cardinality estimate, trailing zeros distribution)
    - DGIM (high-value count in window, exact count, relative error percentage)
    """
    return {
        "bloom_filter": stream_simulator.bloom.get_stats(),
        "flajolet_martin": stream_simulator.fm.get_stats(),
        "dgim": stream_simulator.dgim.get_stats(),
        "stream_clock": stream_simulator.total_processed,
    }


# -----------------------------------------------------------------------------
# 5. Graph Analytics & Fraud Rings
# -----------------------------------------------------------------------------
@router.get("/graph/clusters", tags=["Graph Analytics"])
async def get_graph_clusters():
    """
    Builds directed transaction graph and returns top suspicious fraud ring clusters
    detected via Louvain community detection with cycle and density metrics.
    """
    try:
        return await analyze_fraud_rings(max_transactions=4000)
    except Exception as exc:
        logger.error("Error executing graph analysis: %s", type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate graph community analysis.",
        )


@router.get("/graph/subgraph/{cluster_id}", tags=["Graph Analytics"])
async def get_cluster_subgraph(cluster_id: str):
    """Fetches full node-link graph payload for a specific cluster."""
    analysis = await analyze_fraud_rings(max_transactions=4000)
    for c in analysis.get("clusters", []):
        if c.get("cluster_id") == cluster_id:
            return c
    raise HTTPException(status_code=404, detail="Requested cluster not found.")


# -----------------------------------------------------------------------------
# 6. Batch Analytics
# -----------------------------------------------------------------------------
@router.post("/analytics/run-batch", tags=["Batch Analytics"])
async def trigger_batch_analytics():
    """Triggers Pandas historical aggregation job and Z-score anomaly detection."""
    try:
        result = await run_account_batch_aggregation()
        return result
    except Exception as exc:
        logger.error("Batch analytics failed: %s", type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete batch analytics job.",
        )


@router.get("/analytics/summary", tags=["Batch Analytics"])
async def get_analytics_summary():
    """Provides aggregated statistical charts: volume by type, fraud ratios."""
    db = await db_manager.get_db()
    try:
        pipeline = [
            {"$group": {
                "_id": "$type",
                "count": {"$sum": 1},
                "total_volume": {"$sum": "$amount"},
                "fraud_count": {"$sum": {"$cond": ["$is_flagged", 1, 0]}},
            }},
            {"$sort": {"total_volume": -1}}
        ]
        cursor = db.transactions.aggregate(pipeline)
        type_breakdown = await cursor.to_list(length=20)

        # Map to friendly format
        breakdown = [
            {
                "type": item["_id"] or "UNKNOWN",
                "count": item["count"],
                "total_volume": round(item["total_volume"], 2),
                "fraud_count": item["fraud_count"],
            }
            for item in type_breakdown
        ]

        total_tx = sum(item["count"] for item in breakdown)
        total_fraud = sum(item["fraud_count"] for item in breakdown)

        return {
            "type_breakdown": breakdown,
            "total_transactions": total_tx,
            "total_flagged": total_fraud,
            "fraud_ratio_pct": round((total_fraud / total_tx * 100) if total_tx > 0 else 0.0, 2),
        }
    except Exception as exc:
        logger.error("Failed to generate analytics summary: %s", type(exc).__name__)
        return {"type_breakdown": [], "total_transactions": 0, "total_flagged": 0, "fraud_ratio_pct": 0.0}
