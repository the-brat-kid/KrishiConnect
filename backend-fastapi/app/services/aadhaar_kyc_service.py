import os
import io
import zlib
import base64
import hashlib
import logging
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
from PIL import Image
from fastapi import HTTPException
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from app.core.config import settings

# Graceful headless shim for pyzbar so pyaadhaar never fails due to missing system libzbar
import sys, types
if "pyzbar" not in sys.modules:
    mock_pyzbar = types.ModuleType("pyzbar")
    mock_pyzbar_sub = types.ModuleType("pyzbar.pyzbar")
    mock_pyzbar_sub.decode = lambda *args, **kwargs: []
    sys.modules["pyzbar"] = mock_pyzbar
    sys.modules["pyzbar.pyzbar"] = mock_pyzbar_sub

from pyaadhaar.decode import AadhaarSecureQr
import zxingcpp

logger = logging.getLogger("krishiconnect.aadhaar_kyc")


def get_certs_directory(custom_dir: Optional[str] = None) -> str:
    """Resolve absolute path to certs directory."""
    if custom_dir:
        if os.path.isabs(custom_dir):
            return custom_dir
        return os.path.abspath(custom_dir)

    configured = getattr(settings, "KYC_CERTS_DIR", "certs")
    if os.path.isabs(configured):
        return configured

    # Check relative to backend-fastapi directory
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    candidate = os.path.join(base_dir, configured)
    if os.path.exists(candidate):
        return candidate
    return os.path.abspath(configured)


def load_uidai_certificates(certs_dir: Optional[str] = None) -> List[Tuple[str, rsa.RSAPublicKey]]:
    """
    Dynamically load all public certificates (.cer, .crt, .pem) from certs directory.
    Supports both PEM and DER binary encodings.
    """
    target_dir = get_certs_directory(certs_dir)
    if not os.path.exists(target_dir):
        raise HTTPException(
            status_code=500,
            detail=f"UIDAI certificate configuration error: Directory '{target_dir}' does not exist.",
        )

    loaded_keys: List[Tuple[str, rsa.RSAPublicKey]] = []
    valid_extensions = (".cer", ".crt", ".pem")

    for fname in sorted(os.listdir(target_dir)):
        # Ignore hidden files, private keys, or non-certificate files
        if fname.startswith(".") or fname.startswith("test_key") or not fname.lower().endswith(valid_extensions):
            continue

        fpath = os.path.join(target_dir, fname)
        if not os.path.isfile(fpath):
            continue

        try:
            with open(fpath, "rb") as f:
                cert_bytes = f.read()

            cert = None
            try:
                cert = x509.load_pem_x509_certificate(cert_bytes, default_backend())
            except Exception:
                try:
                    cert = x509.load_der_x509_certificate(cert_bytes, default_backend())
                except Exception:
                    continue

            if cert:
                pub_key = cert.public_key()
                if isinstance(pub_key, rsa.RSAPublicKey):
                    loaded_keys.append((fname, pub_key))
        except Exception as e:
            logger.warning(f"Failed to parse certificate {fname}: {e}")

    if not loaded_keys:
        raise HTTPException(
            status_code=500,
            detail=(
                "UIDAI certificate configuration error: No valid .cer/.crt/.pem public certificates "
                f"found in '{target_dir}'. Please drop official UIDAI public keys into this directory."
            ),
        )

    return loaded_keys


