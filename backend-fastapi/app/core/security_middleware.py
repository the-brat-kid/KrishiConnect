"""
KrishiConnect Enterprise Security Middlewares:
1. SQL Injection Protection: Request inspection & pattern detection
2. XSS (Cross-Site Scripting) Blocking: Tag inspection & secure response headers
3. CSRF (Cross-Site Request Forgery) Protection: Strict origin/referer & token verification
"""

import re
import json
import logging
from typing import Set, List, Optional
from urllib.parse import urlparse
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings

logger = logging.getLogger("krishiconnect.security")

# --------------------------------------------------------------------------
# 1. SQL Injection Signatures & Inspection
# --------------------------------------------------------------------------
SQLI_PATTERNS = [
    re.compile(r"\b(UNION(\s+ALL)?\s+SELECT)\b", re.IGNORECASE),
    re.compile(r"\b(OR|AND)\s+['\"]?\d+['\"]?\s*=\s*['\"]?\d+", re.IGNORECASE),
    re.compile(r"['\"];\s*(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE)\b", re.IGNORECASE),
    re.compile(r"\b(DROP\s+TABLE|ALTER\s+TABLE|TRUNCATE\s+TABLE)\b", re.IGNORECASE),
    re.compile(r"\b(INFORMATION_SCHEMA\.(TABLES|COLUMNS)|SYS\.TABLES|SYSOBJECTS)\b", re.IGNORECASE),
    re.compile(r"\b(PG_SLEEP|WAITFOR\s+DELAY|BENCHMARK\s*\()\b", re.IGNORECASE),
    re.compile(r"(--|/\*|\*/)\s*$", re.IGNORECASE),
    re.compile(r"'\s*OR\s*'\w+'\s*=\s*'\w+", re.IGNORECASE),
]


def contains_sqli(value: str) -> bool:
    """Inspect a single string for SQL injection signatures."""
    if not isinstance(value, str) or len(value) < 4:
        return False
    for pattern in SQLI_PATTERNS:
        if pattern.search(value):
            return True
    return False


def deep_inspect_sqli(data: any) -> bool:
    """Recursively inspect dictionaries, lists, and strings for SQL injection."""
    if isinstance(data, str):
        return contains_sqli(data)
    elif isinstance(data, dict):
        for k, v in data.items():
            if contains_sqli(str(k)) or deep_inspect_sqli(v):
                return True
    elif isinstance(data, (list, tuple, set)):
        for item in data:
            if deep_inspect_sqli(item):
                return True
    return False


# --------------------------------------------------------------------------
# 2. XSS (Cross-Site Scripting) Patterns
# --------------------------------------------------------------------------
XSS_PATTERNS = [
    re.compile(r"<\s*script[^>]*>", re.IGNORECASE),
    re.compile(r"javascript:\s*", re.IGNORECASE),
    re.compile(r"<\s*(iframe|object|embed|applet|meta)[^>]*>", re.IGNORECASE),
    re.compile(r"on(load|error|click|mouseover|focus|blur|change|submit)\s*=", re.IGNORECASE),
    re.compile(r"<\s*svg[^>]*on\w+\s*=", re.IGNORECASE),
    re.compile(r"data:text/html\s*", re.IGNORECASE),
]


def contains_xss(value: str) -> bool:
    """Inspect a single string for script injection & XSS payloads."""
    if not isinstance(value, str) or len(value) < 4:
        return False
    for pattern in XSS_PATTERNS:
        if pattern.search(value):
            return True
    return False


def deep_inspect_xss(data: any) -> bool:
    """Recursively inspect values for XSS attacks."""
    if isinstance(data, str):
        return contains_xss(data)
    elif isinstance(data, dict):
        for k, v in data.items():
            if contains_xss(str(k)) or deep_inspect_xss(v):
                return True
    elif isinstance(data, (list, tuple, set)):
        for item in data:
            if deep_inspect_xss(item):
                return True
    return False


def escape_like_pattern(search_term: str) -> str:
    """Safely escapes SQL LIKE wildcard characters (%, _) to avoid pattern injection."""
    if not search_term:
        return ""
    return search_term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


