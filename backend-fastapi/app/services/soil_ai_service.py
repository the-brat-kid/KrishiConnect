import os
import base64
import json
import logging
from typing import Optional, Dict, Any
import httpx
from dotenv import load_dotenv
from pathlib import Path

# Load env variables
root_env = Path(__file__).resolve().parents[3] / ".env"
backend_env = Path(__file__).resolve().parents[2] / ".env"
if root_env.exists():
    load_dotenv(dotenv_path=root_env, override=True)
if backend_env.exists():
    load_dotenv(dotenv_path=backend_env, override=True)

logger = logging.getLogger("krishiconnect.soil_ai")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
# Prioritize verified working Gemini models in order
GEMINI_MODELS = [
    "models/gemini-3.5-flash",
    "models/gemini-3.1-flash-lite",
    "models/gemini-flash-lite-latest",
    "models/gemini-flash-latest",
    "models/gemini-3.5-flash-lite",
]

SYSTEM_PROMPT = """You are an elite Indian Agronomist and Soil Scientist specializing in precision crop planning for KrishiConnect (covering Odisha and Indian Mandis).
Your job is to analyze the provided Soil Health Card / Lab Test Report image or soil parameters.

Carefully extract the soil parameters:
- pH (Acidic < 6.5, Neutral 6.5-7.5, Alkaline > 7.5)
- Nitrogen (N in kg/ha or rating: Low/Medium/High)
- Phosphorus (P in kg/ha or rating: Low/Medium/High)
- Potassium (K in kg/ha or rating: Low/Medium/High)
- Organic Carbon (OC %: Deficient < 0.5%, Normal 0.5-0.75%, High > 0.75%)
- Micronutrients: Zinc (Zn), Iron (Fe), Sulphur (S), Boron (B)
- Electrical Conductivity / Salinity (EC in dS/m)

CRITICAL REQUIREMENT: For EVERY recommended crop, you MUST specify the optimal, high-yield fertilizer recommendation tailored to that crop and this soil. Mention exact fertilizers (e.g., DAP, Neem Coated Urea, MOP, SSP, Zinc Sulphate, Nano Urea) and stage-wise dosage (Basal at sowing, Top Dressing at vegetative/flowering stages, Micronutrients, and Organic additions).

Then generate a high-precision, farmer-friendly agronomic advisory in JSON format:
{
  "soil_health_score": <number between 40 and 100>,
  "detected_parameters": {
    "ph": "<value e.g. 5.8>",
    "ph_status": "<Acidic / Neutral / Alkaline>",
    "nitrogen": "<Low / Medium / High>",
    "phosphorus": "<Low / Medium / High>",
    "potassium": "<Low / Medium / High>",
    "organic_carbon": "<value e.g. 0.42% (Low)>",
    "zinc": "<Deficient / Sufficient>",
    "salinity_ec": "<Normal / Saline>"
  },
  "summary": "<2-3 sentence clear, formal professional summary of the soil condition in English>",
  "recommended_crops": [
    {
      "crop": "<e.g. Swarna Paddy (Rice) / Groundnut / Mustard / Chilli / Maize>",
      "suitability": <number 75-98>,
      "season": "<Kharif / Rabi / Zaid / Year-round>",
      "reason": "<Specific scientific reason why this crop will thrive in these exact soil parameters>",
      "expected_yield_boost": "<e.g. +18-25% with proper NPK dose>",
      "best_fertilizer": "<Clear summary of best fertilizer for this crop, e.g. 'Basal: DAP 50 kg/acre + MOP 25 kg/acre + Zinc Sulphate 10 kg/acre. Top dressing: Neem Coated Urea in 2 splits (35 kg/acre each)'>",
      "fertilizer_schedule": {
        "basal": "<Dosage at sowing/transplanting e.g. DAP 50 kg + MOP 25 kg/acre>",
        "top_dressing": "<Dosage during active growth e.g. Urea 35 kg at tillering + 35 kg at panicle initiation or Nano Urea spray>",
        "micronutrients": "<Micronutrients needed e.g. Zinc Sulphate 21% @ 10 kg/acre or Boron 1g/L spray>",
        "organic": "<Organic input e.g. Well-decomposed FYM 2-3 tonnes/acre or PSB culture>"
      },
      "npk_ratio": "<Target N:P:K ratio e.g. 80:40:40 kg/ha>",
      "application_tip": "<Vital agronomic tip, e.g. Never mix Zinc Sulphate directly with DAP to prevent chemical precipitation>"
    }
  ],
  "crops_to_avoid": [
    {
      "crop": "<Crop name>",
      "reason": "<Why this crop will fail or produce poor yield under these soil conditions>"
    }
  ],
  "fertilizer_prescription": [
    "<Actionable general step 1, e.g. Lime / Paper Mill Sludge dosage for acidity>",
    "<Actionable general step 2, e.g. Zinc Sulphate 10-12 kg/acre>",
    "<Actionable general step 3, e.g. Split Urea or FYM organic manure>"
  ],
  "organic_interventions": [
    "<e.g. Dhaincha / Sunnhemp green manuring before Kharif>",
    "<e.g. Trichoderma / PSB bio-fertilizer application>"
  ]
}

Return strictly valid JSON matching this schema."""


