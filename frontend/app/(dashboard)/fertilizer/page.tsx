"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Calculator,
  Table as TableIcon,
  ShieldCheck,
  MapPin,
  BookOpen,
  Sprout,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Percent,
  Layers,
  FlaskConical,
  Scale,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/lib/language-context";

// Agrifarming Research Data on Fertilizers Cost per Acre in India
interface CropFertilizerSpec {
  id: string;
  name: string;
  hindiName: string;
  season: "Kharif" | "Rabi" | "Zaid" | "Year-Round";
  ureaKg: number;
  dapKg: number;
  mopKg: number;
  zincKg: number;
  subsidizedCostPerAcre: number;
  unsubsidizedMarketCost: number;
  description: string;
  applicationSchedule: {
    basal: string;
    topDressing1: string;
    topDressing2?: string;
    micronutrient?: string;
  };
  keyAdvice: string;
}

const CROP_FERTILIZER_DATA: CropFertilizerSpec[] = [
  {
    id: "rice",
    name: "Rice (Paddy)",
    hindiName: "धान",
    season: "Kharif",
    ureaKg: 200,
    dapKg: 100,
    mopKg: 50,
    zincKg: 0,
    subsidizedCostPerAcre: 4347,
    unsubsidizedMarketCost: 12850,
    description: "High fertilizer consumer. Requires substantial Nitrogen for tillering and Phosphorus for early root vigor.",
    applicationSchedule: {
      basal: "100% DAP (100 kg) + 100% MOP (50 kg) + 33% Urea (66 kg) at final puddling",
      topDressing1: "33% Urea (66 kg) at active tillering (21-25 days after transplanting)",
      topDressing2: "33% Urea (68 kg) at panicle initiation stage (45-50 DAT)",
      micronutrient: "Zinc Sulphate 21% @ 10 kg/acre (applied separately from DAP) to prevent Khaira disease",
    },
    keyAdvice: "Split Urea into 3 doses to minimize nitrogen volatilization and water leaching in standing water.",
  },
  {
    id: "wheat",
    name: "Wheat",
    hindiName: "गेहूं",
    season: "Rabi",
    ureaKg: 150,
    dapKg: 75,
    mopKg: 25,
    zincKg: 0,
    subsidizedCostPerAcre: 3042,
    unsubsidizedMarketCost: 9100,
    description: "Major cereal of the Rabi season with moderate to high NPK demand. Responds dramatically to timely Crown Root Irrigation top dressing.",
    applicationSchedule: {
      basal: "Full DAP (75 kg) + Full MOP (25 kg) + 1/3rd Urea (50 kg) drilled below seed at sowing",
      topDressing1: "1/3rd Urea (50 kg) with first irrigation (Crown Root Initiation / 20-25 DAS)",
      topDressing2: "1/3rd Urea (50 kg) with second irrigation (Late tillering / 40-45 DAS)",
    },
    keyAdvice: "Never broadcast DAP; drill it 2 inches below the seed for optimal root development in cool soils.",
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    hindiName: "गन्ना",
    season: "Year-Round",
    ureaKg: 300,
    dapKg: 150,
    mopKg: 75,
    zincKg: 0,
    subsidizedCostPerAcre: 6521,
    unsubsidizedMarketCost: 19600,
    description: "The most nutrient-exhaustive commercial crop in India (10-12 months duration). High biomass production requires large N & K doses.",
    applicationSchedule: {
      basal: "Full DAP (150 kg) + 50% MOP (37.5 kg) + 25% Urea (75 kg) in furrows during setts planting",
      topDressing1: "25% Urea (75 kg) at tillering stage (45-60 days after planting)",
      topDressing2: "50% Urea (150 kg) + Remaining 50% MOP (37.5 kg) during final earthing up (90-120 DAP)",
    },
    keyAdvice: "Finish all nitrogen application by 120-150 days; late nitrogen increases vegetative foliage but lowers cane sucrose recovery.",
  },
  {
    id: "cotton",
    name: "Cotton",
    hindiName: "कपास",
    season: "Kharif",
    ureaKg: 100,
    dapKg: 50,
    mopKg: 25,
    zincKg: 0,
    subsidizedCostPerAcre: 2174,
    unsubsidizedMarketCost: 6500,
    description: "Deep taproot cash crop requiring balanced NPK. Excessive nitrogen leads to vegetative vegetative growth at the expense of boll formation.",
    applicationSchedule: {
      basal: "Full DAP (50 kg) + Full MOP (25 kg) + 25% Urea (25 kg) placed along ridges",
      topDressing1: "50% Urea (50 kg) at square formation (45-50 DAS)",
      topDressing2: "25% Urea (25 kg) at peak boll development (70-80 DAS)",
      micronutrient: "Foliar spray of 1% Magnesium Sulphate + 0.1% Boron at flowering to stop boll shedding",
    },
    keyAdvice: "Boron and Magnesium sprays prevent square dry-out and reddening of leaves in Bt-cotton.",
  },
  {
    id: "maize",
    name: "Maize (Corn)",
    hindiName: "मक्का",
    season: "Kharif",
    ureaKg: 100,
    dapKg: 50,
    mopKg: 25,
    zincKg: 0,
    subsidizedCostPerAcre: 2174,
    unsubsidizedMarketCost: 6500,
    description: "C4 high-yielding grain crop with fast nitrogen uptake. Nitrogen demand surges dramatically between knee-high and tasseling stages.",
    applicationSchedule: {
      basal: "Full DAP (50 kg) + Full MOP (25 kg) + 1/3rd Urea (33 kg) at sowing",
      topDressing1: "1/3rd Urea (33 kg) side-dressed at knee-high stage (30-35 DAS)",
      topDressing2: "1/3rd Urea (34 kg) side-dressed at tasseling stage (50-55 DAS)",
    },
    keyAdvice: "Side-dress nitrogen 5-7 cm away from plant stems right before irrigation or rain.",
  },
  {
    id: "pulses",
    name: "Pulses (Arhar, Chana, Moong)",
    hindiName: "दालें (चना, अरहर, मूंग)",
    season: "Rabi",
    ureaKg: 50,
    dapKg: 50,
    mopKg: 25,
    zincKg: 25,
    subsidizedCostPerAcre: 2906,
    unsubsidizedMarketCost: 7800,
    description: "Leguminous crops capable of biological nitrogen fixation via root Rhizobium nodules. Need starter Nitrogen only, but require high Phosphorus & Zinc.",
    applicationSchedule: {
      basal: "Full DAP (50 kg) + Full MOP (25 kg) + Full Urea (50 kg) + Zinc Sulphate (25 kg) at sowing",
      topDressing1: "No soil nitrogen top dressing required (plants fix their own N)",
      micronutrient: "Foliar spray of 2% DAP or 1% Urea at flowering stage boosts pod set",
    },
    keyAdvice: "Treat seeds with Rhizobium + PSB culture (10g/kg). Phosphorus drives prolific root nodule formation.",
  },
  {
    id: "oilseeds",
    name: "Oilseeds (Mustard, Groundnut, Soybean)",
    hindiName: "तिलहन (सरसों, मूंगफली, सोयाबीन)",
    season: "Rabi",
    ureaKg: 75,
    dapKg: 75,
    mopKg: 50,
    zincKg: 25,
    subsidizedCostPerAcre: 4077,
    unsubsidizedMarketCost: 11500,
    description: "High potassium and sulphur demand. Sulphur is indispensable for oil and protein synthesis; zinc prevents chlorosis.",
    applicationSchedule: {
      basal: "Full DAP (75 kg) + Full MOP (50 kg) + Zinc Sulphate (25 kg) + 1/2 Urea (37.5 kg) at sowing",
      topDressing1: "Remaining 1/2 Urea (37.5 kg) after first irrigation (25-30 DAS)",
      micronutrient: "For Groundnut: Apply 100 kg Gypsum/acre at pegging stage for kernel filling",
    },
    keyAdvice: "If using Single Super Phosphate (SSP) instead of DAP, you get 11% Sulphur and 19% Calcium for free!",
  },
  {
    id: "vegetables",
    name: "Fruits & Vegetables",
    hindiName: "फल एवं सब्जियां",
    season: "Year-Round",
    ureaKg: 100,
    dapKg: 100,
    mopKg: 50,
    zincKg: 0,
    subsidizedCostPerAcre: 3811,
    unsubsidizedMarketCost: 11400,
    description: "High-value horticultural crops with steady nutrient withdrawal. High potassium gives superior fruit shine, firmness, and shelf life.",
    applicationSchedule: {
      basal: "Full DAP (100 kg) + 50% MOP (25 kg) + 1/3rd Urea (33 kg) with well-rotted FYM (4 tonnes)",
      topDressing1: "1/3rd Urea (33 kg) at 30 days after transplanting (flowering initiation)",
      topDressing2: "1/3rd Urea (34 kg) + Remaining 50% MOP (25 kg) during fruit swelling",
      micronutrient: "Foliar spray of 19:19:19 + Multi-micronutrient cocktail every 15 days",
    },
    keyAdvice: "Potassium nitrate (13:0:45) foliar spray 15 days before harvest dramatically improves fruit sweetness and color.",
  },
];

