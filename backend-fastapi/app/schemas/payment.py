from pydantic import BaseModel
from typing import Optional, Union
from uuid import UUID
from datetime import datetime

class PaymentCreateOrder(BaseModel):
    invoice_id: Union[UUID, str]
    amount: float

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    invoice_id: Union[UUID, str]

class StripeCheckoutSessionCreate(BaseModel):
    invoice_id: Union[UUID, str]
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None

class StripeCheckoutSessionResponse(BaseModel):
    session_id: str
    url: str
    publishable_key: Optional[str] = None

class StripeVerifyRequest(BaseModel):
    session_id: Optional[str] = None
    payment_intent_id: Optional[str] = None
    invoice_id: Optional[Union[UUID, str]] = None

class StripeVerifyResponse(BaseModel):
    success: bool
    status: str
    invoice_id: str
    payment_id: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    payment_intent_id: Optional[str] = None
    message: str

class UpiCreateQrRequest(BaseModel):
    invoice_id: Union[UUID, str]
    upi_vpa: Optional[str] = None
    upi_name: Optional[str] = None

class UpiCreateQrResponse(BaseModel):
    tn: str
    amount: float
    upiVpa: str
    upiName: str
    upiUrl: str
    invoice_id: str
    invoice_number: str

class UpiStatusResponse(BaseModel):
    tn: str
    amount: float
    status: str
    invoice_id: str

class UpiWebhookRequest(BaseModel):
    tn: Optional[str] = None
    note: Optional[str] = None
    amount: Optional[Union[float, str]] = None
    app: Optional[str] = None
    timestamp: Optional[Union[int, str]] = None

class UpiConfirmPaidRequest(BaseModel):
    tn: str
    utr: Optional[str] = None

class PublicCashConfirmRequest(BaseModel):
    invoice_id: str

class PaymentResponse(BaseModel):
    id: Union[UUID, str]
    invoice_id: Union[UUID, str]
    amount: float
    payment_method: Optional[str] = "stripe"
    currency: Optional[str] = "inr"
    upi_tn: Optional[str] = None
    stripe_session_id: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
