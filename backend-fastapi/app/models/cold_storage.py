import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.models import Base

class ColdStorageFacility(Base):
    __tablename__ = "cold_storage_facilities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    location = Column(String(255), nullable=False)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), default="Odisha")
    pincode = Column(String(10), nullable=True)
    
    # Capacity in Quintals
    total_capacity_quintals = Column(Float, nullable=False, default=1000.0)
    available_capacity_quintals = Column(Float, nullable=False, default=1000.0)
    
    # Temperature & Environment
    temp_min_celsius = Column(Float, default=2.0)
    temp_max_celsius = Column(Float, default=8.0)
    current_temp_celsius = Column(Float, default=4.0)
    humidity_percentage = Column(Float, default=85.0)
    
    # Pricing & Crops
    daily_rate_per_quintal = Column(Float, nullable=False, default=2.5)  # ₹2.5 / quintal / day
    suitable_crops = Column(JSON, default=list)  # e.g. ["Potato", "Onion", "Tomato", "Carrot"]
    
    # Facility Features & Contact
    contact_phone = Column(String(20), nullable=False)
    contact_person = Column(String(100), nullable=True)
    has_backup_power = Column(Boolean, default=True)
    has_cctv = Column(Boolean, default=True)
    has_humidity_control = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    bookings = relationship("ColdStorageBooking", back_populates="facility", cascade="all, delete-orphan")


class ColdStorageBooking(Base):
    __tablename__ = "cold_storage_bookings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    facility_id = Column(String(36), ForeignKey("cold_storage_facilities.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    crop_name = Column(String(100), nullable=False)
    quantity_quintals = Column(Float, nullable=False)
    
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_days = Column(Integer, nullable=False)
    
    daily_rate = Column(Float, nullable=False)
    estimated_total_cost = Column(Float, nullable=False)
    
    farmer_name = Column(String(150), nullable=False)
    farmer_phone = Column(String(20), nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, confirmed, active, completed, cancelled
    
    created_at = Column(DateTime, default=datetime.utcnow)

    facility = relationship("ColdStorageFacility", back_populates="bookings")
