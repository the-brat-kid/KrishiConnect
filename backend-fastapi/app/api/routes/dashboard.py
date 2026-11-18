import asyncio
import time
from typing import Dict, Any, Tuple
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, text
from app.core.database import get_db
from app.api.deps import get_current_business_profile
from app.models.business_profile import BusinessProfile
from app.models.invoice import Invoice
from app.models.customer import Customer

router = APIRouter()

# Fast in-memory cache with 10-second TTL to avoid database hammering
_STATS_CACHE: Dict[str, Tuple[float, Dict[str, Any]]] = {}
_TX_CACHE: Dict[str, Tuple[float, list]] = {}
CACHE_TTL = 10.0  # seconds

@router.get("/stats")
async def get_dashboard_stats(
    profile: BusinessProfile = Depends(get_current_business_profile),
    db: AsyncSession = Depends(get_db)
):
    now = time.time()
    cached = _STATS_CACHE.get(profile.id)
    if cached and (now - cached[0] < CACHE_TTL):
        return cached[1]

    # Ultra-Fast Single-Pass Combined SQL: Combines 7 aggregation queries into 1 roundtrip
    sql = text("""
        SELECT 
            (SELECT COUNT(*) FROM invoices WHERE business_profile_id = :pid) as total_invoices,
            (SELECT COALESCE(SUM(grand_total), 0.0) FROM invoices WHERE business_profile_id = :pid AND status = 'paid') as total_revenue,
            (SELECT COUNT(*) FROM invoices WHERE business_profile_id = :pid AND status = 'paid') as paid_invoices,
            (SELECT COUNT(*) FROM invoices WHERE business_profile_id = :pid AND status = 'unpaid') as unpaid_invoices,
            (SELECT COUNT(*) FROM invoices WHERE business_profile_id = :pid AND status = 'overdue') as overdue_invoices,
            (SELECT COUNT(*) FROM customers WHERE business_profile_id = :pid) as total_customers,
            (SELECT COUNT(*) FROM products WHERE business_profile_id = :pid) as total_products
    """)

    res = await db.execute(sql, {"pid": profile.id})
    row = res.one()

    result = {
        "total_revenue": float(row.total_revenue or 0.0),
        "total_invoices": int(row.total_invoices or 0),
        "total_customers": int(row.total_customers or 0),
        "total_products": int(row.total_products or 0),
        "paid_invoices": int(row.paid_invoices or 0),
        "unpaid_invoices": int(row.unpaid_invoices or 0),
        "overdue_invoices": int(row.overdue_invoices or 0)
    }

    _STATS_CACHE[profile.id] = (now, result)
    return result

@router.get("/recent-transactions")
async def get_recent_transactions(
    profile: BusinessProfile = Depends(get_current_business_profile),
    db: AsyncSession = Depends(get_db)
):
    now = time.time()
    cached = _TX_CACHE.get(profile.id)
    if cached and (now - cached[0] < CACHE_TTL):
        return cached[1]

    res = await db.execute(
        select(Invoice, Customer.name)
        .join(Customer, Invoice.customer_id == Customer.id)
        .where(Invoice.business_profile_id == profile.id)
        .order_by(desc(Invoice.created_at))
        .limit(10)
    )
    items = res.all()
    transactions = []
    for inv, customer_name in items:
        transactions.append({
            "invoice_id": inv.id,
            "invoice_number": inv.invoice_number,
            "customer_name": customer_name,
            "amount": inv.grand_total,
            "status": inv.status,
            "date": inv.date
        })

    _TX_CACHE[profile.id] = (now, transactions)
    return transactions
