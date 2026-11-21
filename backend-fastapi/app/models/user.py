import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import mapped_column, Mapped
from app.core.database import Base
from sqlalchemy.dialects.postgresql import UUID

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)
    
    # Offline Aadhaar Secure QR KYC Fields
    kyc_status: Mapped[str] = mapped_column(String, default="PENDING")
    kyc_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    kyc_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    kyc_dob: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    kyc_pincode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    kyc_dedup_hash: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True, nullable=True)
    kyc_document_filename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    kyc_document_uploaded_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

