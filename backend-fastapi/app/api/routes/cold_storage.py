from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.cold_storage import ColdStorageFacility, ColdStorageBooking
from app.models.user import User
from app.schemas.cold_storage import (
    FacilityCreate,
    FacilityResponse,
    FacilityUpdate,
    BookingCreate,
    BookingResponse,
    BookingStatusUpdate
)
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/facilities", response_model=List[FacilityResponse])
async def list_facilities(
    district: Optional[str] = Query(None, description="Filter by Odisha district"),
    crop: Optional[str] = Query(None, description="Filter by crop name"),
    min_capacity: Optional[float] = Query(None, description="Minimum available quintals"),
    db: AsyncSession = Depends(get_db)
):
    query = select(ColdStorageFacility).where(ColdStorageFacility.is_active == True)
    
    if district:
        query = query.where(ColdStorageFacility.district.ilike(f"%{district}%"))
    if min_capacity:
        query = query.where(ColdStorageFacility.available_capacity_quintals >= min_capacity)
        
    result = await db.execute(query)
    facilities = result.scalars().all()
    
    if crop:
        filtered = [f for f in facilities if any(crop.lower() in c.lower() for c in (f.suitable_crops or []))]
        return filtered
        
    return facilities


@router.post("/facilities", response_model=FacilityResponse, status_code=status.HTTP_201_CREATED)
async def create_facility(
    data: FacilityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    facility = ColdStorageFacility(**data.model_dump())
    db.add(facility)
    await db.commit()
    await db.refresh(facility)
    return facility


@router.get("/facilities/{facility_id}", response_model=FacilityResponse)
async def get_facility(facility_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ColdStorageFacility).where(ColdStorageFacility.id == facility_id))
    facility = result.scalar_one_or_none()
    if not facility:
        raise HTTPException(status_code=404, detail="Cold storage facility not found")
    return facility


@router.post("/facilities/{facility_id}/book", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def book_storage_space(
    facility_id: str,
    data: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(ColdStorageFacility).where(ColdStorageFacility.id == facility_id))
    facility = result.scalar_one_or_none()
    if not facility:
        raise HTTPException(status_code=404, detail="Cold storage facility not found")
        
    if facility.available_capacity_quintals < data.quantity_quintals:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient capacity. Only {facility.available_capacity_quintals} quintals available."
        )
        
    # Calculate days and cost
    delta = (data.end_date - data.start_date).days
    total_days = max(delta, 1)
    estimated_cost = round(data.quantity_quintals * facility.daily_rate_per_quintal * total_days, 2)
    
    booking = ColdStorageBooking(
        facility_id=facility.id,
        user_id=current_user.id,
        crop_name=data.crop_name,
        quantity_quintals=data.quantity_quintals,
        start_date=data.start_date,
        end_date=data.end_date,
        total_days=total_days,
        daily_rate=facility.daily_rate_per_quintal,
        estimated_total_cost=estimated_cost,
        farmer_name=data.farmer_name,
        farmer_phone=data.farmer_phone,
        notes=data.notes,
        status="confirmed"
    )
    
    # Deduct available capacity
    facility.available_capacity_quintals -= data.quantity_quintals
    
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return booking


@router.get("/my-bookings", response_model=List[BookingResponse])
async def get_my_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(ColdStorageBooking)
        .where(ColdStorageBooking.user_id == current_user.id)
        .order_by(ColdStorageBooking.created_at.desc())
    )
    return result.scalars().all()


@router.patch("/bookings/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(
    booking_id: str,
    data: BookingStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(ColdStorageBooking).where(ColdStorageBooking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.status = data.status
    await db.commit()
    await db.refresh(booking)
    return booking
