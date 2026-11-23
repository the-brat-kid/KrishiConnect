from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine
from app.core.security_middleware import EnterpriseSecurityMiddleware
from app.models import Base
from app.api.routes import auth, dashboard, customers, products, invoices, payments, expenses, reports, business_profile, crop_rates, cold_storage, soil_health, aadhaar_kyc, support
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
    ddls = [
        "ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR DEFAULT 'upi'",
        "ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency VARCHAR DEFAULT 'inr'",
        "ALTER TABLE payments ADD COLUMN IF NOT EXISTS upi_tn VARCHAR",
        "ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR",
        "ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR",
        "ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method VARCHAR",
        "CREATE INDEX IF NOT EXISTS ix_users_phone ON users (phone)",
        "CREATE INDEX IF NOT EXISTS ix_business_profiles_user_id ON business_profiles (user_id)",
        "CREATE INDEX IF NOT EXISTS ix_cold_storage_bookings_user_id ON cold_storage_bookings (user_id)",
        "CREATE INDEX IF NOT EXISTS ix_cold_storage_bookings_facility_id ON cold_storage_bookings (facility_id)",
        "CREATE INDEX IF NOT EXISTS ix_invoices_bp_status ON invoices (business_profile_id, status)",
        "CREATE INDEX IF NOT EXISTS ix_invoices_bp_created ON invoices (business_profile_id, created_at DESC)",
        "CREATE INDEX IF NOT EXISTS ix_invoice_items_invoice_id ON invoice_items (invoice_id)",
        "CREATE INDEX IF NOT EXISTS ix_customers_bp_id ON customers (business_profile_id)",
        "CREATE INDEX IF NOT EXISTS ix_products_bp_id ON products (business_profile_id)",
        "CREATE INDEX IF NOT EXISTS ix_expenses_bp_date ON expenses (business_profile_id, date DESC)",
        "CREATE INDEX IF NOT EXISTS ix_payments_invoice_status ON payments (invoice_id, status)",
        "CREATE INDEX IF NOT EXISTS ix_payments_bp_status ON payments (business_profile_id, status)",
        "CREATE INDEX IF NOT EXISTS ix_payments_bp_created ON payments (business_profile_id, created_at DESC)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status VARCHAR DEFAULT 'PENDING'",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_name VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_dob VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_pincode VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_dedup_hash VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_document_filename VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_document_uploaded_at TIMESTAMP",
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_kyc_dedup_hash ON users (kyc_dedup_hash)",
    ]
    async with engine.begin() as conn:
        for ddl in ddls:
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
app.add_middleware(EnterpriseSecurityMiddleware)

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
app.include_router(soil_health.router, prefix=f"{settings.API_V1_STR}/soil-health", tags=["soil-health"])
app.include_router(aadhaar_kyc.router, prefix=f"{settings.API_V1_STR}/kyc/aadhaar", tags=["aadhaar-kyc"])
app.include_router(support.router, prefix=f"{settings.API_V1_STR}/support", tags=["support"])

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