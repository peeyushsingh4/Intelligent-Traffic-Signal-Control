"""
MongoDB client connection manager with async pooling and seamless mock fallback.

Never leaks connection strings, passwords, or internal network topology to logs or errors.
"""

import logging
import asyncio
from typing import Optional, Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.config import settings

logger = logging.getLogger("fraud_detection.storage")


class DatabaseManager:
    _instance: Optional["DatabaseManager"] = None
    _client: Optional[Any] = None
    _db: Optional[Any] = None
    _is_mock: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @property
    def is_mock(self) -> bool:
        return self._is_mock

    async def connect(self) -> AsyncIOMotorDatabase:
        """
        Initializes MongoDB connection. If USE_MOCK_DB is True or connection to
        MONGO_URI fails/times out, seamlessly falls back to mongomock-motor.
        """
        if self._db is not None:
            return self._db

        if settings.USE_MOCK_DB:
            logger.info("USE_MOCK_DB is enabled. Initializing in-memory mock database.")
            self._init_mock()
            return self._db

        try:
            # Attempt to connect to real MongoDB with short server selection timeout
            logger.info("Attempting connection to MongoDB...")
            client = AsyncIOMotorClient(
                settings.MONGO_URI,
                serverSelectionTimeoutMS=2000,
                connectTimeoutMS=2000,
            )
            # Ping database to verify active connection
            await asyncio.wait_for(client.admin.command("ping"), timeout=2.5)
            self._client = client
            self._db = client[settings.DATABASE_NAME]
            self._is_mock = False
            logger.info("Connected successfully to MongoDB database: %s", settings.DATABASE_NAME)
        except Exception as exc:
            # DO NOT log settings.MONGO_URI (contains credentials)
            logger.warning(
                "Could not connect to MongoDB server (reason: %s). "
                "Falling back to zero-configuration in-memory mock database (mongomock-motor).",
                type(exc).__name__,
            )
            self._init_mock()

        return self._db

    def _init_mock(self) -> None:
        try:
            import mongomock_motor
            self._client = mongomock_motor.AsyncMongoMockClient()
            self._db = self._client[settings.DATABASE_NAME]
            self._is_mock = True
            logger.info("In-memory MongoDB mock initialized for database: %s", settings.DATABASE_NAME)
        except ImportError as err:
            logger.error("mongomock-motor is not installed. Database cannot start.")
            raise RuntimeError("Database driver unavailable.") from err

    async def get_db(self) -> AsyncIOMotorDatabase:
        if self._db is None:
            await self.connect()
        return self._db

    async def close(self) -> None:
        if self._client is not None:
            try:
                self._client.close()
            except Exception:
                pass
            self._client = None
            self._db = None
            logger.info("Database connection closed.")


db_manager = DatabaseManager()
