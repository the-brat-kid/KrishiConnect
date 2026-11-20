import os
import time
import httpx
from fastapi import APIRouter, HTTPException, Query, Body, Depends
from typing import Optional, Dict, Any
from pydantic import BaseModel

router = APIRouter()

SANDBOX_API_KEY = os.getenv("SANDBOX_API_KEY", "key_live_8131f9a93e0545839fa6eb9ffc84a105")
SANDBOX_API_SECRET = os.getenv("SANDBOX_API_SECRET", "secret_live_33d4a8c278194e8d97b53a6bde3cda23")
SANDBOX_BASE_URL = "https://api.sandbox.co.in"

_cached_token: Optional[str] = None
_token_expires_at: float = 0.0

async def get_sandbox_token() -> str:
    global _cached_token, _token_expires_at
    now = time.time()
    if _cached_token and now < _token_expires_at - 60:
        return _cached_token

    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post(
            f"{SANDBOX_BASE_URL}/authenticate",
            headers={
                "x-api-key": SANDBOX_API_KEY,
                "x-api-secret": SANDBOX_API_SECRET,
                "x-api-version": "1.0.0",
                "Content-Type": "application/json",
            },
        )
        if res.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Sandbox auth error: {res.text}")

        data = res.json()
        token = data.get("access_token") or (data.get("data") or {}).get("access_token")
        if not token:
            raise HTTPException(status_code=502, detail="No access token in Sandbox auth response")

        _cached_token = token
        _token_expires_at = now + (23 * 3600)
        return token


class PanVerifyRequest(BaseModel):
    pan: str
    name: Optional[str] = "Kisan Trader"
    dob: Optional[str] = "15/03/1990"


class BankVerifyRequest(BaseModel):
    ifsc: str
    account_number: str


@router.get("/ifsc/{ifsc_code}")
async def lookup_ifsc(ifsc_code: str):
    """Verify IFSC and return bank branch details from Sandbox.co.in"""
    clean_ifsc = ifsc_code.strip().upper()
    if len(clean_ifsc) != 11:
        raise HTTPException(status_code=400, detail="Invalid IFSC code format (must be 11 characters)")

    token = await get_sandbox_token()
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.get(
            f"{SANDBOX_BASE_URL}/bank/{clean_ifsc}",
            headers={
                "authorization": token,
                "x-api-key": SANDBOX_API_KEY,
                "x-api-version": "1.0.0",
            },
        )
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail="IFSC code not found")

        data = res.json()
        return {
            "success": True,
            "data": {
                "ifsc": data.get("IFSC", clean_ifsc),
                "bank": data.get("BANK", "Unknown Bank"),
                "branch": data.get("BRANCH", "Main Branch"),
                "address": data.get("ADDRESS", ""),
                "city": data.get("CITY", ""),
                "district": data.get("DISTRICT", ""),
                "state": data.get("STATE", ""),
                "upi": bool(data.get("UPI")),
                "neft": bool(data.get("NEFT")),
                "rtgs": bool(data.get("RTGS")),
                "imps": bool(data.get("IMPS")),
            },
        }


@router.post("/pan/verify")
async def verify_pan(payload: PanVerifyRequest):
    """Verify PAN against Income Tax Department records via Sandbox.co.in"""
    clean_pan = payload.pan.strip().upper()
    token = await get_sandbox_token()

    body = {
        "@entity": "in.co.sandbox.kyc.pan_verification.request",
        "pan": clean_pan,
        "name_as_per_pan": payload.name or "Kisan Trader",
        "date_of_birth": payload.dob or "15/03/1990",
        "consent": "y",
        "reason": "Farmer & APMC Mandi Trader Verification for KrishiConnect",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.post(
            f"{SANDBOX_BASE_URL}/kyc/pan/verify",
            headers={
                "authorization": token,
                "x-api-key": SANDBOX_API_KEY,
                "x-api-version": "1.0.0",
                "Content-Type": "application/json",
            },
            json=body,
        )

        data = res.json()
        if res.status_code >= 400:
            return {
                "success": False,
                "message": data.get("message", "PAN verification failed"),
                "details": data,
            }

        res_data = data.get("data", {})
        return {
            "success": True,
            "data": {
                "pan": res_data.get("pan", clean_pan),
                "status": res_data.get("status", "valid"),
                "status_description": res_data.get("status_description", "ITD Record Verified"),
                "name_match": bool(res_data.get("name_as_per_pan_match")),
                "dob_match": bool(res_data.get("date_of_birth_match")),
                "category": res_data.get("category", "individual"),
                "aadhaar_seeding": res_data.get("aadhaar_seeding_status", "linked"),
                "remarks": res_data.get("remarks", ""),
                "transaction_id": data.get("transaction_id", ""),
            },
        }


@router.post("/bank/verify")
async def verify_bank_account(payload: BankVerifyRequest):
    """Penny-drop bank account verification via Sandbox.co.in"""
    clean_ifsc = payload.ifsc.strip().upper()
    clean_acc = payload.account_number.strip()
    token = await get_sandbox_token()

    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.get(
            f"{SANDBOX_BASE_URL}/bank/{clean_ifsc}/accounts/{clean_acc}/verify",
            headers={
                "authorization": token,
                "x-api-key": SANDBOX_API_KEY,
                "x-api-version": "1.0.0",
            },
        )
        data = res.json()
        res_data = data.get("data", {})
        return {
            "success": True,
            "data": {
                "account_exists": bool(res_data.get("account_exists")),
                "beneficiary_name": res_data.get("name_at_bank", ""),
                "message": res_data.get("message", ""),
                "transaction_id": data.get("transaction_id", ""),
            },
        }
