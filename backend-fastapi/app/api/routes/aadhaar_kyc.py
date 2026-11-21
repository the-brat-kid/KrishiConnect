import os
import re
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

MAX_KYC_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MIN_KYC_FILE_SIZE = 100  # 100 Bytes minimum (cannot be blank/dummy)

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
}


def validate_and_sanitize_kyc_file(file: UploadFile, file_bytes: bytes) -> str:
    """
    Mandatory KYC file upload validator:
    - Enforces presence and non-empty byte payload
    - Enforces size constraints (100B to 10MB)
    - Validates binary magic signatures (preventing executable masking)
    - Sanitizes filename to prevent directory traversal
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mandatory KYC file missing. You must upload an authentic document file.",
        )

    # 1. Size Constraints
    size = len(file_bytes)
    if size < MIN_KYC_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded KYC document is too small ({size} bytes). Minimum required is {MIN_KYC_FILE_SIZE} bytes.",
        )
    if size > MAX_KYC_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Uploaded KYC document exceeds the maximum 10MB size limit ({size / (1024 * 1024):.1f}MB).",
        )

    # 2. Strict Magic Byte Verification (independent of user-supplied MIME or extension)
    is_valid_format = False
    detected_type = "unknown"

    if file_bytes.startswith(b"\xff\xd8\xff"):
        is_valid_format = True
        detected_type = "JPEG Image"
    elif file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        is_valid_format = True
        detected_type = "PNG Image"
    elif file_bytes.startswith(b"RIFF") and len(file_bytes) >= 12 and file_bytes[8:12] == b"WEBP":
        is_valid_format = True
        detected_type = "WebP Image"
    elif file_bytes.startswith(b"%PDF-"):
        is_valid_format = True
        detected_type = "PDF Document"

    if not is_valid_format:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid KYC file format: File header does not match a valid JPEG, PNG, WebP image or PDF document.",
        )

    # 3. Path Traversal & Filename Sanitization
    raw_name = os.path.basename(file.filename.replace("\\", "/"))
    clean_name = re.sub(r"[^a-zA-Z0-9_.-]", "_", raw_name)
    if not clean_name or clean_name.startswith("."):
        clean_name = f"kyc_document_{int(datetime.utcnow().timestamp())}.dat"

    return clean_name


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
    document_filename: Optional[str] = None


@router.get("/status")
async def get_aadhaar_kyc_status(
    current_user: User = Depends(get_current_user),
):
    """Retrieve current user's Aadhaar KYC verification status & mandatory document status."""
    return {
        "success": True,
        "kyc_status": current_user.kyc_status or "PENDING",
        "kyc_verified_at": current_user.kyc_verified_at.isoformat() if current_user.kyc_verified_at else None,
        "kyc_name": current_user.kyc_name,
        "kyc_dob": current_user.kyc_dob,
        "kyc_pincode": current_user.kyc_pincode,
        "kyc_document_uploaded": bool(current_user.kyc_document_filename),
        "kyc_document_filename": current_user.kyc_document_filename,
        "kyc_document_uploaded_at": current_user.kyc_document_uploaded_at.isoformat() if current_user.kyc_document_uploaded_at else None,
    }


@router.post("/upload-document")
async def upload_mandatory_kyc_document(
    file: UploadFile = File(..., description="Mandatory official Aadhaar/e-Aadhaar document (JPEG, PNG, WebP, PDF)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mandatory KYC Document Upload endpoint:
    Validates file presence, magic bytes, size limits, and sanitizes filename.
    Stores cryptographic audit confirmation of document submission.
    """
    file_bytes = await file.read()
    clean_filename = validate_and_sanitize_kyc_file(file, file_bytes)

    current_user.kyc_document_filename = clean_filename
    current_user.kyc_document_uploaded_at = datetime.utcnow()

    await db.commit()
    await db.refresh(current_user)

    try:
        await log_audit(
            action="kyc_document_uploaded",
            actor_id=current_user.id,
            target_type="user",
            target_id=current_user.id,
            meta={"filename": clean_filename, "size_bytes": len(file_bytes)},
        )
    except Exception:
        pass

    return {
        "success": True,
        "message": f"Mandatory KYC document '{clean_filename}' validated and recorded successfully.",
        "filename": clean_filename,
        "size_bytes": len(file_bytes),
        "uploaded_at": current_user.kyc_document_uploaded_at.isoformat(),
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
        document_filename=current_user.kyc_document_filename,
    )


@router.post("/verify-image", response_model=AadhaarKycResponse)
async def verify_aadhaar_image(
    file: UploadFile = File(..., description="Mandatory uploaded image containing Aadhaar Secure QR"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Verify uploaded image containing dense Aadhaar Secure QR code.
    Enforces mandatory document file upload constraints:
    - Non-empty byte payload and size bounds (100B to 10MB)
    - Magic byte inspection (JPEG, PNG, WebP)
    - Path traversal sanitization
    Extracts QR payload using zxing-cpp and runs cryptographic RSA verification.
    """
    # 1. Mandatory File Validation & Sanitization
    image_bytes = await file.read()
    clean_filename = validate_and_sanitize_kyc_file(file, image_bytes)

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

    # 5. Update User KYC with Mandatory Document Confirmation
    current_user.kyc_status = "VERIFIED"
    current_user.kyc_verified_at = datetime.utcnow()
    current_user.kyc_name = result["name"]
    current_user.kyc_dob = result["dob"]
    current_user.kyc_pincode = result["pincode"]
    current_user.kyc_dedup_hash = dedup_hash
    current_user.kyc_document_filename = clean_filename
    current_user.kyc_document_uploaded_at = datetime.utcnow()

    await db.commit()
    await db.refresh(current_user)

    # 6. Audit Log
    try:
        await log_audit(
            action="aadhaar_kyc_verified",
            actor_id=current_user.id,
            target_type="user",
            target_id=current_user.id,
            meta={
                "method": "image_upload_zxing",
                "matched_cert": result["matched_certificate"],
                "filename": clean_filename,
            },
        )
    except Exception:
        pass

    return AadhaarKycResponse(
        success=True,
        message="Aadhaar cryptographically verified against official UIDAI public key from uploaded document.",
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
        document_filename=clean_filename,
    )
