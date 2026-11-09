"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sprout,
  TrendingUp,
  Droplets,
  Calendar,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Info,
  ChevronRight,
  Wheat,
  Scale,
  CheckCircle2,
  Sliders,
  DollarSign,
  Landmark,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/core/animated-number";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CropCostBreakdown {
  seeds: number;
  landPrep: number;
  fertilizers: number;
  irrigation: number;
  cropProtection: number;
  laborHarvest: number;
}

interface CropRecommendation {
  id: string;
  name: string;
  localName: string;
  category: "Pulses" | "Oilseeds" | "Cereals" | "Vegetables" | "Tubers";
  variety: string;
  durationDays: string;
  waterNeed: "Low" | "Medium" | "High";
  soilSuitability: string;
  expectedYieldPerAcre: number; // in Quintals
  modalMarketRate: number; // ₹ per Quintal
  mspRate?: number; // ₹ per Quintal (if MSP covered)
  costs: CropCostBreakdown;
  odishaScheme: string;
  keyAdvantage: string;
}

const RABI_CROPS_ODISHA: CropRecommendation[] = [
  {
    id: "moong",
    name: "Green Gram",
    localName: "Muga Dali / Moong",
    category: "Pulses",
    variety: "IPM 02-03, Samrat, Meha",
    durationDays: "65 - 75 Days",
    waterNeed: "Low",
    soilSuitability: "Residual moisture in post-paddy sandy loam to clay loam",
    expectedYieldPerAcre: 5.5,
    modalMarketRate: 8682,
    mspRate: 8682,
    costs: {
      seeds: 1200,
      landPrep: 1800,
      fertilizers: 1400,
      irrigation: 900,
      cropProtection: 1100,
      laborHarvest: 2100,
    },
    odishaScheme: "75% Certified Seed Subsidy under NFSM-Pulses & KALIA DB assistance.",
    keyAdvantage: "Fast 65-day turnaround, fixes nitrogen in soil after paddy, high guaranteed MSP procurement.",
  },
  {
    id: "mustard",
    name: "Mustard & Rapeseed",
    localName: "Sorisa / Sarson",
    category: "Oilseeds",
    variety: "Pusa Bold, Anuradha, Parbati",
    durationDays: "90 - 105 Days",
    waterNeed: "Low",
    soilSuitability: "Loamy to sandy loam with good drainage (all Odisha districts)",
    expectedYieldPerAcre: 6.2,
    modalMarketRate: 5950,
    mspRate: 5950,
    costs: {
      seeds: 800,
      landPrep: 2000,
      fertilizers: 2200,
      irrigation: 1200,
      cropProtection: 1200,
      laborHarvest: 2200,
    },
    odishaScheme: "Free Mustard Seed Minikit distribution through Odisha Millet & Oilseed Mission.",
    keyAdvantage: "Low water requirement (only 2 light irrigations), strong cold tolerance and ready oil-mill demand.",
  },
  {
    id: "groundnut",
    name: "Groundnut (Rabi)",
    localName: "Badam / Mungphali",
    category: "Oilseeds",
    variety: "Smruti (OG 52-1), Devi, K-6",
    durationDays: "115 - 125 Days",
    waterNeed: "Medium",
    soilSuitability: "Sandy loam & riverine tracts (Ganjam, Puri, Jajpur, Kendrapara)",
    expectedYieldPerAcre: 9.5,
    modalMarketRate: 6783,
    mspRate: 6783,
    costs: {
      seeds: 5400,
      landPrep: 2500,
      fertilizers: 2800,
      irrigation: 2200,
      cropProtection: 1400,
      laborHarvest: 3200,
    },
    odishaScheme: "National Mission on Edible Oils (NMEO) seed and gypsum subsidy.",
    keyAdvantage: "Odisha coastal belt yields top-grade groundnut with huge export demand and oil extraction value.",
  },
  {
    id: "maize",
    name: "Hybrid Maize",
    localName: "Maka / Corn",
    category: "Cereals",
    variety: "Pioneer P3396, DKC 9108, Bio-9681",
    durationDays: "105 - 120 Days",
    waterNeed: "Medium",
    soilSuitability: "Well-drained fertile loam (Nabarangpur, Koraput, Ganjam)",
    expectedYieldPerAcre: 28.0,
    modalMarketRate: 2225,
    mspRate: 2225,
    costs: {
      seeds: 2800,
      landPrep: 2400,
      fertilizers: 3600,
      irrigation: 2400,
      cropProtection: 1500,
      laborHarvest: 2800,
    },
    odishaScheme: "Starch & Poultry feed mill contract buyback with MSP price floor.",
    keyAdvantage: "Highest grain volume per acre; steady industrial demand from feed manufacturers.",
  },
  {
    id: "potato",
    name: "Rabi Potato",
    localName: "Aloo",
    category: "Tubers",
    variety: "Kufri Jyoti, Kufri Pukhraj, Ashoka",
    durationDays: "85 - 95 Days",
    waterNeed: "High",
    soilSuitability: "Friable sandy loam rich in organic matter (Cuttack, Puri, Koraput)",
    expectedYieldPerAcre: 85.0,
    modalMarketRate: 1150,
    costs: {
      seeds: 18000,
      landPrep: 3200,
      fertilizers: 5500,
      irrigation: 3200,
      cropProtection: 2400,
      laborHarvest: 5500,
    },
    odishaScheme: "Odisha Potato Mission cold storage electricity tariff rebate & quality seed subsidy.",
    keyAdvantage: "Very high revenue per acre (₹97,000+) with immediate local wholesale demand in urban hubs.",
  },
  {
    id: "vegetables",
    name: "Winter Cauliflower & Tomato",
    localName: "Kobi & Bilati Baigana",
    category: "Vegetables",
    variety: "Barkha (Cauliflower), Arka Rakshak (Tomato)",
    durationDays: "65 - 80 Days",
    waterNeed: "Medium",
    soilSuitability: "Fertile alluvial loam near peri-urban Mandis (Khordha, Cuttack, Nayagarh)",
    expectedYieldPerAcre: 72.0,
    modalMarketRate: 1400,
    costs: {
      seeds: 3500,
      landPrep: 2800,
      fertilizers: 4200,
      irrigation: 2600,
      cropProtection: 3500,
      laborHarvest: 5400,
    },
    odishaScheme: "Mission for Integrated Development of Horticulture (MIDH) polyhouse and mulch subsidy.",
    keyAdvantage: "Fast cash flow every 70 days; Bhubaneswar & Cuttack retail markets absorb 100% daily volume.",
  },
  {
    id: "boro_paddy",
    name: "Boro / Summer Paddy",
    localName: "Dala Dhana (Rabi)",
    category: "Cereals",
    variety: "MTU 1010, Lalat, Khandagiri",
    durationDays: "120 - 130 Days",
    waterNeed: "High",
    soilSuitability: "Canal irrigated command areas (Bargarh, Sambalpur, Hirakud delta)",
    expectedYieldPerAcre: 24.5,
    modalMarketRate: 3100, // ₹2,300 MSP + ₹800 Odisha State Bonus
    mspRate: 3100,
    costs: {
      seeds: 1400,
      landPrep: 3200,
      fertilizers: 4800,
      irrigation: 4200,
      cropProtection: 2200,
      laborHarvest: 5700,
    },
    odishaScheme: "Odisha State Paddy Bonus (₹3,100/Qtl guaranteed) + Direct DBT procurement.",
    keyAdvantage: "Assured government mandis in Bargarh & Sambalpur with state-sponsored bonus purchase.",
  },
];

