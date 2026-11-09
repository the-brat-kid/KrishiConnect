from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Facility Schemas
class FacilityBase(BaseModel):
    name: str = Field(..., example="Kalinga Agri Cold Chain")
    location: str = Field(..., example="Jagatpur Industrial Estate")
    district: str = Field(..., example="Cuttack")
    state: str = "Odisha"
    pincode: Optional[str] = "754021"
    total_capacity_quintals: float = Field(..., gt=0)
    available_capacity_quintals: float = Field(..., ge=0)
    temp_min_celsius: float = 2.0
    temp_max_celsius: float = 8.0
    current_temp_celsius: float = 4.2
    humidity_percentage: float = 85.0
    daily_rate_per_quintal: float = Field(..., gt=0)
    suitable_crops: List[str] = ["Potato", "Onion", "Tomato", "Ginger"]
    contact_phone: str = Field(..., example="+91 94370 12345")
    contact_person: Optional[str] = "Sanjay Mohanty"
    has_backup_power: bool = True
    has_cctv: bool = True
    has_humidity_control: bool = True
    is_active: bool = True

class FacilityCreate(FacilityBase):
    pass

class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    available_capacity_quintals: Optional[float] = None
    current_temp_celsius: Optional[float] = None
    humidity_percentage: Optional[float] = None
    daily_rate_per_quintal: Optional[float] = None
    is_active: Optional[bool] = None

class FacilityResponse(FacilityBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Booking Schemas
class BookingCreate(BaseModel):
    facility_id: str
    crop_name: str
    quantity_quintals: float = Field(..., gt=0)
    start_date: datetime
    end_date: datetime
    farmer_name: str
    farmer_phone: str
    notes: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: str = Field(..., example="confirmed")  # confirmed, active, completed, cancelled

class BookingResponse(BaseModel):
    id: str
    facility_id: str
    user_id: str
    crop_name: str
    quantity_quintals: float
    start_date: datetime
    end_date: datetime
    total_days: int
    daily_rate: float
    estimated_total_cost: float
    farmer_name: str
    farmer_phone: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
