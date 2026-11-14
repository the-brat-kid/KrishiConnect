import uuid
import logging
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger("krishiconnect.stripe")

try:
    import stripe
except ImportError:
    stripe = None
    logger.warning("Stripe package is not installed. Stripe integration will operate in simulated mode.")

def is_stripe_configured() -> bool:
    """Returns True if a real Stripe API key is set in settings."""
    if not stripe:
        return False
    key = (settings.STRIPE_SECRET_KEY or "").strip()
    return bool(key and not key.startswith("sk_test_placeholder"))

def get_stripe_client():
    if is_stripe_configured():
        stripe.api_key = settings.STRIPE_SECRET_KEY
        return stripe
    return None

def create_checkout_session(
    invoice_id: str,
    invoice_number: str,
    amount: float,
    currency: str = "inr",
    customer_email: Optional[str] = None,
    customer_name: Optional[str] = None,
    business_profile_id: Optional[str] = None,
    success_url: Optional[str] = None,
    cancel_url: Optional[str] = None,
    metadata: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    """
    Creates a Stripe Checkout Session for an invoice.
    Supports real Stripe API when configured, and simulated checkout flow for development/testing.
    """
    client = get_stripe_client()
    base_frontend = (settings.FRONTEND_URL or "http://localhost:3000").rstrip("/")
    
    # Target URLs
    default_success = f"{base_frontend}/invoices/{invoice_id}?payment=success&session_id={{CHECKOUT_SESSION_ID}}"
    default_cancel = f"{base_frontend}/invoices/{invoice_id}?payment=cancelled"
    
    final_success_url = success_url or default_success
    final_cancel_url = cancel_url or default_cancel
    
    session_metadata = {
        "invoice_id": str(invoice_id),
        "invoice_number": str(invoice_number),
        "business_profile_id": str(business_profile_id or ""),
    }
    if metadata:
        session_metadata.update(metadata)

    # 1. Real Stripe API
    if client:
        try:
            curr = (currency or settings.STRIPE_CURRENCY or "inr").lower()
            amount_in_subunits = int(round(amount * 100))
            
            session_params: Dict[str, Any] = {
                "payment_method_types": ["card"],
                "mode": "payment",
                "line_items": [
                    {
                        "price_data": {
                            "currency": curr,
                            "product_data": {
                                "name": f"KrishiConnect Invoice #{invoice_number}",
                                "description": f"Agricultural trade settlement for invoice #{invoice_number}",
                            },
                            "unit_amount": amount_in_subunits,
                        },
                        "quantity": 1,
                    }
                ],
                "metadata": session_metadata,
                "success_url": final_success_url,
                "cancel_url": final_cancel_url,
            }
            
            if customer_email:
                session_params["customer_email"] = customer_email
                
            session = client.checkout.Session.create(**session_params)
            return {
                "session_id": session.id,
                "url": session.url,
                "is_simulated": False,
                "publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
            }
        except Exception as exc:
            logger.error("Failed to create Stripe Checkout session: %s", exc, exc_info=True)
            raise

    # 2. Simulated/Development Mode
    sim_session_id = f"cs_test_sim_{uuid.uuid4().hex[:20]}"
    resolved_success = final_success_url.replace("{CHECKOUT_SESSION_ID}", sim_session_id)
    logger.info("Using simulated Stripe checkout session: %s", sim_session_id)
    
    return {
        "session_id": sim_session_id,
        "url": resolved_success,
        "is_simulated": True,
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY or "pk_test_simulated",
    }

def verify_checkout_session(session_id: str) -> Dict[str, Any]:
    """
    Directly queries Stripe API to verify whether a checkout session has been paid.
    Returns details on verification status, amount, and payment intent ID.
    """
    client = get_stripe_client()
    
    # Simulated Session Verification
    if session_id.startswith("cs_test_sim_") or not client:
        return {
            "verified": True,
            "status": "paid",
            "session_id": session_id,
            "payment_intent_id": f"pi_sim_{uuid.uuid4().hex[:18]}",
            "amount_received": None,
            "currency": "inr",
            "is_simulated": True,
        }

    # Real Stripe API Verification
    try:
        session = client.checkout.Session.retrieve(session_id, expand=["payment_intent"])
        is_paid = session.payment_status == "paid" or session.status == "complete"
        
        payment_intent_id = None
        if session.payment_intent:
            if isinstance(session.payment_intent, str):
                payment_intent_id = session.payment_intent
            else:
                payment_intent_id = getattr(session.payment_intent, "id", None)

        amount_total = (session.amount_total / 100.0) if session.amount_total is not None else None

        return {
            "verified": is_paid,
            "status": "paid" if is_paid else (session.status or "unpaid"),
            "session_id": session.id,
            "payment_intent_id": payment_intent_id,
            "amount_received": amount_total,
            "currency": session.currency,
            "metadata": dict(session.metadata or {}),
            "is_simulated": False,
        }
    except Exception as exc:
        logger.error("Error verifying Stripe session %s: %s", session_id, exc)
        return {
            "verified": False,
            "status": "failed",
            "error": str(exc),
            "session_id": session_id,
            "is_simulated": False,
        }

def construct_webhook_event(payload: bytes, sig_header: str) -> Dict[str, Any]:
    """
    Constructs and verifies a Stripe Webhook event using STRIPE_WEBHOOK_SECRET.
    """
    client = get_stripe_client()
    if not client or not settings.STRIPE_WEBHOOK_SECRET or settings.STRIPE_WEBHOOK_SECRET.startswith("whsec_placeholder"):
        import json
        logger.warning("Skipping webhook signature verification (webhook secret not configured).")
        return json.loads(payload.decode("utf-8"))

    return client.Webhook.construct_event(
        payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
    )
