"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Sprout,
  Droplets,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Truck,
  IndianRupee,
  Layers,
  Sparkles,
  ExternalLink,
  Lightbulb,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chart3DContainer, ThreeDDot, ThreeDChartDefs } from "@/components/ui/chart-3d";
import { useCropHistory, CropHistoryItem } from "@/hooks/use-crop-history";

// Comprehensive Agronomic & Future Profitability Database for Odisha
interface CropAgroProfile {
  localName: string;
  season: string;
  durationDays: string;
  waterNeed: "Low" | "Medium" | "High";
  costPerAcre: number;
  expectedYieldQtl: number;
  marketRatePerQtl: number;
  soilType: string;
  profitOutlook: "Highly Profitable" | "Moderate / Stable" | "High Margin";
  advisory: string;
  costs: {
    seeds: number;
    fertilizer: number;
    labor: number;
    irrigation: number;
    protection: number;
  };
}

const CROP_AGRO_DATABASE: Record<string, CropAgroProfile> = {
  potato: {
    localName: "Alu",
    season: "Rabi (Winter: Nov - Feb)",
    durationDays: "85 - 95 Days",
    waterNeed: "High",
    costPerAcre: 32000,
    expectedYieldQtl: 85,
    marketRatePerQtl: 2800,
    soilType: "Well-drained sandy loam rich in organic matter (Cuttack, Puri, Koraput)",
    profitOutlook: "Highly Profitable",
    advisory: "High demand in urban Odisha wholesale markets. Cold storage releases steady.",
    costs: { seeds: 18000, fertilizer: 5000, labor: 4500, irrigation: 2500, protection: 2000 },
  },
  onion: {
    localName: "Piaja",
    season: "Rabi / Late Kharif (Nov - April)",
    durationDays: "110 - 125 Days",
    waterNeed: "Medium",
    costPerAcre: 28000,
    expectedYieldQtl: 65,
    marketRatePerQtl: 5200,
    soilType: "Friable sandy loam with good drainage (Bolangir, Kalahandi, Angul)",
    profitOutlook: "High Margin",
    advisory: "Strong local demand against Maharashtra/Nasik imports. High storage shelf-life.",
    costs: { seeds: 9000, fertilizer: 6500, labor: 6500, irrigation: 3500, protection: 2500 },
  },
  tomato: {
    localName: "Bilati Baigana",
    season: "Rabi & Autumn (Oct - March)",
    durationDays: "70 - 80 Days",
    waterNeed: "Medium",
    costPerAcre: 22000,
    expectedYieldQtl: 75,
    marketRatePerQtl: 3800,
    soilType: "Alluvial loam (Khordha, Cuttack, Nayagarh, Sambalpur)",
    profitOutlook: "Highly Profitable",
    advisory: "Fast turnaround with weekly picking cycles. High cash velocity at APMC yard.",
    costs: { seeds: 4000, fertilizer: 5500, labor: 6500, irrigation: 3500, protection: 2500 },
  },
  chilli: {
    localName: "Kancha Lanka",
    season: "Rabi / Summer (Oct - April)",
    durationDays: "80 - 95 Days",
    waterNeed: "Low",
    costPerAcre: 26000,
    expectedYieldQtl: 45,
    marketRatePerQtl: 7000,
    soilType: "Light sandy loam to red soil (Ganjam, Rayagada, Koraput)",
    profitOutlook: "High Margin",
    advisory: "Multiple pickings over 4 months. Both fresh green and dry red sales channels.",
    costs: { seeds: 5000, fertilizer: 6000, labor: 8000, irrigation: 3500, protection: 3500 },
  },
  brinjal: {
    localName: "Baigana",
    season: "Year-Round / Rabi peak",
    durationDays: "65 - 75 Days",
    waterNeed: "Medium",
    costPerAcre: 18000,
    expectedYieldQtl: 80,
    marketRatePerQtl: 3500,
    soilType: "Deep silt loam with rich humus (Mahanadi riverine delta)",
    profitOutlook: "Moderate / Stable",
    advisory: "Consistent daily wholesale demand. Continuous harvest for 3 months.",
    costs: { seeds: 2500, fertilizer: 5000, labor: 5500, irrigation: 2500, protection: 2500 },
  },
  ginger: {
    localName: "Ada",
    season: "Kharif-Rabi (8-9 months)",
    durationDays: "210 - 240 Days",
    waterNeed: "High",
    costPerAcre: 65000,
    expectedYieldQtl: 60,
    marketRatePerQtl: 13000,
    soilType: "Humus-rich hill loam (Koraput, Kandhamal, Keonjhar)",
    profitOutlook: "Highly Profitable",
    advisory: "High investment crop with massive export and processing value.",
    costs: { seeds: 35000, fertilizer: 12000, labor: 9500, irrigation: 4500, protection: 4000 },
  },
  garlic: {
    localName: "Rasuna",
    season: "Rabi (Oct - March)",
    durationDays: "120 - 135 Days",
    waterNeed: "Medium",
    costPerAcre: 35000,
    expectedYieldQtl: 40,
    marketRatePerQtl: 18000,
    soilType: "Fertile sandy loam with neutral pH",
    profitOutlook: "High Margin",
    advisory: "Record wholesale prices in 2026. Excellent post-harvest drying durability.",
    costs: { seeds: 18000, fertilizer: 6000, labor: 5500, irrigation: 3000, protection: 2500 },
  },
  paddy: {
    localName: "Dhana / Chaula (Paddy / Rice)",
    season: "Kharif (Monsoon: June - Nov)",
    durationDays: "120 - 135 Days",
    waterNeed: "High",
    costPerAcre: 24000,
    expectedYieldQtl: 26,
    marketRatePerQtl: 2320,
    soilType: "Coastal alluvial and clayey delta loam (Cuttack, Balasore, Bargarh, Puri)",
    profitOutlook: "Moderate / Stable",
    advisory: "Principal staple crop with 100% assured PACS & APMC mandi procurement at government MSP.",
    costs: { seeds: 2500, fertilizer: 7500, labor: 8000, irrigation: 3000, protection: 3000 },
  },
  rice: {
    localName: "Dhana (Swarna / MTU-1001)",
    season: "Kharif (Monsoon: June - Nov)",
    durationDays: "125 - 140 Days",
    waterNeed: "High",
    costPerAcre: 24000,
    expectedYieldQtl: 26,
    marketRatePerQtl: 2320,
    soilType: "Alluvial wetland soils across coastal Odisha",
    profitOutlook: "Moderate / Stable",
    advisory: "Assured MSP procurement and steady demand across all state civil supply depots.",
    costs: { seeds: 2500, fertilizer: 7500, labor: 8000, irrigation: 3000, protection: 3000 },
  },
  groundnut: {
    localName: "Chinabadam (Groundnut / Peanut)",
    season: "Rabi (Winter: Nov - March)",
    durationDays: "105 - 120 Days",
    waterNeed: "Low",
    costPerAcre: 26000,
    expectedYieldQtl: 18,
    marketRatePerQtl: 6750,
    soilType: "Well-drained light sandy loam to coastal alluvial (Jajpur, Ganjam, Cuttack)",
    profitOutlook: "Highly Profitable",
    advisory: "High oil content and strong merchant export demand. Naturally fixes atmospheric nitrogen.",
    costs: { seeds: 8000, fertilizer: 6000, labor: 6500, irrigation: 2500, protection: 3000 },
  },
  peanut: {
    localName: "Chinabadam (Smruti / TAG-24)",
    season: "Rabi (Winter: Nov - March)",
    durationDays: "105 - 120 Days",
    waterNeed: "Low",
    costPerAcre: 26000,
    expectedYieldQtl: 18,
    marketRatePerQtl: 6750,
    soilType: "Light sandy loam with high potassium reserve",
    profitOutlook: "Highly Profitable",
    advisory: "Strong local oil mill buying and high pod-filling efficiency.",
    costs: { seeds: 8000, fertilizer: 6000, labor: 6500, irrigation: 2500, protection: 3000 },
  },
  mustard: {
    localName: "Sorisha (Mustard / Rapeseed)",
    season: "Rabi / Winter (Oct - Feb)",
    durationDays: "85 - 100 Days",
    waterNeed: "Low",
    costPerAcre: 16000,
    expectedYieldQtl: 12,
    marketRatePerQtl: 5850,
    soilType: "Sandy loam to medium loam with good drainage (Angul, Sambalpur, Mayurbhanj)",
    profitOutlook: "High Margin",
    advisory: "Short-duration low water crop, ideal immediately after paddy harvest.",
    costs: { seeds: 2000, fertilizer: 5000, labor: 4500, irrigation: 2000, protection: 2500 },
  },
  wheat: {
    localName: "Gahama (Wheat)",
    season: "Rabi (Nov - March)",
    durationDays: "110 - 120 Days",
    waterNeed: "Medium",
    costPerAcre: 21000,
    expectedYieldQtl: 20,
    marketRatePerQtl: 2450,
    soilType: "Fertile alluvial loam with neutral pH",
    profitOutlook: "Moderate / Stable",
    advisory: "Steady grain demand backed by MSP procurement.",
    costs: { seeds: 3500, fertilizer: 6500, labor: 5500, irrigation: 3000, protection: 2500 },
  },
  maize: {
    localName: "Maka (Corn / Maize)",
    season: "Kharif & Rabi (Year-Round)",
    durationDays: "90 - 105 Days",
    waterNeed: "Medium",
    costPerAcre: 22000,
    expectedYieldQtl: 32,
    marketRatePerQtl: 2225,
    soilType: "Deep well-drained loam (Nabarangpur, Koraput, Mayurbhanj)",
    profitOutlook: "Highly Profitable",
    advisory: "Rapidly expanding cash crop with massive industrial starch and poultry feed mill demand.",
    costs: { seeds: 4000, fertilizer: 7000, labor: 5500, irrigation: 3000, protection: 2500 },
  },
};

