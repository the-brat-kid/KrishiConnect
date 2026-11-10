from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "KrishiConnect API"
    API_V1_STR: str = "/api/v1"
    # No hardcoded default on purpose: a fallback secret baked into source
    # code means anyone with the code can forge valid JWTs against any
    # deployment that forgets to set this. Set SECRET_KEY in your .env /
    # environment -- the app will fail to start if it's missing.
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # DB Config
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "krishiconnect"
    POSTGRES_PORT: str = "5432"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "krishiconnect_audit"

    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # Google OAuth
    GOOGLE_CLIENT_ID: str = "586620821912-vpp58t1c17uqqdl2mrf49d8ha98dtbpq.apps.googleusercontent.com"

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

    CORS_ORIGIN_REGEX_DEFAULT: str = r"^(https?://.*|null)$"

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
        env_file = ".env"

settings = Settings()