// Official Prices & Subsidy Constants from Agrifarming India & Ministry of Chemicals & Fertilizers
const FERTILIZER_RATES = {
  urea: { name: "Neem Coated Urea (45kg bag)", pricePerKg: 5.36, bagWeight: 45, bagPrice: 242, marketPricePerKg: 25.5 },
  dap: { name: "DAP 18-46-0 (50kg bag)", pricePerKg: 24.0, bagWeight: 50, bagPrice: 1200, marketPricePerKg: 80.0 },
  mop: { name: "MOP 0-0-60 (50kg bag)", pricePerKg: 17.5, bagWeight: 50, bagPrice: 875, marketPricePerKg: 35.0 },
  zinc: { name: "Zinc Sulphate 21% (25kg bag)", pricePerKg: 40.0, bagWeight: 25, bagPrice: 1000, marketPricePerKg: 55.0 },
};

// NBS Rabi 2024 Cabinet Approved Rates
const NBS_RATES_RABI = [
  { nutrient: "Nitrogen (N)", rate: 47.02, unit: "Rs. per kg", symbol: "N" },
  { nutrient: "Phosphorus (P)", rate: 20.82, unit: "Rs. per kg", symbol: "P" },
  { nutrient: "Potassium (K)", rate: 2.38, unit: "Rs. per kg", symbol: "K" },
  { nutrient: "Sulphur (S)", rate: 1.89, unit: "Rs. per kg", symbol: "S" },
];

