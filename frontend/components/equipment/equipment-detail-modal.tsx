"use client";

import React, { useState, useMemo } from "react";
import {
  Tractor,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Phone,
  MapPin,
  Fuel,
  UserCheck,
  Layers,
  Sparkles,
  Zap,
  Gauge,
  Check,
  Wrench,
  ArrowRight,
  Calculator,
  Building2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { EquipmentItem, PricingUnit, EquipmentBookingPayload } from "@/types/equipment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EquipmentDetailModalProps {
  equipment: EquipmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookSuccess?: (payload: EquipmentBookingPayload) => void;
}

// Category display labels
const CATEGORY_NAMES: Record<EquipmentItem["category"], string> = {
  tractors: "Tractor",
  harvesters: "Combine Harvester",
  tillage: "Tillage & Land Prep",
  sowing: "Sowing & Planting",
  sprayers: "Sprayers & Agri Drone",
  irrigation: "Irrigation & Threshing",
};

export function EquipmentDetailModal({
  equipment,
  isOpen,
  onClose,
  onBookSuccess,
}: EquipmentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "calculator" | "booking">("specs");

  // Calculator state
  const [calcUnit, setCalcUnit] = useState<PricingUnit>("acre");
  const [calcUnits, setCalcUnits] = useState<number>(2);

  // Booking form state
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [village, setVillage] = useState("");
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [needsOperator, setNeedsOperator] = useState(true);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Machine specs generator based on category & model
  const categorySpecs = useMemo(() => {
    switch (equipment?.category) {
      case "tractors":
        return {
          implements: [
            "Rotavator (6-8 ft)",
            "Hydraulic Reversible MB Plough",
            "Seed Cum Fertilizer Drill",
            "Laser Land Leveler",
            "5-Tonne Tipping Trolley",
            "Multi-Crop Thresher",
          ],
          operations: [
            "Wetland Paddy Puddling with cage wheels",
            "Primary Deep Tillage for Rabi/Kharif crops",
            "Seedbed leveling and secondary cultivation",
            "Heavy farm transport and haulage",
          ],
          fuelBurn: "4.2 - 5.0 Litres/hr under normal tillage",
          hydraulics: "1500 - 2000 kg 3-Point Category II Linkage",
          bestSoil: "Alluvial, Clayey Loam, and Coastal Laterite soils",
        };
      case "harvesters":
        return {
          implements: [
            "14ft High-Speed Cutter Bar",
            "Rubber Track Under-carriage (Wet Fields)",
            "Tangential Threshing Rotor",
            "High-Discharge Hydraulic Grain Tank",
          ],
          operations: [
            "Wetland Monsoon Paddy harvesting without sinking",
            "Wheat, Soybean, and Mustard threshing & cleaning",
            "Grain recovery with < 1.2% shatter loss",
          ],
          fuelBurn: "8.5 - 10.5 Litres/Acre",
          hydraulics: "Independent hydrostatic ground drive",
          bestSoil: "Wet delta fields, submerged paddy basils, and dry wheat fields",
        };
      case "tillage":
        return {
          implements: [
            "Boron Steel L/C Blades",
            "Multi-speed heavy gearbox",
            "Laser transmitter with 400m range",
            "Automatic depth adjustment control",
          ],
          operations: [
            "Clod pulverization and stubble incorporation",
            "Field leveling saving 25-30% irrigation water",
            "Soil aeration and moisture conservation",
          ],
          fuelBurn: "Operated via tractor 540 RPM PTO drive",
          hydraulics: "Requires single/double spool hydraulic connection",
          bestSoil: "All agricultural soil profiles across Odisha & Pan-India",
        };
      case "sprayers":
        return {
          implements: [
            "DGCA Certified Autonomous Flight Controller",
            "Centrifugal Atomizer Spray Nozzles",
            "High-Precision Obstacle Avoidance Radar",
            "Fast-swap 16000mAh Smart Battery Packs",
          ],
          operations: [
            "Ultra-Low Volume (ULV) foliar nutrient spraying",
            "Nano Urea and Micronutrient mist application",
            "Targeted fungal and pest control in standing canopy",
          ],
          fuelBurn: "Zero Fuel (100% Electric Battery Powered)",
          hydraulics: "Covers 1 acre in 6 to 8 minutes with 90% water savings",
          bestSoil: "All crops: Paddy, Sugarcane, Cotton, Vegetables, and Orchards",
        };
      default:
        return {
          implements: [
            "Standard PTO Splined Shaft Coupling",
            "Multi-Crop Adjustable Sieve",
            "Reinforced Steel Chassis Frame",
          ],
          operations: [
            "Precision seed placement at uniform depth",
            "Grain separation from chaff with minimal breakage",
            "High-volume irrigation water pumping",
          ],
          fuelBurn: "3.5 - 4.5 Litres/hr or PTO driven",
          hydraulics: "Standard 3-point tractor connection",
          bestSoil: "Suitable for all field moisture regimes",
        };
    }
  }, [equipment?.category]);

  if (!equipment) return null;

  // Selected rate based on unit
  const activeRate =
    calcUnit === "hour"
      ? equipment.pricePerHour || 850
      : calcUnit === "acre"
      ? equipment.pricePerAcre || 1350
      : equipment.pricePerDay || 3200;

  const totalCalculatedCost = Math.round(activeRate * (calcUnits || 1));

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((r) => setTimeout(r, 800));

      const payload: EquipmentBookingPayload = {
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        farmerName,
        farmerPhone,
        village,
        district: equipment.district,
        pricingUnit: calcUnit,
        durationUnits: calcUnits,
        bookingDate,
        needsOperator: equipment.operatorIncluded || needsOperator,
        notes,
        totalAmount: totalCalculatedCost,
      };

      const bookingId = `KC-EQ-${Date.now().toString().slice(-6)}`;
      setConfirmedBookingId(bookingId);

      if (onBookSuccess) {
        onBookSuccess(payload);
      }
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl sm:max-w-3xl w-[95vw] max-h-[92vh] flex flex-col p-0 rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0c0d0e]/95 backdrop-blur-2xl shadow-2xl text-foreground overflow-hidden">
        {/* 1. Header Section */}
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                >
                  {CATEGORY_NAMES[equipment.category] || equipment.category}
                </Badge>

                {equipment.powerHp && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono font-bold px-2 py-0.5 border-white/20 bg-white/[0.05] text-white"
                  >
                    {equipment.powerHp}
                  </Badge>
                )}

                {equipment.verified && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 border-emerald-500/30 text-emerald-300 bg-emerald-500/10 gap-1 font-semibold flex items-center"
                  >
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>KhetiSetu Verified</span>
                  </Badge>
                )}

                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    equipment.isAvailable
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-zinc-400 bg-zinc-800"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      equipment.isAvailable ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                    }`}
                  />
                  <span>{equipment.isAvailable ? "Hub Available" : "Engaged"}</span>
                </span>
              </div>

              <div className="pt-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  {equipment.brand}
                </span>
                <DialogTitle className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                  {equipment.name}
                </DialogTitle>
              </div>

              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>
                  {equipment.location}, {equipment.district}, {equipment.state}
                </span>
              </DialogDescription>
            </div>

            {/* Rates Card Header */}
            <div className="shrink-0 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-left sm:text-right">
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                Primary Rental
              </span>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                {equipment.pricePerAcre
                  ? `₹${equipment.pricePerAcre}/acre`
                  : equipment.pricePerHour
                  ? `₹${equipment.pricePerHour}/hr`
                  : `₹${equipment.pricePerDay}/day`}
              </div>
              <span className="text-[10px] text-zinc-400 font-mono block">
                {equipment.totalBookings} Completed Jobs
              </span>
            </div>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 mt-3">
            <button
              type="button"
              onClick={() => setActiveTab("specs")}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "specs"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span>Machine Specs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("calculator")}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "calculator"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Calculator className="w-3.5 h-3.5 shrink-0" />
              <span>Cost Calculator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("booking")}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "booking"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Book Machine</span>
            </button>
          </div>
        </DialogHeader>

        {/* 2. Modal Body Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          {/* TAB 1: MACHINE SPECIFICATIONS & PERFORMANCE */}
          {activeTab === "specs" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Snapshot Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Power Rating</span>
                  <span className="font-extrabold text-sm text-white block mt-0.5 font-mono">
                    {equipment.powerHp || "Standard"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Operator Policy</span>
                  <span className="font-extrabold text-sm text-emerald-400 block mt-0.5">
                    {equipment.operatorIncluded ? "Included" : "Self-Operate"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Fuel Policy</span>
                  <span className="font-extrabold text-sm text-white block mt-0.5">
                    {equipment.fuelPolicy === "operator"
                      ? "Operator Arranged"
                      : equipment.fuelPolicy === "included"
                      ? "Fuel Included"
                      : "Renter Fuel"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Dispatch Speed</span>
                  <span className="font-extrabold text-sm text-cyan-400 block mt-0.5 font-mono">
                    &lt; 2 Hours
                  </span>
                </div>
              </div>

              {/* Engineering Specs Card */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Engineering & Capacity Details
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                  {equipment.specs}
                </p>
                {equipment.capacity && (
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-white/5">
                    <strong>Engine / Chamber Spec:</strong> {equipment.capacity}
                  </p>
                )}
              </div>

              {/* Compatible Implements & Attachments */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Supported Implements & Attachments
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {categorySpecs.implements.map((imp) => (
                    <div
                      key={imp}
                      className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center gap-2"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="text-zinc-200">{imp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agronomic Field Operations */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Recommended Agronomic Field Operations
                </span>
                <div className="space-y-1.5 text-xs">
                  {categorySpecs.operations.map((op, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-zinc-300">
                      <span className="font-mono text-[10px] text-emerald-400 font-bold shrink-0 mt-0.5">
                        0{idx + 1}.
                      </span>
                      <span>{op}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Telemetry Note */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-start gap-2 text-emerald-300">
                <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                <p className="leading-relaxed">
                  <strong>Soil & Telemetry Advisory:</strong> Ideal for {categorySpecs.bestSoil}. Estimated fuel consumption rate: <strong>{categorySpecs.fuelBurn}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSPARENT RATES & COST CALCULATOR */}
          {activeTab === "calculator" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Rental Rates Matrix */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Official KhetiSetu Mandi Rate Sheet
                </span>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 rounded-lg border border-white/10 bg-black/30">
                    <span className="text-[10px] text-muted-foreground block">Hourly Rate</span>
                    <span className="font-mono text-base font-bold text-white block mt-0.5">
                      {equipment.pricePerHour ? `₹${equipment.pricePerHour}/hr` : "N/A"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                    <span className="text-[10px] text-emerald-400 block font-semibold">Per Acre Rate</span>
                    <span className="font-mono text-base font-bold text-emerald-400 block mt-0.5">
                      {equipment.pricePerAcre ? `₹${equipment.pricePerAcre}/acre` : "N/A"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-white/10 bg-black/30">
                    <span className="text-[10px] text-muted-foreground block">Full Day (8 Hrs)</span>
                    <span className="font-mono text-base font-bold text-white block mt-0.5">
                      {equipment.pricePerDay ? `₹${equipment.pricePerDay}/day` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Duration Estimator */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white block">
                  Interactive Farm Cost Estimator
                </span>

                {/* Unit Switcher */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Estimate By:</span>
                  <div className="flex gap-1">
                    {(["acre", "hour", "day"] as PricingUnit[]).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setCalcUnit(u)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all border ${
                          calcUnit === u
                            ? "bg-white/15 border-white/30 text-white"
                            : "bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/[0.06]"
                        }`}
                      >
                        {u === "acre" ? "Acres" : u === "hour" ? "Hours" : "Days"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Counter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Select Quantity:</span>
                    <span className="font-mono font-bold text-white">
                      {calcUnits} {calcUnit === "acre" ? "Acres" : calcUnit === "hour" ? "Hours" : "Days"}
                    </span>
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {[1, 2, 4, 8, 12, 20].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCalcUnits(preset)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                          calcUnits === preset
                            ? "bg-emerald-600 border-emerald-500 text-white"
                            : "bg-black/40 border-white/10 text-muted-foreground hover:bg-white/5"
                        }`}
                      >
                        {preset} {calcUnit === "acre" ? "ac" : calcUnit === "hour" ? "hr" : "d"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Receipt */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Base Machine Rental</span>
                    <span className="font-mono text-zinc-300">
                      ₹{activeRate} &times; {calcUnits}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Operator & Handling</span>
                    <span className="text-emerald-400 font-semibold font-mono">₹0 (Included)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Middleman Commission</span>
                    <span className="text-emerald-400 font-semibold font-mono">₹0 (0% Brokerage)</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Estimated Farm Payable
                    </span>
                    <span className="font-mono text-xl font-extrabold text-emerald-400">
                      ₹{totalCalculatedCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setActiveTab("booking")}
                  className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                >
                  Proceed to Book at ₹{totalCalculatedCost.toLocaleString()} &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: RESERVATION & HUB DISPATCH */}
          {activeTab === "booking" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {confirmedBookingId ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white">Machine Reservation Dispatched</h3>
                  <p className="text-xs text-zinc-300 max-w-md mx-auto">
                    Your booking reference <strong>#{confirmedBookingId}</strong> for <strong>{equipment.name}</strong> has been transmitted to the local hub manager. The operator will contact you before departure.
                  </p>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 max-w-xs mx-auto text-xs font-mono text-emerald-400">
                    Estimated Payable: ₹{totalCalculatedCost.toLocaleString()}
                  </div>
                  <div className="pt-2">
                    <Button
                      onClick={onClose}
                      className="h-9 px-6 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Machine Selected</span>
                      <strong className="text-white">{equipment.name}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground block text-[10px]">Payable Estimate</span>
                      <strong className="text-emerald-400 font-mono">₹{totalCalculatedCost}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Farmer / Trader Name *</Label>
                      <Input
                        required
                        type="text"
                        placeholder="e.g. Ramesh Sahoo"
                        value={farmerName}
                        onChange={(e) => setFarmerName(e.target.value)}
                        className="h-9 bg-black/40 border-white/10 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Mobile Phone Number *</Label>
                      <Input
                        required
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={farmerPhone}
                        onChange={(e) => setFarmerPhone(e.target.value)}
                        className="h-9 bg-black/40 border-white/10 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Village / Field Location *</Label>
                      <Input
                        required
                        type="text"
                        placeholder="e.g. Mendhasal, Near Mandi Gate"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        className="h-9 bg-black/40 border-white/10 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Required Date *</Label>
                      <Input
                        required
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="h-9 bg-black/40 border-white/10 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Special Instructions / Field Crop</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Deep tillage for Kharif Paddy sowing"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="h-9 bg-black/40 border-white/10 text-xs"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !equipment.isAvailable}
                      className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      {isSubmitting ? "Transmitting Reservation to Hub..." : "Confirm Machinery Reservation"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* 3. Footer Action Controls */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3 shrink-0">
          <a
            href={`tel:${equipment.contactPhone}`}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-medium text-white transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Call Hub:</span>
            <span className="font-mono text-zinc-300">{equipment.contactPhone}</span>
          </a>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 text-xs border-white/10 bg-transparent hover:bg-white/5"
            >
              Close
            </Button>

            {activeTab !== "booking" && (
              <Button
                size="sm"
                onClick={() => setActiveTab("booking")}
                disabled={!equipment.isAvailable}
                className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Book Machine
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
