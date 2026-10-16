"""
Storage repositories and write-batching buffer for MongoDB collections.

Provides buffered high-throughput ingestion writes, indexed queries,
and sanitized error handling without exposing DB internals.
"""

import asyncio
import logging
import time
from typing import List, Dict, Any, Optional
from backend.storage.mongo_client import db_manager

logger = logging.getLogger("fraud_detection.repositories")


async def init_indexes() -> None:
    """Initializes necessary MongoDB indexes for high query performance."""
    try:
        db = await db_manager.get_db()
        # Transactions indexes
        await db.transactions.create_index([("step", 1), ("timestamp", -1)])
        await db.transactions.create_index([("nameOrig", 1)])
        await db.transactions.create_index([("nameDest", 1)])
        await db.transactions.create_index([("is_flagged", 1)])
        await db.transactions.create_index([("transaction_id", 1)], unique=True)

        # Accounts indexes
        await db.accounts.create_index([("account_id", 1)], unique=True)
        await db.accounts.create_index([("risk_score", -1)])

        # Flagged events indexes
        await db.flagged_events.create_index([("timestamp", -1)])
        await db.flagged_events.create_index([("account_id", 1)])
        await db.flagged_events.create_index([("severity", 1)])
        logger.info("MongoDB indexes verified successfully.")
    except Exception as exc:
        logger.warning("Index initialization notice: %s", type(exc).__name__)


