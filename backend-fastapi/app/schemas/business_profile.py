from pydantic import BaseModel
from typing import Optional, Union
from uuid import UUID

class BusinessProfileBase(BaseModel):
    business_name: str
    business_type: str
    upi_id: Optional[str] = None
    gst_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    logo_base64: Optional[str] = None

class BusinessProfileUpdate(BaseModel):
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    upi_id: Optional[str] = None
    gst_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    logo_base64: Optional[str] = None

class BusinessProfileResponse(BusinessProfileBase):
    id: Union[UUID, str]
    class Config:
        from_attributes = True
