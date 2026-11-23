"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { CropDetailModal } from "@/components/crops/crop-detail-modal";
import { AnimatedNumber } from "@/components/core/animated-number";
import { Tilt } from "@/components/core/tilt";
import { Chart3DContainer, ThreeDBar, ThreeDChartDefs } from "@/components/ui/chart-3d";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
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
  CloudSun,
  Warehouse,
} from "lucide-react";
import { TooltipNavbar } from "@/components/ui/tooltip-navbar";
import { ViewOnMap } from "@/components/ui/view-on-map";
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

// Baseline Mandi staples with authentic high-definition crop imagery & 3D emojis
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
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=320&h=320&fit=crop&crop=center&auto=format&q=85",
    accentGrad: "from-amber-500/20 via-amber-900/10 to-transparent",
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
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=320&h=320&fit=crop&crop=center&auto=format&q=85",
    accentGrad: "from-purple-500/20 via-pink-950/10 to-transparent",
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
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=320&h=320&fit=crop&crop=center&auto=format&q=85",
    accentGrad: "from-rose-500/25 via-red-950/10 to-transparent",
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
    image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=320&h=320&fit=crop&crop=center&auto=format&q=85",
    accentGrad: "from-emerald-500/25 via-teal-950/10 to-transparent",
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
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=320&h=320&fit=crop&crop=center&auto=format&q=85",
    accentGrad: "from-violet-500/20 via-indigo-950/10 to-transparent",
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
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=320&h=320&fit=crop&crop=center&auto=format&q=85",
    accentGrad: "from-yellow-600/20 via-amber-950/10 to-transparent",
  },
];