export default function CropPlannerPage() {
  const [landAcres, setLandAcres] = useState<number>(2.5);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSoil, setSelectedSoil] = useState<string>("all");
  const [expandedCropId, setExpandedCropId] = useState<string>("moong");

  // Dynamic calculations for each crop based on user's land acres
  const calculatedCrops = useMemo(() => {
    return RABI_CROPS_ODISHA.map((crop) => {
      const totalCostPerAcre = Object.values(crop.costs).reduce((a, b) => a + b, 0);
      const grossRevenuePerAcre = crop.expectedYieldPerAcre * crop.modalMarketRate;
      const netProfitPerAcre = grossRevenuePerAcre - totalCostPerAcre;
      const roiPercent = Math.round((netProfitPerAcre / totalCostPerAcre) * 100);

      const totalCostUserLand = totalCostPerAcre * landAcres;
      const totalYieldUserLand = crop.expectedYieldPerAcre * landAcres;
      const totalRevenueUserLand = grossRevenuePerAcre * landAcres;
      const totalProfitUserLand = netProfitPerAcre * landAcres;

      return {
        ...crop,
        totalCostPerAcre,
        grossRevenuePerAcre,
        netProfitPerAcre,
        roiPercent,
        totalCostUserLand,
        totalYieldUserLand,
        totalRevenueUserLand,
        totalProfitUserLand,
      };
    });
  }, [landAcres]);

  // Filter crops
  const filteredCrops = useMemo(() => {
    return calculatedCrops.filter((c) => {
      if (selectedCategory !== "All" && c.category !== selectedCategory) return false;
      return true;
    });
  }, [calculatedCrops, selectedCategory]);

  // Comparative Chart Data
  const chartData = useMemo(() => {
    return calculatedCrops.map((c) => ({
      name: c.name,
      profitPerAcre: c.netProfitPerAcre,
      costPerAcre: c.totalCostPerAcre,
      roi: c.roiPercent,
    }));
  }, [calculatedCrops]);

  // Overall best recommendations
  const highestProfitCrop = useMemo(() => {
    return [...calculatedCrops].sort((a, b) => b.netProfitPerAcre - a.netProfitPerAcre)[0];
  }, [calculatedCrops]);

  const highestRoiCrop = useMemo(() => {
    return [...calculatedCrops].sort((a, b) => b.roiPercent - a.roiPercent)[0];
  }, [calculatedCrops]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1 font-medium text-xs">
              <Sparkles className="h-3 w-3" /> Upcoming Season: Rabi 2026-27 Planning
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Odisha Agro-Climatic Model</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sprout className="h-8 w-8 text-primary" />
            Next Season Crop & Profitability Advisor
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Data-backed crop recommendations for the upcoming winter season in Odisha: compare cultivation costs, harvest yields, and net profits per acre.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link href="/crop-rates" className="flex items-center gap-1.5">
              <span>View Today&apos;s Mandi Rates</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Interactive Land Acreage & Farm Setup Bar */}
      <Card className="bg-card shadow-sm border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Acreage Selector with Animated Number & Glyph */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground text-xs sm:text-sm flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-primary" />
                  Your Cultivable Land Size:
                </span>

                {/* Animated Number Badge with Glyph */}
                <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-card border border-primary/30 shadow-xs">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    width="15"
                    height="15"
                    className="mr-2 h-3.5 w-3.5 fill-transparent stroke-primary stroke-[1.4]"
                  >
                    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                  </svg>
                  <AnimatedNumber
                    className="inline-flex items-center font-mono text-xl sm:text-2xl font-bold text-foreground tracking-tight"
                    springOptions={{
                      bounce: 0,
                      duration: 600,
                    }}
                    value={landAcres}
                    format={(val) => {
                      const rounded = Math.round(val * 10) / 10;
                      return rounded % 1 !== 0 ? rounded.toFixed(1) : rounded.toString();
                    }}
                    suffix=" Acres"
                  />
                </div>
              </div>

              <input
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={landAcres}
                onChange={(e) => setLandAcres(parseFloat(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />

              {/* Quick Acreage Preset Buttons for smooth animated spring transitions */}
              <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                {[0.5, 2.5, 5, 10, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setLandAcres(preset)}
                    className={`px-1.5 py-0.5 rounded transition-all hover:text-primary ${
                      landAcres === preset
                        ? "font-bold text-primary bg-primary/10 border border-primary/20 shadow-xs"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    {preset} {preset === 0.5 ? "Acre" : "Acres"}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick KPI Highlights for Selected Land */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-border/80 bg-muted/30">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                  Top Margin Crop
                </span>
                <p className="text-sm font-extrabold text-foreground mt-0.5 truncate">
                  {highestProfitCrop.name}
                </p>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  +<AnimatedNumber value={Math.round(highestProfitCrop.totalProfitUserLand)} prefix="₹" suffix=" Net" springOptions={{ bounce: 0, duration: 1600 }} />
                </span>
              </div>

              <div className="p-3 rounded-lg border border-border/80 bg-muted/30">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                  Highest ROI Option
                </span>
                <p className="text-sm font-extrabold text-foreground mt-0.5 truncate">
                  {highestRoiCrop.name}
                </p>
                <span className="text-xs font-bold text-primary">
                  <AnimatedNumber value={highestRoiCrop.roiPercent} suffix="% Return" springOptions={{ bounce: 0, duration: 1600 }} />
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-lg border border-primary/20 bg-primary/5">
                <span className="text-[10px] font-semibold uppercase text-primary block">
                  Odisha Bonus Status
                </span>
                <p className="text-sm font-extrabold text-foreground mt-0.5">
                  ₹3,100 / Qtl
                </p>
                <span className="text-[10px] text-muted-foreground">
                  Assured Boro Paddy MSP
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparative Profit vs Cultivation Cost Chart */}
      <Card className="bg-card shadow-sm border-border">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <TrendingUp className="w-4 h-4 text-primary" />
                Economic Comparison: Net Profit vs Cultivation Cost (₹ / Acre)
              </CardTitle>
              <CardDescription className="text-xs">
                Compare expected earnings against upfront investment required for each crop in Rabi season.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" stroke="#888888" />
                <YAxis tick={{ fontSize: 11 }} stroke="#888888" tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: number, name: string) => [
                    `₹${val.toLocaleString("en-IN")}`,
                    name === "profitPerAcre" ? "Net Profit / Acre" : "Cultivation Cost / Acre",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                <Bar dataKey="profitPerAcre" name="Net Profit (₹/Acre)" fill="#10b981" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1800} animationEasing="ease-out" />
                <Bar dataKey="costPerAcre" name="Cultivation Cost (₹/Acre)" fill="#64748b" radius={[4, 4, 0, 0]} opacity={0.7} isAnimationActive={true} animationDuration={2000} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {["All", "Pulses", "Oilseeds", "Cereals", "Vegetables", "Tubers"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex-shrink-0 ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {cat === "All" ? "All Recommended Crops" : cat}
          </button>
        ))}
      </div>

      {/* Itemized Crop Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredCrops.map((crop) => {
          const isExpanded = expandedCropId === crop.id;

          return (
            <Card
              key={crop.id}
              className={`bg-card border transition-all ${
                isExpanded ? "border-primary/50 shadow-md ring-1 ring-primary/20" : "border-border/80 shadow-xs hover:border-border"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                        {crop.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">{crop.localName}</span>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground">
                      {crop.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Top Varieties: <span className="font-semibold text-foreground">{crop.variety}</span>
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Net Profit ({landAcres} Acres)
                    </span>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      <AnimatedNumber
                        value={Math.round(crop.totalProfitUserLand)}
                        prefix="₹"
                        springOptions={{ bounce: 0, duration: 1200 }}
                      />
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 block mt-1">
                      {crop.roiPercent}% ROI
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-1 text-xs">
                {/* 4 Financial Benchmarks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/70 text-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Exp. Yield / Acre</span>
                    <span className="font-bold text-foreground text-xs">{crop.expectedYieldPerAcre} Qtl</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Mandi Rate / MSP</span>
                    <span className="font-bold text-primary text-xs">₹{crop.modalMarketRate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Cost / Acre</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400 text-xs">₹{crop.totalCostPerAcre.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Profit / Acre</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">+₹{crop.netProfitPerAcre.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Agronomic Conditions */}
                <div className="grid grid-cols-2 gap-2 text-muted-foreground text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>Duration: <strong className="text-foreground">{crop.durationDays}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span>Water Requirement: <strong className="text-foreground">{crop.waterNeed}</strong></span>
                  </div>
                </div>

                {/* Key Strategic Advantage */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Agronomic Edge:</strong> {crop.keyAdvantage}
                </p>

                {/* Odisha Govt Scheme / Subsidy Banner */}
                <div className="p-2.5 rounded-md bg-primary/10 border border-primary/20 text-[11px] flex items-start gap-2">
                  <Landmark className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground leading-snug">{crop.odishaScheme}</span>
                </div>

                {/* Toggle Itemized Cost Breakdown Button */}
                <button
                  type="button"
                  onClick={() => setExpandedCropId(isExpanded ? "" : crop.id)}
                  className="w-full flex items-center justify-center gap-1 text-[11px] font-semibold text-primary hover:underline pt-1"
                >
                  <span>{isExpanded ? "Hide Itemized Cultivation Expenses" : "View Itemized Expense Breakdown (Seeds, Khad, Labor)"}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>

                {/* Detailed Expense Table (When Expanded) */}
                {isExpanded && (
                  <div className="p-3 rounded-md border border-border/80 bg-background space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[11px] font-bold text-foreground border-b pb-1.5">
                      <span>Expense Head (Cost / Acre)</span>
                      <span>Amount</span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-muted-foreground">
                      <div className="flex justify-between">
                        <span>1. Certified Seed & Seed Treatment</span>
                        <span className="font-mono text-foreground">₹{crop.costs.seeds.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Land Preparation & Tractor Plowing</span>
                        <span className="font-mono text-foreground">₹{crop.costs.landPrep.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3. Fertilizers (DAP, Urea, MOP) & Bio-manure</span>
                        <span className="font-mono text-foreground">₹{crop.costs.fertilizers.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>4. Irrigation Energy (Diesel / Electricity)</span>
                        <span className="font-mono text-foreground">₹{crop.costs.irrigation.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>5. Plant Protection (Weeding & Bio-pesticides)</span>
                        <span className="font-mono text-foreground">₹{crop.costs.cropProtection.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>6. Harvesting, Threshing & Transport Prep</span>
                        <span className="font-mono text-foreground">₹{crop.costs.laborHarvest.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2 border-t font-bold text-xs text-foreground">
                      <span>Total Cultivation Cost (Per Acre)</span>
                      <span className="text-primary font-mono">₹{crop.totalCostPerAcre.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
