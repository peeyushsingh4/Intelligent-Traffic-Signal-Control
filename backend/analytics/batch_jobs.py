"""
Batch Analytics Layer: Historical Statistics & Z-Score Anomaly Detection.

Uses Pandas for vectorized statistical calculations on transacting accounts.
Identifies accounts whose transactions deviate significantly (> 3 standard deviations)
from their historical behavior.
"""

import time
import logging
from typing import Dict, Any, List
import pandas as pd
from backend.storage.mongo_client import db_manager

logger = logging.getLogger("fraud_detection.batch_jobs")


async def run_account_batch_aggregation() -> Dict[str, Any]:
    """
    Executes batch statistical aggregation over all stored transactions.
    Computes count, mean, std dev, max, and detects z-score anomalies (> 3 sigma).
    """
    start_time = time.time()
    db = await db_manager.get_db()

    # Load recent transactions into Pandas DataFrame
    cursor = db.transactions.find(
        {},
        {
            "_id": 0,
            "transaction_id": 1,
            "nameOrig": 1,
            "nameDest": 1,
            "amount": 1,
            "type": 1,
            "step": 1,
            "isFraud": 1,
            "timestamp": 1,
        },
    )
    raw_txs = await cursor.to_list(length=100000)

    if not raw_txs:
        return {
            "status": "COMPLETED",
            "message": "No transactions found in database.",
            "total_accounts_processed": 0,
            "anomalies_detected": 0,
            "duration_ms": round((time.time() - start_time) * 1000, 2),
        }

    df = pd.DataFrame(raw_txs)

    # 1. Per-account sender statistics
    stats_df = df.groupby("nameOrig")["amount"].agg(
        tx_count="count",
        avg_amount="mean",
        std_amount="std",
        max_amount="max",
        total_amount="sum",
    ).reset_index()

    # Fill NaN std (accounts with 1 transaction) with 0.0
    stats_df["std_amount"] = stats_df["std_amount"].fillna(0.0)

    # 2. Merge back to compute Z-score per transaction: z = (amount - mean) / std
    merged = df.merge(stats_df, on="nameOrig", how="left")

    # Only calculate z-score for accounts with at least 3 transactions and std > 0
    valid_mask = (merged["tx_count"] >= 3) & (merged["std_amount"] > 1.0)
    merged["z_score"] = 0.0
    merged.loc[valid_mask, "z_score"] = (
        (merged.loc[valid_mask, "amount"] - merged.loc[valid_mask, "avg_amount"])
        / merged.loc[valid_mask, "std_amount"]
    )

    # 3. Filter z-score anomalies (z > 3.0 indicates significant deviation from normal account pattern)
    anomalies_df = merged[merged["z_score"] > 3.0]
    anomalous_accounts = set(anomalies_df["nameOrig"].unique())

    # 4. Upsert aggregated profiles into MongoDB `accounts` collection
    account_records: List[Dict[str, Any]] = []
    for _, row in stats_df.iterrows():
        acc_id = row["nameOrig"]
        is_anomaly = acc_id in anomalous_accounts
        flags = ["Z_SCORE_ANOMALY"] if is_anomaly else []

        account_records.append({
            "account_id": acc_id,
            "account_type": "MERCHANT" if acc_id.startswith("M") else "CUSTOMER",
            "transaction_count": int(row["tx_count"]),
            "avg_amount": round(float(row["avg_amount"]), 2),
            "std_amount": round(float(row["std_amount"]), 2),
            "max_amount": round(float(row["max_amount"]), 2),
            "total_sent": round(float(row["total_amount"]), 2),
            "is_statistical_anomaly": is_anomaly,
            "flags": flags,
            "last_batch_update": time.time(),
        })

    # Bulk update accounts in DB
    for record in account_records:
        await db.accounts.update_one(
            {"account_id": record["account_id"]},
            {"$set": record},
            upsert=True,
        )

    # Flag transactions that had z > 3.0 in MongoDB
    if not anomalies_df.empty:
        anomalous_tx_ids = anomalies_df["transaction_id"].tolist()
        await db.transactions.update_many(
            {"transaction_id": {"$in": anomalous_tx_ids}},
            {
                "$addToSet": {"flags": "Z_SCORE_ANOMALY"},
                "$set": {"is_flagged": True},
            },
        )

    duration = (time.time() - start_time) * 1000
    logger.info(
        "Batch aggregation complete in %.1f ms. Processed %d accounts, flagged %d statistical anomalies.",
        duration,
        len(account_records),
        len(anomalous_accounts),
    )

    return {
        "status": "COMPLETED",
        "total_transactions_analyzed": len(df),
        "total_accounts_processed": len(account_records),
        "anomalies_detected": len(anomalous_accounts),
        "top_anomalous_accounts": list(anomalous_accounts)[:10],
        "duration_ms": round(duration, 2),
    }
