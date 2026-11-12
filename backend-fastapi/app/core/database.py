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
        },
        "command_timeout": 15,
    }

engine = create_async_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    echo=False,
    pool_pre_ping=True,      # Tests connection liveness before checkout to prevent stale disconnects
    pool_recycle=1800,       # Recycles connections every 30 minutes to reduce handshake overhead
    pool_size=20,            # Higher baseline connection pool to eliminate query queuing
    max_overflow=40,         # Allows burst up to 60 concurrent database connections
    pool_timeout=15,         # Fail fast if pool is saturated instead of blocking indefinitely
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

# MongoDB Setup with connection pooling & fast server selection
mongo_client = AsyncIOMotorClient(
    settings.MONGODB_URL,
    maxPoolSize=50,
    minPoolSize=5,
    serverSelectionTimeoutMS=2000,
    waitQueueTimeoutMS=5000,
)
mongo_db = mongo_client[settings.MONGODB_DB_NAME]
