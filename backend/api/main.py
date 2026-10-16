"""
FastAPI Application Entry Point.

Configures application lifespan, CORS policies, secure error handlers,
REST routers, and live WebSocket streaming.
"""

import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.storage.mongo_client import db_manager
from backend.storage.repositories import init_indexes, write_buffer
from backend.ingestion.csv_loader import generate_paysim_sample
from backend.ingestion.stream_simulator import stream_simulator
from backend.api.routes import router as api_router
from backend.api.websocket_manager import ws_manager

# Configure structured application logger
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("fraud_detection.app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manages clean application startup and shutdown lifecycle."""
    logger.info("Initializing Financial Fraud Detection Analytics Engine...")
    logger.info("Configuration (Safe): %s", settings.safe_dict())

    # 1. Connect to Database (real MongoDB or mongomock fallback)
    await db_manager.connect()

    # 2. Initialize Indexes
    await init_indexes()

    # 3. Start In-Memory Async Write Buffer
    write_buffer.start()

    # 4. Verify Sample Dataset Exists; Generate If Missing
    if not os.path.exists(settings.DEFAULT_DATASET_PATH):
        logger.info("Default dataset not found at %s. Generating sample...", settings.DEFAULT_DATASET_PATH)
        generate_paysim_sample(settings.DEFAULT_DATASET_PATH, num_rows=50000)

    logger.info("Startup complete. System ready to stream.")
    yield

    # Clean Shutdown
    logger.info("Shutting down Fraud Detection Engine...")
    if stream_simulator.state == "RUNNING":
        stream_simulator.pause()
    await write_buffer.stop()
    await db_manager.close()
    logger.info("Shutdown completed cleanly.")


app = FastAPI(
    title="Real-Time Financial Fraud Detection Platform API",
    description="High-throughput streaming fraud detection platform utilizing Bloom Filter, DGIM, Flajolet-Martin, and NetworkX community detection.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Safe Exception Handler: Prevents leaking stack traces or credentials
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception processing %s: %s", request.url.path, type(exc).__name__)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred while processing your request. Please try again later.",
        },
    )


# Mount REST Endpoints
app.include_router(api_router)


# Mount Live WebSocket Endpoint
@app.websocket("/api/ws/live")
async def websocket_live_stream(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial handshake state
        await websocket.send_json({
            "type": "HANDSHAKE",
            "message": "Connected to Real-Time Fraud Detection Engine",
            "stats": stream_simulator.get_stats(),
        })

        # Keep connection open and handle any client commands
        while True:
            client_msg = await websocket.receive_text()
            if client_msg == "PING":
                await websocket.send_text("PONG")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as exc:
        logger.debug("WebSocket session ended: %s", type(exc).__name__)
        ws_manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api.main:app", host=settings.HOST, port=settings.PORT, reload=True)