// Regional Demand & Cost Variations
const REGIONAL_VARIATIONS = [
  {
    region: "Northern Region",
    states: "Punjab, Haryana, Uttar Pradesh, Uttarakhand, Himachal Pradesh, J&K",
    avgCostPerMT: "INR 12,000",
    shareOfDemand: "30%",
    keyCrops: "Wheat, Paddy, Sugarcane, Mustard",
    factors: "Lowest regional cost due to domestic production pipelines (Hazira-Vijaipur-Jagdishpur gas grid) and low rail freight.",
    statusColor: "emerald",
  },
  {
    region: "Eastern Region",
    states: "Odisha, Bihar, West Bengal, Jharkhand, Assam & NE States",
    avgCostPerMT: "INR 13,500",
    shareOfDemand: "20%",
    keyCrops: "Rice, Maize, Jute, Oilseeds, Vegetables",
    factors: "Higher cost due to lower share of local synthesis plants, longer rail lead distance from western gas hubs, and import transshipment.",
    statusColor: "amber",
  },
  {
    region: "Southern Region",
    states: "Andhra Pradesh, Telangana, Karnataka, Tamil Nadu, Kerala",
    avgCostPerMT: "INR 12,000",
    shareOfDemand: "25%",
    keyCrops: "Rice, Cotton, Sugarcane, Pulses, Spices",
    factors: "Competitive pricing due to proximity to major deepwater ports (Visakhapatnam, Chennai, Ennore, Mangalore) for imported DAP & MOP.",
    statusColor: "blue",
  },
  {
    region: "Western Region",
    states: "Maharashtra, Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh",
    avgCostPerMT: "INR 13,000",
    shareOfDemand: "25%",
    keyCrops: "Cotton, Soybean, Wheat, Groundnut, Pulses",
    factors: "High cash crop consumption; depends on imported rock phosphate and potash handled at Kandla and Mundra ports.",
    statusColor: "purple",
  },
];

