from pydantic import BaseModel, EmailStr
from typing import Optional
from app.schemas.user import UserResponse
from app.schemas.business_profile import BusinessProfileResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class OtpSendRequest(BaseModel):
    phone: str

class OtpVerifyRequest(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None
    role: Optional[str] = "Individual"

class DemoLoginRequest(BaseModel):
    role: str = "farmer"

class GoogleLoginRequest(BaseModel):
    credential: Optional[str] = None
    id_token: Optional[str] = None
    access_token: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str
    user: Optional[UserResponse] = None
    business_profile: Optional[BusinessProfileResponse] = None

class RefreshRequest(BaseModel):
    refresh_token: str
