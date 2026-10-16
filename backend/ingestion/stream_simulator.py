"""
Real-Time Stream Simulator Module.

Replays PaySim dataset rows at a configurable rate, piping them through
the three streaming algorithms (Bloom Filter, Flajolet-Martin, DGIM),
buffering database writes, and broadcasting live events via WebSockets.
"""

import asyncio
import time
import logging
from typing import Dict, Any, List, Optional
from backend.config import settings
from backend.algorithms.bloom_filter import BloomFilter
from backend.algorithms.flajolet_martin import FlajoletMartin
from backend.algorithms.dgim import DGIM
from backend.storage.repositories import write_buffer
from backend.ingestion.csv_loader import stream_csv_dataset
from backend.api.websocket_manager import ws_manager

logger = logging.getLogger("fraud_detection.stream_simulator")


class StreamSimulator:
    def __init__(self):
        # Algorithms initialization
        self.bloom = BloomFilter(
            expected_elements=settings.BLOOM_EXPECTED_ACCOUNTS,
            false_positive_rate=settings.BLOOM_FALSE_POSITIVE_RATE,
        )
        self.fm = FlajoletMartin(num_hashes=settings.FM_HASH_COUNT)
        self.dgim = DGIM(
            window_size=settings.DGIM_WINDOW_SIZE,
            high_value_threshold=settings.DGIM_HIGH_VALUE_THRESHOLD,
        )

        # Simulation state
        self.state: str = "IDLE"  # IDLE, RUNNING, PAUSED, COMPLETED
        self.speed: int = settings.STREAM_SPEED  # tx per second
        self.dataset_path: str = settings.DEFAULT_DATASET_PATH

        # Metrics
        self.total_processed: int = 0
        self.total_flagged: int = 0
        self.total_volume: float = 0.0
        self.start_time: Optional[float] = None
        self.recent_buffer: List[Dict[str, Any]] = []

        # Background async worker task
        self._task: Optional[asyncio.Task] = None
        self._pause_event = asyncio.Event()
        self._pause_event.set()  # Not paused by default
        self._stop_requested = False

    def get_stats(self) -> Dict[str, Any]:
        """Returns unified live KPIs and algorithmic states."""
        elapsed = (time.time() - self.start_time) if self.start_time and self.state == "RUNNING" else 0
        current_rate = (self.total_processed / elapsed) if elapsed > 1 else self.speed

        return {
            "state": self.state,
            "speed": self.speed,
            "total_processed": self.total_processed,
            "total_flagged": self.total_flagged,
            "total_volume": round(self.total_volume, 2),
            "current_rate": round(current_rate, 1),
            "bloom_filter": self.bloom.get_stats(),
            "flajolet_martin": self.fm.get_stats(),
            "dgim": self.dgim.get_stats(),
        }

    def start(self) -> None:
        """Starts or resumes stream simulation."""
        if self.state == "PAUSED":
            self.state = "RUNNING"
            self._pause_event.set()
            logger.info("Stream simulation resumed at %d tx/s.", self.speed)
            return

        if self.state == "RUNNING":
            return

        self.state = "RUNNING"
        self._stop_requested = False
        self._pause_event.set()
        if not self.start_time:
            self.start_time = time.time()

        self._task = asyncio.create_task(self._run_stream_loop())
        logger.info("Stream simulator started at %d tx/s using dataset: %s", self.speed, self.dataset_path)

    def pause(self) -> None:
        """Pauses stream simulation."""
        if self.state == "RUNNING":
            self.state = "PAUSED"
            self._pause_event.clear()
            logger.info("Stream simulation paused.")

    def set_speed(self, new_speed: int) -> None:
        """Updates streaming rate dynamically (1 to 500 tx/sec)."""
        self.speed = max(1, min(new_speed, 500))
        logger.info("Stream speed set to %d tx/s.", self.speed)

    async def reset(self) -> None:
        """Stops simulator, clears all streaming algorithms and in-memory caches."""
        self._stop_requested = True
        self._pause_event.set()
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None

        self.bloom.reset()
        self.fm.reset()
        self.dgim.reset()
        self.total_processed = 0
        self.total_flagged = 0
        self.total_volume = 0.0
        self.start_time = None
        self.recent_buffer.clear()
        self.state = "IDLE"
        self._stop_requested = False
        logger.info("Stream simulator and algorithm states reset to initial zero state.")

    async def _run_stream_loop(self) -> None:
        """Asynchronous execution loop reading dataset and pushing transactions."""
        try:
            generator = stream_csv_dataset(self.dataset_path)

            for raw_tx in generator:
                if self._stop_requested:
                    break

                # Wait if simulator is paused
                await self._pause_event.wait()

                # Process transaction through algorithms and storage
                enriched_tx, flagged_events = self.process_transaction(raw_tx)

                # Maintain recent buffer (last 50 in-memory items)
                self.recent_buffer.insert(0, enriched_tx)
                if len(self.recent_buffer) > 50:
                    self.recent_buffer.pop()

                # Buffer to database
                await write_buffer.enqueue_transaction(enriched_tx, flagged_events)

                # Broadcast live update to WebSockets every N transactions to avoid UI saturation
                # Broadcast every 1 tx if speed <= 15, or periodically if speed is high
                if self.total_processed % max(1, self.speed // 10) == 0:
                    await ws_manager.broadcast({
                        "type": "TRANSACTION_EVENT",
                        "data": enriched_tx,
                        "stats": self.get_stats(),
                        "alert": flagged_events[0] if flagged_events else None,
                    })

                # Dynamic sleep interval based on target speed
                delay = 1.0 / self.speed
                await asyncio.sleep(delay)

            self.state = "COMPLETED"
            logger.info("Stream simulation completed after %d transactions.", self.total_processed)

        except asyncio.CancelledError:
            logger.info("Stream loop cancelled.")
        except Exception as exc:
            self.state = "IDLE"
            logger.error("Error in stream simulation loop: %s", type(exc).__name__)

    def process_transaction(self, raw_tx: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Executes streaming algorithm checks and risk scoring on a single transaction.
        """
        self.total_processed += 1
        amount = raw_tx["amount"]
        name_orig = raw_tx["nameOrig"]
        name_dest = raw_tx["nameDest"]
        tx_type = raw_tx["type"]
        is_fraud = raw_tx["isFraud"]

        self.total_volume += amount
        timestamp = time.time()
        tx_id = f"TX_{raw_tx['step']:04d}_{self.total_processed:07d}"

        # 1. Bloom Filter Check (Unseen account anomaly detection)
        # check_and_add returns True if account ALREADY existed, False if NEW
        is_known_orig = self.bloom.check_and_add(name_orig)
        is_known_dest = self.bloom.check_and_add(name_dest)
        is_new_account = (not is_known_orig) or (not is_known_dest)

        # 2. Flajolet-Martin Update (Distinct account streaming cardinality)
        self.fm.add(name_orig)
        self.fm.add(name_dest)

        # 3. DGIM Update (Count of high-value transactions in sliding window)
        is_high_value = self.dgim.add_transaction(amount)

        # Risk Analysis & Flagging
        flags: List[str] = []
        flagged_events: List[Dict[str, Any]] = []
        risk_score: float = 5.0  # Base legitimate score

        if is_new_account:
            flags.append("NEW_ACCOUNT_RISK")
            risk_score += 25.0

        if is_high_value:
            flags.append("HIGH_AMOUNT_DGIM")
            risk_score += 30.0

        if is_fraud == 1:
            flags.append("CONFIRMED_FRAUD")
            risk_score += 40.0

        # Heuristic: complete balance drain on large cashout
        if tx_type == "CASH_OUT" and raw_tx["newbalanceOrig"] == 0 and raw_tx["oldbalanceOrg"] > 10000:
            flags.append("BALANCE_DRAIN_FRAUD")
            risk_score += 25.0

        risk_score = min(100.0, risk_score)
        is_flagged = len(flags) > 0 or risk_score >= 50.0

        if is_flagged:
            self.total_flagged += 1
            severity = "CRITICAL" if risk_score >= 80 else ("HIGH" if risk_score >= 50 else "MEDIUM")
            event = {
                "event_id": f"EVT_{tx_id}",
                "transaction_id": tx_id,
                "account_id": name_orig,
                "destination_id": name_dest,
                "amount": amount,
                "flags": flags,
                "severity": severity,
                "risk_score": round(risk_score, 1),
                "timestamp": timestamp,
            }
            flagged_events.append(event)

        enriched_tx = {
            "transaction_id": tx_id,
            "step": raw_tx["step"],
            "type": tx_type,
            "amount": amount,
            "nameOrig": name_orig,
            "oldbalanceOrg": raw_tx["oldbalanceOrg"],
            "newbalanceOrig": raw_tx["newbalanceOrig"],
            "nameDest": name_dest,
            "oldbalanceDest": raw_tx["oldbalanceDest"],
            "newbalanceDest": raw_tx["newbalanceDest"],
            "isFraud": is_fraud,
            "isFlaggedFraud": raw_tx["isFlaggedFraud"],
            "is_flagged": is_flagged,
            "risk_score": round(risk_score, 1),
            "flags": flags,
            "timestamp": timestamp,
        }

        return enriched_tx, flagged_events


# Stream simulator singleton
stream_simulator = StreamSimulator()
