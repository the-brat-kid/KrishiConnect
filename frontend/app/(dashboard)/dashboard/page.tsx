"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { CropDetailModal } from "@/components/crops/crop-detail-modal";
import { FreightDetailModal, FreightCorridorDetail } from "@/components/logistics/freight-detail-modal";
import { BuyerDetailModal, CropBuyerDetail } from "@/components/buyers/buyer-detail-modal";
import { EquipmentDetailModal } from "@/components/equipment/equipment-detail-modal";
import { EQUIPMENT_CATALOG } from "@/lib/equipment-data";
import { EquipmentItem } from "@/types/equipment";
import { ColdStorageDetailModal } from "@/components/cold-storage/cold-storage-detail-modal";
import { BookingModal as ColdStorageBookingModal } from "@/components/cold-storage/booking-modal";
import { ColdStorageFacility } from "@/types/cold-storage";
import { useToast } from "@/components/ui/use-toast";
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
  Tractor,
  ThermometerSnowflake,
  ShieldCheck,
  ChevronRight,
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

// Baseline Mandi staples with authentic high-definition crop imagery
const BASE_STAPLES = [
  {
    id: "potato",
    name: "Potato (Alu)",
    fallbackPrice: 20,
    unit: "kg",
    fallbackRetail: "₹26",
    change: "+₹1",
    status: "up",
    image: "/crops/potato.jpg",
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
    image: "/crops/onion.jpg",
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
    image: "/crops/tomato.jpg",
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
    image: "/crops/green-chilli.jpg",
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
    image: "/crops/brinjal.jpg",
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
    image: "/crops/ginger.jpg",
    accentGrad: "from-yellow-600/20 via-amber-950/10 to-transparent",
  },
];

