"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calculator,
  Table as TableIcon,
  ShieldCheck,
  MapPin,
  BookOpen,
  Sprout,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Layers,
  FlaskConical,
  Scale,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
    description: "Requires structured nitrogen application across vegetative and panicle formation stages.",
    applicationSchedule: {
      basal: "100% DAP (100 kg) + 100% MOP (50 kg) + 33% Urea (66 kg) at final puddling",
      topDressing1: "33% Urea (66 kg) at tillering (21-25 DAT)",
      topDressing2: "33% Urea (68 kg) at panicle initiation (45-50 DAT)",
      micronutrient: "Zinc Sulphate 21% @ 10 kg/acre applied separately from phosphatic inputs",
    },
    keyAdvice: "Three-stage nitrogen split minimizes volatilization loss in submerged fields.",
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
    description: "Primary Rabi cereal. Critical response window coincides with Crown Root Initiation (CRI).",
    applicationSchedule: {
      basal: "Full DAP (75 kg) + Full MOP (25 kg) + 1/3rd Urea (50 kg) placed below seed line",
      topDressing1: "1/3rd Urea (50 kg) at first irrigation (CRI stage / 20-25 DAS)",
      topDressing2: "1/3rd Urea (50 kg) at late tillering (40-45 DAS)",
    },
    keyAdvice: "Drill phosphatic fertilizer 5 cm below seed depth for root interception in cold soil.",
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
    description: "High biomass commercial crop with long vegetative duration requiring high cumulative N and K.",
    applicationSchedule: {
      basal: "Full DAP (150 kg) + 50% MOP (37.5 kg) + 25% Urea (75 kg) in planting furrows",
      topDressing1: "25% Urea (75 kg) at tillering (45-60 DAP)",
      topDressing2: "50% Urea (150 kg) + 50% MOP (37.5 kg) during earthing up (90-120 DAP)",
    },
    keyAdvice: "Complete nitrogen delivery before 120 days to preserve sucrose recovery percentage.",
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
    description: "Deep-rooted crop. Nitrogen doses timed to prevent excessive vegetative foliage over boll set.",
    applicationSchedule: {
      basal: "Full DAP (50 kg) + Full MOP (25 kg) + 25% Urea (25 kg) on planting ridges",
      topDressing1: "50% Urea (50 kg) at square initiation (45-50 DAS)",
      topDressing2: "25% Urea (25 kg) at boll development (70-80 DAS)",
      micronutrient: "1% Magnesium Sulphate + 0.1% Boron foliar spray at peak bloom",
    },
    keyAdvice: "Foliar boron prevents square abscission and improves boll retention.",
  },
  {
    id: "maize",
    name: "Maize",
    hindiName: "मक्का",
    season: "Kharif",
    ureaKg: 100,
    dapKg: 50,
    mopKg: 25,
    zincKg: 0,
    subsidizedCostPerAcre: 2174,
    unsubsidizedMarketCost: 6500,
    description: "C4 cereal with fast nitrogen assimilation. Uptake peaks during knee-high and tasseling stages.",
    applicationSchedule: {
      basal: "Full DAP (50 kg) + Full MOP (25 kg) + 1/3rd Urea (33 kg) at sowing",
      topDressing1: "1/3rd Urea (33 kg) side-dressed at knee-high stage (30-35 DAS)",
      topDressing2: "1/3rd Urea (34 kg) side-dressed at tasseling (50-55 DAS)",
    },
    keyAdvice: "Side-dress nitrogen bands 5 cm offset from plant base prior to irrigation.",
  },
  {
    id: "pulses",
    name: "Pulses (Arhar, Chana, Moong)",
    hindiName: "दालें",
    season: "Rabi",
    ureaKg: 50,
    dapKg: 50,
    mopKg: 25,
    zincKg: 25,
    subsidizedCostPerAcre: 2906,
    unsubsidizedMarketCost: 7800,
    description: "Fixes atmospheric nitrogen biologically. Requires starter nitrogen with phosphorus and zinc for nodulation.",
    applicationSchedule: {
      basal: "Full DAP (50 kg) + Full MOP (25 kg) + Full Urea (50 kg) + Zinc Sulphate (25 kg) at sowing",
      topDressing1: "Soil nitrogen top-dressing not required",
      micronutrient: "2% DAP foliar spray at 50% flowering to enhance pod set",
    },
    keyAdvice: "Rhizobium seed inoculation lowers synthetic nitrogen demand while improving root nodule count.",
  },
  {
    id: "oilseeds",
    name: "Oilseeds (Mustard, Groundnut, Soybean)",
    hindiName: "तिलहन",
    season: "Rabi",
    ureaKg: 75,
    dapKg: 75,
    mopKg: 50,
    zincKg: 25,
    subsidizedCostPerAcre: 4077,
    unsubsidizedMarketCost: 11500,
    description: "High potassium and sulphur dependency. Sulphur is essential for oil synthesis and glucosinolates.",
    applicationSchedule: {
      basal: "Full DAP (75 kg) + Full MOP (50 kg) + Zinc Sulphate (25 kg) + 1/2 Urea (37.5 kg) at sowing",
      topDressing1: "Remaining 1/2 Urea (37.5 kg) post first irrigation (25-30 DAS)",
      micronutrient: "Groundnut: 100 kg Gypsum/acre at pegging for pod filling",
    },
    keyAdvice: "Single Super Phosphate (SSP) provides available Sulphur (11%) and Calcium (19%) as a DAP alternative.",
  },
  {
    id: "vegetables",
    name: "Fruits & Vegetables",
    hindiName: "फल व सब्जियां",
    season: "Year-Round",
    ureaKg: 100,
    dapKg: 100,
    mopKg: 50,
    zincKg: 0,
    subsidizedCostPerAcre: 3811,
    unsubsidizedMarketCost: 11400,
    description: "High continuous nutrient extraction. Potassium balances fruit firmness, color, and post-harvest shelf life.",
    applicationSchedule: {
      basal: "Full DAP (100 kg) + 50% MOP (25 kg) + 1/3rd Urea (33 kg) with FYM base",
      topDressing1: "1/3rd Urea (33 kg) at 30 days post transplant",
      topDressing2: "1/3rd Urea (34 kg) + Remaining 50% MOP (25 kg) during fruit development",
      micronutrient: "19:19:19 balanced foliar spray during flowering intervals",
    },
    keyAdvice: "Potassium nitrate application prior to harvest improves fruit weight and Brix rating.",
  },
];

