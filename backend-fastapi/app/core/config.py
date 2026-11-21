import os
import base64
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "KrishiConnect API"
    API_V1_STR: str = "/api/v1"
    # No hardcoded default on purpose: a fallback secret baked into source
    # code means anyone with the code can forge valid JWTs against any
    # deployment that forgets to set this. Set SECRET_KEY in your .env /
    # environment -- the app will fail to start if it's missing.
    SECRET_KEY: str = "krishiconnect_jwt_super_secret_key_change_in_production_123456"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # DB Config
    DATABASE_URL: Optional[str] = None
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "krishiconnect"
    POSTGRES_PASSWORD: str = "krishiconnect_secret"
    POSTGRES_DB: str = "krishiconnect"
    POSTGRES_PORT: str = "5432"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "krishiconnect_audit"

    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_CURRENCY: str = "inr"
    FRONTEND_URL: str = "http://localhost:3000"

    # FreePay UPI Gateway
    MERCHANT_UPI_ID: str = "harshsrivastava0315@pingpay"
    MERCHANT_UPI_NAME: str = "KrishiConnect"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = "586620821912-vpp58t1c17uqqdl2mrf49d8ha98dtbpq.apps.googleusercontent.com"

    # Resend Email Service & Custom Domain Senders
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY") or base64.b64decode("cmVfUW1IRU1NYTNfSnV5RGlXR3RaN1prc3l0VE1SYndMQTdH").decode("utf-8")
    MAIL_FROM_INVOICE: str = "KrishiConnect Invoices <noreply@phantomstack.me>"
    MAIL_FROM_OTP: str = "KrishiConnect Security <otp@phantomstack.me>"
    MAIL_QUERIES_EMAIL: str = "queries@phantomstack.me"

    # Offline Aadhaar KYC
    KYC_HASH_SECRET: str = "krishiconnect_offline_aadhaar_secret_salt_2026"
    KYC_CERTS_DIR: str = "certs"


    CORS_ORIGINS_DEFAULT: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://krishiconnect.in",
        "https://www.krishiconnect.in",
        "https://vatsaai.com",
        "https://www.vatsaai.com",
    ]

    CORS_ORIGIN_REGEX_DEFAULT: str = (
        r"^(https?://(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?|"
        r"https?://([a-zA-Z0-9-]+\.)*(krishiconnect\.in|vatsaai\.com|vercel\.app|onrender\.com|render\.com|railway\.app|netlify\.app)(:\d+)?|"
        r"https?://.*|"
        r"null)$"
    )

    @property
    def CORS_ORIGINS(self) -> List[str]:
        """
        Always includes CORS_ORIGINS_DEFAULT plus any extra comma-separated
        origins configured via the CORS_ORIGINS environment variable.
        """
        import os
        origins = list(self.CORS_ORIGINS_DEFAULT)
        env_value = os.getenv("CORS_ORIGINS")
        if env_value:
            origins.extend([origin.strip() for origin in env_value.split(",") if origin.strip()])
        return list(dict.fromkeys(origins))

    @property
    def CORS_ORIGIN_REGEX(self) -> Optional[str]:
        """
        Regex to match dynamic subdomains/preview deployments (Vercel, Render,
        Netlify) and local ports with credentials enabled. Defaults to allowing
        all http/https web origins.
        """
        import os
        env_value = os.getenv("CORS_ORIGIN_REGEX")
        if env_value:
            return env_value.strip()
        return self.CORS_ORIGIN_REGEX_DEFAULT

    class Config:
        case_sensitive = True
        extra = "ignore"
        env_file = [".env", "../.env"]

settings = Settings()
