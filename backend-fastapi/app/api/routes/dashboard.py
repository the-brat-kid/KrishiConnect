import asyncio
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, case
from app.core.database import get_db
from app.api.deps import get_current_business_profile
from app.models.business_profile import BusinessProfile
from app.models.invoice import Invoice, InvoiceStatus
from app.models.customer import Customer
from app.models.product import Product
from app.models.payment import Payment

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    profile: BusinessProfile = Depends(get_current_business_profile),
    db: AsyncSession = Depends(get_db)
):
    # High-Performance Aggregated Query: Combines 5 invoice queries into a single SQL pass
    inv_stats_q = select(
        func.count(Invoice.id).label("total_invoices"),
        func.coalesce(
            func.sum(
                case((Invoice.status == InvoiceStatus.paid.value, Invoice.grand_total), else_=0.0)
            ),
            0.0
        ).label("total_revenue"),
        func.count(case((Invoice.status == InvoiceStatus.paid.value, 1))).label("paid_invoices"),
        func.count(case((Invoice.status == InvoiceStatus.unpaid.value, 1))).label("unpaid_invoices"),
        func.count(case((Invoice.status == InvoiceStatus.overdue.value, 1))).label("overdue_invoices"),
    ).where(Invoice.business_profile_id == profile.id)

    cust_q = select(func.count(Customer.id)).where(Customer.business_profile_id == profile.id)
    prod_q = select(func.count(Product.id)).where(Product.business_profile_id == profile.id)

    # Execute queries concurrently over async connection
    inv_res, cust_res, prod_res = await asyncio.gather(
        db.execute(inv_stats_q),
        db.execute(cust_q),
        db.execute(prod_q),
    )

    inv_row = inv_res.one()
    total_customers = cust_res.scalar() or 0
    total_products = prod_res.scalar() or 0

    return {
        "total_revenue": float(inv_row.total_revenue or 0.0),
        "total_invoices": int(inv_row.total_invoices or 0),
        "total_customers": total_customers,
        "total_products": total_products,
        "paid_invoices": int(inv_row.paid_invoices or 0),
        "unpaid_invoices": int(inv_row.unpaid_invoices or 0),
        "overdue_invoices": int(inv_row.overdue_invoices or 0)
    }

@router.get("/recent-transactions")
async def get_recent_transactions(
    profile: BusinessProfile = Depends(get_current_business_profile),
    db: AsyncSession = Depends(get_db)
):
    # We'll use recent invoices for this, joining with customer
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
    return transactions