// High-definition Liquid Glass Crop Avatar with 3D Micro-Emoji Badge
function CropIcon({
  image,
  alt,
  emoji,
  accentGrad = "from-emerald-500/20 to-transparent",
}: {
  image: string;
  alt: string;
  emoji: string;
  accentGrad?: string;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center p-1 select-none">
      {/* Specular Liquid Glass Ambient Frame */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-br border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.35),0_6px_20px_rgba(0,0,0,0.4)] backdrop-blur-xl group-hover:scale-105 group-hover:border-primary/50 transition-all duration-300",
          accentGrad
        )}
      />

      {/* Top Specular Glint */}
      <div className="pointer-events-none absolute inset-x-2 top-0.5 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      {/* Studio Photo */}
      {!hasError ? (
        <img
          src={image}
          alt={alt}
          onError={() => setHasError(true)}
          className="relative z-10 w-full h-full object-cover rounded-xl shadow-md transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        /* 3D Emoji Avatar Fallback */
        <div className="relative z-10 w-full h-full flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-md">
          <span className="text-3xl select-none leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)] group-hover:scale-115 transition-transform duration-200">
            {emoji}
          </span>
        </div>
      )}

      {/* 3D Micro-Emoji Corner Badge */}
      <div
        className="absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full bg-[#0b100d]/90 backdrop-blur-md border border-white/25 shadow-[0_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center text-xs select-none group-hover:scale-110 transition-transform"
        title={alt}
      >
        <span>{emoji}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, businessProfile } = useAuth();
  const {
    currentRegionDef,
    selectedState,
    selectedPlaceId,
    selectedMandiObj,
    setRegionAndPlace,
  } = useLanguage();
  const displayName = user?.name || user?.full_name || businessProfile?.business_name || "Kisan";

  // Live Mandi Query Hook (automatically reflects active State/Region)
  const {
    data: cropRatesData,
    isFetching: ratesFetching,
    refetch: refetchRates,
  } = useCropRates(selectedState || currentRegionDef?.name);

  const [selectedCropModal, setSelectedCropModal] = useState<{
    name: string;
    price: number | string;
    retail?: string;
    unit?: string;
  } | null>(null);

  // Live Clock & Real-time Date
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime
    ? currentTime.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Live Date";

  const formattedTime = currentTime
    ? currentTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "--:--:--";

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
        const rawPrice = match.priceNum || base.fallbackPrice;
        // Clean round wholesale price to 1 decimal place to eliminate floating point glitches
        const priceNum = Math.round(rawPrice * 10) / 10;
        const retailNum = parseInt(match.retailPrice?.replace(/₹|,/g, ""), 10) || Math.round(priceNum * 1.3);
        
        // Accurate clean difference calculation without IEEE 754 precision artifacts
        const rawDiff = priceNum - base.fallbackPrice;
        const cleanDiff = Math.round(rawDiff * 10) / 10;
        const absDiff = Math.abs(cleanDiff);
        const formattedDiff = absDiff % 1 === 0 ? absDiff.toFixed(0) : absDiff.toFixed(1);
        
        const changeStr =
          cleanDiff > 0 ? `+₹${formattedDiff}` : cleanDiff < 0 ? `-₹${formattedDiff}` : "0";
        const status = cleanDiff > 0 ? "up" : cleanDiff < 0 ? "down" : "stable";

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
    { route: "Cuttack Mandi Hub", dist: 28, cost: 1900, truck: "Pickup 1.5T", time: "45 mins", emoji: "🛻" },
    { route: "Puri Coastal Market", dist: 60, cost: 3100, truck: "Tata 407 3.5T", time: "1.5 hrs", emoji: "🚚" },
    { route: "Berhampur Trading Yard", dist: 175, cost: 7800, truck: "6-Tyre 9T", time: "3.5 hrs", emoji: "🚛" },
    { route: "Sambalpur Grain Corridor", dist: 280, cost: 12500, truck: "6-Tyre 9T", time: "6 hrs", emoji: "🚛" },
    { route: "Bargarh Paddy Market", dist: 330, cost: 14800, truck: "10-Tyre 16T", time: "7 hrs", emoji: "🚛" },
  ];

  // 4. Procurement Share (Vertical List + Donut Pie Chart)
  const procurementRequirements = [
    { entity: "Utkal Agro Commodities", crop: "Paddy (Swarna / Sona Masoori)", volume: 100, unit: "MT", type: "Rice Mill", color: "#16a34a", emoji: "🌾" },
    { entity: "Kalinga Fresh Mandi", crop: "Tomato & Onion Lots", volume: 45, unit: "MT", type: "Wholesaler", color: "#d97706", emoji: "🍅" },
    { entity: "Eastern Spices Export", crop: "Kandhamal Turmeric (Haldi)", volume: 25, unit: "MT", type: "Exporter", color: "#2563eb", emoji: "🟡" },
    { entity: "Odisha Seed Producers", crop: "Certified Mustard (Rai)", volume: 15, unit: "MT", type: "FPO Agency", color: "#9333ea", emoji: "🌼" },
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
    <div className="space-y-8 pb-12 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
      {/* 1. Header Bar: Real-Time Date, Live Clock & User Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Live • {selectedMandiObj ? selectedMandiObj.name : currentRegionDef.primaryHubs[0]}
            </span>
          </div>

          {/* Large Date with Live Updating Time Pill */}
          <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-editorial drop-shadow-md">
              {formattedDate}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur-xl text-xs sm:text-sm font-mono font-bold text-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.2)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Welcome back */}
          <p className="text-xs sm:text-sm text-foreground/90 font-medium mt-1.5 drop-shadow-sm">
            Welcome back, <strong className="text-foreground font-bold">{displayName}</strong>
          </p>
        </div>

        <div className="flex items-center">
          <TooltipNavbar
            items={[
              {
                icon: <Plus className="h-full w-full" />,
                label: "Invoice",
                labelHasKeyword: ["I"],
                variant: "primary",
                href: "/invoices/new",
              },
              {
                icon: <Store className="h-full w-full" />,
                label: "Rates",
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
                icon: <Warehouse className="h-full w-full" />,
                label: "Cold Storage",
                labelHasKeyword: ["C"],
                href: "/cold-storage",
              },
              {
                icon: <MapPin className="h-full w-full" />,
                label: "Weather",
                labelHasKeyword: ["W"],
                href: "/weather",
              },
              {
                icon: <Sprout className="h-full w-full" />,
                label: "Planner",
                labelHasKeyword: ["P"],
                href: "/crop-planner",
              },
            ]}
            tooltipPosition="bottom"
            tooltipDelay={100}
          />
        </div>
      </div>

      {/* 2. SECTION: Mandi Rates */}
      <Card className="rounded-2xl border border-white/12 dark:border-white/[0.09] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] dark:from-white/[0.06] dark:via-black/25 dark:to-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_16px_40px_rgba(0,0,0,0.35)] overflow-hidden">
        <CardHeader className="pb-4 border-b border-white/10 dark:border-white/[0.07]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(20,122,77,0.5)]" />
                  <span>Mandi Rates</span>
                </CardTitle>

                <div className="btn-liquid-glass inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live</span>
                </div>
              </div>

              <CardDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>APMC wholesale prices</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/80 font-mono">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  {lastUpdatedText}
                </span>
              </CardDescription>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => refetchRates()}
                disabled={ratesFetching}
                className="btn-liquid-glass inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-foreground hover:text-white"
                title="Refresh rates"
              >
                <RefreshCw className={cn("w-3 h-3 text-primary", ratesFetching && "animate-spin")} />
                <span>{ratesFetching ? "Syncing..." : "Sync"}</span>
              </button>

              <Link
                href="/crop-rates"
                className="btn-liquid-glass inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-foreground hover:text-white"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3 text-primary" />
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-w-0">
            {/* Left Column: Crop Cards */}
            <div className="lg:col-span-6 space-y-3 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Modal Rates
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

                      {/* Top: Glass Icon & Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <CropIcon
                          image={crop.image}
                          alt={crop.name}
                          emoji={crop.emoji}
                          accentGrad={crop.accentGrad}
                        />

                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold rounded-full px-2 py-0.5 backdrop-blur-md whitespace-nowrap tabular-nums shrink-0",
                            crop.status === "up"
                              ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30"
                              : crop.status === "down"
                                ? "text-rose-400 bg-rose-500/15 border-rose-500/30"
                                : "text-muted-foreground bg-white/5 border-white/10"
                          )}
                        >
                          {crop.change !== "0" ? crop.change : "Stable"}
                        </Badge>
                      </div>

                      {/* Center: Crop Name & Retail */}
                      <div className="mt-3 space-y-0.5">
                        <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate" title={crop.name}>
                          {crop.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Retail: <span className="font-medium text-foreground">{crop.retail}/{crop.unit}</span>
                        </p>
                      </div>

                      {/* Bottom: Modal Price */}
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-baseline justify-between">
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

            {/* Right Column: Comparative Price Graph */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full min-w-0">
              <Chart3DContainer
                title="Price Spread (₹/kg)"
                subtitle="Wholesale vs Retail"
                icon={<BarChart2 className="w-4 h-4 text-emerald-400" />}
              >
                <div className="w-full h-64 pt-2 min-w-0 overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mandiChartData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                      <ThreeDChartDefs />
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
                      <Bar dataKey="wholesale" name="Wholesale" fill="url(#threed-emerald)" shape={<ThreeDBar />} isAnimationActive={true} animationDuration={1800} animationEasing="ease-out" />
                      <Bar dataKey="retail" name="Retail" fill="url(#threed-amber)" shape={<ThreeDBar />} isAnimationActive={true} animationDuration={2000} animationEasing="ease-out" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Chart3DContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather & Radar */}
      <Card className="border-white/10 bg-card/40 dark:bg-black/30 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden">
        <CardHeader className="pb-4 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(20,122,77,0.5)]" />
                  <span>Weather & Radar</span>
                </CardTitle>
                <div className="btn-liquid-glass inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Wind &amp; Rain Radar</span>
                </div>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Satellite precipitation & wind radar
              </CardDescription>
            </div>
            <Link
              href="/weather"
              className="btn-liquid-glass inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-foreground hover:text-white"
            >
              <span>Details</span>
              <ArrowRight className="w-3 h-3 text-primary" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ViewOnMap
            key={`${selectedMandiObj.id}-${selectedState}`}
            locationName={selectedMandiObj.name}
            address={selectedMandiObj.address}
            lat={selectedMandiObj.lat}
            lon={selectedMandiObj.lon}
            state={selectedState}
            onLocationChange={(mandi) => {
              setRegionAndPlace(mandi.state, mandi.id);
            }}
            className="w-full h-[460px] sm:h-[500px]"
          />
        </CardContent>
      </Card>

      {/* 3. SECTION: Price Trends */}
      <Card className="border-white/10 bg-card/40 dark:bg-black/30 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden">
        <CardHeader className="pb-4 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(20,122,77,0.5)]" />
                <span>Price Trends</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                7-day market price movement
              </CardDescription>
            </div>
            <Link
              href="/rate-trends"
              className="btn-liquid-glass inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-foreground hover:text-white"
            >
              <span>Details</span>
              <ArrowRight className="w-3 h-3 text-primary" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-w-0">
            {/* Left Column: Vertical Volatility Highlights */}
            <div className="lg:col-span-5 space-y-3 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Market Movers
              </span>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-between hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/25 via-red-950/20 to-transparent border border-rose-500/35 p-1 shrink-0 shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=160&h=160&fit=crop&crop=center&auto=format&q=85"
                        alt="Tomato"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black/85 border border-white/20 flex items-center justify-center text-[10px] shadow-sm select-none">
                        🍅
                      </span>
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-semibold text-emerald-400">Top Gainer</span>
                      <p className="text-sm font-extrabold text-foreground truncate">Tomato</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="text-base font-black text-emerald-500 dark:text-emerald-400">
                      <AnimatedNumber value={11.8} decimals={1} prefix="+" suffix="%" springOptions={{ bounce: 0, duration: 1800 }} />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">+₹4/kg</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-between hover:border-rose-500/40 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/25 via-pink-950/20 to-transparent border border-purple-500/35 p-1 shrink-0 shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=160&h=160&fit=crop&crop=center&auto=format&q=85"
                        alt="Onion"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black/85 border border-white/20 flex items-center justify-center text-[10px] shadow-sm select-none">
                        🧅
                      </span>
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-semibold text-rose-400">Top Loser</span>
                      <p className="text-sm font-extrabold text-foreground truncate">Onion</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="text-base font-black text-rose-500 dark:text-rose-400">
                      <AnimatedNumber value={-7.1} decimals={1} suffix="%" springOptions={{ bounce: 0, duration: 1800 }} />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">-₹4/kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Weekly Price Trend */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full min-w-0">
              <Chart3DContainer
                title="Weekly Trends"
                subtitle="7-day fluctuation"
                icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
              >
                <div className="w-full h-56 pt-2 min-w-0 overflow-hidden">
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
                      margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
                    >
                      <ThreeDChartDefs />
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
                      <Bar dataKey="Potato" name="Potato" fill="url(#threed-amber)" shape={<ThreeDBar />} />
                      <Bar dataKey="Onion" name="Onion" fill="url(#threed-rose)" shape={<ThreeDBar />} />
                      <Bar dataKey="Tomato" name="Tomato" fill="url(#threed-emerald)" shape={<ThreeDBar />} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Chart3DContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Freight Logistics & 5. Crop Buyers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-w-0">
        {/* Freight Logistics */}
        <Card className="rounded-2xl border border-white/12 dark:border-white/[0.09] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] dark:from-white/[0.06] dark:via-black/25 dark:to-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden min-w-0">
          <CardHeader className="pb-3 border-b border-white/10 dark:border-white/[0.07]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span>Freight Logistics</span>
              </CardTitle>
              <Link
                href="/transportation"
                className="btn-liquid-glass inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-foreground hover:text-white"
              >
                <span>Book →</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {freightCorridors.map((c) => (
              <div
                key={c.route}
                className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-all backdrop-blur-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-950/20 to-transparent border border-emerald-500/30 flex items-center justify-center text-lg shadow-sm shrink-0 select-none">
                    {c.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{c.route}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {c.dist} km • {c.truck} • {c.time}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <p className="text-xs font-mono font-bold text-foreground">₹{c.cost.toLocaleString("en-IN")}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">Ready</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Crop Buyers */}
        <Card className="rounded-2xl border border-white/12 dark:border-white/[0.09] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] dark:from-white/[0.06] dark:via-black/25 dark:to-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden min-w-0">
          <CardHeader className="pb-3 border-b border-white/10 dark:border-white/[0.07]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Crop Buyers</span>
              </CardTitle>
              <Link
                href="/customers"
                className="btn-liquid-glass inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-foreground hover:text-white"
              >
                <span>View All →</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {procurementRequirements.map((p) => (
              <div
                key={p.entity}
                className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-all backdrop-blur-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-yellow-950/20 to-transparent border border-amber-500/30 flex items-center justify-center text-lg shadow-sm shrink-0 select-none">
                    {p.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{p.entity}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{p.crop}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <p className="text-xs font-mono font-bold text-foreground">
                    {p.volume} {p.unit}
                  </p>
                  <span className="text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full border border-primary/25">{p.type}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 6. Financial Overview */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Financial Overview</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Invoices & receivables summary
            </p>
          </div>
          <Link
            href="/invoices"
            className="btn-liquid-glass inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-foreground hover:text-white"
          >
            <span>Invoices →</span>
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
