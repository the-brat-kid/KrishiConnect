from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class SoilLabResponse(BaseModel):
    id: str
    name: str
    district: str
    location: str
    state: str = "Odisha"
    pincode: Optional[str] = None
    contact_phone: str
    accreditation: str
    turnaround_days: int
    rating: float
    total_tests_conducted: int
    doorstep_collection: bool
    base_fee: float
    supported_tests: List[str]
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SoilAppointmentCreate(BaseModel):
    lab_id: str
    farmer_name: str
    farmer_phone: str
    farm_district: str
    village_or_area: str
    farm_size_acres: float = 1.0
    crop_planned: str
    soil_type: str = "Alluvial"
    test_package: str = "12-Parameter Complete Health Card"
    appointment_mode: str = "Doorstep Pickup"
    appointment_date: datetime
    time_slot: str = "09:00 AM - 12:00 PM"
    notes: Optional[str] = None
    total_amount: float = 199.0


class SoilAppointmentResponse(BaseModel):
    id: str
    lab_id: str
    user_id: Optional[str] = None
    farmer_name: str
    farmer_phone: str
    farm_district: str
    village_or_area: str
    farm_size_acres: float
    crop_planned: str
    soil_type: str
    test_package: str
    appointment_mode: str
    appointment_date: datetime
    time_slot: str
    notes: Optional[str] = None
    status: str
    total_amount: float
    created_at: datetime
    lab: Optional[SoilLabResponse] = None

    class Config:
        from_attributes = True


class SoilAppointmentStatusUpdate(BaseModel):
    status: str
