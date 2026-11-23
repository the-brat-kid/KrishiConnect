import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from app.core.database import get_db
from app.models.soil_health import SoilHealthLab, SoilHealthAppointment
from app.models.user import User
from app.services.soil_ai_service import analyze_soil_report_image, analyze_soil_values
from app.schemas.soil_health import (
    SoilLabResponse,
    SoilAppointmentCreate,
    SoilAppointmentResponse,
    SoilAppointmentStatusUpdate,
)
from app.api.deps import get_current_user

router = APIRouter()

SEED_LABS = [
    {
        "id": "lab-ouat-bbsr",
        "name": "OUAT Central Soil & Fertilizer Testing Research Lab",
        "district": "Khordha",
        "location": "College of Agriculture, OUAT Campus, Siripur",
        "state": "Odisha",
        "pincode": "751003",
        "contact_phone": "+91 674 239 7970",
        "accreditation": "ICAR & NABL Accredited (ISO/IEC 17025)",
        "turnaround_days": 2,
        "rating": 4.9,
        "total_tests_conducted": 3480,
        "doorstep_collection": True,
        "base_fee": 199.0,
        "supported_tests": [
            "12-Parameter Complete Health Card",
            "Basic NPK + pH + Organic Carbon",
            "Micronutrient Panel (Zn, Fe, Cu, Mn, B)",
            "Salinity & Electrical Conductivity (EC)",
        ],
        "is_active": True,
    },
    {
        "id": "lab-nrri-cuttack",
        "name": "ICAR-NRRI Soil Science & Plant Health Center",
        "district": "Cuttack",
        "location": "Bidyadharpur, Near NH-16",
        "state": "Odisha",
        "pincode": "753006",
        "contact_phone": "+91 671 236 7777",
        "accreditation": "Govt of India ICAR National Institute",
        "turnaround_days": 3,
        "rating": 4.95,
        "total_tests_conducted": 4820,
        "doorstep_collection": True,
        "base_fee": 249.0,
        "supported_tests": [
            "12-Parameter Complete Health Card",
            "Heavy Metal & Residue Screening",
            "Wetland & Lowland Rice Soil Profiling",
            "Microbial Biomass & Organic Carbon",
        ],
        "is_active": True,
    },
    {
        "id": "lab-kvk-sambalpur",
        "name": "Sambalpur District Krishi Vigyan Kendra (KVK)",
        "district": "Sambalpur",
        "location": "Chiplima Agro Hub, Near Hirakud Dam",
        "state": "Odisha",
        "pincode": "768025",
        "contact_phone": "+91 663 245 1280",
        "accreditation": "Dept of Agriculture, Govt of Odisha",
        "turnaround_days": 3,
        "rating": 4.75,
        "total_tests_conducted": 1940,
        "doorstep_collection": True,
        "base_fee": 149.0,
        "supported_tests": [
            "12-Parameter Complete Health Card",
            "Basic NPK + Soil Texture",
            "Canal Command Salinity Diagnostic",
        ],
        "is_active": True,
    },
    {
        "id": "lab-kvk-balasore",
        "name": "Northern Coastal Agro Diagnostics & Soil Lab",
        "district": "Balasore",
        "location": "KVK Remuna, Industrial Area",
        "state": "Odisha",
        "pincode": "756019",
        "contact_phone": "+91 6782 254 310",
        "accreditation": "State Soil Testing Laboratory Accredited",
        "turnaround_days": 3,
        "rating": 4.7,
        "total_tests_conducted": 1580,
        "doorstep_collection": True,
        "base_fee": 180.0,
        "supported_tests": [
            "12-Parameter Complete Health Card",
            "Coastal Saline Soil Test",
            "Paddy & Oilseed Recommendation",
        ],
        "is_active": True,
    },
    {
        "id": "lab-ganjam-berhampur",
        "name": "South Odisha Soil Fertility & Diagnostic Lab",
        "district": "Ganjam",
        "location": "Ankushpur Mandi Road, Berhampur",
        "state": "Odisha",
        "pincode": "760001",
        "contact_phone": "+91 680 228 1450",
        "accreditation": "Govt of Odisha Soil Testing Network",
        "turnaround_days": 2,
        "rating": 4.8,
        "total_tests_conducted": 2210,
        "doorstep_collection": True,
        "base_fee": 199.0,
        "supported_tests": [
            "12-Parameter Complete Health Card",
            "Red Laterite Acidity Correction (Lime Dose)",
            "Vegetable & Chilli Nutrient Profiling",
        ],
        "is_active": True,
    },
    {
        "id": "lab-bargarh-hub",
        "name": "Bargarh Rice Bowl Precision Soil Clinic",
        "district": "Bargarh",
        "location": "APMC Mandi Yard, Attabira Road",
        "state": "Odisha",
        "pincode": "768028",
        "contact_phone": "+91 6646 232 890",
        "accreditation": "Krishi Vigyan Kendra Certified",
        "turnaround_days": 2,
        "rating": 4.85,
        "total_tests_conducted": 3120,
        "doorstep_collection": True,
        "base_fee": 199.0,
        "supported_tests": [
            "12-Parameter Complete Health Card",
            "Intensive Paddy NPK & Zinc Depletion",
            "Custom Bio-Fertilizer Prescription",
        ],
        "is_active": True,
    },
]


