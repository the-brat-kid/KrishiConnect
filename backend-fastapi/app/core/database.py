from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings
from motor.motor_asyncio import AsyncIOMotorClient

# PostgreSQL Connection Engine Optimized for High-Speed OLTP
connect_args = {}
if "asyncpg" in settings.SQLALCHEMY_DATABASE_URI:
    connect_args = {
        "server_settings": {
            # Disabling JIT compilation provides major speedup (eliminates 50-100ms compilation overhead per query)
            "jit": "off",
            "application_name": "krishiconnect_fastapi",
            "work_mem": "16MB",
            "synchronous_commit": "off",
        },
        "command_timeout": 15,
        "statement_cache_size": 1024,
        "max_cached_statement_lifetime": 600,
    }

engine = create_async_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    echo=False,
    pool_pre_ping=False,     # Disabled pre-ping to eliminate redundant SELECT 1 latency on every checkout
    pool_recycle=300,        # Recycles connections every 5 minutes to prevent stale sockets
    pool_size=10,            # Optimal baseline pool size for local & containerized environments
    max_overflow=20,         # Allows burst up to 30 concurrent connections without exhausting Postgres limit
    pool_timeout=5,          # Fail fast if pool is saturated instead of blocking indefinitely
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# MongoDB Setup with fast timeout and non-blocking pool
mongo_client = AsyncIOMotorClient(
    settings.MONGODB_URL,
    maxPoolSize=20,
    minPoolSize=0,            # 0 ensures no background connection loops when MongoDB is offline
    serverSelectionTimeoutMS=250,  # 250ms fast-fail to prevent request hangs when MongoDB is down
    waitQueueTimeoutMS=1000,
)
mongo_db = mongo_client[settings.MONGODB_DB_NAME]
