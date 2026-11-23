import asyncio
import time
from datetime import datetime
from app.core.database import mongo_db

# Circuit breaker: if MongoDB is unreachable or down, don't stall requests
_mongo_last_failed_time: float = 0.0
_MONGO_BACKOFF_SECONDS: float = 300.0  # 5 minute backoff to eliminate retries when MongoDB is offline

async def _insert_audit_entry(action: str, user_id: str, business_profile_id: str, entity_type: str, entity_id: str, details: dict):
    global _mongo_last_failed_time
    # If MongoDB was recently detected as offline, skip immediately (0ms overhead)
    if time.time() - _mongo_last_failed_time < _MONGO_BACKOFF_SECONDS:
        return

    if mongo_db is not None:
        try:
            collection = mongo_db["audit_logs"]
            log_entry = {
                "action": action,
                "user_id": str(user_id) if user_id else None,
                "business_profile_id": str(business_profile_id) if business_profile_id else None,
                "entity_type": entity_type,
                "entity_id": str(entity_id) if entity_id else None,
                "details": details or {},
                "timestamp": datetime.utcnow()
            }
            await collection.insert_one(log_entry)
        except Exception:
            # Trip the circuit breaker for 60 seconds so subsequent requests don't lag
            _mongo_last_failed_time = time.time()

async def log_audit(action: str, user_id: str, business_profile_id: str, entity_type: str, entity_id: str, details: dict):
    """
    Non-blocking audit logging. Dispatched to the asyncio background loop
    so it never blocks the primary HTTP/database response to the user.
    """
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_insert_audit_entry(action, user_id, business_profile_id, entity_type, entity_id, details))
    except RuntimeError:
        pass