// High-definition Liquid Glass Crop Avatar
function CropIcon({
  image,
  alt,
  accentGrad = "from-emerald-500/20 to-transparent",
}: {
  image: string;
  alt: string;
  emoji?: string;
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
        /* Minimalist Icon Fallback */
        <div className="relative z-10 w-full h-full flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-md">
          <Sprout className="w-7 h-7 text-emerald-400" />
        </div>
      )}
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
  const [selectedFreightModal, setSelectedFreightModal] = useState<FreightCorridorDetail | null>(null);
  const [selectedBuyerModal, setSelectedBuyerModal] = useState<CropBuyerDetail | null>(null);
  const [selectedEquipmentModal, setSelectedEquipmentModal] = useState<EquipmentItem | null>(null);
  const [selectedColdStorageModal, setSelectedColdStorageModal] = useState<ColdStorageFacility | null>(null);
  const [coldStorageBookingFacility, setColdStorageBookingFacility] = useState<ColdStorageFacility | null>(null);
  const { toast } = useToast();

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

  const openCropModalByName = (cropQuery: string) => {
    const q = cropQuery.toLowerCase();
    const matchedStaple = staples.find(
      (s) => s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
    if (matchedStaple) {
      setSelectedCropModal({
        name: matchedStaple.name,
        price: matchedStaple.price,
        retail: matchedStaple.retail,
        unit: matchedStaple.unit,
      });
      return;
    }
    setSelectedCropModal({
      name: cropQuery,
      price: q.includes("onion") ? "₹52" : q.includes("tomato") ? "₹38" : "₹28",
      retail: q.includes("onion") ? "₹65" : q.includes("tomato") ? "₹48" : "₹35",
      unit: "kg",
    });
  };

  // 3. Freight Corridors (Vertical List + Detailed Dispatch Modal)
  const freightCorridors: FreightCorridorDetail[] = [
    {
      id: "bbsr-cuttack",
      route: "Cuttack Mandi Hub",
      origin: "Bhubaneswar Unit-1 Mandi",
      destination: "Cuttack Malgodown APMC",
      region: "East",
      dist: 28,
      cost: 1900,
      truck: "Pickup 1.5T",
      time: "45 mins",
      highway: "NH-16",
      commodity: "Fresh Vegetables, Tomato, Brinjal & Green Chilli",
    },
    {
      id: "bbsr-puri",
      route: "Puri Coastal Market",
      origin: "Bhubaneswar Agro Hub",
      destination: "Puri / Pipili APMC Yard",
      region: "East",
      dist: 60,
      cost: 3100,
      truck: "Tata 407 3.5T",
      time: "1.5 hrs",
      highway: "NH-316",
      commodity: "Coconut, Paddy, Coastal Produce & Vegetables",
    },
    {
      id: "bbsr-berhampur",
      route: "Berhampur Trading Yard",
      origin: "Bhubaneswar / Khordha",
      destination: "Berhampur APMC, Ganjam",
      region: "East",
      dist: 175,
      cost: 7800,
      truck: "6-Tyre 9T",
      time: "3.5 hrs",
      highway: "NH-16",
      commodity: "Groundnut, Chillies, Turmeric & Bulk Vegetables",
    },
    {
      id: "cuttack-sambalpur",
      route: "Sambalpur Grain Corridor",
      origin: "Cuttack / Angul Hub",
      destination: "Sambalpur APMC Mandi",
      region: "East",
      dist: 280,
      cost: 12500,
      truck: "6-Tyre 9T",
      time: "6 hrs",
      highway: "NH-55",
      commodity: "Swarna Paddy, Pulses, Oilseeds & Grain Sacks",
    },
    {
      id: "bargarh-paddy",
      route: "Bargarh Paddy Market",
      origin: "Bhubaneswar / Cuttack Hub",
      destination: "Bargarh Rice Bowl APMC",
      region: "East",
      dist: 330,
      cost: 14800,
      truck: "10-Tyre 16T",
      time: "7 hrs",
      highway: "NH-55 / NH-53",
      commodity: "Bulk Paddy Consignments, Custom Milled Rice & Maize",
    },
  ];

  // 4. Procurement Share (Vertical List + Detailed Buyer Modal)
  const procurementRequirements: Array<{
    entity: string;
    crop: string;
    volume: number;
    unit: string;
    type: string;
    color: string;
    detail: CropBuyerDetail;
  }> = [
    {
      entity: "Utkal Agro Commodities",
      crop: "Paddy (Swarna / Sona Masoori)",
      volume: 100,
      unit: "MT",
      type: "Rice Mill",
      color: "#16a34a",
      detail: {
        id: "buyer-utkal",
        businessName: "Utkal Agro Commodities & Mills",
        contactPerson: "R. K. Mohapatra",
        category: "Rice Mill",
        cropsNeeded: ["Paddy (Swarna)", "Sona Masoori", "Basmati Rice", "Broken Rice"],
        volumeRequirement: "100 – 500 MT / Month",
        location: "Cuttack / Bhubaneswar Belt",
        state: "Odisha",
        paymentTerms: "Immediate RTGS / 3-day bank settlement",
        verified: true,
        activeDeal: "Urgent demand for 100 MT Swarna & Sona Masoori Paddy at mill gate.",
        contactPhone: "+91 94370 11220",
      },
    },
    {
      entity: "Kalinga Fresh Mandi",
      crop: "Tomato & Onion Lots",
      volume: 45,
      unit: "MT",
      type: "Wholesaler",
      color: "#d97706",
      detail: {
        id: "buyer-kalinga",
        businessName: "Kalinga Fresh Vegetable Aggregators",
        contactPerson: "Bikash Behera",
        category: "Wholesaler",
        cropsNeeded: ["Tomato", "Onion Big", "Potato", "Green Chilli"],
        volumeRequirement: "45 MT / Week (5–15 MT Daily)",
        location: "Unit-1 Mandi, Bhubaneswar",
        state: "Odisha",
        paymentTerms: "Spot Cash / Same-day Mandi UPI settlement",
        verified: true,
        activeDeal: "Buying daily fresh A-grade Tomato & Onion lots directly from farm gate.",
        contactPhone: "+91 98610 44321",
      },
    },
    {
      entity: "Eastern Spices Export",
      crop: "Kandhamal Turmeric (Haldi)",
      volume: 25,
      unit: "MT",
      type: "Exporter",
      color: "#2563eb",
      detail: {
        id: "buyer-eastern",
        businessName: "Eastern Spices & Turmeric Exporters",
        contactPerson: "Debabrata Nayak",
        category: "Exporter",
        cropsNeeded: ["Kandhamal Turmeric (Haldi)", "Dry Ginger", "Black Pepper", "Chillies"],
        volumeRequirement: "25 – 100 MT / Season",
        location: "Berhampur & Kandhamal Hub",
        state: "Odisha",
        paymentTerms: "Letter of Credit / Bank guarantee for export lots",
        verified: true,
        activeDeal: "Procuring high-curcumin Kandhamal Haldi fingers with GI documentation.",
        contactPhone: "+91 94375 77890",
      },
    },
    {
      entity: "Odisha Seed Producers",
      crop: "Certified Mustard (Rai)",
      volume: 15,
      unit: "MT",
      type: "FPO Agency",
      color: "#9333ea",
      detail: {
        id: "buyer-seed",
        businessName: "Odisha Seed Producers Syndicate",
        contactPerson: "Ashok Pradhan",
        category: "FPO Agency",
        cropsNeeded: ["Certified Mustard (Rai)", "Groundnut", "Green Gram (Moong)"],
        volumeRequirement: "15 – 60 MT / Batch",
        location: "Sambalpur & Khordha FPO Cluster",
        state: "Odisha",
        paymentTerms: "20% Advance + Balance on lab moisture clearance",
        verified: true,
        activeDeal: "Direct FPO procurement for certified Rabi Mustard & Oilseed lots.",
        contactPhone: "+91 94372 33445",
      },
    },
  ];

  const procurementPieData = procurementRequirements.map((p) => ({
    name: p.entity.split(" ")[0],
    value: p.volume,
    color: p.color,
  }));

  // 5. Featured Farm Equipment Fleet (KhetiSetu Network) linked to full EQUIPMENT_CATALOG
  const featuredEquipment = [
    {
      name: "Mahindra 575 DI XP Plus",
      category: "47 HP Tractor",
      location: "Bhubaneswar Hub",
      rate: "₹850/hr • ₹1,350/acre",
      status: "Available",
      catalogItem: EQUIPMENT_CATALOG.find((e) => e.id === "eq-tr-01") || EQUIPMENT_CATALOG[0],
    },
    {
      name: "Preet 987 Self-Propelled Harvester",
      category: "101 HP Combine",
      location: "Cuttack Sadar Hub",
      rate: "₹2,600/hr • ₹2,800/acre",
      status: "Available",
      catalogItem: EQUIPMENT_CATALOG.find((e) => e.id === "eq-hv-02") || EQUIPMENT_CATALOG[1],
    },
    {
      name: "AgriBot 10L Precision Spray Drone",
      category: "DGCA Certified UAV",
      location: "Khordha Rural Fleet",
      rate: "₹450/acre",
      status: "Available",
      catalogItem: EQUIPMENT_CATALOG.find((e) => e.id === "eq-sp-01") || EQUIPMENT_CATALOG[2],
    },
  ];

  // 6. Featured Cold Storage Agro Vaults with Full Telemetry
  const featuredColdStorage: Array<{
    name: string;
    location: string;
    temp: string;
    capacity: string;
    rate: string;
    facility: ColdStorageFacility;
  }> = [
    {
      name: "Taj Agro Mega Cold Storage",
      location: "Agra, Uttar Pradesh",
      temp: "2.8°C",
      capacity: "8,400 Qtl Available",
      rate: "₹2.2/qtl/day",
      facility: {
        id: "cs-up-1",
        name: "Taj Agro Mega Cold Storage",
        location: "Khandari APMC Agro Corridor",
        district: "Agra",
        state: "Uttar Pradesh",
        pincode: "282002",
        total_capacity_quintals: 25000,
        available_capacity_quintals: 8400,
        temp_min_celsius: 2.0,
        temp_max_celsius: 4.0,
        current_temp_celsius: 2.8,
        humidity_percentage: 90,
        daily_rate_per_quintal: 2.2,
        suitable_crops: ["Potato", "Carrot", "Garlic", "Onion"],
        contact_phone: "+91 94120 11223",
        has_backup_power: true,
        has_cctv: true,
        has_humidity_control: true,
        is_active: true,
      },
    },
    {
      name: "Sahyadri Agro Cold Vault",
      location: "Nashik, Maharashtra",
      temp: "1.5°C",
      capacity: "5,200 Qtl Available",
      rate: "₹2.8/qtl/day",
      facility: {
        id: "cs-mh-1",
        name: "Sahyadri Agro Cold Vault & Reefer",
        location: "Mohadi Grape & Onion Hub, Dindori",
        district: "Nashik",
        state: "Maharashtra",
        pincode: "422206",
        total_capacity_quintals: 18000,
        available_capacity_quintals: 5200,
        temp_min_celsius: 0.0,
        temp_max_celsius: 4.5,
        current_temp_celsius: 1.5,
        humidity_percentage: 92,
        daily_rate_per_quintal: 2.8,
        suitable_crops: ["Grapes", "Onion", "Pomegranate", "Tomato"],
        contact_phone: "+91 98220 33445",
        has_backup_power: true,
        has_cctv: true,
        has_humidity_control: true,
        is_active: true,
      },
    },
    {
      name: "Banaskantha Agro Chain",
      location: "Deesa, Gujarat",
      temp: "3.2°C",
      capacity: "11,200 Qtl Available",
      rate: "₹2.1/qtl/day",
      facility: {
        id: "cs-gj-1",
        name: "Banaskantha Mega Agri Cold Chain",
        location: "Deesa Highway Agro Park",
        district: "Banaskantha",
        state: "Gujarat",
        pincode: "385535",
        total_capacity_quintals: 30000,
        available_capacity_quintals: 11200,
        temp_min_celsius: 2.0,
        temp_max_celsius: 5.0,
        current_temp_celsius: 3.2,
        humidity_percentage: 88,
        daily_rate_per_quintal: 2.1,
        suitable_crops: ["Potato", "Castor", "Mustard", "Groundnut"],
        contact_phone: "+91 97240 55667",
        has_backup_power: true,
        has_cctv: true,
        has_humidity_control: true,
        is_active: true,
      },
    },
  ];

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
                icon: <Tractor className="h-full w-full" />,
                label: "Equipment",
                labelHasKeyword: ["E"],
                href: "/equipment",
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
                      <Bar
                        dataKey="wholesale"
                        name="Wholesale"
                        fill="url(#threed-emerald)"
                        shape={<ThreeDBar />}
                        className="cursor-pointer"
                        onClick={(entry: any) => entry?.name && openCropModalByName(String(entry.name))}
                        isAnimationActive={true}
                        animationDuration={1800}
                        animationEasing="ease-out"
                      />
                      <Bar
                        dataKey="retail"
                        name="Retail"
                        fill="url(#threed-amber)"
                        shape={<ThreeDBar />}
                        className="cursor-pointer"
                        onClick={(entry: any) => entry?.name && openCropModalByName(String(entry.name))}
                        isAnimationActive={true}
                        animationDuration={2000}
                        animationEasing="ease-out"
                      />
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
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openCropModalByName("Tomato")}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openCropModalByName("Tomato")}
                  className="cursor-pointer group p-3.5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-between hover:border-emerald-500/40 hover:bg-white/[0.06] transition-all"
                  title="Click for Tomato price history and profitability breakdown"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/25 via-red-950/20 to-transparent border border-rose-500/35 p-1 shrink-0 shadow-md">
                      <img
                        src="/crops/tomato.jpg"
                        alt="Tomato"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-semibold text-emerald-400">Top Gainer</span>
                      <p className="text-sm font-extrabold text-foreground truncate group-hover:text-emerald-400 transition-colors">Tomato</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-500 dark:text-emerald-400">
                        <AnimatedNumber value={11.8} decimals={1} prefix="+" suffix="%" springOptions={{ bounce: 0, duration: 1800 }} />
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground">+₹4/kg</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openCropModalByName("Onion")}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openCropModalByName("Onion")}
                  className="cursor-pointer group p-3.5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-between hover:border-rose-500/40 hover:bg-white/[0.06] transition-all"
                  title="Click for Onion price history and profitability breakdown"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/25 via-pink-950/20 to-transparent border border-purple-500/35 p-1 shrink-0 shadow-md">
                      <img
                        src="/crops/onion.jpg"
                        alt="Onion"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-semibold text-rose-400">Top Loser</span>
                      <p className="text-sm font-extrabold text-foreground truncate group-hover:text-rose-400 transition-colors">Onion</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <div className="text-right">
                      <div className="text-base font-black text-rose-500 dark:text-rose-400">
                        <AnimatedNumber value={-7.1} decimals={1} suffix="%" springOptions={{ bounce: 0, duration: 1800 }} />
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground">-₹4/kg</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Weekly Price Trend */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full min-w-0">
              <Chart3DContainer
                title="Weekly Trends"
                subtitle="7-day fluctuation (click a bar or crop)"
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
                      <Legend
                        wrapperStyle={{ fontSize: "11px", paddingTop: "8px", cursor: "pointer" }}
                        onClick={(e: any) => e?.dataKey && openCropModalByName(String(e.dataKey))}
                      />
                      <Bar
                        dataKey="Potato"
                        name="Potato"
                        fill="url(#threed-amber)"
                        shape={<ThreeDBar />}
                        className="cursor-pointer"
                        onClick={() => openCropModalByName("Potato")}
                      />
                      <Bar
                        dataKey="Onion"
                        name="Onion"
                        fill="url(#threed-rose)"
                        shape={<ThreeDBar />}
                        className="cursor-pointer"
                        onClick={() => openCropModalByName("Onion")}
                      />
                      <Bar
                        dataKey="Tomato"
                        name="Tomato"
                        fill="url(#threed-emerald)"
                        shape={<ThreeDBar />}
                        className="cursor-pointer"
                        onClick={() => openCropModalByName("Tomato")}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Inspect Commodity:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {["Potato", "Onion", "Tomato"].map((cropName) => (
                      <button
                        key={cropName}
                        type="button"
                        onClick={() => openCropModalByName(cropName)}
                        className="btn-liquid-glass inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-foreground hover:text-emerald-400 transition-colors"
                      >
                        <span>{cropName}</span>
                        <ChevronRight className="w-3 h-3 text-emerald-400" />
                      </button>
                    ))}
                  </div>
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
                role="button"
                tabIndex={0}
                onClick={() => setSelectedFreightModal(c)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedFreightModal(c)}
                className="cursor-pointer group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-emerald-500/40 transition-all backdrop-blur-md"
                title={`Click for full freight breakdown on ${c.route}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-950/20 to-transparent border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shrink-0 select-none">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-emerald-400 transition-colors">{c.route}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {c.dist} km • {c.truck} • {c.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 pl-2">
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-foreground">₹{c.cost.toLocaleString("en-IN")}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">Ready</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
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
                role="button"
                tabIndex={0}
                onClick={() => setSelectedBuyerModal(p.detail)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedBuyerModal(p.detail)}
                className="cursor-pointer group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-amber-500/40 transition-all backdrop-blur-md"
                title={`Click to view buyer contact, terms & lot quote for ${p.entity}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-yellow-950/20 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0 select-none">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-amber-400 transition-colors">{p.entity}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{p.crop}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 pl-2">
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-foreground">
                      {p.volume} {p.unit}
                    </p>
                    <span className="text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full border border-primary/25">{p.type}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 5. Farm Equipment Fleet & Cold Storage Vaults */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-w-0">
        {/* Farm Equipment Fleet */}
        <Card className="rounded-2xl border border-white/12 dark:border-white/[0.09] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] dark:from-white/[0.06] dark:via-black/25 dark:to-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden min-w-0">
          <CardHeader className="pb-3 border-b border-white/10 dark:border-white/[0.07]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Tractor className="w-4 h-4 text-primary" />
                  <span>Farm Equipment Fleet</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  KhetiSetu verified machinery network
                </CardDescription>
              </div>
              <Link
                href="/equipment"
                className="btn-liquid-glass inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-foreground hover:text-white"
              >
                <span>Rent Fleet →</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {featuredEquipment.map((eq) => (
              <div
                key={eq.name}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedEquipmentModal(eq.catalogItem)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedEquipmentModal(eq.catalogItem)}
                className="cursor-pointer group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-emerald-500/40 transition-all backdrop-blur-md"
                title={`Click for technical specs & booking for ${eq.name}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-950/20 to-transparent border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shrink-0 select-none">
                    <Tractor className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-emerald-400 transition-colors">{eq.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {eq.category} • {eq.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 pl-2">
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-emerald-400">{eq.rate}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                      {eq.status}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cold Storage & Preservation Vaults */}
        <Card className="rounded-2xl border border-white/12 dark:border-white/[0.09] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] dark:from-white/[0.06] dark:via-black/25 dark:to-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden min-w-0">
          <CardHeader className="pb-3 border-b border-white/10 dark:border-white/[0.07]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-primary" />
                  <span>Cold Storage & Preservation</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Live chamber telemetry & vacancies
                </CardDescription>
              </div>
              <Link
                href="/cold-storage"
                className="btn-liquid-glass inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-foreground hover:text-white"
              >
                <span>Book Vault →</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {featuredColdStorage.map((cs) => (
              <div
                key={cs.name}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedColdStorageModal(cs.facility)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedColdStorageModal(cs.facility)}
                className="cursor-pointer group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-cyan-500/40 transition-all backdrop-blur-md"
                title={`Click for live chamber telemetry & booking for ${cs.name}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 via-cyan-950/20 to-transparent border border-blue-500/30 flex items-center justify-center text-cyan-400 shadow-sm shrink-0 select-none">
                    <ThermometerSnowflake className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-cyan-400 transition-colors">{cs.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {cs.location} • <span className="font-mono text-cyan-300 font-semibold">{cs.temp}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 pl-2">
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-foreground">{cs.rate}</p>
                    <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/25">
                      {cs.capacity}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
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

      {/* Freight Corridor Detail Modal */}
      <FreightDetailModal
        corridor={selectedFreightModal}
        isOpen={!!selectedFreightModal}
        onClose={() => setSelectedFreightModal(null)}
      />

      {/* Crop Buyer Detail Modal */}
      <BuyerDetailModal
        buyer={selectedBuyerModal}
        isOpen={!!selectedBuyerModal}
        onClose={() => setSelectedBuyerModal(null)}
      />

      {/* Equipment Fleet Detail & Booking Modal */}
      <EquipmentDetailModal
        equipment={selectedEquipmentModal}
        isOpen={!!selectedEquipmentModal}
        onClose={() => setSelectedEquipmentModal(null)}
        onBookSuccess={(payload) => {
          toast({
            title: "Equipment Reservation Confirmed",
            description: `${payload.equipmentName} booked for ${payload.bookingDate} in ${payload.village}.`,
          });
        }}
      />

      {/* Cold Storage Telemetry Detail Modal */}
      <ColdStorageDetailModal
        facility={selectedColdStorageModal}
        isOpen={!!selectedColdStorageModal}
        onClose={() => setSelectedColdStorageModal(null)}
        onBook={(fac) => setColdStorageBookingFacility(fac)}
      />

      {/* Cold Storage Booking Dialog */}
      <ColdStorageBookingModal
        facility={coldStorageBookingFacility}
        isOpen={!!coldStorageBookingFacility}
        onClose={() => setColdStorageBookingFacility(null)}
        onSuccess={() => {
          toast({
            title: "Cold Storage Chamber Reserved",
            description: "Chamber booking request submitted. Facility manager will contact you shortly.",
          });
        }}
      />
    </div>
  );
}
