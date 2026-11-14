import logging
import time
import re
import urllib.parse
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_business_profile, get_current_user
from app.models.payment import Payment
from app.models.invoice import Invoice
from app.models.customer import Customer
from app.models.business_profile import BusinessProfile
from app.models.user import User
from app.schemas.payment import (
    PaymentCreateOrder,
    PaymentVerify,
    PaymentResponse,
    StripeCheckoutSessionCreate,
    StripeCheckoutSessionResponse,
    StripeVerifyRequest,
    StripeVerifyResponse,
    UpiCreateQrRequest,
    UpiCreateQrResponse,
    UpiStatusResponse,
    UpiWebhookRequest,
)
from app.services.razorpay_service import create_order, verify_signature
from app.services.stripe_service import (
    create_checkout_session,
    verify_checkout_session,
    construct_webhook_event,
    is_stripe_configured,
)
from app.services.audit_service import log_audit

logger = logging.getLogger("krishiconnect.payments")
router = APIRouter()


# ==========================================
# STRIPE INTEGRATION ENDPOINTS
# ==========================================

@router.get("/stripe/config")
async def get_stripe_config():
    """Returns the Stripe publishable key and mode for frontend clients."""
    return {
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY or "pk_test_placeholder",
        "currency": (settings.STRIPE_CURRENCY or "inr").lower(),
        "is_configured": is_stripe_configured(),
    }


