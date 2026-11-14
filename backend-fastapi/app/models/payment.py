import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, Float, DateTime, Index
from sqlalchemy.orm import mapped_column, Mapped
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (
        Index("ix_payments_profile_status", "business_profile_id", "status"),
        Index("ix_payments_profile_created", "business_profile_id", "created_at"),
        Index("ix_payments_stripe_session", "stripe_session_id"),
        Index("ix_payments_stripe_intent", "stripe_payment_intent_id"),
        Index("ix_payments_upi_tn", "upi_tn"),
    )
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_profile_id: Mapped[str] = mapped_column(String, ForeignKey("business_profiles.id"), index=True)
    invoice_id: Mapped[str] = mapped_column(String, ForeignKey("invoices.id"), index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_method: Mapped[str] = mapped_column(String, default="stripe", nullable=True)
    currency: Mapped[str] = mapped_column(String, default="inr", nullable=True)
    
    # FreePay UPI Transaction Note
    upi_tn: Mapped[str] = mapped_column(String, nullable=True)
    
    # Stripe identifiers
    stripe_session_id: Mapped[str] = mapped_column(String, nullable=True)
    stripe_payment_intent_id: Mapped[str] = mapped_column(String, nullable=True)
    
    # Razorpay identifiers (legacy/backward compatibility)
    razorpay_order_id: Mapped[str] = mapped_column(String, nullable=True)
    razorpay_payment_id: Mapped[str] = mapped_column(String, nullable=True)
    razorpay_signature: Mapped[str] = mapped_column(String, nullable=True)
    
    # Status: 'created', 'pending', 'paid', 'failed', 'refunded'
    status: Mapped[str] = mapped_column(String, nullable=False, default="created")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
