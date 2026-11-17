import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class SoilHealthLab(Base):
    __tablename__ = "soil_health_labs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    district = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    state = Column(String(100), default="Odisha")
    pincode = Column(String(10), nullable=True)
    contact_phone = Column(String(20), nullable=False)
    accreditation = Column(String(150), default="ICAR & NABL Certified")
    turnaround_days = Column(Integer, default=3)
    rating = Column(Float, default=4.8)
    total_tests_conducted = Column(Integer, default=1250)
    doorstep_collection = Column(Boolean, default=True)
    base_fee = Column(Float, default=199.0)
    supported_tests = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    appointments = relationship("SoilHealthAppointment", back_populates="lab", cascade="all, delete-orphan")


class SoilHealthAppointment(Base):
    __tablename__ = "soil_health_appointments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lab_id = Column(String(36), ForeignKey("soil_health_labs.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    farmer_name = Column(String(100), nullable=False)
    farmer_phone = Column(String(20), nullable=False)
    farm_district = Column(String(100), nullable=False)
    village_or_area = Column(String(255), nullable=False)
    farm_size_acres = Column(Float, default=1.0)
    crop_planned = Column(String(100), nullable=False)
    soil_type = Column(String(100), default="Alluvial")
    test_package = Column(String(100), default="12-Parameter Complete Health Card")
    appointment_mode = Column(String(50), default="Doorstep Pickup")
    appointment_date = Column(DateTime, nullable=False)
    time_slot = Column(String(50), default="09:00 AM - 12:00 PM")
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="confirmed")
    total_amount = Column(Float, default=199.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    lab = relationship("SoilHealthLab", back_populates="appointments")