@router.post("/stripe/checkout-session", response_model=StripeCheckoutSessionResponse)
async def create_stripe_checkout_session(
    req: StripeCheckoutSessionCreate,
    profile: BusinessProfile = Depends(get_current_business_profile),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticated vendor endpoint: creates a Stripe Checkout session for an invoice.
    Records a pending payment entry that can be auto-verified via webhook or return redirect.
    """
    # Verify invoice belongs to the authenticated business profile
    res = await db.execute(
        select(Invoice)
        .where(Invoice.id == str(req.invoice_id), Invoice.business_profile_id == profile.id)
        .options(selectinload(Invoice.customer))
    )
    invoice = res.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if invoice.status == "paid":
        raise HTTPException(status_code=400, detail="This invoice has already been paid")

    customer_email = invoice.customer.email if invoice.customer else None
    customer_name = invoice.customer.name if invoice.customer else None

    # Create Stripe Checkout Session
    session_data = create_checkout_session(
        invoice_id=invoice.id,
        invoice_number=invoice.invoice_number,
        amount=float(invoice.grand_total),
        currency=settings.STRIPE_CURRENCY,
        customer_email=customer_email,
        customer_name=customer_name,
        business_profile_id=profile.id,
        success_url=req.success_url,
        cancel_url=req.cancel_url,
    )

    # Check for existing pending payment for this session or create a new one
    payment = Payment(
        business_profile_id=profile.id,
        invoice_id=invoice.id,
        amount=float(invoice.grand_total),
        payment_method="stripe",
        currency=(settings.STRIPE_CURRENCY or "inr").lower(),
        stripe_session_id=session_data["session_id"],
        status="pending",
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)

    await log_audit(
        "create_stripe_checkout",
        current_user.id,
        profile.id,
        "payment",
        payment.id,
        {"session_id": session_data["session_id"], "amount": invoice.grand_total},
    )

    return StripeCheckoutSessionResponse(
        session_id=session_data["session_id"],
        url=session_data["url"],
        publishable_key=session_data.get("publishable_key"),
    )


@router.post("/public/stripe/checkout-session", response_model=StripeCheckoutSessionResponse)
async def create_public_stripe_checkout_session(
    req: StripeCheckoutSessionCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Public customer endpoint: allows an invoice buyer to initiate Stripe payment
    without requiring vendor authentication.
    """
    res = await db.execute(
        select(Invoice)
        .where(Invoice.id == str(req.invoice_id))
        .options(selectinload(Invoice.customer), selectinload(Invoice.business_profile))
    )
    invoice = res.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if invoice.status == "paid":
        raise HTTPException(status_code=400, detail="Invoice is already paid")

    customer_email = invoice.customer.email if invoice.customer else None
    customer_name = invoice.customer.name if invoice.customer else None

    session_data = create_checkout_session(
        invoice_id=invoice.id,
        invoice_number=invoice.invoice_number,
        amount=float(invoice.grand_total),
        currency=settings.STRIPE_CURRENCY,
        customer_email=customer_email,
        customer_name=customer_name,
        business_profile_id=invoice.business_profile_id,
        success_url=req.success_url,
        cancel_url=req.cancel_url,
    )

    payment = Payment(
        business_profile_id=invoice.business_profile_id,
        invoice_id=invoice.id,
        amount=float(invoice.grand_total),
        payment_method="stripe",
        currency=(settings.STRIPE_CURRENCY or "inr").lower(),
        stripe_session_id=session_data["session_id"],
        status="pending",
    )
    db.add(payment)
    await db.commit()

    return StripeCheckoutSessionResponse(
        session_id=session_data["session_id"],
        url=session_data["url"],
        publishable_key=session_data.get("publishable_key"),
    )


@router.post("/stripe/verify", response_model=StripeVerifyResponse)
async def verify_stripe_payment(
    req: StripeVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Auto-Verification Endpoint:
    Receives session_id or payment_intent_id, queries Stripe directly,
    and if verified, updates the invoice and payment records to 'paid'.
    Can be called by either vendor or customer upon redirect.
    """
    if not req.session_id and not req.payment_intent_id:
        raise HTTPException(status_code=400, detail="Either session_id or payment_intent_id is required")

    # 1. Look up payment record in DB
    payment = None
    if req.session_id:
        res = await db.execute(select(Payment).where(Payment.stripe_session_id == req.session_id))
        payment = res.scalars().first()

    if not payment and req.invoice_id:
        res = await db.execute(
            select(Payment)
            .where(Payment.invoice_id == str(req.invoice_id))
            .order_by(desc(Payment.created_at))
        )
        payment = res.scalars().first()

    # 2. Verify with Stripe API
    verification = verify_checkout_session(req.session_id or "")

    if not verification.get("verified"):
        return StripeVerifyResponse(
            success=False,
            status=verification.get("status", "unverified"),
            invoice_id=str(req.invoice_id or (payment.invoice_id if payment else "")),
            message="Payment has not been confirmed by Stripe yet.",
        )

    # 3. Mark payment as paid
    invoice_id = str(req.invoice_id or (payment.invoice_id if payment else ""))
    if payment:
        payment.status = "paid"
        if verification.get("payment_intent_id"):
            payment.stripe_payment_intent_id = verification["payment_intent_id"]
        invoice_id = payment.invoice_id

    # 4. Update the invoice to 'paid'
    if invoice_id:
        inv_res = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
        invoice = inv_res.scalars().first()
        if invoice:
            invoice.status = "paid"
            invoice.payment_method = "stripe"

    await db.commit()

    return StripeVerifyResponse(
        success=True,
        status="paid",
        invoice_id=invoice_id,
        payment_id=payment.id if payment else None,
        amount=verification.get("amount_received"),
        currency=verification.get("currency"),
        payment_intent_id=verification.get("payment_intent_id"),
        message="Payment verified successfully. Invoice marked as Paid.",
    )


@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="stripe-signature"),
    db: AsyncSession = Depends(get_db),
):
    """
    Stripe Webhook Handler:
    Automatically catches asynchronous payment notifications (e.g. checkout.session.completed,
    payment_intent.succeeded) and updates invoice and payment status in real-time.
    """
    payload = await request.body()
    try:
        event = construct_webhook_event(payload, stripe_signature or "")
    except Exception as exc:
        logger.error("Stripe webhook verification error: %s", exc)
        raise HTTPException(status_code=400, detail=f"Webhook Error: {str(exc)}")

    event_type = event.get("type")
    data_object = event.get("data", {}).get("object", {})

    logger.info("Received Stripe webhook event: %s", event_type)

    if event_type == "checkout.session.completed":
        session_id = data_object.get("id")
        payment_intent_id = data_object.get("payment_intent")
        metadata = data_object.get("metadata", {})
        invoice_id = metadata.get("invoice_id")

        # Find payment by session_id
        payment = None
        if session_id:
            res = await db.execute(select(Payment).where(Payment.stripe_session_id == session_id))
            payment = res.scalars().first()

        if payment:
            payment.status = "paid"
            if payment_intent_id:
                payment.stripe_payment_intent_id = payment_intent_id
            invoice_id = payment.invoice_id

        # Update invoice status
        if invoice_id:
            inv_res = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
            invoice = inv_res.scalars().first()
            if invoice:
                invoice.status = "paid"
                invoice.payment_method = "stripe"

        await db.commit()
        logger.info("Stripe checkout session %s settled invoice %s", session_id, invoice_id)

    elif event_type == "payment_intent.succeeded":
        payment_intent_id = data_object.get("id")
        if payment_intent_id:
            res = await db.execute(
                select(Payment).where(Payment.stripe_payment_intent_id == payment_intent_id)
            )
            payment = res.scalars().first()
            if payment:
                payment.status = "paid"
                inv_res = await db.execute(select(Invoice).where(Invoice.id == payment.invoice_id))
                invoice = inv_res.scalars().first()
                if invoice:
                    invoice.status = "paid"
                    invoice.payment_method = "stripe"
                await db.commit()

    elif event_type == "payment_intent.payment_failed":
        payment_intent_id = data_object.get("id")
        if payment_intent_id:
            res = await db.execute(
                select(Payment).where(Payment.stripe_payment_intent_id == payment_intent_id)
            )
            payment = res.scalars().first()
            if payment:
                payment.status = "failed"
                await db.commit()

    return {"status": "success", "event": event_type}


# ==========================================
# FREEPAY ZERO-FEE P2P UPI GATEWAY ENDPOINTS
# ==========================================

@router.post("/upi/create-qr", response_model=UpiCreateQrResponse)
async def create_upi_qr_order(
    req: UpiCreateQrRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a dynamic zero-fee P2P UPI QR payment order with a unique transaction note (tn).
    Can be paid via Google Pay, PhonePe, Paytm, BHIM, Cred, etc.
    """
    res = await db.execute(
        select(Invoice)
        .where(Invoice.id == str(req.invoice_id))
        .options(selectinload(Invoice.customer), selectinload(Invoice.business_profile))
    )
    invoice = res.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if invoice.status == "paid":
        raise HTTPException(status_code=400, detail="This invoice has already been settled")

    timestamp = int(time.time())
    tn = f"krishi_inv_{invoice.id[:8]}_{timestamp}"

    upi_vpa = (
        (invoice.business_profile.upi_id if invoice.business_profile and invoice.business_profile.upi_id else None)
        or settings.MERCHANT_UPI_ID
        or "harshsrivastava0315@pingpay"
    )
    upi_name = (
        (invoice.business_profile.business_name if invoice.business_profile and invoice.business_profile.business_name else None)
        or settings.MERCHANT_UPI_NAME
        or "KrishiConnect"
    )

    amount = float(invoice.grand_total)

    vpa_enc = urllib.parse.quote(upi_vpa)
    name_enc = urllib.parse.quote(upi_name)
    tn_enc = urllib.parse.quote(tn)
    upi_url = f"upi://pay?pa={vpa_enc}&pn={name_enc}&am={amount:.2f}&cu=INR&tn={tn_enc}&tr={tn_enc}"

    payment = Payment(
        business_profile_id=invoice.business_profile_id,
        invoice_id=invoice.id,
        amount=amount,
        payment_method="upi",
        currency="inr",
        upi_tn=tn,
        status="pending",
    )
    db.add(payment)
    await db.commit()

    return UpiCreateQrResponse(
        tn=tn,
        amount=amount,
        upiVpa=upi_vpa,
        upiName=upi_name,
        upiUrl=upi_url,
        invoice_id=invoice.id,
        invoice_number=invoice.invoice_number,
    )


@router.get("/upi/status/{tn}", response_model=UpiStatusResponse)
async def get_upi_transaction_status(
    tn: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Polling endpoint used by the frontend watcher to detect real-time UPI settlement.
    """
    res = await db.execute(select(Payment).where(Payment.upi_tn == tn))
    payment = res.scalars().first()
    if not payment:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return UpiStatusResponse(
        tn=payment.upi_tn or tn,
        amount=payment.amount,
        status=payment.status,
        invoice_id=payment.invoice_id,
    )


@router.post("/upi/webhook")
async def upi_payment_webhook(
    req: UpiWebhookRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    FreePay Webhook Endpoint:
    Receives notification payloads from the Android GPay/PhonePe Listener app (GpayReader).
    Extracts the unique transaction note (tn), updates the transaction, and marks invoice as Paid.
    """
    resolved_tn = req.tn
    if not resolved_tn and req.note:
        match = re.search(r"(krishi_inv_[a-zA-Z0-9_-]+|user_id_[a-zA-Z0-9_-]+)", req.note)
        resolved_tn = match.group(0) if match else None

    if not resolved_tn:
        return {"status": "ignored", "message": "No matching transaction reference found in note"}

    res = await db.execute(select(Payment).where(Payment.upi_tn == resolved_tn))
    payment = res.scalars().first()
    if not payment:
        return {"status": "not_found", "message": "Transaction not found or already processed"}

    payment.status = "paid"

    inv_res = await db.execute(select(Invoice).where(Invoice.id == payment.invoice_id))
    invoice = inv_res.scalars().first()
    if invoice:
        invoice.status = "paid"
        invoice.payment_method = "upi"

    await db.commit()
    logger.info("FreePay UPI settled transaction %s for invoice %s", resolved_tn, payment.invoice_id)
    return {"status": "success", "message": "Transaction updated and invoice settled successfully"}


@router.post("/upi/simulate-test")
async def simulate_upi_payment(
    tn: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Development & demo endpoint: triggers simulated settlement for a pending UPI QR order.
    """
    res = await db.execute(select(Payment).where(Payment.upi_tn == tn))
    payment = res.scalars().first()
    if not payment:
        raise HTTPException(status_code=404, detail="Transaction not found")

    payment.status = "paid"
    inv_res = await db.execute(select(Invoice).where(Invoice.id == payment.invoice_id))
    invoice = inv_res.scalars().first()
    if invoice:
        invoice.status = "paid"
        invoice.payment_method = "upi"

    await db.commit()
    return {"status": "success", "message": f"Simulated UPI payment verified for {tn}"}


# ==========================================
# RAZORPAY / MANUAL / LEGACY ENDPOINTS
# ==========================================

@router.post("/create-order")
async def create_payment_order(
    req: PaymentCreateOrder,
    profile: BusinessProfile = Depends(get_current_business_profile),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(Invoice).where(Invoice.id == str(req.invoice_id), Invoice.business_profile_id == profile.id)
    )
    invoice = res.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    order_data = create_order(req.amount, f"Receipt for {invoice.invoice_number}")
    payment = Payment(
        business_profile_id=profile.id,
        invoice_id=invoice.id,
        amount=req.amount,
        payment_method="razorpay",
        razorpay_order_id=order_data.get("id"),
        status="created",
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    await log_audit("create_payment_order", current_user.id, profile.id, "payment", payment.id, {})
    return order_data


@router.post("/verify")
async def verify_payment(
    req: PaymentVerify,
    profile: BusinessProfile = Depends(get_current_business_profile),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(Payment).where(
            Payment.razorpay_order_id == req.razorpay_order_id,
            Payment.business_profile_id == profile.id,
        )
    )
    payment = res.scalars().first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if verify_signature(req.razorpay_order_id, req.razorpay_payment_id, req.razorpay_signature):
        payment.status = "paid"
        payment.razorpay_payment_id = req.razorpay_payment_id
        payment.razorpay_signature = req.razorpay_signature

        inv_res = await db.execute(select(Invoice).where(Invoice.id == payment.invoice_id))
        invoice = inv_res.scalars().first()
        if invoice:
            invoice.status = "paid"

        await db.commit()
        await log_audit(
            "verify_payment",
            current_user.id,
            profile.id,
            "payment",
            payment.id,
            {"status": "paid"},
        )
        return {"status": "success"}
    raise HTTPException(status_code=400, detail="Invalid signature")


@router.post("/webhook")
async def razorpay_webhook():
    return {"status": "ok"}


@router.get("/invoice/{invoice_id}", response_model=List[PaymentResponse])
async def get_invoice_payments(
    invoice_id: str,
    profile: BusinessProfile = Depends(get_current_business_profile),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(Payment)
        .where(Payment.invoice_id == invoice_id, Payment.business_profile_id == profile.id)
        .order_by(desc(Payment.created_at))
    )
    return res.scalars().all()