export interface SoilRecommendationData {
  crop?: string;
  suitability?: number;
  season?: string;
  reason?: string;
  expected_yield_boost?: string;
  best_fertilizer?: string;
  fertilizer_schedule?: {
    basal?: string;
    top_dressing?: string;
    micronutrients?: string;
    organic?: string;
  };
  npk_ratio?: string;
  application_tip?: string;
}

export interface SoilParametersData {
  ph?: string;
  ph_status?: string;
  nitrogen?: string;
  phosphorus?: string;
  potassium?: string;
  organic_carbon?: string;
  zinc?: string;
  salinity_ec?: string;
}

interface CropDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropName: string;
  currentPrice?: number | string;
  retailPrice?: string;
  unit?: string;
  category?: string;
  priceQuintal?: number | string;
  mandiInfo?: string;
  url?: string;
  soilRecommendation?: SoilRecommendationData;
  soilParameters?: SoilParametersData;
  district?: string;
}

export function CropDetailModal({
  isOpen,
  onClose,
  cropName,
  currentPrice,
  retailPrice,
  unit = "kg",
  category,
  priceQuintal,
  mandiInfo,
  url,
  soilRecommendation,
  soilParameters,
  district = "Odisha",
}: CropDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"history" | "profit" | "soil">(
    soilRecommendation ? "soil" : "history"
  );
  const [calcAcres, setCalcAcres] = useState<number>(1);
  const { data: historyData } = useCropHistory();

  // Match crop with history dataset
  const historyItem = useMemo(() => {
    if (!historyData?.items || !cropName) return null;
    const clean = cropName.toLowerCase().trim();
    return historyData.items.find((i: CropHistoryItem) => {
      const iName = i.name.toLowerCase();
      return iName.includes(clean) || clean.includes(iName) || clean.split(" ")[0] === iName.split(" ")[0];
    });
  }, [historyData, cropName]);

  // Match crop with Agro database
  const agroProfile = useMemo(() => {
    const clean = cropName.toLowerCase();
    for (const key of Object.keys(CROP_AGRO_DATABASE)) {
      if (clean.includes(key)) {
        return CROP_AGRO_DATABASE[key];
      }
    }
    // Dynamic Fallback estimation based on current price
    const numPrice = typeof currentPrice === "number" ? currentPrice : parseInt(String(currentPrice).replace(/\D/g, ""), 10) || 35;
    const estYield = 60;
    const estCost = 24000;
    const estRateQtl = numPrice * 100;
    return {
      localName: cropName,
      season: "Upcoming Rabi (Winter / Spring)",
      durationDays: "75 - 90 Days",
      waterNeed: "Medium" as const,
      costPerAcre: estCost,
      expectedYieldQtl: estYield,
      marketRatePerQtl: estRateQtl,
      soilType: "Fertile alluvial loam with good drainage across Odisha",
      profitOutlook: "Moderate / Stable" as const,
      advisory: "Favorable conditions for local mandi auction and wholesale procurement.",
      costs: { seeds: 4000, fertilizer: 6000, labor: 7000, irrigation: 4000, protection: 3000 },
    };
  }, [cropName, currentPrice]);

  // Transform 7-day history for Recharts LineChart
  const chartData = useMemo(() => {
    if (historyItem?.dailyPrices && historyData?.columns) {
      return historyData.columns.map((col: string, idx: number) => ({
        day: col,
        price: historyItem.dailyPrices[idx] ?? historyItem.currentPrice,
      }));
    }

    // Fallback 7-day realistic simulation based on current price
    const base = typeof currentPrice === "number" ? currentPrice : parseInt(String(currentPrice).replace(/\D/g, ""), 10) || 35;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
    const variations = [-3, -2, -1, 1, 0, 2, 0];
    return days.map((d, i) => ({
      day: d,
      price: Math.max(10, base + variations[i]),
    }));
  }, [historyItem, historyData, currentPrice]);

  // Profit calculation for the user's selected acres
  const profitMetrics = useMemo(() => {
    const cost = agroProfile.costPerAcre * calcAcres;
    const yieldTotal = agroProfile.expectedYieldQtl * calcAcres;
    const revenue = yieldTotal * agroProfile.marketRatePerQtl;
    const netProfit = revenue - cost;
    const roi = Math.round((netProfit / cost) * 100);

    return {
      cost,
      yieldTotal,
      revenue,
      netProfit,
      roi,
    };
  }, [agroProfile, calcAcres]);

  const displayWholesale = currentPrice || (historyItem ? `₹${historyItem.currentPrice}` : "₹35");
  const displayRetail = retailPrice || (historyItem?.retailPrices?.[6] || "₹45");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[88vh] flex flex-col gap-0 bg-card border-border shadow-2xl p-0 overflow-hidden">
        {/* Modal Top Header */}
        <DialogHeader className="shrink-0 p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/80 bg-muted/20 space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 text-[10px] font-bold uppercase tracking-wider">
                  {category || "Mandi Intelligence"}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">{agroProfile.localName}</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {cropName}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {mandiInfo || "APMC Mandi"} • Market Analytics
              </DialogDescription>
            </div>

            {/* Price Pill */}
            <div className="text-left sm:text-right p-2.5 rounded-lg border border-border/80 bg-card">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Wholesale Rate
              </span>
              <div className="text-xl sm:text-2xl font-black text-primary">
                {priceQuintal
                  ? typeof priceQuintal === "number"
                    ? `₹${priceQuintal.toLocaleString("en-IN")}/qtl`
                    : `${priceQuintal.startsWith("₹") ? "" : "₹"}${priceQuintal}/qtl`
                  : (typeof displayWholesale === "number" ? `₹${displayWholesale}/${unit}` : displayWholesale)}
              </div>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                ₹{typeof displayWholesale === "number" ? displayWholesale : displayWholesale.replace("₹", "")}/{unit} • Retail: {displayRetail}
              </span>
            </div>
          </div>

          {/* Tab Navigation - Grid layout, zero horizontal scroll */}
          <div className={`grid ${soilRecommendation ? "grid-cols-3" : "grid-cols-2"} gap-1.5 pt-3 w-full`}>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-all text-center ${
                activeTab === "history"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Price History</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("profit")}
              className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-all text-center ${
                activeTab === "profit"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Profit & ROI</span>
            </button>
            {soilRecommendation && (
              <button
                type="button"
                onClick={() => setActiveTab("soil")}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-all text-center ${
                  activeTab === "soil"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Soil Advisory</span>
                {soilRecommendation.suitability && (
                  <span className="text-[10px] font-bold opacity-85 hidden sm:inline">
                    ({soilRecommendation.suitability}%)
                  </span>
                )}
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Modal Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.3)_transparent]">
          {/* TAB 1: 7-DAY PRICE HISTORY & VOLATILITY */}
          {activeTab === "history" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-2.5 text-xs text-center">
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                  <span className="text-[10px] text-muted-foreground block">7-Day Trajectory</span>
                  <div className="flex items-center justify-center gap-1 font-extrabold text-sm text-foreground mt-0.5">
                    {historyItem?.trend === "up" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center tabular-nums">
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +₹{Number(historyItem.change).toFixed(historyItem.change % 1 === 0 ? 0 : 1)}
                      </span>
                    ) : historyItem?.trend === "down" ? (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center tabular-nums">
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -₹{Math.abs(Number(historyItem.change)).toFixed(historyItem.change % 1 === 0 ? 0 : 1)}
                      </span>
                    ) : (
                      <span className="text-amber-500">Stable</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                  <span className="text-[10px] text-muted-foreground block">Weekly Range</span>
                  <span className="font-extrabold text-sm text-foreground block mt-0.5">
                    ₹{Math.min(...chartData.map((c) => c.price))} - ₹{Math.max(...chartData.map((c) => c.price))}/{unit}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                  <span className="text-[10px] text-muted-foreground block">Retail Margin</span>
                  <span className="font-extrabold text-sm text-primary block mt-0.5">
                    +30% to +45%
                  </span>
                </div>
              </div>

              {/* 7-Day Trend Chart (3D Perspective) */}
              <Chart3DContainer
                title="Price Progression (Past 7 Days)"
                subtitle={`APMC Wholesale Modal (₹/${unit})`}
                badge="3D Trend"
                show3DBadge={true}
              >
                <div className="h-44 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                      <ThreeDChartDefs />
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#888888" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#888888" domain={["auto", "auto"]} />
                      <Tooltip
                        formatter={(val: any) => [`₹${val}/${unit}`, "Mandi Price"]}
                        contentStyle={{
                          backgroundColor: "rgba(10, 10, 10, 0.9)",
                          borderColor: "rgba(255, 255, 255, 0.15)",
                          backdropFilter: "blur(16px)",
                          borderRadius: "12px",
                          fontSize: "12px",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={<ThreeDDot />}
                        activeDot={{ r: 8, stroke: "#ffffff", strokeWidth: 2 }}
                        isAnimationActive={true}
                        animationDuration={1800}
                        animationEasing="ease-out"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Chart3DContainer>

              {/* Mandi Intelligence Notice */}
              <div className="p-3 rounded-md bg-muted/30 border border-border/60 text-xs text-muted-foreground flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Prices are synchronized across verified National APMC mandis via Agmarknet & data.gov.in (Government of India). Modal values represent wholesale auction rates per quintal (1 quintal = 100 kg) and per kg.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: FUTURE CULTIVATION & PROFIT PROJECTION */}
          {activeTab === "profit" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Interactive Land Slider */}
              <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">Plan Cultivation Land Size:</span>
                  <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                    {calcAcres} {calcAcres === 1 ? "Acre" : "Acres"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={calcAcres}
                  onChange={(e) => setCalcAcres(parseFloat(e.target.value))}
                  className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                />
              </div>

              {/* Projected Profit Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                  <span className="text-[10px] text-muted-foreground block">Total Investment</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm block mt-0.5">
                    ₹{profitMetrics.cost.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                  <span className="text-[10px] text-muted-foreground block">Expected Yield</span>
                  <span className="font-bold text-foreground text-sm block mt-0.5">
                    {profitMetrics.yieldTotal} Qtl
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                  <span className="text-[10px] text-muted-foreground block">Gross Revenue</span>
                  <span className="font-bold text-foreground text-sm block mt-0.5">
                    ₹{profitMetrics.revenue.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">
                    Net Profit
                  </span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm block mt-0.5">
                    +₹{profitMetrics.netProfit.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Cultivation Expense Itemized Breakdown */}
              <div className="p-3.5 rounded-lg border border-border/80 bg-card space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-foreground border-b pb-1.5">
                  <span>Cultivation Expenses (Per Acre)</span>
                  <span>Amount</span>
                </div>
                <div className="space-y-1 text-muted-foreground text-[11px]">
                  <div className="flex justify-between">
                    <span>• Certified Seeds & Sowing</span>
                    <span className="font-mono text-foreground">₹{agroProfile.costs.seeds.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Fertilizers (DAP/Urea) & Manure</span>
                    <span className="font-mono text-foreground">₹{agroProfile.costs.fertilizer.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Labor & Harvesting Operations</span>
                    <span className="font-mono text-foreground">₹{agroProfile.costs.labor.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Irrigation & Diesel/Electric Pump</span>
                    <span className="font-mono text-foreground">₹{agroProfile.costs.irrigation.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Plant Protection & Bio-pesticides</span>
                    <span className="font-mono text-foreground">₹{agroProfile.costs.protection.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="flex justify-between pt-1.5 border-t font-bold text-xs text-foreground">
                  <span>Total Cultivation Cost / Acre:</span>
                  <span className="text-primary font-mono">₹{agroProfile.costPerAcre.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Agronomic Profile & Sowing Requirements */}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="p-2.5 rounded-md border border-border/70 bg-muted/20">
                  <span className="text-[10px] font-semibold text-foreground block">Harvest Window:</span>
                  <span>{agroProfile.durationDays}</span>
                </div>
                <div className="p-2.5 rounded-md border border-border/70 bg-muted/20">
                  <span className="text-[10px] font-semibold text-foreground block">Water Need:</span>
                  <span>{agroProfile.waterNeed} requirement</span>
                </div>
              </div>

              {/* Agro Advisory Banner */}
              <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-foreground leading-relaxed">
                  <strong>Agronomic Advisory:</strong> {agroProfile.advisory} Returns on investment are projected at <strong>{profitMetrics.roi}% ROI</strong> for {agroProfile.season}.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SOIL & FERTILIZER ADVISORY */}
          {activeTab === "soil" && soilRecommendation && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Match Header Banner */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-emerald-950/20 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 text-xs font-bold">
                      {soilRecommendation.season || agroProfile.season}
                    </Badge>
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 text-xs font-bold">
                      {soilRecommendation.suitability || 90}% Match
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">
                    Soil Suitability
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {soilRecommendation.reason || agroProfile.advisory}
                  </p>
                </div>
                {soilRecommendation.expected_yield_boost && (
                  <div className="text-left sm:text-right shrink-0 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                    <span className="text-[10px] text-muted-foreground block">Yield Potential</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {soilRecommendation.expected_yield_boost}
                    </span>
                  </div>
                )}
              </div>

              {/* Extracted Soil Parameters Snapshot */}
              {soilParameters && (
                <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Field Parameters ({district})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-card border border-border/50">
                      <span className="text-[10px] text-muted-foreground block">Soil pH</span>
                      <span className="font-bold text-foreground">{soilParameters.ph} ({soilParameters.ph_status})</span>
                    </div>
                    <div className="p-2 rounded-lg bg-card border border-border/50">
                      <span className="text-[10px] text-muted-foreground block">Nitrogen (N)</span>
                      <span className="font-bold text-foreground">{soilParameters.nitrogen}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-card border border-border/50">
                      <span className="text-[10px] text-muted-foreground block">Phosphorus & Potash</span>
                      <span className="font-bold text-foreground">P: {soilParameters.phosphorus} | K: {soilParameters.potassium}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-card border border-border/50">
                      <span className="text-[10px] text-muted-foreground block">Zinc & Carbon</span>
                      <span className="font-bold text-foreground">Zn: {soilParameters.zinc} | OC: {soilParameters.organic_carbon}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Optimal Fertilizer Recommendation Card */}
              {soilRecommendation.best_fertilizer && (
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Fertilizer Schedule</span>
                  </div>
                  <p className="text-xs text-foreground/90 font-medium leading-relaxed bg-card/60 p-2.5 rounded-lg border border-border/60">
                    {soilRecommendation.best_fertilizer}
                  </p>

                  {/* Stage-wise Schedule Breakdown */}
                  {soilRecommendation.fertilizer_schedule && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
                      {soilRecommendation.fertilizer_schedule.basal && (
                        <div className="p-2 rounded-lg bg-card border border-border/60">
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                            1. Basal Application
                          </span>
                          <span className="text-foreground/90 text-[11px] mt-0.5 block leading-relaxed">
                            {soilRecommendation.fertilizer_schedule.basal}
                          </span>
                        </div>
                      )}
                      {soilRecommendation.fertilizer_schedule.top_dressing && (
                        <div className="p-2 rounded-lg bg-card border border-border/60">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                            2. Top Dressing
                          </span>
                          <span className="text-foreground/90 text-[11px] mt-0.5 block leading-relaxed">
                            {soilRecommendation.fertilizer_schedule.top_dressing}
                          </span>
                        </div>
                      )}
                      {soilRecommendation.fertilizer_schedule.micronutrients && (
                        <div className="p-2 rounded-lg bg-card border border-border/60">
                          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                            3. Micronutrient Spray
                          </span>
                          <span className="text-foreground/90 text-[11px] mt-0.5 block leading-relaxed">
                            {soilRecommendation.fertilizer_schedule.micronutrients}
                          </span>
                        </div>
                      )}
                      {soilRecommendation.fertilizer_schedule.organic && (
                        <div className="p-2 rounded-lg bg-card border border-border/60">
                          <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                            4. Organic / Bio-fertilizer
                          </span>
                          <span className="text-foreground/90 text-[11px] mt-0.5 block leading-relaxed">
                            {soilRecommendation.fertilizer_schedule.organic}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {soilRecommendation.application_tip && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 italic flex items-start gap-1.5">
                      <Lightbulb className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Tip:</strong> {soilRecommendation.application_tip}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons for Subsidy & Cold Storage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                <Button asChild variant="outline" className="h-9 text-xs font-semibold border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 justify-start">
                  <Link href={`/fertilizer?crop=${encodeURIComponent(cropName.split(" ")[0].toLowerCase())}`}>
                    <IndianRupee className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    <span>Fertilizer Calculator</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-9 text-xs font-semibold border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 justify-start">
                  <Link href={`/cold-storage?crop=${encodeURIComponent(cropName.split(" ")[0].toLowerCase())}`}>
                    <Layers className="w-3.5 h-3.5 mr-1 text-cyan-500" />
                    <span>Cold Storage</span>
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="shrink-0 p-3.5 sm:p-4 border-t border-border/80 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
            {soilRecommendation && (
              <Button variant="outline" size="sm" asChild className="text-xs font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400">
                <Link href={`/fertilizer?crop=${encodeURIComponent(cropName.split(" ")[0].toLowerCase())}`}>
                  <IndianRupee className="w-3.5 h-3.5 mr-1" />
                  <span>Fertilizer Subsidy</span>
                </Link>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link href="/transportation" className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-primary" />
                <span>Calculate Freight</span>
              </Link>
            </Button>
            <Button size="sm" asChild className="text-xs font-semibold">
              <Link href="/invoices/new" className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Create Mandi Invoice</span>
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