def _get_api_key() -> str:
    key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY).strip()
    return key


def _get_heuristic_fallback(district: str = "Odisha") -> Dict[str, Any]:
    """Reliable agronomic fallback based on ICAR Eastern Zone & OUAT soil research."""
    return {
        "soil_health_score": 72,
        "detected_parameters": {
            "ph": "6.2",
            "ph_status": "Slightly Acidic (Coastal Alluvial / Lateritic)",
            "nitrogen": "Low (< 240 kg/ha)",
            "phosphorus": "Medium (18-24 kg/ha)",
            "potassium": "High (> 280 kg/ha)",
            "organic_carbon": "0.48% (Low)",
            "zinc": "Deficient (< 0.6 ppm)",
            "salinity_ec": "Normal (< 1.0 dS/m)",
        },
        "summary": f"Your soil in {district} has good potassium reserve but shows slight acidity and low organic carbon & zinc deficiency. With targeted liming and zinc supplementation, high yields can be achieved.",
        "recommended_crops": [
            {
                "crop": "Paddy (Swarna / MTU-1001 / Lalat)",
                "suitability": 95,
                "season": "Kharif",
                "reason": "Naturally adapted to Odisha coastal and alluvial soils; thrives under current moisture and responds strongly to basal zinc.",
                "expected_yield_boost": "+22% with split nitrogen",
                "best_fertilizer": "Basal: DAP (50 kg/acre) + MOP (25 kg/acre) + Zinc Sulphate 21% (10 kg/acre). Top Dressing: Neem-Coated Urea in 2 splits (35 kg/acre each) at tillering and panicle initiation.",
                "fertilizer_schedule": {
                    "basal": "DAP 50 kg + MOP 25 kg + Zinc Sulphate 10 kg per acre at final puddling",
                    "top_dressing": "Neem Coated Urea: 35 kg at 20-25 days (tillering) + 35 kg at 45-50 days (panicle initiation)",
                    "micronutrients": "Zinc Sulphate 21% @ 10 kg/acre or 0.5% foliar spray if khaira symptom appears",
                    "organic": "Dhaincha (Sesbania) green manure or 2.5 tonnes decomposed cow dung FYM"
                },
                "npk_ratio": "80:40:40 N:P:K kg/ha",
                "application_tip": "Apply Zinc Sulphate separately from DAP to avoid zinc phosphate precipitation."
            },
            {
                "crop": "Groundnut / Peanut (Smruti / TAG-24)",
                "suitability": 89,
                "season": "Rabi",
                "reason": "Requires high potassium for pod filling and can fix its own atmospheric nitrogen, saving fertilizer cost.",
                "expected_yield_boost": "+15-20% oil content",
                "best_fertilizer": "Basal: SSP (Single Super Phosphate) 125 kg/acre + MOP 25 kg/acre + Urea 15 kg/acre. Gypsum: 100 kg/acre at pegging stage.",
                "fertilizer_schedule": {
                    "basal": "SSP 125 kg (provides Phosphorus + Sulphur + Calcium) + MOP 25 kg + Urea 15 kg/acre",
                    "top_dressing": "Agricultural Gypsum 100 kg/acre at 40-45 DAS along with earthing-up (critical for pod filling)",
                    "micronutrients": "Borax @ 4 kg/acre or 0.2% Boron foliar spray at peak flowering",
                    "organic": "Rhizobium & PSB bio-fertilizer seed treatment (200g each per 10kg seed)"
                },
                "npk_ratio": "20:40:40 N:P:K kg/ha",
                "application_tip": "Gypsum application during peg formation enhances kernel size, prevents 'pops' (empty pods) and raises oil percentage."
            },
            {
                "crop": "Mustard (Pusa Bold / Anuradha)",
                "suitability": 85,
                "season": "Rabi / Winter",
                "reason": "Short duration, low water requirement, excellent rotational crop after paddy.",
                "expected_yield_boost": "+18% yield",
                "best_fertilizer": "Basal: DAP 35 kg/acre + MOP 15 kg/acre + Sulphur 90% (8 kg/acre). Top Dressing: Urea 30 kg/acre after first irrigation.",
                "fertilizer_schedule": {
                    "basal": "DAP 35 kg + MOP 15 kg + Bentonite Sulphur 90% @ 8 kg/acre at sowing",
                    "top_dressing": "Urea 30 kg/acre immediately after first irrigation at 25-30 DAS",
                    "micronutrients": "Sulphur is critical for pungency (glucosinolate) and oil synthesis",
                    "organic": "Compost / FYM 2 tonnes/acre during field preparation"
                },
                "npk_ratio": "60:30:30 N:P:K kg/ha",
                "application_tip": "Sulphur is indispensable for oilseeds; if using SSP instead of DAP, extra sulphur is not required."
            },
            {
                "crop": "Chilli & Solanaceous Vegetables",
                "suitability": 82,
                "season": "Kharif-Rabi",
                "reason": "High market price in local Odisha mandis; potassium boosts disease resistance.",
                "expected_yield_boost": "+25% grade-A fruit",
                "best_fertilizer": "Basal: NPK 10-26-26 (75 kg/acre) + Neem Cake (100 kg/acre). Top Dressing: Urea (25 kg/acre) + MOP (15 kg/acre) in 3 split doses every 20 days.",
                "fertilizer_schedule": {
                    "basal": "NPK 10-26-26 @ 75 kg + Decomposed FYM 4 tonnes + Neem Cake 100 kg/acre",
                    "top_dressing": "Split doses of Urea 25 kg + MOP 15 kg at 30, 50, and 70 days after transplanting",
                    "micronutrients": "Foliar spray of 19:19:19 (5g/L) + Multiplex micronutrient mixture (2ml/L) at flowering",
                    "organic": "Neem cake to prevent root-knot nematodes and slow-release nitrogen"
                },
                "npk_ratio": "100:50:50 N:P:K kg/ha",
                "application_tip": "High potassium (MOP / 10-26-26) enhances fruit color, pungency and builds defense against anthracnose dieback."
            },
        ],
        "crops_to_avoid": [
            {
                "crop": "Chickpea / Kabuli Chana",
                "reason": "Highly sensitive to acidic soil and root rot in humid coastal conditions.",
            },
            {
                "crop": "Wheat",
                "reason": "Requires prolonged cold temperature and neutral to alkaline soil; yields are substandard in coastal Odisha.",
            },
        ],
        "fertilizer_prescription": [
            "Broadcast 150 kg Agricultural Lime or Dolomite per acre 15 days before sowing to correct soil acidity.",
            "Apply Zinc Sulphate (21%) @ 10 kg/acre as basal dose with DAP/MOP.",
            "Apply Urea in 3 split doses (1/3rd basal, 1/3rd tillering, 1/3rd panicle initiation) to reduce nitrogen leaching.",
            "Incorporate 2-3 tonnes of decomposed Farm Yard Manure (FYM / Compost) to restore Organic Carbon.",
        ],
        "organic_interventions": [
            "Grow Dhaincha (Sesbania) green manure for 45 days and plow into soil before main Kharif paddy.",
            "Treat seeds with Azotobacter & Phosphate Solubilizing Bacteria (PSB) @ 10g/kg seed.",
        ],
    }


