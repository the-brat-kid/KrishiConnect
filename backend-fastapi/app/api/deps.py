from typing import AsyncGenerator
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.models.business_profile import BusinessProfile

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    # Check per-request cached instance to avoid duplicate queries within the same request lifecycle
    if hasattr(request.state, "current_user") and request.state.current_user is not None:
        return request.state.current_user

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Combined Outer Join: Fetches User AND BusinessProfile in a single ultra-fast query
    result = await db.execute(
        select(User, BusinessProfile)
        .outerjoin(BusinessProfile, BusinessProfile.user_id == User.id)
        .where(User.id == user_id)
    )
    row = result.first()
    if row is None:
        raise credentials_exception
    user, profile = row
    request.state.current_user = user
    request.state.current_profile = profile
    return user

async def get_current_business_profile(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> BusinessProfile:
    # Use profile cached during get_current_user joined query (0 additional database queries)
    if hasattr(request.state, "current_profile") and request.state.current_profile is not None:
        return request.state.current_profile

    result = await db.execute(select(BusinessProfile).where(BusinessProfile.user_id == current_user.id))
    profile = result.scalars().first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Business profile not found")
    request.state.current_profile = profile
    return profile
