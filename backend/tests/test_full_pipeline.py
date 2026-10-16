import pytest
from fastapi.testclient import TestClient
from backend.api.main import app
from backend.ingestion.stream_simulator import stream_simulator
from backend.storage.repositories import write_buffer
from backend.analytics.batch_jobs import run_account_batch_aggregation
from backend.analytics.graph_analysis import analyze_fraud_rings


def test_full_pipeline_ingestion_and_analytics():
    """
    End-to-end integration test verifying:
    1. Transaction streaming and algorithm enrichment
    2. Batch aggregation and z-score anomaly detection
    3. Directed NetworkX graph construction and Louvain community detection
    4. REST endpoints integration
    """
    client = TestClient(app)

    # 1. Simulate 120 transactions through the pipeline
    from backend.ingestion.csv_loader import stream_csv_dataset
    from backend.config import settings

    gen = stream_csv_dataset(settings.DEFAULT_DATASET_PATH)
    enriched_list = []
    for _ in range(120):
        raw = next(gen)
        enriched, flagged = stream_simulator.process_transaction(raw)
        enriched_list.append((enriched, flagged))

    assert stream_simulator.total_processed >= 120
    assert stream_simulator.bloom.count >= 120
    assert stream_simulator.fm.estimate() > 0
    assert stream_simulator.dgim.current_time >= 120

    # 2. Flush to DB
    import asyncio
    async def flush_all():
        for tx, flags in enriched_list:
            await write_buffer.enqueue_transaction(tx, flags)
        await write_buffer.flush()

    asyncio.run(flush_all())

    # 3. Test API Transactions endpoint returns stored data
    res_tx = client.get("/api/transactions?limit=20")
    assert res_tx.status_code == 200
    data_tx = res_tx.json()
    assert len(data_tx["items"]) > 0

    # 4. Run Batch Aggregations (Pandas)
    batch_res = asyncio.run(run_account_batch_aggregation())
    assert batch_res["status"] == "COMPLETED"
    assert batch_res["total_accounts_processed"] > 0

    # 5. Run Graph Analytics (NetworkX & Louvain)
    graph_res = asyncio.run(analyze_fraud_rings(max_transactions=100))
    assert "clusters" in graph_res
    assert graph_res["total_nodes"] > 0
    assert graph_res["total_edges"] > 0

    # 6. Test Algorithm Telemetry via REST
    algo_res = client.get("/api/algorithms/stats")
    assert algo_res.status_code == 200
    stats = algo_res.json()
    assert stats["bloom_filter"]["fill_rate"] >= 0
    assert stats["flajolet_martin"]["estimated_distinct_accounts"] > 0
    assert stats["dgim"]["relative_error_pct"] <= 50.0

    # 7. Test Summary Endpoint
    summary_res = client.get("/api/analytics/summary")
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert "type_breakdown" in summary
