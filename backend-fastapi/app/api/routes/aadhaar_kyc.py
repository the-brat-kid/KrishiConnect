from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.aadhaar_kyc_service import (
    verify_and_decode_aadhaar_qr,
    extract_qr_from_image,
)
from app.services.audit_service import log_audit

router = APIRouter()


class VerifyQrRequest(BaseModel):
    qr_data: str = Field(..., description="Numeric Base-10 BigInt payload extracted from Aadhaar Secure QR")


class AadhaarKycResponse(BaseModel):
    success: bool
    message: str
    status: str
    name: str
    dob: str
    gender: str
    pincode: str
    state: str
    district: str
    address: str
    reference_id: str
    photo_base64: Optional[str] = None
    verified_at: str


@router.get("/status")
async def get_aadhaar_kyc_status(
    current_user: User = Depends(get_current_user),
):
    """Retrieve current user's Aadhaar KYC verification status."""
    return {
        "success": True,
        "kyc_status": current_user.kyc_status or "PENDING",
        "kyc_verified_at": current_user.kyc_verified_at.isoformat() if current_user.kyc_verified_at else None,
        "kyc_name": current_user.kyc_name,
        "kyc_dob": current_user.kyc_dob,
        "kyc_pincode": current_user.kyc_pincode,
    }


@router.post("/verify-qr", response_model=AadhaarKycResponse)
async def verify_aadhaar_qr(
    payload: VerifyQrRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Verify live camera scanned Aadhaar Secure QR payload.
    Cryptographically verifies RSA-SHA256 signature against UIDAI public keys.
    Zero third-party APIs. Strict in-memory processing.
    """
    # 1. Cryptographic Verification Pipeline
    result = verify_and_decode_aadhaar_qr(payload.qr_data)

    # 2. Privacy & Deduplication Check: Ensure identity isn't already claimed by another user
    dedup_hash = result["dedup_hash"]
    existing_q = await db.execute(
        select(User).where(User.kyc_dedup_hash == dedup_hash, User.id != current_user.id)
    )
    if existing_q.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This Aadhaar identity is already verified with another KrishiConnect account.",
        )

    # 3. Update Current User KYC Record (Zero raw QR data stored)
    current_user.kyc_status = "VERIFIED"
    current_user.kyc_verified_at = datetime.utcnow()
    current_user.kyc_name = result["name"]
    current_user.kyc_dob = result["dob"]
    current_user.kyc_pincode = result["pincode"]
    current_user.kyc_dedup_hash = dedup_hash

    await db.commit()
    await db.refresh(current_user)

    # 4. Audit Log
    try:
        await log_audit(
            action="aadhaar_kyc_verified",
            actor_id=current_user.id,
            target_type="user",
            target_id=current_user.id,
            meta={"method": "qr_camera_scan", "matched_cert": result["matched_certificate"]},
        )
    except Exception:
        pass

    return AadhaarKycResponse(
        success=True,
        message="Aadhaar cryptographically verified against official UIDAI public key.",
        status=current_user.kyc_status,
        name=result["name"],
        dob=result["dob"],
        gender=result["gender"],
        pincode=result["pincode"],
        state=result["state"],
        district=result["district"],
        address=result["address"],
        reference_id=result["reference_id"],
        photo_base64=result["photo_base64"],
        verified_at=result["verified_at"],
    )


@router.post("/verify-image", response_model=AadhaarKycResponse)
async def verify_aadhaar_image(
    file: UploadFile = File(..., description="Uploaded image containing Aadhaar Secure QR"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Verify uploaded image (photo, crop, or screenshot) containing dense Aadhaar Secure QR code.
    Extracts QR payload using zxing-cpp and runs cryptographic RSA verification.
    The uploaded image is processed in memory and discarded immediately (zero disk persistence).
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid image (JPEG, PNG, WebP).",
        )

    # 1. Read in-memory image bytes
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # 2. Extract QR payload via zxing-cpp
    qr_text = extract_qr_from_image(image_bytes)

    # 3. Cryptographic Verification Pipeline
    result = verify_and_decode_aadhaar_qr(qr_text)

    # 4. Deduplication Check
    dedup_hash = result["dedup_hash"]
    existing_q = await db.execute(
        select(User).where(User.kyc_dedup_hash == dedup_hash, User.id != current_user.id)
    )
    if existing_q.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This Aadhaar identity is already verified with another KrishiConnect account.",
        )

    # 5. Update User KYC
    current_user.kyc_status = "VERIFIED"
    current_user.kyc_verified_at = datetime.utcnow()
    current_user.kyc_name = result["name"]
    current_user.kyc_dob = result["dob"]
    current_user.kyc_pincode = result["pincode"]
    current_user.kyc_dedup_hash = dedup_hash

    await db.commit()
    await db.refresh(current_user)

    # 6. Audit Log
    try:
        await log_audit(
            action="aadhaar_kyc_verified",
            actor_id=current_user.id,
            target_type="user",
            target_id=current_user.id,
            meta={"method": "image_upload_zxing", "matched_cert": result["matched_certificate"]},
        )
    except Exception:
        pass

    return AadhaarKycResponse(
        success=True,
        message="Aadhaar cryptographically verified against official UIDAI public key from image.",
        status=current_user.kyc_status,
        name=result["name"],
        dob=result["dob"],
        gender=result["gender"],
        pincode=result["pincode"],
        state=result["state"],
        district=result["district"],
        address=result["address"],
        reference_id=result["reference_id"],
        photo_base64=result["photo_base64"],
        verified_at=result["verified_at"],
    )
