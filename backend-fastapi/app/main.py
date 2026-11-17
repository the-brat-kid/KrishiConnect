from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine
from app.models import Base
from app.api.routes import auth, dashboard, customers, products, invoices, payments, expenses, reports, business_profile, crop_rates, cold_storage
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi import Limiter
from slowapi.util import get_remote_address

from sqlalchemy import text

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create all tables on startup (if they don't exist)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Ensure recently added columns exist on existing tables in all environments
        for ddl in [
            "ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR DEFAULT 'upi'",
            "ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency VARCHAR DEFAULT 'inr'",
            "ALTER TABLE payments ADD COLUMN IF NOT EXISTS upi_tn VARCHAR",
            "ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR",
            "ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR",
            "ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method VARCHAR",
            "CREATE INDEX IF NOT EXISTS ix_users_phone ON users (phone)",
            "CREATE INDEX IF NOT EXISTS ix_cold_storage_bookings_user_id ON cold_storage_bookings (user_id)",
            "CREATE INDEX IF NOT EXISTS ix_cold_storage_bookings_facility_id ON cold_storage_bookings (facility_id)",
        ]:
            try:
                await conn.execute(text(ddl))
            except Exception:
                pass
    print("✅ Database tables verified/created successfully")
    yield

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging, traceback
    logging.getLogger("krishiconnect.server").error(
        "Unhandled 500 on %s %s: %s\n%s", request.method, request.url, exc, traceback.format_exc()
    )
    response = JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": exc.__class__.__name__}
    )
    origin = request.headers.get("origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Vary"] = "Origin"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])
app.include_router(customers.router, prefix=f"{settings.API_V1_STR}/customers", tags=["customers"])
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["products"])
app.include_router(invoices.router, prefix=f"{settings.API_V1_STR}/invoices", tags=["invoices"])
app.include_router(payments.router, prefix=f"{settings.API_V1_STR}/payments", tags=["payments"])
app.include_router(expenses.router, prefix=f"{settings.API_V1_STR}/expenses", tags=["expenses"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])
app.include_router(business_profile.router, prefix=f"{settings.API_V1_STR}/business-profile", tags=["business-profile"])
app.include_router(crop_rates.router, prefix=f"{settings.API_V1_STR}/crop-rates", tags=["crop-rates"])
app.include_router(cold_storage.router, prefix=f"{settings.API_V1_STR}/cold-storage", tags=["cold-storage"])

@app.get("/")
def root():
    return {"message": "Welcome to KrishiConnect API"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "krishiconnect-api"}

@app.post("/webhook/payment")
async def root_webhook_payment(request: Request, db = Depends(payments.get_db)):
    """Direct FreePay GpayReader Android Listener compatibility endpoint."""
    return await payments.upi_payment_webhook(request, db)