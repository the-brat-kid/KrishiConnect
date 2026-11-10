"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CropDetailModal } from "@/components/crops/crop-detail-modal";
import { AnimatedNumber } from "@/components/core/animated-number";
import { Tilt } from "@/components/core/tilt";
import { useAuth } from "@/lib/auth-context";
import { useCropRates } from "@/hooks/use-crop-rates";
import { useCropHistory } from "@/hooks/use-crop-history";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  TrendingUp,
  Truck,
  Users,
  FileText,
  ArrowRight,
  Plus,
  MapPin,
  BarChart2,
  Sprout,
  RefreshCw,
  Clock,
} from "lucide-react";
import { TooltipNavbar } from "@/components/ui/tooltip-navbar";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from "recharts";
import { cn } from "@/lib/utils";

// Baseline Mandi staples with authentic fallback emoji & data
const BASE_STAPLES = [
  {
    id: "potato",
    name: "Potato (Alu)",
    fallbackPrice: 20,
    unit: "kg",
    fallbackRetail: "₹26",
    change: "+₹1",
    status: "up",
    emoji: "🥔",
    image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Potato.jpg?width=128&height=128&fit=bounds",
  },
  {
    id: "onion",
    name: "Onion (Piaja)",
    fallbackPrice: 32,
    unit: "kg",
    fallbackRetail: "₹42",
    change: "-₹2",
    status: "down",
    emoji: "🧅",
    image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Onion.jpg?width=128&height=128&fit=bounds",
  },
  {
    id: "tomato",
    name: "Tomato (Bilati)",
    fallbackPrice: 22,
    unit: "kg",
    fallbackRetail: "₹30",
    change: "+₹3",
    status: "up",
    emoji: "🍅",
    image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Tomato.jpg?width=128&height=128&fit=bounds",
  },
  {
    id: "green-chilli",
    name: "Green Chilli (Lanka)",
    fallbackPrice: 55,
    unit: "kg",
    fallbackRetail: "₹75",
    change: "-₹3",
    status: "down",
    emoji: "🌶️",
    image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Green%20Chilli.jpg?width=128&height=128&fit=bounds",
  },
  {
    id: "brinjal",
    name: "Brinjal (Baigana)",
    fallbackPrice: 24,
    unit: "kg",
    fallbackRetail: "₹32",
    change: "+₹2",
    status: "up",
    emoji: "🍆",
    image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Brinjal.jpg?width=128&height=128&fit=bounds",
  },
  {
    id: "ginger",
    name: "Ginger (Ada)",
    fallbackPrice: 85,
    unit: "kg",
    fallbackRetail: "₹110",
    change: "0",
    status: "stable",
    emoji: "🫚",
    image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Ginger.jpg?width=128&height=128&fit=bounds",
  },
];

// Helper component for guaranteed vegetable icon rendering with fallback
function CropIcon({ image, alt, emoji }: { image: string; alt: string; emoji: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <span className="text-3xl select-none leading-none drop-shadow-md">{emoji}</span>;
  }

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <img
        src={image}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-12 h-12 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-115"
      />
    </div>
  );
}