class TransactionRepository:
    @staticmethod
    async def insert_batch(records: List[Dict[str, Any]]) -> int:
        if not records:
            return 0
        try:
            db = await db_manager.get_db()
            result = await db.transactions.insert_many(records, ordered=False)
            return len(result.inserted_ids)
        except Exception as exc:
            logger.error("Failed to batch insert transactions: %s", type(exc).__name__)
            return 0

    @staticmethod
    async def get_transactions(
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        flagged_only: bool = False,
        tx_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Fetches paginated transactions with defensive parameter clamping."""
        limit = max(1, min(limit, 100))
        skip = max(0, skip)

        query: Dict[str, Any] = {}
        if flagged_only:
            query["is_flagged"] = True
        if tx_type and tx_type.upper() != "ALL":
            query["type"] = tx_type.upper()
        if search:
            query["$or"] = [
                {"nameOrig": {"$regex": search, "$options": "i"}},
                {"nameDest": {"$regex": search, "$options": "i"}},
                {"transaction_id": {"$regex": search, "$options": "i"}},
            ]

        try:
            db = await db_manager.get_db()
            total = await db.transactions.count_documents(query)
            cursor = (
                db.transactions.find(query, {"_id": 0})
                .sort("timestamp", -1)
                .skip(skip)
                .limit(limit)
            )
            items = await cursor.to_list(length=limit)
            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
                "has_more": (skip + len(items)) < total,
            }
        except Exception as exc:
            logger.error("Error fetching transactions: %s", type(exc).__name__)
            return {"items": [], "total": 0, "skip": skip, "limit": limit, "has_more": False}

    @staticmethod
    async def get_total_count() -> int:
        try:
            db = await db_manager.get_db()
            return await db.transactions.count_documents({})
        except Exception:
            return 0


class AccountRepository:
    @staticmethod
    async def upsert_accounts(accounts_data: List[Dict[str, Any]]) -> None:
        """Batch upserts accounts during ingestion."""
        if not accounts_data:
            return
        db = await db_manager.get_db()
        for acc in accounts_data:
            account_id = acc["account_id"]
            try:
                await db.accounts.update_one(
                    {"account_id": account_id},
                    {
                        "$inc": {
                            "transaction_count": acc.get("tx_delta", 1),
                            "total_sent": acc.get("sent_delta", 0.0),
                            "total_received": acc.get("recv_delta", 0.0),
                        },
                        "$set": {
                            "account_type": "MERCHANT" if account_id.startswith("M") else "CUSTOMER",
                            "last_active": time.time(),
                        },
                        "$addToSet": {
                            "flags": {"$each": acc.get("flags", [])}
                        }
                    },
                    upsert=True
                )
            except Exception:
                pass

    @staticmethod
    async def get_accounts(skip: int = 0, limit: int = 50, min_risk: float = 0.0) -> Dict[str, Any]:
        limit = max(1, min(limit, 100))
        skip = max(0, skip)
        query: Dict[str, Any] = {}
        if min_risk > 0:
            query["risk_score"] = {"$gte": min_risk}

        try:
            db = await db_manager.get_db()
            total = await db.accounts.count_documents(query)
            cursor = (
                db.accounts.find(query, {"_id": 0})
                .sort("risk_score", -1)
                .skip(skip)
                .limit(limit)
            )
            items = await cursor.to_list(length=limit)
            return {"items": items, "total": total, "skip": skip, "limit": limit}
        except Exception as exc:
            logger.error("Error fetching accounts: %s", type(exc).__name__)
            return {"items": [], "total": 0, "skip": skip, "limit": limit}

    @staticmethod
    async def get_account(account_id: str) -> Optional[Dict[str, Any]]:
        try:
            db = await db_manager.get_db()
            return await db.accounts.find_one({"account_id": account_id}, {"_id": 0})
        except Exception:
            return None


class FlaggedEventRepository:
    @staticmethod
    async def insert_batch(events: List[Dict[str, Any]]) -> int:
        if not events:
            return 0
        try:
            db = await db_manager.get_db()
            res = await db.flagged_events.insert_many(events, ordered=False)
            return len(res.inserted_ids)
        except Exception as exc:
            logger.error("Error inserting flagged events: %s", type(exc).__name__)
            return 0

    @staticmethod
    async def get_flagged_events(
        skip: int = 0, limit: int = 50, severity: Optional[str] = None
    ) -> Dict[str, Any]:
        limit = max(1, min(limit, 100))
        skip = max(0, skip)
        query: Dict[str, Any] = {}
        if severity and severity.upper() != "ALL":
            query["severity"] = severity.upper()

        try:
            db = await db_manager.get_db()
            total = await db.flagged_events.count_documents(query)
            cursor = (
                db.flagged_events.find(query, {"_id": 0})
                .sort("timestamp", -1)
                .skip(skip)
                .limit(limit)
            )
            items = await cursor.to_list(length=limit)
            return {"items": items, "total": total, "skip": skip, "limit": limit}
        except Exception as exc:
            logger.error("Error fetching flagged events: %s", type(exc).__name__)
            return {"items": [], "total": 0, "skip": skip, "limit": limit}


class AsyncWriteBuffer:
    """
    In-memory batch buffer to prevent hitting MongoDB on every single transaction.
    Flushes when buffer reaches batch_size or every flush_interval seconds.
    """

    def __init__(self, batch_size: int = 50, flush_interval: float = 0.3):
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        self._tx_buffer: List[Dict[str, Any]] = []
        self._event_buffer: List[Dict[str, Any]] = []
        self._lock = asyncio.Lock()
        self._flush_task: Optional[asyncio.Task] = None
        self._running = False

    def start(self) -> None:
        if not self._running:
            self._running = True
            self._flush_task = asyncio.create_task(self._flush_loop())

    async def stop(self) -> None:
        self._running = False
        if self._flush_task:
            self._flush_task.cancel()
            try:
                await self._flush_task
            except asyncio.CancelledError:
                pass
        await self.flush()

    async def enqueue_transaction(self, tx: Dict[str, Any], flagged_events: List[Dict[str, Any]]) -> None:
        async with self._lock:
            self._tx_buffer.append(tx)
            if flagged_events:
                self._event_buffer.extend(flagged_events)

            if len(self._tx_buffer) >= self.batch_size:
                await self._flush_locked()

    async def flush(self) -> None:
        async with self._lock:
            await self._flush_locked()

    async def _flush_locked(self) -> None:
        if not self._tx_buffer and not self._event_buffer:
            return

        txs_to_write = list(self._tx_buffer)
        events_to_write = list(self._event_buffer)
        self._tx_buffer.clear()
        self._event_buffer.clear()

        if txs_to_write:
            await TransactionRepository.insert_batch(txs_to_write)
        if events_to_write:
            await FlaggedEventRepository.insert_batch(events_to_write)

    async def _flush_loop(self) -> None:
        while self._running:
            try:
                await asyncio.sleep(self.flush_interval)
                await self.flush()
            except asyncio.CancelledError:
                break
            except Exception as exc:
                logger.error("Error in write buffer loop: %s", type(exc).__name__)


# Global write buffer singleton
write_buffer = AsyncWriteBuffer(batch_size=50, flush_interval=0.3)
