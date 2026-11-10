import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.api.deps import get_current_user, get_current_business_profile
from app.models.user import User
from app.models.business_profile import BusinessProfile
from app.schemas.auth import (
    TokenResponse,
    LoginRequest,
    RefreshRequest,
    OtpSendRequest,
    OtpVerifyRequest,
    DemoLoginRequest,
    GoogleLoginRequest,
)
from app.schemas.user import UserCreate
from jose import jwt, JWTError
from app.core.config import settings
from app.services.audit_service import log_audit

router = APIRouter()

# In-memory OTP cache for demo/testing
_otp_store = {}

@router.post("/otp/send")
async def send_otp(req: OtpSendRequest):
    clean_phone = "".join(filter(str.isdigit, req.phone))[-10:]
    if len(clean_phone) != 10:
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit Indian mobile number")

    otp = "1234"
    _otp_store[clean_phone] = otp
    return {
        "success": True,
        "message": f"OTP sent to +91 {clean_phone}",
        "phone": clean_phone,
        "demo_otp": otp,
    }

@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp(req: OtpVerifyRequest, db: AsyncSession = Depends(get_db)):
    clean_phone = "".join(filter(str.isdigit, req.phone))[-10:]
    expected_otp = _otp_store.get(clean_phone, "1234")

    # Accept 1234 as universal test/demo OTP
    if req.otp not in [expected_otp, "1234", "0000"]:
        raise HTTPException(status_code=400, detail="Invalid OTP. Please enter 1234.")

    synthetic_email = f"user_{clean_phone}@krishiconnect.in"

    result = await db.execute(
        select(User).where((User.phone == clean_phone) | (User.email == synthetic_email))
    )
    user = result.scalars().first()

    if not user:
        full_name = req.name or f"Kisan {clean_phone[-4:]}"
        user = User(
            full_name=full_name,
            email=synthetic_email,
            hashed_password=get_password_hash("krishi_otp_secret"),
            phone=clean_phone,
        )
        db.add(user)
        await db.flush()

        profile = BusinessProfile(
            user_id=user.id,
            business_name=full_name,
            business_type=req.role or "Individual",
            address="Bhubaneswar, Odisha",
        )
        db.add(profile)
        await db.commit()
        await db.refresh(user)
        await db.refresh(profile)
    else:
        prof_res = await db.execute(select(BusinessProfile).where(BusinessProfile.user_id == user.id))
        profile = prof_res.scalars().first()

    access_token = create_access_token(user.id, profile.id if profile else None)
    refresh_token = create_refresh_token(user.id, profile.id if profile else None)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
        "business_profile": profile,
    }

@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(req: DemoLoginRequest, db: AsyncSession = Depends(get_db)):
    is_farmer = req.role.lower() == "farmer"
    demo_email = "kisan.demo@krishiconnect.in" if is_farmer else "trader.demo@krishiconnect.in"
    demo_name = "Ramesh Sahoo (Farmer Demo)" if is_farmer else "Utkal Agro Traders (Demo)"
    demo_role = "Individual" if is_farmer else "Merchant"
    demo_phone = "9861012345" if is_farmer else "9437012345"

    result = await db.execute(select(User).where(User.email == demo_email))
    user = result.scalars().first()

    if not user:
        user = User(
            full_name=demo_name,
            email=demo_email,
            hashed_password=get_password_hash("demo123456"),
            phone=demo_phone,
        )
        db.add(user)
        await db.flush()

        profile = BusinessProfile(
            user_id=user.id,
            business_name=demo_name,
            business_type=demo_role,
            address="Unit-1 Mandi, Bhubaneswar, Odisha",
            upi_id="kisan@upi" if is_farmer else "utkalagro@upi",
        )
        db.add(profile)
        await db.commit()
        await db.refresh(user)
        await db.refresh(profile)
    else:
        prof_res = await db.execute(select(BusinessProfile).where(BusinessProfile.user_id == user.id))
        profile = prof_res.scalars().first()

    access_token = create_access_token(user.id, profile.id if profile else None)
    refresh_token = create_refresh_token(user.id, profile.id if profile else None)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
        "business_profile": profile,
    }

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        phone=user_in.phone,
    )
    db.add(user)
    await db.flush()

    profile = BusinessProfile(
        user_id=user.id,
        business_name=user_in.business_name or user_in.full_name,
        business_type=user_in.business_type,
        upi_id=user_in.upi_id,
        gst_number=user_in.gst_number,
        address=user_in.address,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(user)
    await db.refresh(profile)

    access_token = create_access_token(user.id, profile.id)
    refresh_token = create_refresh_token(user.id, profile.id)

    await log_audit("register", user.id, profile.id, "user", user.id, {})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
        "business_profile": profile,
    }

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalars().first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    prof_res = await db.execute(select(BusinessProfile).where(BusinessProfile.user_id == user.id))
    profile = prof_res.scalars().first()

    access_token = create_access_token(user.id, profile.id if profile else None)
    refresh_token = create_refresh_token(user.id, profile.id if profile else None)

    await log_audit("login", user.id, profile.id if profile else None, "user", user.id, {})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
        "business_profile": profile,
    }

@router.post("/refresh")
async def refresh_token(req: RefreshRequest):
    try:
        payload = jwt.decode(req.refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
        bp_id = payload.get("business_profile_id")
        return {
            "access_token": create_access_token(user_id, bp_id),
            "token_type": "bearer",
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user),
    profile: BusinessProfile = Depends(get_current_business_profile),
):
    return {"user": current_user, "business_profile": profile}

@router.post("/google", response_model=TokenResponse)
async def google_login(req: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    raw_token = req.credential or req.id_token
    email = None
    name = None

    if raw_token:
        # Verify Google ID Token via Google's official tokeninfo API
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    "https://oauth2.googleapis.com/tokeninfo",
                    params={"id_token": raw_token},
                )
            if res.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired Google authentication token",
                )
            payload = res.json()
            email = payload.get("email")
            name = payload.get("name") or payload.get("given_name") or (email.split("@")[0] if email else "Google User")
            verified = payload.get("email_verified")
            if not verified or str(verified).lower() not in ["true", "1"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Google email is not verified",
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Google token verification failed: {str(e)}",
            )
    elif req.access_token:
        # Verify via Google's userinfo API
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {req.access_token}"},
                )
            if res.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google access token",
                )
            payload = res.json()
            email = payload.get("email")
            name = payload.get("name") or (email.split("@")[0] if email else "Google User")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Google verification failed: {str(e)}",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Google token or credential",
        )

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not retrieve email from Google profile",
        )

    # Check if user already exists
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    if not user:
        user = User(
            full_name=name or "Google User",
            email=email,
            hashed_password=get_password_hash(f"google_{uuid.uuid4()}"),
            phone=None,
        )
        db.add(user)
        await db.flush()

        profile = BusinessProfile(
            user_id=user.id,
            business_name=name or "Google User",
            business_type="Individual",
            address="Bhubaneswar, Odisha",
        )
        db.add(profile)
        await db.commit()
        await db.refresh(user)
        await db.refresh(profile)
        await log_audit("register_google", user.id, profile.id, "user", user.id, {"email": email})
    else:
        prof_res = await db.execute(select(BusinessProfile).where(BusinessProfile.user_id == user.id))
        profile = prof_res.scalars().first()
        await log_audit("login_google", user.id, profile.id if profile else None, "user", user.id, {"email": email})

    access_token = create_access_token(user.id, profile.id if profile else None)
    refresh_token = create_refresh_token(user.id, profile.id if profile else None)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
        "business_profile": profile,
    }
