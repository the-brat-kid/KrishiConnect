import os
import zlib
import gzip
import tempfile
import unittest
import datetime
from fastapi import HTTPException
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding

from app.services.aadhaar_kyc_service import (
    verify_and_decode_aadhaar_qr,
    load_uidai_certificates,
    compute_kyc_dedup_hash,
)


class TestAadhaarKycVerification(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Generate an in-memory RSA keypair fixture for cryptographic testing
        cls.private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        cls.public_key = cls.private_key.public_key()

        # Create temporary certs directory with a valid certificate
        cls.temp_certs_dir = tempfile.mkdtemp()
        subject = issuer = x509.Name([
            x509.NameAttribute(x509.NameOID.COMMON_NAME, u"UIDAI Test Authority"),
        ])
        cert = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(issuer)
            .public_key(cls.public_key)
            .serial_number(x509.random_serial_number())
            .not_valid_before(datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1))
            .not_valid_after(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=365))
            .sign(cls.private_key, hashes.SHA256())
        )
        cert_file = os.path.join(cls.temp_certs_dir, "test_uidai.cer")
        with open(cert_file, "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))

    # 1. Rejection of old non-numeric XML QR strings
    def test_reject_legacy_xml_qr(self):
        legacy_xml = '<?xml version="1.0"?><PrintLetterBarcodeData uid="123412341234" name="Kisan Farmer"/>'
        with self.assertRaises(HTTPException) as ctx:
            verify_and_decode_aadhaar_qr(legacy_xml, certs_dir=self.temp_certs_dir)
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("pre-2018 XML Aadhaar", ctx.exception.detail)

    def test_reject_arbitrary_non_numeric_qr(self):
        with self.assertRaises(HTTPException) as ctx:
            verify_and_decode_aadhaar_qr("HELLO_INVALID_NON_NUMERIC_QR", certs_dir=self.temp_certs_dir)
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("strictly numeric", ctx.exception.detail)

    # 2. Rejection of corrupted/invalid gzip payloads
    def test_reject_corrupted_gzip_payload(self):
        # A numeric string whose bytes are NOT valid gzip stream
        invalid_numeric = "987654321012345678909876543210"
        with self.assertRaises(HTTPException) as ctx:
            verify_and_decode_aadhaar_qr(invalid_numeric, certs_dir=self.temp_certs_dir)
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Decompression failed", ctx.exception.detail)

    # 3. Proper error when certs/ has no .cer files
    def test_error_when_no_certificates_found(self):
        empty_dir = tempfile.mkdtemp()
        try:
            with self.assertRaises(HTTPException) as ctx:
                load_uidai_certificates(empty_dir)
            self.assertEqual(ctx.exception.status_code, 500)
            self.assertIn("UIDAI certificate configuration error", ctx.exception.detail)
        finally:
            os.rmdir(empty_dir)

    # 4. Rejection when a valid payload's bytes are tampered with (signature mismatch)
    def test_reject_tampered_signature(self):
        # Create a sample payload: 50 bytes of data + 256-byte signature
        dummy_data = b"VTC:Khurda,State:Odisha,Name:Harsh Srivastava,DOB:15/03/1990"
        valid_signature = self.private_key.sign(dummy_data, padding.PKCS1v15(), hashes.SHA256())
        
        # Tamper with 1 byte of dummy_data
        tampered_data = b"VTC:Khurda,State:Odisha,Name:TAMPERED_NAME,DOB:15/03/1990"
        tampered_stream = tampered_data + valid_signature
        
        # Compress into valid gzip stream
        compressed = gzip.compress(tampered_stream)
        bigint_val = int.from_bytes(compressed, byteorder="big")
        tampered_qr_str = str(bigint_val)

        with self.assertRaises(HTTPException) as ctx:
            verify_and_decode_aadhaar_qr(tampered_qr_str, certs_dir=self.temp_certs_dir)
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Cryptographic verification failed", ctx.exception.detail)

    # 5. Deduplication Hash calculation & consistency
    def test_dedup_hash_consistency_and_salting(self):
        hash1 = compute_kyc_dedup_hash("Harsh Srivastava", "15/03/1990", "751001", secret="saltA")
        hash2 = compute_kyc_dedup_hash("harsh srivastava ", "15/03/1990", "751001", secret="saltA")
        hash_diff_salt = compute_kyc_dedup_hash("Harsh Srivastava", "15/03/1990", "751001", secret="saltB")
        hash_diff_dob = compute_kyc_dedup_hash("Harsh Srivastava", "16/03/1990", "751001", secret="saltA")

        # Must normalize whitespace & case
        self.assertEqual(hash1, hash2)
        # Must be different with different salt or dob
        self.assertNotEqual(hash1, hash_diff_salt)
        self.assertNotEqual(hash1, hash_diff_dob)
        self.assertEqual(len(hash1), 64)  # SHA-256 hex string

    # 6. API Route Integration Tests
    def test_api_status_endpoint(self):
        from fastapi.testclient import TestClient
        from app.main import app
        from app.api.deps import get_current_user
        from app.models.user import User

        mock_user = User(
            id="test-user-uuid",
            full_name="Harsh Srivastava",
            email="harsh@test.com",
            hashed_password="hash",
            kyc_status="VERIFIED",
            kyc_name="Harsh Srivastava",
            kyc_dob="15/03/1990",
            kyc_pincode="751001",
        )
        app.dependency_overrides[get_current_user] = lambda: mock_user
        try:
            client = TestClient(app)
            res = client.get("/api/v1/kyc/aadhaar/status")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["kyc_status"], "VERIFIED")
            self.assertEqual(data["kyc_name"], "Harsh Srivastava")
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_api_verify_qr_rejects_xml(self):
        from fastapi.testclient import TestClient
        from app.main import app
        from app.api.deps import get_current_user
        from app.models.user import User

        mock_user = User(
            id="test-user-uuid",
            full_name="Harsh Srivastava",
            email="harsh@test.com",
            hashed_password="hash",
        )
        app.dependency_overrides[get_current_user] = lambda: mock_user
        try:
            client = TestClient(app)
            res = client.post(
                "/api/v1/kyc/aadhaar/verify-qr",
                json={"qr_data": "<PrintLetterBarcodeData uid='1234' />"}
            )
            self.assertEqual(res.status_code, 400)
            self.assertIn("pre-2018 XML", res.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_api_verify_image_rejects_blank_image(self):
        from fastapi.testclient import TestClient
        from app.main import app
        from app.api.deps import get_current_user
        from app.models.user import User
        from PIL import Image
        import io

        mock_user = User(
            id="test-user-uuid",
            full_name="Harsh Srivastava",
            email="harsh@test.com",
            hashed_password="hash",
        )
        app.dependency_overrides[get_current_user] = lambda: mock_user
        try:
            client = TestClient(app)
            # Create a blank white image without QR code
            img = Image.new("RGB", (200, 200), color="white")
            buf = io.BytesIO()
            img.save(buf, format="JPEG")
            buf.seek(0)

            res = client.post(
                "/api/v1/kyc/aadhaar/verify-image",
                files={"file": ("blank.jpg", buf.getvalue(), "image/jpeg")}
            )
            self.assertEqual(res.status_code, 400)
            self.assertIn("No QR code detected", res.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user, None)


if __name__ == "__main__":
    unittest.main()