def compute_kyc_dedup_hash(name: str, dob: str, pincode: str, secret: Optional[str] = None) -> str:
    """
    Compute cryptographic deduplication hash:
    SHA-256(lowercase(name.strip()) + dob.strip() + pincode.strip() + secret)
    """
    salt = secret or getattr(settings, "KYC_HASH_SECRET", "krishiconnect_offline_aadhaar_secret_salt_2026")
    normalized = f"{name.strip().lower()}{dob.strip()}{pincode.strip()}{salt}"
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def extract_qr_from_image(image_bytes: bytes) -> str:
    """
    Extract dense Aadhaar Secure QR payload text from uploaded image using zxingcpp.
    Includes contrast & grayscale auto-tuning for challenging scans.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    # Pass 1: Standard barcode extraction
    barcodes = zxingcpp.read_barcodes(img)

    # Pass 2: Grayscale and contrast enhanced fallback
    if not barcodes:
        try:
            from PIL import ImageEnhance, ImageOps
            gray = ImageOps.grayscale(img)
            enhanced = ImageEnhance.Contrast(gray).enhance(2.2)
            barcodes = zxingcpp.read_barcodes(enhanced)
        except Exception:
            pass

    if not barcodes:
        raise HTTPException(
            status_code=400,
            detail=(
                "No QR code detected in the uploaded image. Please ensure the QR code is clearly visible, "
                "well-focused, well-lit, and uncropped. For best results, use a high-resolution photo or PDF crop."
            ),
        )

    qr_text = barcodes[0].text
    if not qr_text:
        raise HTTPException(status_code=400, detail="QR code found but returned empty content.")

    return qr_text


def verify_and_decode_aadhaar_qr(
    qr_data: str,
    certs_dir: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Complete Cryptographic Verification Pipeline for Offline Aadhaar Secure QR:
    1. Validates strictly numeric BigInt (rejects legacy pre-2018 XML cards).
    2. Converts BigInt -> big-endian bytes -> gzip decompress.
    3. Splits last 256 bytes = RSA signature, preceding bytes = signed data.
    4. Cryptographically verifies signature against loaded UIDAI certificates using RSA-SHA256 (PKCS1v15).
    5. Decodes demographic attributes via AadhaarSecureQr.
    6. Converts embedded JPEG2000 photo to browser-compatible JPEG base64 string.
    7. Computes KYC deduplication hash.
    """
    raw_str = qr_data.strip()

    # 1. BigInt Numeric Validation
    if not raw_str.isdigit():
        lower_raw = raw_str.lower()
        if "<" in raw_str and ("xml" in lower_raw or "printletterbarcodedata" in lower_raw or "barcode" in lower_raw):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Detected legacy pre-2018 XML Aadhaar card format. Legacy XML cards lack cryptographic "
                    "UIDAI digital signatures. Please use a physical PVC Aadhaar card or newly downloaded "
                    "e-Aadhaar PDF from uidai.gov.in."
                ),
            )
        raise HTTPException(
            status_code=400,
            detail="Invalid Aadhaar QR format: Payload must be a strictly numeric Base-10 BigInt string.",
        )

    # 2. BigInt to Big-Endian Bytes
    try:
        qr_int = int(raw_str)
        bit_len = qr_int.bit_length()
        qr_bytes = qr_int.to_bytes((bit_len + 7) // 8, byteorder="big")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse BigInt payload into bytes: {str(e)}")

    # 3. Gzip / Zlib Decompression
    try:
        # Standard UIDAI Secure QR uses gzip stream (16 + MAX_WBITS)
        decompressed = zlib.decompress(qr_bytes, 16 + zlib.MAX_WBITS)
    except Exception:
        try:
            # Fallback to auto-detect gzip or zlib header
            decompressed = zlib.decompress(qr_bytes, zlib.MAX_WBITS | 32)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Decompression failed: Invalid or corrupted gzip payload ({str(e)}).",
            )

    # 4. Split Payload: Last 256 bytes = RSA signature
    if len(decompressed) < 256:
        raise HTTPException(
            status_code=400,
            detail="Payload too short: Decompressed stream does not contain the mandatory 256-byte RSA signature.",
        )

    signature = decompressed[-256:]
    signed_data = decompressed[:-256]

    # 5. Cryptographic RSA-SHA256 PKCS1v15 Signature Verification
    public_keys = load_uidai_certificates(certs_dir)
    verified = False
    matched_cert = None

    for cert_name, pub_key in public_keys:
        try:
            pub_key.verify(signature, signed_data, padding.PKCS1v15(), hashes.SHA256())
            verified = True
            matched_cert = cert_name
            break
        except Exception:
            continue

    if not verified:
        raise HTTPException(
            status_code=400,
            detail=(
                "Cryptographic verification failed: RSA-SHA256 signature does not match any official UIDAI "
                "public certificates. The QR code is either counterfeit, tampered with, or signed by an untrusted key."
            ),
        )

    # 6. Demographic Decoding via AadhaarSecureQr
    try:
        qr_obj = AadhaarSecureQr(qr_int)
        demographics = qr_obj.decodeddata
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to decode Aadhaar demographic details from verified payload: {str(e)}",
        )

    name = str(demographics.get("name") or "").strip()
    dob = str(demographics.get("dob") or "").strip()
    gender = str(demographics.get("gender") or "").strip()
    pincode = str(demographics.get("pincode") or "").strip()
    reference_id = str(demographics.get("referenceid") or "").strip()
    state = str(demographics.get("state") or "").strip()
    district = str(demographics.get("district") or "").strip()
    careof = str(demographics.get("careof") or "").strip()
    vtc = str(demographics.get("vtc") or "").strip()
    postoffice = str(demographics.get("postoffice") or "").strip()
    location = str(demographics.get("location") or "").strip()
    street = str(demographics.get("street") or "").strip()
    house = str(demographics.get("house") or "").strip()
    landmark = str(demographics.get("landmark") or "").strip()

    # Compose structured address
    addr_parts = [house, street, landmark, location, vtc, postoffice, district, state, pincode]
    address = ", ".join([p for p in addr_parts if p])

    # 7. Convert Embedded JPEG2000 Photo to Base64 JPEG
    photo_base64 = None
    if qr_obj.isImage():
        try:
            img = qr_obj.image()
            if img:
                buf = io.BytesIO()
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img.save(buf, format="JPEG", quality=92)
                photo_base64 = f"data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"
        except Exception as img_err:
            logger.warning(f"JPEG2000 photo extraction notice: {img_err}")

    # 8. Compute Deduplication Hash (SHA-256 with salt)
    dedup_hash = compute_kyc_dedup_hash(name, dob, pincode)

    return {
        "verified": True,
        "matched_certificate": matched_cert,
        "name": name,
        "dob": dob,
        "gender": gender,
        "pincode": pincode,
        "reference_id": reference_id,
        "state": state,
        "district": district,
        "address": address,
        "photo_base64": photo_base64,
        "dedup_hash": dedup_hash,
        "verified_at": datetime.utcnow().isoformat(),
    }