export default function DashboardPage() {
  const { user, businessProfile } = useAuth();
  const displayName = user?.name || user?.full_name || businessProfile?.business_name || "Kisan";

  // Live Mandi Query Hook
  const {
    data: cropRatesData,
    isFetching: ratesFetching,
    refetch: refetchRates,
  } = useCropRates();

  const [selectedCropModal, setSelectedCropModal] = useState<{
    name: string;
    price: number | string;
    retail?: string;
    unit?: string;
  } | null>(null);

  // 1. Dynamic Live Mandi Staples
  const staples = useMemo(() => {
    const liveItems = cropRatesData?.items || [];

    return BASE_STAPLES.map((base) => {
      // Find matching live commodity from the APMC scrape/backend
      const match = liveItems.find((item) => {
        const itemLower = item.name.toLowerCase();
        const baseKey = base.id.toLowerCase();
        return (
          itemLower.includes(baseKey) ||
          itemLower.includes(base.name.toLowerCase().split(" ")[0])
        );
      });

      if (match) {
        const priceNum = match.priceNum || base.fallbackPrice;
        const retailNum = parseInt(match.retailPrice?.replace(/₹|,/g, ""), 10) || Math.round(priceNum * 1.3);
        const changeNum = priceNum - base.fallbackPrice;
        const changeStr =
          changeNum > 0 ? `+₹${changeNum}` : changeNum < 0 ? `-₹${Math.abs(changeNum)}` : base.change;
        const status = changeNum > 0 ? "up" : changeNum < 0 ? "down" : base.status;

        return {
          ...base,
          priceNum,
          price: `₹${priceNum}`,
          retail: `₹${retailNum}`,
          change: changeStr,
          status,
          image: match.image || base.image,
        };
      }

      return {
        ...base,
        priceNum: base.fallbackPrice,
        price: `₹${base.fallbackPrice}`,
        retail: base.fallbackRetail,
      };
    });
  }, [cropRatesData]);

  const mandiChartData = useMemo(() => {
    return staples.map((s) => ({
      name: s.name.split(" ")[0],
      wholesale: s.priceNum,
      retail: parseInt(s.retail.replace("₹", ""), 10) || Math.round(s.priceNum * 1.3),
    }));
  }, [staples]);

  // 3. Freight Corridors (Vertical List + Transport Distance Bar Chart)
  const freightCorridors = [
    { route: "Cuttack Mandi Hub", dist: 28, cost: 1900, truck: "Pickup 1.5T", time: "45 mins" },
    { route: "Puri Coastal Market", dist: 60, cost: 3100, truck: "Tata 407 3.5T", time: "1.5 hrs" },
    { route: "Berhampur Trading Yard", dist: 175, cost: 7800, truck: "6-Tyre 9T", time: "3.5 hrs" },
    { route: "Sambalpur Grain Corridor", dist: 280, cost: 12500, truck: "6-Tyre 9T", time: "6 hrs" },
    { route: "Bargarh Paddy Market", dist: 330, cost: 14800, truck: "10-Tyre 16T", time: "7 hrs" },
  ];

  // 4. Procurement Share (Vertical List + Donut Pie Chart)
  const procurementRequirements = [
    { entity: "Utkal Agro Commodities", crop: "Paddy (Swarna / Sona Masoori)", volume: 100, unit: "MT", type: "Rice Mill", color: "#16a34a" },
    { entity: "Kalinga Fresh Mandi", crop: "Tomato & Onion Lots", volume: 45, unit: "MT", type: "Wholesaler", color: "#d97706" },
    { entity: "Eastern Spices Export", crop: "Kandhamal Turmeric (Haldi)", volume: 25, unit: "MT", type: "Exporter", color: "#2563eb" },
    { entity: "Odisha Seed Producers", crop: "Certified Mustard (Rai)", volume: 15, unit: "MT", type: "FPO Agency", color: "#9333ea" },
  ];

  const procurementPieData = procurementRequirements.map((p) => ({
    name: p.entity.split(" ")[0],
    value: p.volume,
    color: p.color,
  }));

  const lastUpdatedText = cropRatesData?.updatedAt
    ? new Date(cropRatesData.updatedAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Live Auction";

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* 1. Header Bar: Personalized Greeting & Liquid Glass Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Bhubaneswar APMC Live Operations
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-editorial">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time agricultural pricing, verified trade corridors, and farm invoicing.
          </p>
        </div>

        <div className="flex items-center">
          <TooltipNavbar
            items={[
              {
                icon: <Plus className="h-full w-full" />,
                label: "Create Invoice",
                labelHasKeyword: ["C"],
                variant: "primary",
                href: "/invoices/new",
              },
              {
                icon: <Store className="h-full w-full" />,
                label: "Daily Rates",
                labelHasKeyword: ["R"],
                href: "/crop-rates",
              },
              {
                icon: <Truck className="h-full w-full" />,
                label: "Logistics",
                labelHasKeyword: ["L"],
                href: "/transportation",
              },
              {
                icon: <MapPin className="h-full w-full" />,
                label: "Farm Weather",
                labelHasKeyword: ["W"],
                href: "/weather",
              },
              {
                icon: <Sprout className="h-full w-full" />,
                label: "Season Planner",
                labelHasKeyword: ["P"],
                href: "/crop-planner",
              },
            ]}
            tooltipPosition="bottom"
            tooltipDelay={100}
          />
        </div>
      </div>

      {/* 2. SECTION: Today's Mandi Baselines (Blended Liquid Glass Container) */}
      <Card className="border-white/10 bg-card/40 dark:bg-black/30 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden">
        <CardHeader className="pb-4 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(20,122,77,0.5)]" />
                  <span>Today&apos;s Mandi Baselines (Bhubaneswar APMC)</span>
                </CardTitle>

                {/* Blended Liquid Glass Live Badge */}
                <div className="btn-liquid-glass inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span>Live Market</span>
                </div>
              </div>

              <CardDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>Wholesale modal auction rates across Odisha Mandis (acrop.app).</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/80 font-mono">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  {lastUpdatedText}
                </span>
              </CardDescription>
            </div>

            {/* Controls: Liquid Glass Live Sync & Link */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => refetchRates()}
                disabled={ratesFetching}
                className="btn-liquid-glass inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-foreground hover:text-white"
                title="Refresh live mandi rates from mandi auctions (acrop.app)"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 text-primary", ratesFetching && "animate-spin")} />
                <span>{ratesFetching ? "Syncing..." : "Sync Live Rates"}</span>
              </button>

              <Link
                href="/crop-rates"
                className="btn-liquid-glass inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-foreground hover:text-white"
              >
                <span>View all 40+ Odisha crops</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: 3D Tilt Crop Cards with Enlarged Liquid Glass Icons */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Commodity Modal Rates
                </span>
                <span className="text-[10px] font-medium text-primary">
                  Hover to 3D Tilt • Click for 7-day trend & profit forecast
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {staples.map((crop) => (
                  <Tilt key={crop.name} rotationFactor={8} isRevese className="cursor-pointer">
                    <div
                      onClick={() =>
                        setSelectedCropModal({
                          name: crop.name,
                          price: crop.price,
                          retail: crop.retail,
                          unit: crop.unit,
                        })
                      }
                      style={{ borderRadius: "16px" }}
                      className="group relative flex flex-col justify-between overflow-hidden border border-white/12 bg-gradient-to-b from-white/[0.07] via-white/[0.03] to-white/[0.01] backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_8px_24px_rgba(0,0,0,0.3)] hover:border-primary/50 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_12px_32px_rgba(0,0,0,0.45)] transition-all p-3.5 h-full"
                    >
                      {/* Top Specular Rim Highlight */}
                      <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

                      {/* Top: Enlarged Glass Icon Box & Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        {/* Enlarged Liquid Glass Icon Frame */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.02] border border-white/20 p-2 flex items-center justify-center flex-shrink-0 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_6px_16px_rgba(0,0,0,0.3)] group-hover:scale-105 group-hover:border-primary/40 transition-all duration-200">
                          <CropIcon image={crop.image} alt={crop.name} emoji={crop.emoji} />
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold rounded-full px-2 py-0.5 backdrop-blur-md",
                            crop.status === "up"
                              ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.25)]"
                              : crop.status === "down"
                                ? "text-rose-400 bg-rose-500/15 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.25)]"
                                : "text-muted-foreground bg-white/5 border-white/10"
                          )}
                        >
                          {crop.change !== "0" ? crop.change : "Stable"}
                        </Badge>
                      </div>

                      {/* Center: Crop Name & Retail Spread */}
                      <div className="mt-3 space-y-0.5">
                        <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate" title={crop.name}>
                          {crop.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Retail: <span className="font-semibold text-foreground">{crop.retail}/{crop.unit}</span>
                        </p>
                      </div>

                      {/* Bottom: Mandi Wholesale Price with AnimatedNumber */}
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-baseline justify-between">
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Wholesale</span>
                        <div className="text-sm font-extrabold text-foreground tabular-nums">
                          <AnimatedNumber
                            value={crop.priceNum}
                            prefix="₹"
                            springOptions={{ bounce: 0, duration: 1500 }}
                          />
                          <span className="text-[10px] font-normal text-muted-foreground">/{crop.unit}</span>
                        </div>
                      </div>
                    </div>
                  </Tilt>
                ))}
              </div>
            </div>

            {/* Right Column: Comparative Price Graph (Blended Liquid Glass Container) */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full bg-white/[0.03] dark:bg-black/25 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  Wholesale vs Retail Price Spread (₹/kg)
                </span>
                <span className="text-[11px] text-muted-foreground">Bhubaneswar Yard</span>
              </div>

              <div className="w-full h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mandiChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#888888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10, 10, 10, 0.9)",
                        backdropFilter: "blur(16px)",
                        borderColor: "rgba(255, 255, 255, 0.15)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Bar dataKey="wholesale" name="Wholesale Mandi" fill="#15803d" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1800} animationEasing="ease-out" />
                    <Bar dataKey="retail" name="Retail Baseline" fill="#d97706" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={2000} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. SECTION: 7-Day Market Volatility */}
      <Card className="border-white/10 bg-card/40 dark:bg-black/30 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden">
        <CardHeader className="pb-4 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(20,122,77,0.5)]" />
                <span>7-Day Rate Volatility & Market Trajectory</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Weekly price movement history for staple commodities across Odisha markets.
              </CardDescription>
            </div>
            <Link
              href="/rate-trends"
              className="btn-liquid-glass inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-foreground hover:text-white"
            >
              <span>View full 7-day charts</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Vertical Volatility Highlights */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Weekly Volatility Breakdown
              </span>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground">Top Weekly Gainer</span>
                    <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">Tomato (Bilati)</p>
                    <p className="text-xs text-muted-foreground">High institutional demand from Cuttack</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      <AnimatedNumber value={11.8} decimals={1} prefix="+" suffix="%" springOptions={{ bounce: 0, duration: 1800 }} />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">+₹4 / kg</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground">Weekly Value Drop</span>
                    <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400">Onion Big (Piaja)</p>
                    <p className="text-xs text-muted-foreground">Fresh Nasik arrivals into Bhubaneswar</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                      <AnimatedNumber value={-7.1} decimals={1} suffix="%" springOptions={{ bounce: 0, duration: 1800 }} />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">-₹4 / kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Weekly Price Trend */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full bg-white/[0.03] dark:bg-black/25 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.25)]">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                7-Day Price Fluctuation (₹/kg)
              </span>
              <div className="w-full h-56 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { day: "Mon", Potato: 26, Onion: 56, Tomato: 34 },
                      { day: "Tue", Potato: 26, Onion: 55, Tomato: 35 },
                      { day: "Wed", Potato: 27, Onion: 54, Tomato: 36 },
                      { day: "Thu", Potato: 27, Onion: 53, Tomato: 36 },
                      { day: "Fri", Potato: 28, Onion: 52, Tomato: 37 },
                      { day: "Sat", Potato: 28, Onion: 52, Tomato: 38 },
                      { day: "Today", Potato: 28, Onion: 52, Tomato: 38 },
                    ]}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#888888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10, 10, 10, 0.9)",
                        backdropFilter: "blur(16px)",
                        borderColor: "rgba(255, 255, 255, 0.15)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Bar dataKey="Potato" fill="#ca8a04" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Onion" fill="#e11d48" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Tomato" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. SECTION: Freight Corridors & 5. Procurement Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Freight Corridors */}
        <Card className="border-white/10 bg-card/40 dark:bg-black/30 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)]">
          <CardHeader className="pb-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span>Verified Freight Corridors</span>
              </CardTitle>
              <Link
                href="/transportation"
                className="btn-liquid-glass inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-foreground hover:text-white"
              >
                <span>Book Truck</span>
                <ArrowRight className="w-3 h-3 text-primary" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {freightCorridors.map((c) => (
              <div
                key={c.route}
                className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md"
              >
                <div>
                  <p className="text-xs font-bold text-foreground">{c.route}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {c.dist} km • {c.truck} • {c.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-foreground">₹{c.cost.toLocaleString("en-IN")}</p>
                  <span className="text-[10px] text-emerald-500 font-semibold">Ready</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Procurement Requirements */}
        <Card className="border-white/10 bg-card/40 dark:bg-black/30 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)]">
          <CardHeader className="pb-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Institutional Crop Buyers</span>
              </CardTitle>
              <Link
                href="/customers"
                className="btn-liquid-glass inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-foreground hover:text-white"
              >
                <span>View Buyers</span>
                <ArrowRight className="w-3 h-3 text-primary" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {procurementRequirements.map((p) => (
              <div
                key={p.entity}
                className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md"
              >
                <div>
                  <p className="text-xs font-bold text-foreground">{p.entity}</p>
                  <p className="text-[11px] text-muted-foreground">{p.crop}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-foreground">
                    {p.volume} {p.unit}
                  </p>
                  <span className="text-[10px] text-primary font-semibold">{p.type}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 6. Farm Billing & Financial Overview */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Farm Billing & Financial Overview</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Receivables tracking, paid ratios, and customer ledger balances.
            </p>
          </div>
          <Link
            href="/invoices"
            className="btn-liquid-glass inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-foreground hover:text-white"
          >
            <span>Invoices ledger</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
          </Link>
        </div>
        <StatsCards />
      </div>

      {/* 7. Recent Invoices Ledger */}
      <RecentTransactions />

      {/* Commodity Intelligence Modal (Price History & Next-Season Profitability) */}
      {selectedCropModal && (
        <CropDetailModal
          isOpen={!!selectedCropModal}
          onClose={() => setSelectedCropModal(null)}
          cropName={selectedCropModal.name}
          currentPrice={selectedCropModal.price}
          retailPrice={selectedCropModal.retail}
          unit={selectedCropModal.unit}
        />
      )}
    </div>
  );
}
