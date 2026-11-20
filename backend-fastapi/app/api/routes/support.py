from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.services.email_service import send_inquiry_email_background

router = APIRouter()


class ContactInquiryRequest(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = "farmer"
    subject: Optional[str] = "General Inquiry"
    message: str


@router.post("/contact")
async def submit_contact_inquiry(req: ContactInquiryRequest, background_tasks: BackgroundTasks):
    if not req.name.strip() or not req.message.strip():
        raise HTTPException(status_code=400, detail="Name and message are required.")

    # Dispatch email to queries@phantomstack.me and reply receipt
    background_tasks.add_task(
        send_inquiry_email_background,
        req.name.strip(),
        req.email.strip() if req.email else "",
        req.phone.strip() if req.phone else "",
        req.role or "farmer",
        req.subject or "General Inquiry",
        req.message.strip(),
    )

    return {
        "success": True,
        "message": "Your message has been received! Our support desk at queries@phantomstack.me will contact you shortly.",
    }
