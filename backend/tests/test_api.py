import pytest
from fastapi.testclient import TestClient
from backend.api.main import app

client = TestClient(app)


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "is_mock_db" in data
    assert "stream_state" in data


def test_api_stream_status():
    response = client.get("/api/stream/status")
    assert response.status_code == 200
    data = response.json()
    assert "state" in data
    assert "speed" in data
    assert "bloom_filter" in data
    assert "flajolet_martin" in data
    assert "dgim" in data


def test_api_stream_controls():
    # Test set speed
    speed_res = client.post("/api/stream/speed", json={"speed": 25})
    assert speed_res.status_code == 200
    assert speed_res.json()["speed"] == 25

    # Test start
    start_res = client.post("/api/stream/start")
    assert start_res.status_code == 200
    assert start_res.json()["state"] == "RUNNING"

    # Test pause
    pause_res = client.post("/api/stream/pause")
    assert pause_res.status_code == 200
    assert pause_res.json()["state"] == "PAUSED"


def test_api_algorithms_telemetry():
    response = client.get("/api/algorithms/stats")
    assert response.status_code == 200
    data = response.json()
    assert "bloom_filter" in data
    assert "fill_rate" in data["bloom_filter"]
    assert "flajolet_martin" in data
    assert "estimated_distinct_accounts" in data["flajolet_martin"]
    assert "dgim" in data
    assert "estimated_high_value_count" in data["dgim"]


def test_api_transactions_pagination():
    response = client.get("/api/transactions?skip=0&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "skip" in data
    assert "limit" in data
    assert data["limit"] == 10