const FERTILIZER_RATES = {
  urea: { name: "Neem Coated Urea (45kg)", pricePerKg: 5.36, bagWeight: 45, bagPrice: 242, marketPricePerKg: 25.5 },
  dap: { name: "DAP 18-46-0 (50kg)", pricePerKg: 24.0, bagWeight: 50, bagPrice: 1200, marketPricePerKg: 80.0 },
  mop: { name: "MOP 0-0-60 (50kg)", pricePerKg: 17.5, bagWeight: 50, bagPrice: 875, marketPricePerKg: 35.0 },
  zinc: { name: "Zinc Sulphate 21% (25kg)", pricePerKg: 40.0, bagWeight: 25, bagPrice: 1000, marketPricePerKg: 55.0 },
};

const NBS_RATES_RABI = [
  { nutrient: "Nitrogen (N)", rate: 47.02, unit: "INR / kg", symbol: "N" },
  { nutrient: "Phosphorus (P)", rate: 20.82, unit: "INR / kg", symbol: "P" },
  { nutrient: "Potassium (K)", rate: 2.38, unit: "INR / kg", symbol: "K" },
  { nutrient: "Sulphur (S)", rate: 1.89, unit: "INR / kg", symbol: "S" },
];

const REGIONAL_VARIATIONS = [
  {
    region: "Northern Region",
    states: "Punjab, Haryana, Uttar Pradesh, Uttarakhand, Himachal Pradesh, J&K",
    avgCostPerMT: "INR 12,000",
    shareOfDemand: "30%",
    keyCrops: "Wheat, Paddy, Sugarcane, Mustard",
    factors: "Direct gas pipeline connectivity (HVJ pipeline) and local synthesis plants maintain lower logistics overhead.",
  },
  {
    region: "Eastern Region",
    states: "Odisha, Bihar, West Bengal, Jharkhand, Assam & NE States",
    avgCostPerMT: "INR 13,500",
    shareOfDemand: "20%",
    keyCrops: "Rice, Maize, Jute, Oilseeds, Vegetables",
    factors: "Higher rail freight distances from western natural gas grids and reliance on coastal port transshipment.",
  },
  {
    region: "Southern Region",
    states: "Andhra Pradesh, Telangana, Karnataka, Tamil Nadu, Kerala",
    avgCostPerMT: "INR 12,000",
    shareOfDemand: "25%",
    keyCrops: "Rice, Cotton, Sugarcane, Pulses, Spices",
    factors: "Competitive pricing enabled by proximity to deepwater discharge ports (Visakhapatnam, Chennai, Mangalore).",
  },
  {
    region: "Western Region",
    states: "Maharashtra, Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh",
    avgCostPerMT: "INR 13,000",
    shareOfDemand: "25%",
    keyCrops: "Cotton, Soybean, Wheat, Groundnut, Pulses",
    factors: "Intensive cash crop consumption; dependent on imported raw rock phosphate and potash handled via Kandla.",
  },
];

