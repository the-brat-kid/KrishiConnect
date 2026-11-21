import pytest
from fastapi.testclient import TestClient
from fastapi import UploadFile
from io import BytesIO
from app.main import app
from app.core.ssrf_protection import is_safe_url, validate_safe_url
from app.core.security_middleware import contains_sqli, contains_xss, escape_like_pattern
from app.api.routes.aadhaar_kyc import validate_and_sanitize_kyc_file
from fastapi import HTTPException


def test_ssrf_protection_blocks_private_and_cloud_ips():
    # 1. Loopback
    assert is_safe_url("http://127.0.0.1/admin")[0] is False
    assert is_safe_url("http://localhost:8000/api")[0] is False
    assert is_safe_url("http://[::1]/secret")[0] is False

    # 2. Cloud Metadata (AWS/GCP/Azure)
    assert is_safe_url("http://169.254.169.254/latest/meta-data/")[0] is False
    assert is_safe_url("http://metadata.google.internal/computeMetadata/v1/")[0] is False

    # 3. RFC 1918 Private Subnets
    assert is_safe_url("http://10.0.0.1:5432/")[0] is False
    assert is_safe_url("http://172.16.0.5/")[0] is False
    assert is_safe_url("http://192.168.1.1/router")[0] is False

    # 4. Dangerous Schemes
    assert is_safe_url("file:///etc/passwd")[0] is False
    assert is_safe_url("gopher://127.0.0.1:6379/_flushall")[0] is False
    assert is_safe_url("dict://127.0.0.1:11211/stat")[0] is False

    # 5. Internal Docker service names
    assert is_safe_url("http://postgres:5432")[0] is False
    assert is_safe_url("http://redis:6379")[0] is False
    assert is_safe_url("http://mongodb:27017")[0] is False

    # 6. Valid Public URLs
    safe_ok, _ = is_safe_url("https://www.google.com")
    assert safe_ok is True


def test_sqli_detection_patterns():
    # Detects common SQL injection attacks
    assert contains_sqli("' OR '1'='1") is True
    assert contains_sqli("admin' OR 1=1--") is True
    assert contains_sqli("1; DROP TABLE users;") is True
    assert contains_sqli("1 UNION SELECT username, password FROM users") is True
    assert contains_sqli("1' UNION ALL SELECT null, null, null--") is True
    assert contains_sqli("1 AND PG_SLEEP(5)") is True

    # Benign inputs are not flagged
    assert contains_sqli("Potato") is False
    assert contains_sqli("harsh@example.com") is False
    assert contains_sqli("Invoice for Cuttack APMC") is False


def test_xss_detection_patterns():
    # Detects common XSS vectors
    assert contains_xss("<script>alert(1)</script>") is True
    assert contains_xss("<script src='http://evil.com/x.js'>") is True
    assert contains_xss("<img src=x onerror=alert('XSS')>") is True
    assert contains_xss("javascript:alert(document.cookie)") is True
    assert contains_xss("<iframe src='http://attacker.com'></iframe>") is True
    assert contains_xss("<svg onload=alert(1)>") is True

    # Benign inputs are safe
    assert contains_xss("Hello world!") is False
    assert contains_xss("Kisan Market 2026") is False


def test_sql_like_escaping():
    assert escape_like_pattern("100% pure") == "100\\% pure"
    assert escape_like_pattern("user_name") == "user\\_name"
    assert escape_like_pattern("normal text") == "normal text"


def test_kyc_mandatory_file_validation():
    # 1. Reject empty or tiny payload (< 100 bytes)
    mock_file = UploadFile(filename="test.jpg", file=BytesIO(b"tiny"))
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_kyc_file(mock_file, b"tiny")
    assert exc_info.value.status_code == 400
    assert "too small" in exc_info.value.detail.lower()

    # 2. Reject file without valid magic header
    fake_payload = b"A" * 200  # 200 bytes of plain text
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_kyc_file(mock_file, fake_payload)
    assert exc_info.value.status_code == 400
    assert "invalid kyc file format" in exc_info.value.detail.lower()

    # 3. Reject oversized file (> 10MB)
    huge_bytes = b"\xff\xd8\xff" + b"0" * (11 * 1024 * 1024)
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_kyc_file(mock_file, huge_bytes)
    assert exc_info.value.status_code == 413

    # 4. Accept valid JPEG magic bytes
    valid_jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * 200
    clean_name = validate_and_sanitize_kyc_file(mock_file, valid_jpeg)
    assert clean_name == "test.jpg"

    # 5. Accept valid PNG magic bytes
    valid_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 200
    mock_png = UploadFile(filename="aadhaar_doc.png", file=BytesIO(valid_png))
    clean_png = validate_and_sanitize_kyc_file(mock_png, valid_png)
    assert clean_png == "aadhaar_doc.png"

    # 6. Accept valid PDF magic bytes
    valid_pdf = b"%PDF-1.4" + b"\x00" * 200
    mock_pdf = UploadFile(filename="eaadhaar.pdf", file=BytesIO(valid_pdf))
    clean_pdf = validate_and_sanitize_kyc_file(mock_pdf, valid_pdf)
    assert clean_pdf == "eaadhaar.pdf"

    # 7. Path Traversal Filename Sanitization
    malicious_traversal = UploadFile(filename="../../../etc/cron.d/hack.jpg", file=BytesIO(valid_jpeg))
    safe_name = validate_and_sanitize_kyc_file(malicious_traversal, valid_jpeg)
    assert ".." not in safe_name
    assert "/" not in safe_name
    assert "\\" not in safe_name
    assert safe_name == "hack.jpg"


def test_middleware_blocks_sqli_query_param():
    client = TestClient(app)
    response = client.get("/api/v1/customers?search=' OR '1'='1")
    assert response.status_code == 400
    data = response.json()
    assert data.get("code") == "SQL_INJECTION_DETECTED"


def test_middleware_blocks_xss_query_param():
    client = TestClient(app)
    response = client.get("/api/v1/customers?search=<script>alert('pwned')</script>")
    assert response.status_code == 400
    data = response.json()
    assert data.get("code") == "XSS_DETECTED"


def test_middleware_blocks_csrf_from_untrusted_origin():
    client = TestClient(app)
    # State-changing POST from malicious external origin
    response = client.post(
        "/api/v1/customers",
        json={"name": "Hacked Customer"},
        headers={"Origin": "https://attacker-evil-site.com"},
    )
    assert response.status_code == 403
    data = response.json()
    assert data.get("code") == "CSRF_FAILED"


def test_security_headers_attached_to_responses():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    headers = response.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "SAMEORIGIN"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    assert "Content-Security-Policy" in headers
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


def test_ssrf_check_endpoint():
    client = TestClient(app)
    # 1. Probe internal loopback
    res = client.post("/api/v1/support/check-ssrf", json={"url": "http://127.0.0.1:8000/secret"})
    assert res.status_code == 200
    data = res.json()
    assert data["is_safe"] is False
    assert data["verdict"] == "BLOCKED"

    # 2. Probe AWS/GCP metadata
    res = client.post("/api/v1/support/check-ssrf", json={"url": "http://169.254.169.254/latest/meta-data"})
    assert res.status_code == 200
    data = res.json()
    assert data["is_safe"] is False
    assert data["verdict"] == "BLOCKED"

    # 3. Public legitimate URL
    res = client.post("/api/v1/support/check-ssrf", json={"url": "https://www.google.com"})
    assert res.status_code == 200
    data = res.json()
    assert data["is_safe"] is True
    assert data["verdict"] == "ALLOWED"