function FertilizerContent() {
  const searchParams = useSearchParams();
  const cropParam = searchParams.get("crop")?.toLowerCase() || "";
  const { t } = useLanguage();

  // Find matching crop or default to Rice
  const initialCrop = useMemo(() => {
    if (!cropParam) return CROP_FERTILIZER_DATA[0];
    const found = CROP_FERTILIZER_DATA.find(
      (c) => c.id === cropParam || c.name.toLowerCase().includes(cropParam) || c.hindiName.includes(cropParam)
    );
    return found || CROP_FERTILIZER_DATA[0];
  }, [cropParam]);

  const [selectedCrop, setSelectedCrop] = useState<CropFertilizerSpec>(initialCrop);
  const [acres, setAcres] = useState<number>(2);
  const [useNanoAlternative, setUseNanoAlternative] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Live Calculations based on acreage and selected crop
  const calculations = useMemo(() => {
    const ureaKg = selectedCrop.ureaKg * acres;
    const dapKg = selectedCrop.dapKg * acres;
    const mopKg = selectedCrop.mopKg * acres;
    const zincKg = selectedCrop.zincKg * acres;

    // Bags count
    const ureaBags = Math.ceil(ureaKg / FERTILIZER_RATES.urea.bagWeight);
    const dapBags = Math.ceil(dapKg / FERTILIZER_RATES.dap.bagWeight);
    const mopBags = Math.ceil(mopKg / FERTILIZER_RATES.mop.bagWeight);
    const zincBags = zincKg > 0 ? Math.ceil(zincKg / FERTILIZER_RATES.zinc.bagWeight) : 0;

    // Subsidized cost what farmer pays
    const ureaCost = ureaKg * FERTILIZER_RATES.urea.pricePerKg;
    const dapCost = dapKg * FERTILIZER_RATES.dap.pricePerKg;
    const mopCost = mopKg * FERTILIZER_RATES.mop.pricePerKg;
    const zincCost = zincKg * FERTILIZER_RATES.zinc.pricePerKg;
    let totalFarmerCost = Math.round(ureaCost + dapCost + mopCost + zincCost);

    // Unsubsidized real market cost
    const ureaMarket = ureaKg * FERTILIZER_RATES.urea.marketPricePerKg;
    const dapMarket = dapKg * FERTILIZER_RATES.dap.marketPricePerKg;
    const mopMarket = mopKg * FERTILIZER_RATES.mop.marketPricePerKg;
    const zincMarket = zincKg * FERTILIZER_RATES.zinc.marketPricePerKg;
    const totalMarketValue = Math.round(ureaMarket + dapMarket + mopMarket + zincMarket);

    // Subsidy savings given by Govt
    const totalGovtSubsidy = totalMarketValue - totalFarmerCost;
    const subsidyPercentage = Math.round((totalGovtSubsidy / totalMarketValue) * 100);

    // Nano alternative calculation (1 bottle Nano Urea 500ml @ ₹225 replaces 1 bag of 45kg urea)
    const nanoUreaBottles = ureaBags;
    const nanoUreaCost = nanoUreaBottles * 225;
    const nanoSavings = Math.max(0, Math.round(ureaCost - nanoUreaCost));

    return {
      ureaKg,
      dapKg,
      mopKg,
      zincKg,
      ureaBags,
      dapBags,
      mopBags,
      zincBags,
      totalFarmerCost,
      totalMarketValue,
      totalGovtSubsidy,
      subsidyPercentage,
      nanoUreaBottles,
      nanoSavings,
    };
  }, [selectedCrop, acres]);

  // Filtered benchmark list
  const filteredCrops = useMemo(() => {
    if (!searchFilter.trim()) return CROP_FERTILIZER_DATA;
    const q = searchFilter.toLowerCase();
    return CROP_FERTILIZER_DATA.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.hindiName.toLowerCase().includes(q) ||
        c.season.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner with Liquid Glass Effect */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950/40 via-zinc-900/60 to-zinc-950/80 border border-emerald-500/25 backdrop-blur-2xl shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Agrifarming & ICAR Data Intelligence
              </Badge>
              <Badge variant="outline" className="text-zinc-300 border-zinc-700 text-xs font-semibold">
                NBS Rabi 2024 Approved
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
              Fertilizers Cost Per Acre & Government Subsidies
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Comprehensive agronomic cost breakdown, nutrient requirement analysis, and Direct Benefit Transfer (DBT)
              subsidy intelligence across major Indian crops.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href="/soil-health">
              <Button
                variant="outline"
                className="text-xs h-10 border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400 font-bold gap-2"
              >
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                <span>Test Soil With Gemini AI</span>
              </Button>
            </Link>
            <a
              href="https://www.agrifarming.in/fertilizers-cost-per-acre-analysis-of-government-subsidies-on-fertilizers-in-india"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="ghost"
                className="text-xs h-10 text-muted-foreground hover:text-foreground font-semibold gap-1.5"
              >
                <span>Agrifarming Study</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* 4 Quick Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[11px] text-muted-foreground block font-medium">Cabinet NBS Outlay</span>
            <span className="text-base sm:text-lg font-black text-foreground font-mono">₹22,303 Cr</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Rabi 2024 Approved</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[11px] text-muted-foreground block font-medium">Urea (45kg bag) Capped</span>
            <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">₹242 / bag</span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">₹5.36/kg fixed MRP</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[11px] text-muted-foreground block font-medium">Nitrogen Subsidy Rate</span>
            <span className="text-base sm:text-lg font-black text-amber-400 font-mono">₹47.02 / kg</span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Govt NBS payment</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[11px] text-muted-foreground block font-medium">National Consumption</span>
            <span className="text-base sm:text-lg font-black text-blue-400 font-mono">~60 MMT / yr</span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Across 2.3L DBT PoS</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Tabs */}
      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="bg-zinc-900/70 border border-white/10 p-1 rounded-2xl backdrop-blur-xl flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="calculator"
            className="text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-xl py-2 px-3.5 gap-2"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Cost Calculator</span>
          </TabsTrigger>
          <TabsTrigger
            value="benchmarks"
            className="text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-xl py-2 px-3.5 gap-2"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Crop Benchmarks (8 Crops)</span>
          </TabsTrigger>
          <TabsTrigger
            value="subsidies"
            className="text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-xl py-2 px-3.5 gap-2"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Govt Subsidies & NBS</span>
          </TabsTrigger>
          <TabsTrigger
            value="regions"
            className="text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-xl py-2 px-3.5 gap-2"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Regional Variations</span>
          </TabsTrigger>
          <TabsTrigger
            value="guide"
            className="text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-xl py-2 px-3.5 gap-2"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Fertilizer Types Guide</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INTERACTIVE CALCULATOR */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Config Card */}
            <div className="lg:col-span-5 space-y-5">
              <Card className="rounded-3xl border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-emerald-400" />
                      <span>Farm Configuration</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-[11px] text-emerald-400 border-emerald-500/40">
                      Step 1 & 2
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Select your crop and farm acreage to calculate exact fertilizer bags and government subsidy savings.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  {/* Crop Selector */}
                  <div className="space-y-1.5">
                    <Label htmlFor="crop-select" className="text-xs font-bold">
                      Select Major Crop (फसल चुनें)
                    </Label>
                    <select
                      id="crop-select"
                      value={selectedCrop.id}
                      onChange={(e) => {
                        const crop = CROP_FERTILIZER_DATA.find((c) => c.id === e.target.value);
                        if (crop) setSelectedCrop(crop);
                      }}
                      className="w-full h-11 px-3.5 rounded-xl border border-input bg-background/80 text-foreground font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {CROP_FERTILIZER_DATA.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.hindiName}) — ₹{c.subsidizedCostPerAcre.toLocaleString()}/acre
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Farm Size Slider & Input */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="farm-acres" className="text-xs font-bold">
                        Farm Size (एकड़ में जमीन)
                      </Label>
                      <span className="font-extrabold text-emerald-400 font-mono text-sm">
                        {acres} {acres === 1 ? "Acre" : "Acres"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Input
                        id="farm-acres"
                        type="number"
                        min={0.5}
                        max={100}
                        step={0.5}
                        value={acres}
                        onChange={(e) => setAcres(Math.max(0.5, parseFloat(e.target.value) || 1))}
                        className="w-24 h-10 font-bold font-mono text-center text-sm rounded-xl"
                      />
                      <div className="flex-1 flex gap-1.5 overflow-x-auto py-1">
                        {[1, 2, 5, 10, 20].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setAcres(preset)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              acres === preset
                                ? "bg-emerald-600 text-white"
                                : "bg-white/5 hover:bg-white/10 text-muted-foreground"
                            }`}
                          >
                            {preset}ac
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Crop Agronomic Snapshot */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase">Benchmark per Acre</span>
                      <span className="font-mono font-bold text-foreground">
                        ₹{selectedCrop.subsidizedCostPerAcre.toLocaleString()} / acre
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {selectedCrop.description}
                    </p>
                    <div className="text-[11px] pt-1 text-emerald-400 font-semibold flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{selectedCrop.keyAdvice}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nano Fertilizer Switch Banner */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-950/40 to-emerald-950/40 border border-blue-500/30 backdrop-blur-xl shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-xs text-foreground">IFFCO Nano Urea Alternative</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/40">
                    Saves ₹{calculations.nanoSavings}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  1 bottle (500ml @ ₹225) replaces 1 bag of 45kg Urea with &gt;80% nitrogen absorption efficiency and zero water runoff.
                </p>
              </div>
            </div>

            {/* Live Calculation Results Card */}
            <div className="lg:col-span-7 space-y-5">
              <Card className="rounded-3xl border-emerald-500/30 bg-zinc-900/70 backdrop-blur-xl shadow-2xl overflow-hidden">
                <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                        Estimated Farm Requirement
                      </span>
                      <CardTitle className="text-lg font-extrabold text-foreground">
                        {selectedCrop.name} ({acres} Acres)
                      </CardTitle>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block font-medium">You Pay (Subsidized)</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        ₹{calculations.totalFarmerCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-6">
                  {/* Bag Requirement Tally */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Required Fertilizers & Bags Tally</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Urea */}
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <span className="text-[11px] text-muted-foreground block font-semibold">Neem Urea (45kg)</span>
                        <span className="text-xl font-black text-foreground font-mono block my-1">
                          {calculations.ureaBags} Bags
                        </span>
                        <span className="text-[10px] text-emerald-400 block font-mono">
                          {calculations.ureaKg} kg (₹{Math.round(calculations.ureaKg * 5.36).toLocaleString()})
                        </span>
                      </div>

                      {/* DAP */}
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <span className="text-[11px] text-muted-foreground block font-semibold">DAP (50kg)</span>
                        <span className="text-xl font-black text-foreground font-mono block my-1">
                          {calculations.dapBags} Bags
                        </span>
                        <span className="text-[10px] text-emerald-400 block font-mono">
                          {calculations.dapKg} kg (₹{Math.round(calculations.dapKg * 24).toLocaleString()})
                        </span>
                      </div>

                      {/* MOP */}
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <span className="text-[11px] text-muted-foreground block font-semibold">MOP Potash (50kg)</span>
                        <span className="text-xl font-black text-foreground font-mono block my-1">
                          {calculations.mopBags} Bags
                        </span>
                        <span className="text-[10px] text-emerald-400 block font-mono">
                          {calculations.mopKg} kg (₹{Math.round(calculations.mopKg * 17.5).toLocaleString()})
                        </span>
                      </div>

                      {/* Zinc Sulphate (if applicable) */}
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <span className="text-[11px] text-muted-foreground block font-semibold">Zinc Sulphate</span>
                        <span className="text-xl font-black text-foreground font-mono block my-1">
                          {calculations.zincKg > 0 ? `${calculations.zincBags} Bags` : "Optional"}
                        </span>
                        <span className="text-[10px] text-amber-400 block font-mono">
                          {calculations.zincKg > 0 ? `${calculations.zincKg} kg (₹${calculations.zincKg * 40})` : "As per soil test"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Govt Subsidy Savings Breakdown */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Government Subsidy Benefit (सरकार द्वारा सब्सिडी)</span>
                      </span>
                      <Badge className="bg-emerald-500 text-black font-extrabold text-xs px-2.5">
                        {calculations.subsidyPercentage}% OFF
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Actual Unsubsidized Value:</span>
                        <span className="font-bold text-foreground font-mono text-sm line-through text-muted-foreground">
                          ₹{calculations.totalMarketValue.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Farmer Pays (DBT MRP):</span>
                        <span className="font-extrabold text-emerald-400 font-mono text-sm">
                          ₹{calculations.totalFarmerCost.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Govt Pays on Your Behalf:</span>
                        <span className="font-black text-amber-400 font-mono text-sm">
                          +₹{calculations.totalGovtSubsidy.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Application Schedule for Selected Crop */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Recommended Application Schedule ({selectedCrop.name})</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] shrink-0 mt-0.5">
                          BASAL
                        </span>
                        <span className="text-foreground/90 leading-snug">
                          {selectedCrop.applicationSchedule.basal}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px] shrink-0 mt-0.5">
                          SPLIT 1
                        </span>
                        <span className="text-foreground/90 leading-snug">
                          {selectedCrop.applicationSchedule.topDressing1}
                        </span>
                      </div>

                      {selectedCrop.applicationSchedule.topDressing2 && (
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] shrink-0 mt-0.5">
                            SPLIT 2
                          </span>
                          <span className="text-foreground/90 leading-snug">
                            {selectedCrop.applicationSchedule.topDressing2}
                          </span>
                        </div>
                      )}

                      {selectedCrop.applicationSchedule.micronutrient && (
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px] shrink-0 mt-0.5">
                            MICRONUTRIENT
                          </span>
                          <span className="text-foreground/90 leading-snug">
                            {selectedCrop.applicationSchedule.micronutrient}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: CROP BENCHMARK MATRIX (ALL 8 CROPS) */}
        <TabsContent value="benchmarks" className="space-y-5">
          <Card className="rounded-3xl border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-emerald-400" />
                    <span>Cost Per Acre Benchmark Matrix (Agrifarming India Study)</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Comprehensive verified data on fertilizer dose, unit price, and total expenditure across major crops in India.
                  </CardDescription>
                </div>

                <div className="w-full sm:w-64">
                  <Input
                    placeholder="Search crop or season..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-muted-foreground font-bold">
                      <th className="p-3">Crop Name</th>
                      <th className="p-3">Season</th>
                      <th className="p-3">Urea (kg/ac)</th>
                      <th className="p-3">DAP (kg/ac)</th>
                      <th className="p-3">MOP (kg/ac)</th>
                      <th className="p-3">Zinc (kg/ac)</th>
                      <th className="p-3">Subsidized Cost</th>
                      <th className="p-3">Market Value</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCrops.map((crop) => (
                      <tr
                        key={crop.id}
                        className={`hover:bg-white/5 transition-colors ${
                          selectedCrop.id === crop.id ? "bg-emerald-500/10 font-medium" : ""
                        }`}
                      >
                        <td className="p-3">
                          <span className="font-bold text-foreground block">{crop.name}</span>
                          <span className="text-[10px] text-muted-foreground">{crop.hindiName}</span>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px] px-2 py-0 border-zinc-700">
                            {crop.season}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono">{crop.ureaKg} kg</td>
                        <td className="p-3 font-mono">{crop.dapKg} kg</td>
                        <td className="p-3 font-mono">{crop.mopKg} kg</td>
                        <td className="p-3 font-mono">{crop.zincKg > 0 ? `${crop.zincKg} kg` : "—"}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          ₹{crop.subsidizedCostPerAcre.toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-muted-foreground line-through">
                          ₹{crop.unsubsidizedMarketCost.toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedCrop(crop);
                              const tabsEl = document.querySelector('[data-state="active"][value="benchmarks"]');
                              // Switch to calculator
                              const calcTab = document.querySelector('[value="calculator"]') as HTMLButtonElement;
                              if (calcTab) calcTab.click();
                            }}
                            className="h-8 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          >
                            Calculate &rarr;
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary cost hierarchy card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <span className="font-bold text-amber-400 block mb-0.5">Highest Fertilizer Cost: Sugarcane</span>
                  <span className="text-[11px] text-muted-foreground">
                    Sugarcane tops the chart at ₹6,521/acre due to its 12-month heavy feeding cycle (300kg Urea + 150kg DAP + 75kg MOP).
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="font-bold text-emerald-400 block mb-0.5">Most Economical: Cotton & Maize</span>
                  <span className="text-[11px] text-muted-foreground">
                    Cotton and Maize average ₹2,174/acre, offering maximum agronomic efficiency when drilled along ridges.
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <span className="font-bold text-blue-400 block mb-0.5">High Zinc / Sulphur Response: Pulses & Oilseeds</span>
                  <span className="text-[11px] text-muted-foreground">
                    Pulses fix biological Nitrogen, shifting investment to Phosphorus (DAP) and Zinc Sulphate for pod nodulation.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: GOVERNMENT SUBSIDIES & NBS */}
        <TabsContent value="subsidies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NBS Rabi 2024 Rates Card */}
            <Card className="rounded-3xl border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cabinet Approved NBS Rates (Rabi 2024)</span>
                  </CardTitle>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                    Official DoF
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Under the Nutrient-Based Subsidy (NBS) scheme, the Central Government reimburses fertilizer firms based on actual nutrient weight.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                <div className="divide-y divide-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  {NBS_RATES_RABI.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                          {item.symbol}
                        </span>
                        <div>
                          <span className="font-bold text-foreground block">{item.nutrient}</span>
                          <span className="text-[10px] text-muted-foreground">{item.unit}</span>
                        </div>
                      </div>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        ₹{item.rate.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-bold text-foreground block text-[11px]">
                    Total Cabinet Sanctioned Package: ₹22,303 Crore
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Includes freight subsidy support for indigenous Single Superphosphate (SSP) and special packages for P&K grades like 10-26-26 and 12-32-16.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* DBT 2.0 & PoS Machine Explanation */}
            <Card className="rounded-3xl border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-400" />
                  <span>How Direct Benefit Transfer (DBT 2.0) Works</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  India’s digital subsidy mechanism across 2.3+ lakh fertilizer retailers.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-foreground block">Farmer Walks Into Kendra</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Farmer provides Aadhaar number and undergoes biometric fingerprint or Iris authentication on the Point of Sale (PoS) device.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-foreground block">Purchase at Subsidized MRP</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Farmer only pays the controlled price (₹242/Urea bag, ₹1,200/DAP bag) directly to the merchant.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-foreground block">Automatic Subsidy Transfer</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      The Government DBT system releases 100% of the subsidy difference directly to fertilizer manufacturers (IFFCO, KRIBHCO, Coromandel) based on verified machine logs.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-emerald-300 font-semibold">
                    Zero paperwork required from farmers; genuine subsidized rates are auto-billed at every certified PACS/Kendra.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: REGIONAL VARIATIONS */}
        <TabsContent value="regions" className="space-y-5">
          <Card className="rounded-3xl border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Regional Cost Disparities Across India</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Why fertilizer cost per metric ton differs between North, East (Odisha/Bihar), West, and South.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REGIONAL_VARIATIONS.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-foreground">{r.region}</span>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                        {r.avgCostPerMT} / MT
                      </Badge>
                    </div>

                    <div className="text-xs space-y-1">
                      <div>
                        <span className="text-muted-foreground font-semibold">States:</span>{" "}
                        <span className="text-foreground/90">{r.states}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold">Consumption Share:</span>{" "}
                        <span className="text-foreground font-mono font-bold">{r.shareOfDemand} of National Demand</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold">Key Crops:</span>{" "}
                        <span className="text-emerald-400">{r.keyCrops}</span>
                      </div>
                    </div>

                    <p className="text-[11.5px] text-muted-foreground leading-relaxed pt-2 border-t border-white/5">
                      {r.factors}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: FERTILIZER TYPES ENCYCLOPEDIA */}
        <TabsContent value="guide" className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Nitrogenous */}
            <Card className="rounded-3xl border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-2">
                <Badge className="w-fit bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] mb-1 font-mono">
                  46% N
                </Badge>
                <CardTitle className="text-base font-bold text-foreground">Nitrogenous Fertilizers</CardTitle>
                <CardDescription className="text-xs">Urea, Ammonium, Nitrate</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>
                  Nitrogen drives vegetative leaf development, tillering, and chlorophyll synthesis. Urea is highly soluble but volatile.
                </p>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-[11px]">
                  <strong>Neem Coating:</strong> Mandatory in India to slow nitrogen release and prevent industrial diversion.
                </div>
              </CardContent>
            </Card>

            {/* Phosphatic */}
            <Card className="rounded-3xl border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-2">
                <Badge className="w-fit bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] mb-1 font-mono">
                  18% N, 46% P₂O₅
                </Badge>
                <CardTitle className="text-base font-bold text-foreground">Phosphatic Fertilizers</CardTitle>
                <CardDescription className="text-xs">DAP, SSP (Single Superphosphate)</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>
                  Phosphorus stimulates rapid root branching, early seedling establishment, and strong stalk architecture.
                </p>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-[11px]">
                  <strong>Agronomist Rule:</strong> Never broadcast DAP on the surface; place it 2 inches below seed depth.
                </div>
              </CardContent>
            </Card>

            {/* Potassic */}
            <Card className="rounded-3xl border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-2">
                <Badge className="w-fit bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] mb-1 font-mono">
                  60% K₂O
                </Badge>
                <CardTitle className="text-base font-bold text-foreground">Potassic Fertilizers</CardTitle>
                <CardDescription className="text-xs">Muriate of Potash (MOP), SOP</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>
                  Potassium regulates stomatal water balance, starch translocation, grain plumping, and disease defense.
                </p>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-[11px]">
                  <strong>Quality Booster:</strong> Enhances grain test weight, tuber size in potato, and cane juice purity.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 3. Bottom CTA Link to Soil Health */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-zinc-900/70 to-emerald-950/50 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl">
        <div className="space-y-1">
          <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            <span>Never Over-Fertilize: Test Your Soil First</span>
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            Using fertilizers without a soil test wastes up to ₹1,500/acre in unused chemicals. Upload your Soil Health Card to get Gemini AI crop and nutrient advisory.
          </p>
        </div>

        <Link href="/soil-health" className="shrink-0">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 gap-2 shadow-lg">
            <span>Soil AI Scanner</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function FertilizerPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Loading Fertilizer Intelligence & Subsidies Calculator...
        </div>
      }
    >
      <FertilizerContent />
    </Suspense>
  );
}
