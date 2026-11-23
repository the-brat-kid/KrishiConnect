"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Warehouse,
  Search,
  Filter,
  ShieldCheck,
  ThermometerSnowflake,
  Plus,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Globe2,
  Building2,
} from "lucide-react";
import { ColdStorageFacility } from "@/types/cold-storage";
import { ColdStorageCard } from "@/components/cold-storage/cold-storage-card";
import { BookingModal } from "@/components/cold-storage/booking-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";

const PAN_INDIA_FACILITIES: ColdStorageFacility[] = [
  {
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
  {
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
  {
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
  {
    id: "cs-pb-1",
    name: "Doaba Seed Potato & Agro Vault",
    location: "GT Road Mandi Zone",
    district: "Jalandhar",
    state: "Punjab",
    pincode: "144001",
    total_capacity_quintals: 22000,
    available_capacity_quintals: 7100,
    temp_min_celsius: 2.0,
    temp_max_celsius: 4.0,
    current_temp_celsius: 2.6,
    humidity_percentage: 89,
    daily_rate_per_quintal: 2.3,
    suitable_crops: ["Seed Potato", "Peas", "Carrots", "Cauliflower"],
    contact_phone: "+91 98140 77889",
    has_backup_power: true,
    has_cctv: true,
    has_humidity_control: true,
    is_active: true,
  },
  {
    id: "cs-ka-1",
    name: "Deccan Horticultural Cold Hub",
    location: "APMC Market Yard Road",
    district: "Kolar",
    state: "Karnataka",
    pincode: "563101",
    total_capacity_quintals: 15000,
    available_capacity_quintals: 4900,
    temp_min_celsius: 6.0,
    temp_max_celsius: 12.0,
    current_temp_celsius: 8.5,
    humidity_percentage: 90,
    daily_rate_per_quintal: 3.2,
    suitable_crops: ["Tomato", "Capsicum", "Beans", "Mango"],
    contact_phone: "+91 94480 22334",
    has_backup_power: true,
    has_cctv: true,
    has_humidity_control: true,
    is_active: true,
  },
  {
    id: "cs-ap-1",
    name: "Guntur Chilli Export Cold Storage",
    location: "Mirchi Yard Bypass, NH-16",
    district: "Guntur",
    state: "Andhra Pradesh",
    pincode: "522004",
    total_capacity_quintals: 20000,
    available_capacity_quintals: 6300,
    temp_min_celsius: 4.0,
    temp_max_celsius: 10.0,
    current_temp_celsius: 5.5,
    humidity_percentage: 65,
    daily_rate_per_quintal: 2.6,
    suitable_crops: ["Dried Red Chilli", "Turmeric", "Coriander", "Tobacco"],
    contact_phone: "+91 98480 44556",
    has_backup_power: true,
    has_cctv: true,
    has_humidity_control: true,
    is_active: true,
  },
  {
    id: "cs-hp-1",
    name: "Himalayan CA Controlled Atmosphere Vault",
    location: "Theog Apple Hub, NH-5",
    district: "Shimla",
    state: "Himachal Pradesh",
    pincode: "171201",
    total_capacity_quintals: 14000,
    available_capacity_quintals: 3800,
    temp_min_celsius: -0.5,
    temp_max_celsius: 2.0,
    current_temp_celsius: 0.5,
    humidity_percentage: 95,
    daily_rate_per_quintal: 3.8,
    suitable_crops: ["Apple", "Pears", "Plum", "Cherries"],
    contact_phone: "+91 98160 88990",
    has_backup_power: true,
    has_cctv: true,
    has_humidity_control: true,
    is_active: true,
  },
  {
    id: "cs-wb-1",
    name: "Tarkeshwar Agri Cold Warehouse",
    location: "Arambagh Road Mandi Link",
    district: "Hooghly",
    state: "West Bengal",
    pincode: "712410",
    total_capacity_quintals: 28000,
    available_capacity_quintals: 9500,
    temp_min_celsius: 2.0,
    temp_max_celsius: 4.0,
    current_temp_celsius: 3.0,
    humidity_percentage: 88,
    daily_rate_per_quintal: 2.0,
    suitable_crops: ["Potato", "Pointed Gourd", "Ginger", "Turmeric"],
    contact_phone: "+91 98300 66778",
    has_backup_power: true,
    has_cctv: true,
    has_humidity_control: true,
    is_active: true,
  },
  {
    id: "cs-mp-1",
    name: "Malwa Agro Fresh Cold Chambers",
    location: "Sanwer Industrial APMC Belt",
    district: "Indore",
    state: "Madhya Pradesh",
    pincode: "452001",
    total_capacity_quintals: 16000,
    available_capacity_quintals: 5800,
    temp_min_celsius: 1.0,
    temp_max_celsius: 5.0,
    current_temp_celsius: 3.0,
    humidity_percentage: 85,
    daily_rate_per_quintal: 2.4,
    suitable_crops: ["Garlic", "Onion", "Potato", "Soybean Seed"],
    contact_phone: "+91 98270 33221",
    has_backup_power: true,
    has_cctv: true,
    has_humidity_control: true,
    is_active: true,
  },
  {
    id: "cs-od-1",
    name: "Kalinga Agri-Tech Cold Storage",
    location: "Jagatpur Industrial Zone",
    district: "Cuttack",
    state: "Odisha",
    pincode: "754021",
    total_capacity_quintals: 8000,
    available_capacity_quintals: 3100,
    temp_min_celsius: 2.0,
    temp_max_celsius: 6.0,
    current_temp_celsius: 3.8,
    humidity_percentage: 88,
    daily_rate_per_quintal: 2.4,
    suitable_crops: ["Potato", "Onion", "Ginger", "Carrot"],
    contact_phone: "+91 94370 12345",
    has_backup_power: true,
    has_cctv: true,
    has_humidity_control: true,
    is_active: true,
  },
  {
    id: "cs-od-2",
    name: "Utkal Mega Cold Chain & Logistics",
    location: "NH-16, Khandagiri Bypass",
    district: "Khordha",
    state: "Odisha",
    pincode: "751030",
    total_capacity_quintals: 10000,
    available_capacity_quintals: 4600,
    temp_min_celsius: 0.0,
    temp_max_celsius: 4.0,
    current_temp_celsius: 2.1,
    humidity_percentage: 92,
    daily_rate_per_quintal: 3.1,
    suitable_crops: ["Tomato", "Apple", "Cauliflower", "Capsicum"],
    contact_phone: "+91 98610 56789",
    has_backup_power: true,
    has_cctv: true,
    has_humidity_control: true,
    is_active: true,
  },
];

const STATES = [
  "All India",
  "Uttar Pradesh",
  "Maharashtra",
  "Gujarat",
  "Punjab",
  "Karnataka",
  "Andhra Pradesh",
  "Himachal Pradesh",
  "West Bengal",
  "Madhya Pradesh",
  "Odisha",
];

function ColdStorageContent() {
  const { currentRegionDef } = useLanguage();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || searchParams.get("crop") || "";

  const [facilities] = useState<ColdStorageFacility[]>(PAN_INDIA_FACILITIES);
  const [search, setSearch] = useState(initialQuery);
  const [selectedState, setSelectedState] = useState(
    initialQuery
      ? "All India"
      : currentRegionDef?.name && STATES.includes(currentRegionDef.name)
      ? currentRegionDef.name
      : "All India"
  );

  useEffect(() => {
    if (initialQuery) {
      setSearch(initialQuery);
      setSelectedState("All India");
    }
  }, [initialQuery]);

  useEffect(() => {
    if (!initialQuery && currentRegionDef?.name) {
      if (STATES.includes(currentRegionDef.name)) {
        setSelectedState(currentRegionDef.name);
      } else {
        setSelectedState("All India");
      }
    }
  }, [currentRegionDef?.name, initialQuery]);
  const [bookingFacility, setBookingFacility] = useState<ColdStorageFacility | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const term = search.toLowerCase();
      const matchesSearch =
        f.name.toLowerCase().includes(term) ||
        f.location.toLowerCase().includes(term) ||
        f.district.toLowerCase().includes(term) ||
        f.state.toLowerCase().includes(term) ||
        f.suitable_crops.some((c) => c.toLowerCase().includes(term));
      const matchesState = selectedState === "All India" || f.state.toLowerCase() === selectedState.toLowerCase();
      return matchesSearch && matchesState;
    });
  }, [facilities, search, selectedState]);

  const totalCapacity = useMemo(() => {
    return facilities.reduce((sum, f) => sum + f.total_capacity_quintals, 0);
  }, [facilities]);

  const availableCapacity = useMemo(() => {
    return facilities.reduce((sum, f) => sum + f.available_capacity_quintals, 0);
  }, [facilities]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <ThermometerSnowflake className="h-3.5 w-3.5" />
            <span>National Post-Harvest Cold-Chain & Vault Network</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-editorial">
            Pan-India Cold Storage Network
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Book temperature-controlled chambers, monitor telemetry live, and obtain WDRA e-NWR negotiable warehouse receipts across 10+ states.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="https://nccd.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-liquid-glass inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-white transition-all shadow-xs group"
          >
            <Globe2 className="h-4 w-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span>NCCD National Directory</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-white shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>

          <a
            href="https://wdra.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-liquid-glass inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-white transition-all shadow-xs group"
          >
            <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span>WDRA e-NWR Portal</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-white shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card/60 border border-border/60 backdrop-blur-md">
          <span className="text-xs text-muted-foreground font-medium">Pan-India Capacity</span>
          <p className="text-xl font-black text-foreground font-mono mt-1">
            {totalCapacity.toLocaleString("en-IN")} Qtl
          </p>
        </div>
        <div className="p-4 rounded-xl bg-card/60 border border-border/60 backdrop-blur-md">
          <span className="text-xs text-muted-foreground font-medium">Available Chamber Space</span>
          <p className="text-xl font-black text-primary font-mono mt-1">
            {availableCapacity.toLocaleString("en-IN")} Qtl
          </p>
        </div>
        <div className="p-4 rounded-xl bg-card/60 border border-border/60 backdrop-blur-md">
          <span className="text-xs text-muted-foreground font-medium">Average Daily Rent</span>
          <p className="text-xl font-black text-foreground font-mono mt-1">₹2.58 /qtl</p>
        </div>
        <div className="p-4 rounded-xl bg-card/60 border border-border/60 backdrop-blur-md">
          <span className="text-xs text-muted-foreground font-medium">Active State Hubs</span>
          <p className="text-xl font-black text-emerald-500 font-mono mt-1">10 States (Pan-India)</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by facility name, crop (e.g. Potato, Apple, Onion), or district..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-card text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-auto"
            >
              {STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* State Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedState(st)}
              className={`text-xs px-3 py-1 rounded-full font-semibold transition-all shrink-0 ${
                selectedState === st
                  ? "btn-liquid-glass-primary shadow-[0_0_12px_rgba(20,122,77,0.35)] text-white"
                  : "btn-liquid-glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Facility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((fac) => (
          <ColdStorageCard
            key={fac.id}
            facility={fac}
            onBook={(f) => {
              setBookingFacility(f);
              setIsModalOpen(true);
            }}
          />
        ))}
      </div>

      {filteredFacilities.length === 0 && (
        <div className="p-10 text-center rounded-xl border border-dashed text-muted-foreground">
          <Warehouse className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
          <p className="font-semibold text-sm">No cold storage facilities found</p>
          <p className="text-xs mt-1">Try clearing your filters or searching for another crop/district.</p>
        </div>
      )}

      {/* Booking Dialog */}
      <BookingModal
        facility={bookingFacility}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => alert("Chamber booking request submitted successfully! Facility manager will contact you.")}
      />
    </div>
  );
}

export default function ColdStoragePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Loading Cold Storage Facilities...
        </div>
      }
    >
      <ColdStorageContent />
    </Suspense>
  );
}