async def _seed_labs_if_empty(db: AsyncSession):
    res = await db.execute(select(SoilHealthLab).limit(1))
    if res.scalar_one_or_none() is None:
        for lab_data in SEED_LABS:
            lab = SoilHealthLab(**lab_data)
            db.add(lab)
        await db.commit()


@router.get("/labs", response_model=List[SoilLabResponse])
async def list_soil_labs(
    district: Optional[str] = Query(None, description="Filter by district"),
    doorstep: Optional[bool] = Query(None, description="Filter by doorstep collection"),
    db: AsyncSession = Depends(get_db)
):
    await _seed_labs_if_empty(db)
    
    query = select(SoilHealthLab).where(SoilHealthLab.is_active == True)
    if district and district.lower() != "all":
        query = query.where(SoilHealthLab.district.ilike(f"%{district}%"))
    if doorstep is not None:
        query = query.where(SoilHealthLab.doorstep_collection == doorstep)
        
    query = query.order_by(desc(SoilHealthLab.rating))
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/appointments", response_model=List[SoilAppointmentResponse])
async def list_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    query = select(SoilHealthAppointment).options(selectinload(SoilHealthAppointment.lab))
    if current_user:
        query = query.where(
            (SoilHealthAppointment.user_id == current_user.id) |
            (SoilHealthAppointment.farmer_phone == (current_user.phone or ""))
        )
    query = query.order_by(desc(SoilHealthAppointment.created_at))
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/appointments", response_model=SoilAppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    data: SoilAppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    # Verify lab exists
    lab_res = await db.execute(select(SoilHealthLab).where(SoilHealthLab.id == data.lab_id))
    lab = lab_res.scalar_one_or_none()
    if not lab:
        raise HTTPException(status_code=404, detail="Selected Soil Testing Lab not found")

    user_id = current_user.id if current_user else None

    appointment = SoilHealthAppointment(
        id=str(uuid.uuid4()),
        lab_id=data.lab_id,
        user_id=user_id,
        farmer_name=data.farmer_name.strip(),
        farmer_phone=data.farmer_phone.strip(),
        farm_district=data.farm_district.strip(),
        village_or_area=data.village_or_area.strip(),
        farm_size_acres=data.farm_size_acres,
        crop_planned=data.crop_planned.strip(),
        soil_type=data.soil_type.strip(),
        test_package=data.test_package.strip(),
        appointment_mode=data.appointment_mode.strip(),
        appointment_date=data.appointment_date.replace(tzinfo=None) if data.appointment_date.tzinfo else data.appointment_date,
        time_slot=data.time_slot.strip(),
        notes=data.notes.strip() if data.notes else None,
        total_amount=data.total_amount or lab.base_fee,
        status="confirmed",
        created_at=datetime.utcnow()
    )

    db.add(appointment)
    await db.commit()
    
    # Reload with lab relationship
    q = select(SoilHealthAppointment).options(selectinload(SoilHealthAppointment.lab)).where(SoilHealthAppointment.id == appointment.id)
    reloaded = await db.execute(q)
    return reloaded.scalar_one()


@router.patch("/appointments/{appointment_id}/status", response_model=SoilAppointmentResponse)
async def update_appointment_status(
    appointment_id: str,
    data: SoilAppointmentStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    q = select(SoilHealthAppointment).options(selectinload(SoilHealthAppointment.lab)).where(SoilHealthAppointment.id == appointment_id)
    res = await db.execute(q)
    apt = res.scalar_one_or_none()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    apt.status = data.status
    await db.commit()
    await db.refresh(apt)
    return apt


@router.delete("/appointments/{appointment_id}")
async def cancel_appointment(
    appointment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    q = select(SoilHealthAppointment).where(SoilHealthAppointment.id == appointment_id)
    if current_user:
        q = q.where(
            (SoilHealthAppointment.user_id == current_user.id) |
            (SoilHealthAppointment.farmer_phone == (current_user.phone or ""))
        )
    res = await db.execute(q)
    apt = res.scalar_one_or_none()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found or unauthorized")

    await db.delete(apt)
    await db.commit()
    return {"detail": "Soil health check appointment cancelled successfully"}


class SoilManualAnalysisRequest(BaseModel):
    ph: Optional[str] = "6.0"
    nitrogen: Optional[str] = "Low"
    phosphorus: Optional[str] = "Medium"
    potassium: Optional[str] = "High"
    organic_carbon: Optional[str] = "0.5%"
    zinc: Optional[str] = "Deficient"
    salinity_ec: Optional[str] = "Normal"
    district: Optional[str] = "Khordha"


@router.post("/analyze-report")
async def analyze_soil_report(
    file: UploadFile = File(...),
    district: Optional[str] = Form("Khordha")
):
    """
    Diagnostic analysis of uploaded Soil Health Card photo or lab report.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    mime_type = file.content_type or "image/jpeg"
    result = await analyze_soil_report_image(contents, mime_type=mime_type, district=district or "Odisha")
    return result


@router.post("/analyze-manual")
async def analyze_manual_soil(req: SoilManualAnalysisRequest):
    """
    KrishiConnect agronomic crop and fertilizer advisory based on manually entered soil parameters.
    """
    result = await analyze_soil_values(req.model_dump(), district=req.district or "Odisha")
    return result