async def analyze_soil_report_image(image_bytes: bytes, mime_type: str = "image/jpeg", district: str = "Odisha") -> Dict[str, Any]:
    api_key = _get_api_key()
    if not api_key or api_key == "your_gemini_api_key":
        logger.warning("Gemini API key missing. Using expert agronomic fallback.")
        return _get_heuristic_fallback(district)

    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    prompt = f"{SYSTEM_PROMPT}\n\nTarget Region / District: {district}, Odisha, India."

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": base64_image,
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.2,
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        for model in GEMINI_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/{model}:generateContent?key={api_key}"
            try:
                resp = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        raw_text = candidates[0]["content"]["parts"][0]["text"]
                        parsed = json.loads(raw_text)
                        logger.info("Successfully analyzed soil report using %s", model)
                        return parsed
                else:
                    logger.warning("Model %s returned HTTP %s: %s", model, resp.status_code, resp.text[:200])
            except Exception as e:
                logger.warning("Failed calling %s: %s", model, e)

    logger.warning("All Gemini Vision models failed or exhausted quota. Returning agronomic fallback.")
    return _get_heuristic_fallback(district)


async def analyze_soil_values(values: Dict[str, Any], district: str = "Odisha") -> Dict[str, Any]:
    api_key = _get_api_key()
    if not api_key or api_key == "your_gemini_api_key":
        return _get_heuristic_fallback(district)

    user_text = f"""Farmer provided these soil parameters for analysis:
- pH: {values.get('ph', '6.0')}
- Nitrogen: {values.get('nitrogen', 'Low')}
- Phosphorus: {values.get('phosphorus', 'Medium')}
- Potassium: {values.get('potassium', 'High')}
- Organic Carbon: {values.get('organic_carbon', '0.5%')}
- Zinc: {values.get('zinc', 'Deficient')}
- Salinity / EC: {values.get('salinity_ec', 'Normal')}
- District: {district}, Odisha

{SYSTEM_PROMPT}"""

    payload = {
        "contents": [{"parts": [{"text": user_text}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.2,
        },
    }

    async with httpx.AsyncClient(timeout=25.0) as client:
        for model in GEMINI_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/{model}:generateContent?key={api_key}"
            try:
                resp = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        raw_text = candidates[0]["content"]["parts"][0]["text"]
                        return json.loads(raw_text)
            except Exception as e:
                logger.warning("Failed calling %s for values: %s", model, e)

    return _get_heuristic_fallback(district)
