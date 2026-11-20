# UIDAI Offline e-KYC Public Certificates Directory

This directory stores official public key certificates (`.cer`, `.crt`, `.pem`) issued by the **Unique Identification Authority of India (UIDAI)** for offline e-KYC signature verification.

## How Offline Aadhaar Secure QR Verification Works
1. Every modern Aadhaar QR code (PVC Card, e-Aadhaar PDF, mAadhaar) is cryptographically signed by UIDAI using an RSA-SHA256 digital signature (`PKCS1v15`).
2. The decompressed payload contains:
   - Data bytes (demographic info, mobile/email hash, biometric JPEG2000 photograph)
   - Last 256 bytes: RSA-SHA256 signature
3. This service dynamically scans all `.cer` / `.crt` / `.pem` files in this directory and verifies the 256-byte signature against each public key.
4. If a matching UIDAI certificate validates the signature, the Aadhaar data is mathematically proven to be authentic and untampered without needing any third-party paid APIs.

## How to Add or Update Official UIDAI Certificates

1. **Download Official Public Certificates from UIDAI**:
   - Visit the official UIDAI portal: [https://uidai.gov.in](https://uidai.gov.in) -> Ecosystem -> Offline e-KYC
   - Or download the public key from the UIDAI developer portal.
2. **File Formats Supported**:
   - Both **DER (Binary)** and **PEM (Base64 ASCII `-----BEGIN CERTIFICATE-----`)** formats are automatically recognized and loaded.
3. **Drop Files into this Directory**:
   - Copy the `.cer` file directly into this folder:
     ```bash
     cp path/to/uidai_offline_publicKey.cer backend-fastapi/certs/
     ```
4. **Certificate Rotation & Multi-Certificate Support**:
   - UIDAI rotates signing certificates periodically (e.g. 2023, 2025, 2027).
   - You can keep multiple `.cer` files in this directory simultaneously. The verification engine will check each key until a valid match is found.

> [!WARNING]
> If this directory is empty or contains no valid certificates, the service will return an explicit `500 Internal Server Error` configuration warning. Do not delete certificates without replacing them.
