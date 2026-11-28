"use client";

import React, { useState, useMemo } from "react";
import {
  Tractor,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  Layers,
  SlidersHorizontal,
} from "lucide-react";
import { EquipmentItem, EquipmentCategory, PricingUnit, EquipmentBookingPayload } from "@/types/equipment";
import { EQUIPMENT_CATALOG } from "@/lib/equipment-data";
import { EquipmentCard } from "@/components/equipment/equipment-card";
import { EquipmentBookingModal } from "@/components/equipment/booking-modal";
import { EquipmentDetailModal } from "@/components/equipment/equipment-detail-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORIES: { id: EquipmentCategory; label: string }[] = [
  { id: "all", label: "All Equipment" },
  { id: "tractors", label: "Tractors" },
  { id: "harvesters", label: "Harvesters" },
  { id: "tillage", label: "Tillage" },
  { id: "sowing", label: "Sowing" },
  { id: "sprayers", label: "Sprayers & Drones" },
  { id: "irrigation", label: "Irrigation & Threshing" },
];

export default function EquipmentRentalPage() {
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [rateFilter, setRateFilter] = useState<string>("all");
  const [activeModalItem, setActiveModalItem] = useState<EquipmentItem | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<EquipmentItem | null>(null);
  const [bookingSuccessAlert, setBookingSuccessAlert] = useState<string | null>(null);

  // Extract unique districts
  const districts = useMemo(() => {
    const set = new Set<string>();
    EQUIPMENT_CATALOG.forEach((item) => set.add(item.district));
    return Array.from(set).sort();
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return EQUIPMENT_CATALOG.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // District filter
      if (selectedDistrict !== "all" && item.district !== selectedDistrict) {
        return false;
      }

      // Rate preference filter
      if (rateFilter === "hourly" && !item.pricePerHour) return false;
      if (rateFilter === "acre" && !item.pricePerAcre) return false;
      if (rateFilter === "daily" && !item.pricePerDay) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesBrand = item.brand.toLowerCase().includes(query);
        const matchesLocation = item.location.toLowerCase().includes(query);
        const matchesDistrict = item.district.toLowerCase().includes(query);
        const matchesSpecs = item.specs.toLowerCase().includes(query);

        if (!matchesName && !matchesBrand && !matchesLocation && !matchesDistrict && !matchesSpecs) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCategory, selectedDistrict, rateFilter, searchQuery]);

  const handleBookingSuccess = (payload: EquipmentBookingPayload) => {
    setBookingSuccessAlert(
      `Reservation confirmed for ${payload.equipmentName} (${payload.durationUnits} ${
        payload.pricingUnit === "hour" ? "hours" : payload.pricingUnit === "acre" ? "acres" : "days"
      }) in ${payload.village}. Hub dispatched.`
    );
    setTimeout(() => {
      setBookingSuccessAlert(null);
    }, 8000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Farm Equipment &amp; Machinery
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Rent tractors, harvesters, seeders &amp; drones at fixed rates.
          </p>
        </div>

        {/* Fleet Metrics Strip */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-center">
            <span className="text-[10px] text-muted-foreground block uppercase font-medium">Available Units</span>
            <span className="font-mono text-base font-bold text-white">
              {EQUIPMENT_CATALOG.filter((i) => i.isAvailable).length} / {EQUIPMENT_CATALOG.length}
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-center">
            <span className="text-[10px] text-muted-foreground block uppercase font-medium">Verified Hubs</span>
            <span className="font-mono text-base font-bold text-emerald-400">{districts.length}</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {bookingSuccessAlert && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{bookingSuccessAlert}</span>
          </div>
          <button
            onClick={() => setBookingSuccessAlert(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-bold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Search & Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search equipment, brand, model, or specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white/[0.03] border-white/10 text-xs placeholder:text-muted-foreground"
            />
          </div>

          {/* District Selector */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="h-10 px-3 rounded-lg bg-black/60 border border-white/10 text-xs text-foreground focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Districts ({EQUIPMENT_CATALOG.length})</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Rate Filter Selector */}
          <select
            value={rateFilter}
            onChange={(e) => setRateFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-black/60 border border-white/10 text-xs text-foreground focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Rates</option>
            <option value="hourly">Hourly Available</option>
            <option value="acre">Per Acre Available</option>
            <option value="daily">Daily Available</option>
          </select>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? "bg-white/15 border-white/30 text-white font-semibold shadow-xs"
                  : "bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Equipment Listings Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
          <Tractor className="h-10 w-10 text-muted-foreground mx-auto stroke-[1.5]" />
          <h3 className="text-base font-bold text-white">No Equipment Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No machines matched your current search and filter combination. Try resetting filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedDistrict("all");
              setRateFilter("all");
              setSearchQuery("");
            }}
            className="text-xs h-8 border-white/10 bg-transparent hover:bg-white/5"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <EquipmentCard
              key={item.id}
              item={item}
              onViewDetails={(equipment) => setSelectedDetailItem(equipment)}
              onBook={(equipment) => setActiveModalItem(equipment)}
            />
          ))}
        </div>
      )}

      {/* 4. Equipment Comprehensive Detail Modal (Specs, Cost Estimator, Implements) */}
      <EquipmentDetailModal
        equipment={selectedDetailItem}
        isOpen={!!selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onBookSuccess={handleBookingSuccess}
      />

      {/* 5. Equipment Quick Booking Modal */}
      <EquipmentBookingModal
        equipment={activeModalItem}
        isOpen={!!activeModalItem}
        onClose={() => setActiveModalItem(null)}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}