function FertilizerContent() {
  const searchParams = useSearchParams();
  const cropParam = searchParams.get("crop")?.toLowerCase() || "";

  const initialCrop = useMemo(() => {
    if (!cropParam) return CROP_FERTILIZER_DATA[0];
    const found = CROP_FERTILIZER_DATA.find(
      (c) => c.id === cropParam || c.name.toLowerCase().includes(cropParam) || c.hindiName.includes(cropParam)
    );
    return found || CROP_FERTILIZER_DATA[0];
  }, [cropParam]);

  const [selectedCrop, setSelectedCrop] = useState<CropFertilizerSpec>(initialCrop);
  const [detailCropModal, setDetailCropModal] = useState<CropFertilizerSpec | null>(null);
  const [acres, setAcres] = useState<number>(2);
  const [searchFilter, setSearchFilter] = useState<string>("");

  const calculations = useMemo(() => {
    const ureaKg = selectedCrop.ureaKg * acres;
    const dapKg = selectedCrop.dapKg * acres;
    const mopKg = selectedCrop.mopKg * acres;
    const zincKg = selectedCrop.zincKg * acres;

    const ureaBags = Math.ceil(ureaKg / FERTILIZER_RATES.urea.bagWeight);
    const dapBags = Math.ceil(dapKg / FERTILIZER_RATES.dap.bagWeight);
    const mopBags = Math.ceil(mopKg / FERTILIZER_RATES.mop.bagWeight);
    const zincBags = zincKg > 0 ? Math.ceil(zincKg / FERTILIZER_RATES.zinc.bagWeight) : 0;

    const ureaCost = ureaKg * FERTILIZER_RATES.urea.pricePerKg;
    const dapCost = dapKg * FERTILIZER_RATES.dap.pricePerKg;
    const mopCost = mopKg * FERTILIZER_RATES.mop.pricePerKg;
    const zincCost = zincKg * FERTILIZER_RATES.zinc.pricePerKg;
    const totalFarmerCost = Math.round(ureaCost + dapCost + mopCost + zincCost);

    const ureaMarket = ureaKg * FERTILIZER_RATES.urea.marketPricePerKg;
    const dapMarket = dapKg * FERTILIZER_RATES.dap.marketPricePerKg;
    const mopMarket = mopKg * FERTILIZER_RATES.mop.marketPricePerKg;
    const zincMarket = zincKg * FERTILIZER_RATES.zinc.marketPricePerKg;
    const totalMarketValue = Math.round(ureaMarket + dapMarket + mopMarket + zincMarket);

    const totalGovtSubsidy = totalMarketValue - totalFarmerCost;
    const subsidyPercentage = Math.round((totalGovtSubsidy / totalMarketValue) * 100);

    const nanoUreaCost = ureaBags * 225;
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
      nanoSavings,
    };
  }, [selectedCrop, acres]);

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
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-[#0c0d0e] border border-white/10 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-[11px] font-semibold">
                ICAR & Agrifarming Reference
              </Badge>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[11px] font-semibold">
                NBS Rabi 2024
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Fertilizers Cost Per Acre & Government Subsidies
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Agronomic cost breakdown, application schedules, and Nutrient-Based Subsidy (NBS) benchmarks across major Indian crops.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/soil-health">
              <Button
                variant="outline"
                className="text-xs h-9 border-white/15 hover:bg-white/5 text-foreground font-semibold gap-1.5"
              >
                <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                <span>Soil Health Check</span>
              </Button>
            </Link>
            <a
              href="https://www.agrifarming.in/fertilizers-cost-per-acre-analysis-of-government-subsidies-on-fertilizers-in-india"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="ghost"
                className="text-xs h-9 text-muted-foreground hover:text-foreground font-medium gap-1.5"
              >
                <span>Reference Study</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-muted-foreground block font-medium">Cabinet NBS Outlay</span>
            <span className="text-base font-bold text-foreground font-mono">₹22,303 Cr</span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Rabi 2024 Approved</span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-muted-foreground block font-medium">Urea (45kg bag)</span>
            <span className="text-base font-bold text-emerald-400 font-mono">₹242</span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Statutory Capped MRP</span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-muted-foreground block font-medium">Nitrogen Subsidy</span>
            <span className="text-base font-bold text-foreground font-mono">₹47.02 / kg</span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">NBS Payable Rate</span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-muted-foreground block font-medium">National Demand</span>
            <span className="text-base font-bold text-foreground font-mono">~60 MMT / yr</span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Biometric DBT Network</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Tabs */}
      <Tabs defaultValue="calculator" className="space-y-5">
        <TabsList className="bg-zinc-900/60 border border-white/10 p-1 rounded-xl backdrop-blur-md flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="calculator"
            className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg py-1.5 px-3 gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Cost Calculator</span>
          </TabsTrigger>
          <TabsTrigger
            value="benchmarks"
            className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg py-1.5 px-3 gap-1.5"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Crop Benchmarks</span>
          </TabsTrigger>
          <TabsTrigger
            value="subsidies"
            className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg py-1.5 px-3 gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NBS Subsidies</span>
          </TabsTrigger>
          <TabsTrigger
            value="regions"
            className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg py-1.5 px-3 gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Regional Disparities</span>
          </TabsTrigger>
          <TabsTrigger
            value="guide"
            className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg py-1.5 px-3 gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Fertilizer Types</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CALCULATOR */}
        <TabsContent value="calculator" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Input Config Card */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="rounded-2xl border-white/10 bg-[#0c0d0e] shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-400" />
                    <span>Configuration</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select crop and acreage to calculate requirement and subsidy deductions.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  {/* Crop Selector */}
                  <div className="space-y-1.5">
                    <Label htmlFor="crop-select" className="text-xs font-semibold text-muted-foreground">
                      Crop Selection
                    </Label>
                    <select
                      id="crop-select"
                      value={selectedCrop.id}
                      onChange={(e) => {
                        const crop = CROP_FERTILIZER_DATA.find((c) => c.id === e.target.value);
                        if (crop) setSelectedCrop(crop);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-zinc-950 text-foreground font-medium text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    >
                      {CROP_FERTILIZER_DATA.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — ₹{c.subsidizedCostPerAcre.toLocaleString()} / acre
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Farm Size */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="farm-acres" className="text-xs font-semibold text-muted-foreground">
                        Acreage
                      </Label>
                      <span className="font-bold text-foreground font-mono">
                        {acres} {acres === 1 ? "Acre" : "Acres"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Input
                        id="farm-acres"
                        type="number"
                        min={0.5}
                        max={100}
                        step={0.5}
                        value={acres}
                        onChange={(e) => setAcres(Math.max(0.5, parseFloat(e.target.value) || 1))}
                        className="w-20 h-9 font-bold font-mono text-center text-xs rounded-lg"
                      />
                      <div className="flex-1 flex gap-1 overflow-x-auto">
                        {[1, 2, 5, 10, 20].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setAcres(preset)}
                            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                              acres === preset
                                ? "bg-zinc-700 text-white font-bold"
                                : "bg-white/5 hover:bg-white/10 text-muted-foreground"
                            }`}
                          >
                            {preset} ac
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Snapshot Details */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground uppercase font-semibold">Standard Cost</span>
                      <span className="font-mono font-bold text-foreground">
                        ₹{selectedCrop.subsidizedCostPerAcre.toLocaleString()} / acre
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      {selectedCrop.description}
                    </p>
                    <div className="text-[11px] text-zinc-300 font-medium flex items-start gap-1.5 pt-1 border-t border-white/5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{selectedCrop.keyAdvice}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nano Alternative Note */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Nano Urea Alternative</span>
                  <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-700">
                    Saves ₹{calculations.nanoSavings}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  One 500ml bottle (₹225) replaces one 45kg bag of Urea with 80%+ nitrogen efficiency.
                </p>
              </div>
            </div>

            {/* Results Card */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="rounded-2xl border-white/10 bg-[#0c0d0e] shadow-xl overflow-hidden">
                <CardHeader className="bg-white/[0.02] border-b border-white/5 py-3.5 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Estimated Farm Dose
                      </span>
                      <CardTitle className="text-base font-bold text-foreground">
                        {selectedCrop.name} ({acres} Acres)
                      </CardTitle>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block">Subsidized Total</span>
                      <span className="text-xl font-bold text-emerald-400 font-mono">
                        ₹{calculations.totalFarmerCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                  {/* Bag Requirement Tally */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Material Breakdown</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                        <span className="text-[11px] text-muted-foreground block">Urea (45kg)</span>
                        <span className="text-lg font-bold text-foreground font-mono my-0.5 block">
                          {calculations.ureaBags} Bags
                        </span>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          {calculations.ureaKg} kg (₹{Math.round(calculations.ureaKg * 5.36).toLocaleString()})
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                        <span className="text-[11px] text-muted-foreground block">DAP (50kg)</span>
                        <span className="text-lg font-bold text-foreground font-mono my-0.5 block">
                          {calculations.dapBags} Bags
                        </span>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          {calculations.dapKg} kg (₹{Math.round(calculations.dapKg * 24).toLocaleString()})
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                        <span className="text-[11px] text-muted-foreground block">MOP Potash (50kg)</span>
                        <span className="text-lg font-bold text-foreground font-mono my-0.5 block">
                          {calculations.mopBags} Bags
                        </span>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          {calculations.mopKg} kg (₹{Math.round(calculations.mopKg * 17.5).toLocaleString()})
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                        <span className="text-[11px] text-muted-foreground block">Zinc Sulphate</span>
                        <span className="text-lg font-bold text-foreground font-mono my-0.5 block">
                          {calculations.zincKg > 0 ? `${calculations.zincBags} Bags` : "0"}
                        </span>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          {calculations.zincKg > 0 ? `${calculations.zincKg} kg (₹${calculations.zincKg * 40})` : "Optional"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subsidy Deductions */}
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Subsidy Deductions (DBT)</span>
                      </span>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-mono text-xs">
                        {calculations.subsidyPercentage}% Absorbed by State
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-0.5">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Unsubsidized Value:</span>
                        <span className="font-semibold text-muted-foreground font-mono line-through">
                          ₹{calculations.totalMarketValue.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Net Payable (MRP):</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          ₹{calculations.totalFarmerCost.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Government Subsidy:</span>
                        <span className="font-bold text-foreground font-mono">
                          ₹{calculations.totalGovtSubsidy.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Application Schedule */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Application Protocol
                    </h4>

                    <div className="space-y-1.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] shrink-0 font-bold">
                          BASAL
                        </span>
                        <span className="text-muted-foreground leading-normal">
                          {selectedCrop.applicationSchedule.basal}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] shrink-0 font-bold">
                          SPLIT 1
                        </span>
                        <span className="text-muted-foreground leading-normal">
                          {selectedCrop.applicationSchedule.topDressing1}
                        </span>
                      </div>

                      {selectedCrop.applicationSchedule.topDressing2 && (
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] shrink-0 font-bold">
                            SPLIT 2
                          </span>
                          <span className="text-muted-foreground leading-normal">
                            {selectedCrop.applicationSchedule.topDressing2}
                          </span>
                        </div>
                      )}

                      {selectedCrop.applicationSchedule.micronutrient && (
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] shrink-0 font-bold">
                            MICRONUTRIENT
                          </span>
                          <span className="text-muted-foreground leading-normal">
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

        {/* TAB 2: BENCHMARK MATRIX */}
        <TabsContent value="benchmarks" className="space-y-4">
          <Card className="rounded-2xl border-white/10 bg-[#0c0d0e] shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-emerald-400" />
                    <span>Cost Per Acre Benchmark Matrix</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Baseline fertilizer doses and expenditures documented in the Agrifarming India field analysis.
                  </CardDescription>
                </div>

                <div className="w-full sm:w-60">
                  <Input
                    placeholder="Filter crops..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-muted-foreground font-semibold">
                      <th className="p-2.5">Crop</th>
                      <th className="p-2.5">Season</th>
                      <th className="p-2.5">Urea (kg)</th>
                      <th className="p-2.5">DAP (kg)</th>
                      <th className="p-2.5">MOP (kg)</th>
                      <th className="p-2.5">Zinc (kg)</th>
                      <th className="p-2.5">Subsidized Cost</th>
                      <th className="p-2.5">Market Value</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCrops.map((crop) => (
                      <tr
                        key={crop.id}
                        onClick={() => setDetailCropModal(crop)}
                        className={`cursor-pointer hover:bg-white/[0.05] transition-colors ${
                          selectedCrop.id === crop.id ? "bg-white/[0.04]" : ""
                        }`}
                        title={`Click to view full fertilizer dose & subsidy details for ${crop.name}`}
                      >
                        <td className="p-2.5">
                          <span className="font-semibold text-foreground block">{crop.name}</span>
                          <span className="text-[10px] text-muted-foreground">{crop.hindiName}</span>
                        </td>
                        <td className="p-2.5">
                          <span className="text-[10px] text-muted-foreground font-mono">{crop.season}</span>
                        </td>
                        <td className="p-2.5 font-mono">{crop.ureaKg}</td>
                        <td className="p-2.5 font-mono">{crop.dapKg}</td>
                        <td className="p-2.5 font-mono">{crop.mopKg}</td>
                        <td className="p-2.5 font-mono">{crop.zincKg > 0 ? crop.zincKg : "—"}</td>
                        <td className="p-2.5 font-mono font-semibold text-emerald-400">
                          ₹{crop.subsidizedCostPerAcre.toLocaleString()}
                        </td>
                        <td className="p-2.5 font-mono text-muted-foreground line-through">
                          ₹{crop.unsubsidizedMarketCost.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedCrop(crop);
                              const calcTab = document.querySelector('[value="calculator"]') as HTMLButtonElement;
                              if (calcTab) calcTab.click();
                            }}
                            className="h-7 text-xs text-zinc-300 hover:text-white"
                          >
                            Calculate &rarr;
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: SUBSIDIES */}
        <TabsContent value="subsidies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl border-white/10 bg-[#0c0d0e] shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>NBS Nutrient Subsidy Rates (Rabi 2024)</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Government reimbursement schedule per kg of active nutrient under NBS.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden">
                  {NBS_RATES_RABI.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono font-bold text-xs">
                          {item.symbol}
                        </span>
                        <div>
                          <span className="font-semibold text-foreground block">{item.nutrient}</span>
                          <span className="text-[10px] text-muted-foreground">{item.unit}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-foreground">
                        ₹{item.rate.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground leading-normal">
                  Total sanctioned budget: ₹22,303 Crore. Supports secondary freight equalization for indigenous SSP.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-white/10 bg-[#0c0d0e] shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Scale className="w-4 h-4 text-zinc-400" />
                  <span>DBT Settlement Mechanism</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Aadhaar-authenticated point of sale (PoS) flow.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="font-semibold text-foreground block">1. Authentication</span>
                  <p className="text-[11px] text-muted-foreground">
                    Purchases logged via biometric authentication against Aadhaar on certified retail PoS machines.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="font-semibold text-foreground block">2. Capped Billing</span>
                  <p className="text-[11px] text-muted-foreground">
                    Farmers are billed exclusively at statutory MRP (₹242/Urea bag, ₹1,200/DAP bag).
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="font-semibold text-foreground block">3. Reconciled Disbursement</span>
                  <p className="text-[11px] text-muted-foreground">
                    100% of the manufacturer subsidy gap is disbursed digitally following confirmed PoS logs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: REGIONAL VARIATIONS */}
        <TabsContent value="regions" className="space-y-4">
          <Card className="rounded-2xl border-white/10 bg-[#0c0d0e] shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Regional Cost Structure</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Factors influencing average cost per metric ton across agricultural zones.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {REGIONAL_VARIATIONS.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{r.region}</span>
                      <span className="font-mono font-semibold text-emerald-400">{r.avgCostPerMT} / MT</span>
                    </div>

                    <div className="text-[11px] space-y-0.5 text-muted-foreground">
                      <div><span className="font-medium text-zinc-400">States:</span> {r.states}</div>
                      <div><span className="font-medium text-zinc-400">Share of Demand:</span> {r.shareOfDemand}</div>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-normal pt-1 border-t border-white/5">
                      {r.factors}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: GUIDE */}
        <TabsContent value="guide" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-2xl border-white/10 bg-[#0c0d0e] shadow-lg">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit border-zinc-700 text-zinc-400 text-[10px] mb-1 font-mono">
                  46% N
                </Badge>
                <CardTitle className="text-sm font-bold text-foreground">Nitrogenous Fertilizers</CardTitle>
                <CardDescription className="text-xs">Urea, Ammonium, Nitrate</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>Facilitates vegetative leaf growth, tillering, and chlorophyll production.</p>
                <p className="text-[11px] text-zinc-400">Mandatory neem coating slows hydrolysis and reduces leaching.</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-white/10 bg-[#0c0d0e] shadow-lg">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit border-zinc-700 text-zinc-400 text-[10px] mb-1 font-mono">
                  18% N, 46% P₂O₅
                </Badge>
                <CardTitle className="text-sm font-bold text-foreground">Phosphatic Fertilizers</CardTitle>
                <CardDescription className="text-xs">DAP, Single Superphosphate (SSP)</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>Drives root development, seedling vigor, and stalk rigidity.</p>
                <p className="text-[11px] text-zinc-400">Place 5 cm below seed level for optimal root contact.</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-white/10 bg-[#0c0d0e] shadow-lg">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit border-zinc-700 text-zinc-400 text-[10px] mb-1 font-mono">
                  60% K₂O
                </Badge>
                <CardTitle className="text-sm font-bold text-foreground">Potassic Fertilizers</CardTitle>
                <CardDescription className="text-xs">Muriate of Potash (MOP)</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>Regulates stomatal water conductance, carbohydrate transport, and stress resistance.</p>
                <p className="text-[11px] text-zinc-400">Enhances grain weight, tuber density, and juice purity.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 3. Bottom Soil Diagnostic Banner */}
      <div className="p-5 rounded-2xl bg-[#0c0d0e] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            <span>Soil Health Diagnostic</span>
          </h3>
          <p className="text-xs text-muted-foreground max-w-xl">
            Evaluate soil nutrient availability before procuring inputs to prevent over-fertilization.
          </p>
        </div>

        <Link href="/soil-health" className="shrink-0">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 gap-1.5">
            <span>Soil Scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Crop Fertilizer Detail Modal */}
      <Dialog open={!!detailCropModal} onOpenChange={(open) => !open && setDetailCropModal(null)}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] flex flex-col p-0 rounded-2xl border border-white/15 bg-[#0c0d0e]/95 backdrop-blur-2xl shadow-2xl text-foreground overflow-hidden">
          {detailCropModal && (
            <>
              <DialogHeader className="p-5 pb-4 border-b border-white/10 bg-white/[0.02] shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                        {detailCropModal.season} Season
                      </Badge>
                      <span className="text-xs text-muted-foreground">{detailCropModal.hindiName}</span>
                    </div>
                    <DialogTitle className="text-lg font-extrabold text-foreground">
                      {detailCropModal.name} — Nutrient Schedule
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      {detailCropModal.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-5 space-y-4 overflow-y-auto text-xs">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-muted-foreground block">Urea</span>
                    <span className="font-mono font-bold text-foreground text-sm">{detailCropModal.ureaKg} kg</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-muted-foreground block">DAP</span>
                    <span className="font-mono font-bold text-foreground text-sm">{detailCropModal.dapKg} kg</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-muted-foreground block">MOP</span>
                    <span className="font-mono font-bold text-foreground text-sm">{detailCropModal.mopKg} kg</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-muted-foreground block">Zinc</span>
                    <span className="font-mono font-bold text-foreground text-sm">
                      {detailCropModal.zincKg > 0 ? `${detailCropModal.zincKg} kg` : "Opt."}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Subsidized Cost / Acre</span>
                    <span className="text-lg font-extrabold font-mono text-emerald-400">
                      ₹{detailCropModal.subsidizedCostPerAcre.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">Unsubsidized Market Value</span>
                    <span className="font-mono text-sm line-through text-muted-foreground">
                      ₹{detailCropModal.unsubsidizedMarketCost.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Split Application Protocol
                  </span>
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
                    <span className="font-bold text-emerald-400 block text-[10px] uppercase">Basal</span>
                    <p className="text-foreground/90 mt-0.5">{detailCropModal.applicationSchedule.basal}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
                    <span className="font-bold text-amber-400 block text-[10px] uppercase">Split 1</span>
                    <p className="text-foreground/90 mt-0.5">{detailCropModal.applicationSchedule.topDressing1}</p>
                  </div>
                  {detailCropModal.applicationSchedule.topDressing2 && (
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
                      <span className="font-bold text-sky-400 block text-[10px] uppercase">Split 2</span>
                      <p className="text-foreground/90 mt-0.5">{detailCropModal.applicationSchedule.topDressing2}</p>
                    </div>
                  )}
                  {detailCropModal.applicationSchedule.micronutrient && (
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
                      <span className="font-bold text-purple-400 block text-[10px] uppercase">Micronutrient</span>
                      <p className="text-foreground/90 mt-0.5">{detailCropModal.applicationSchedule.micronutrient}</p>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground leading-relaxed">{detailCropModal.keyAdvice}</span>
                </div>
              </div>

              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end gap-2 shrink-0">
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedCrop(detailCropModal);
                    setDetailCropModal(null);
                    const calcTab = document.querySelector('[value="calculator"]') as HTMLButtonElement;
                    if (calcTab) calcTab.click();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 h-9"
                >
                  <Calculator className="w-3.5 h-3.5 mr-1.5" />
                  <span>Calculate Dose in Cost Calculator</span>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FertilizerPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Loading Fertilizer Economics...
        </div>
      }
    >
      <FertilizerContent />
    </Suspense>
  );
}
