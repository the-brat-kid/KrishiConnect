import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, Float, DateTime, Index
from sqlalchemy.orm import mapped_column, Mapped
from app.core.database import Base
from sqlalchemy.dialects.postgresql import UUID

class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (
        Index("ix_payments_profile_status", "business_profile_id", "status"),
        Index("ix_payments_profile_created", "business_profile_id", "created_at"),
    )
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_profile_id: Mapped[str] = mapped_column(String, ForeignKey("business_profiles.id"), index=True)
    invoice_id: Mapped[str] = mapped_column(String, ForeignKey("invoices.id"), index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    razorpay_order_id: Mapped[str] = mapped_column(String, nullable=True)
    razorpay_payment_id: Mapped[str] = mapped_column(String, nullable=True)
    razorpay_signature: Mapped[str] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