# --------------------------------------------------------------------------
# Combined Security Middleware (SQLi, XSS, CSRF & Security Headers)
# --------------------------------------------------------------------------
class EnterpriseSecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # Whitelisted paths that do not require CSRF checks (e.g. webhooks authenticated by HMAC signatures)
        self.csrf_exempt_prefixes = {
            "/api/v1/payments/stripe/webhook",
            "/api/v1/payments/upi/webhook",
            "/api/v1/payments/webhook",
            "/webhook/payment",
            "/docs",
            "/openapi.json",
            "/health",
        }

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        method = request.method.upper()

        # ------------------------------------------------------------------
        # 1. SQL Injection & XSS Check on Query Parameters
        # ------------------------------------------------------------------
        query_params = dict(request.query_params)
        for key, val in query_params.items():
            if contains_sqli(val):
                logger.warning("Blocked SQL Injection attempt in query param '%s': %s", key, val)
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={
                        "detail": "Security violation: Potential SQL Injection detected in request parameters.",
                        "code": "SQL_INJECTION_DETECTED",
                    },
                )
            if contains_xss(val):
                logger.warning("Blocked XSS attack in query param '%s': %s", key, val)
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={
                        "detail": "Security violation: Malicious script/XSS pattern detected in parameters.",
                        "code": "XSS_DETECTED",
                    },
                )

        # ------------------------------------------------------------------
        # 2. SQL Injection & XSS Check on JSON Request Body
        # ------------------------------------------------------------------
        content_type = request.headers.get("content-type", "").lower()
        if method in {"POST", "PUT", "PATCH", "DELETE"} and "application/json" in content_type:
            try:
                body_bytes = await request.body()
                if body_bytes:
                    try:
                        body_json = json.loads(body_bytes.decode("utf-8"))
                        if deep_inspect_sqli(body_json):
                            logger.warning("Blocked SQL Injection attempt in JSON body from %s", request.client.host if request.client else "unknown")
                            return JSONResponse(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                content={
                                    "detail": "Security violation: Potential SQL Injection detected in request body.",
                                    "code": "SQL_INJECTION_DETECTED",
                                },
                            )
                        if deep_inspect_xss(body_json):
                            logger.warning("Blocked XSS attack in JSON body from %s", request.client.host if request.client else "unknown")
                            return JSONResponse(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                content={
                                    "detail": "Security violation: Malicious script/XSS pattern detected in request body.",
                                    "code": "XSS_DETECTED",
                                },
                            )
                    except json.JSONDecodeError:
                        pass
            except Exception as e:
                logger.debug("Body inspection notice: %s", e)

        # ------------------------------------------------------------------
        # 3. CSRF Protection for State-Changing Requests
        # ------------------------------------------------------------------
        if method in {"POST", "PUT", "PATCH", "DELETE"}:
            is_exempt = (path == "/") or any(path.startswith(prefix) for prefix in self.csrf_exempt_prefixes)
            if not is_exempt:
                origin = request.headers.get("origin")
                referer = request.headers.get("referer")

                # If Origin or Referer is sent, verify it matches allowed origins
                request_origin = origin
                if not request_origin and referer:
                    try:
                        parsed_ref = urlparse(referer)
                        request_origin = f"{parsed_ref.scheme}://{parsed_ref.netloc}"
                    except Exception:
                        request_origin = None

                if request_origin:
                    allowed_origins: List[str] = settings.CORS_ORIGINS
                    origin_regex = settings.CORS_ORIGIN_REGEX
                    is_allowed = request_origin in allowed_origins

                    if not is_allowed and origin_regex:
                        if re.match(origin_regex, request_origin):
                            is_allowed = True

                    if not is_allowed:
                        logger.warning("CSRF validation blocked request to %s from untrusted origin: %s", path, request_origin)
                        return JSONResponse(
                            status_code=status.HTTP_403_FORBIDDEN,
                            content={
                                "detail": "CSRF validation failed: Request origin is untrusted.",
                                "code": "CSRF_FAILED",
                            },
                        )

        # ------------------------------------------------------------------
        # Execute Request & Attach Security Headers
        # ------------------------------------------------------------------
        response = await call_next(request)

        # Comprehensive Security Headers (XSS, Clickjacking, MIME-Sniffing)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://js.stripe.com; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: blob: https:; "
            "font-src 'self' data: https:; "
            "connect-src 'self' https: wss:; "
            "frame-src 'self' https://checkout.razorpay.com https://js.stripe.com; "
            "object-src 'none'; "
            "base-uri 'self';"
        )
        return response
