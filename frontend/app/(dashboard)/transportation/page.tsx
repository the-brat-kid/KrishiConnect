"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AnimatedNumber } from "@/components/core/animated-number";
import { FreightDetailModal, FreightCorridorDetail } from "@/components/logistics/freight-detail-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Truck,
  MapPin,
  ExternalLink,
  Navigation,
  Clock,
  IndianRupee,
  ShieldCheck,
  PhoneCall,
  Scale,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  Globe2,
} from "lucide-react";

interface Corridor {
  id: string;
  name: string;
  origin: string;
  destination: string;
  region: "North" | "South" | "East" | "West" | "Central" | "National";
  distance: number;
  highway: string;
  typicalCommodity: string;
}

const PRESET_CORRIDORS: Corridor[] = [
  { id: "delhi-agra", name: "Delhi Azadpur – Agra Potato Hub", origin: "Delhi NCR", destination: "Agra, Uttar Pradesh", region: "North", distance: 210, highway: "Yamuna Expressway", typicalCommodity: "Potato, Seasonal Vegetables" },
  { id: "khanna-delhi", name: "Khanna Grain Market – Delhi Azadpur", origin: "Khanna, Punjab", destination: "Delhi NCR", region: "North", distance: 310, highway: "NH-44", typicalCommodity: "Wheat, Basmati Paddy, Maize" },
  { id: "shimla-delhi", name: "Shimla Apple Belt – Delhi NCR", origin: "Shimla, Himachal Pradesh", destination: "Delhi NCR", region: "North", distance: 345, highway: "NH-5 / NH-44", typicalCommodity: "Apples, Stone Fruits, Garlic" },
  { id: "nashik-mumbai", name: "Nashik Onion Hub – Mumbai Vashi APMC", origin: "Nashik, Maharashtra", destination: "Mumbai, Maharashtra", region: "West", distance: 165, highway: "NH-160 / Samruddhi Exp", typicalCommodity: "Onions, Table Grapes, Tomatoes" },
  { id: "deesa-ahmedabad", name: "Deesa Potato Belt – Ahmedabad APMC", origin: "Deesa, Gujarat", destination: "Ahmedabad, Gujarat", region: "West", distance: 150, highway: "NH-27", typicalCommodity: "Processing Potatoes, Castor, Mustard" },
  { id: "pune-bengaluru", name: "Pune APMC – Bengaluru Yeshwanthpur", origin: "Pune, Maharashtra", destination: "Bengaluru, Karnataka", region: "South", distance: 840, highway: "NH-48", typicalCommodity: "Pomegranates, Vegetables, Sugar" },
  { id: "guntur-hyderabad", name: "Guntur Mirchi Yard – Hyderabad Bowenpally", origin: "Guntur, Andhra Pradesh", destination: "Hyderabad, Telangana", region: "South", distance: 275, highway: "NH-65", typicalCommodity: "Red Chillies, Turmeric, Cotton" },
  { id: "kolar-chennai", name: "Kolar Tomato Belt – Chennai Koyambedu", origin: "Kolar, Karnataka", destination: "Chennai, Tamil Nadu", region: "South", distance: 280, highway: "NH-75 / NH-48", typicalCommodity: "Fresh Tomatoes, Vegetables, Mangoes" },
  { id: "indore-mumbai", name: "Indore Mandi – Mumbai Nhava Sheva", origin: "Indore, Madhya Pradesh", destination: "Mumbai, Maharashtra", region: "Central", distance: 590, highway: "NH-52 / NH-60", typicalCommodity: "Soybean, Garlic, Wheat, Pulses" },
  { id: "bbsr-kolkata", name: "Bhubaneswar / Cuttack – Kolkata Posta Mandi", origin: "Bhubaneswar, Odisha", destination: "Kolkata, West Bengal", region: "East", distance: 440, highway: "NH-16", typicalCommodity: "Vegetables, Betel Leaf, Fish, Rice" },
  { id: "cuttack-sambalpur", name: "Cuttack Mandi – Sambalpur APMC", origin: "Cuttack, Odisha", destination: "Sambalpur, Odisha", region: "East", distance: 260, highway: "NH-55", typicalCommodity: "Paddy, Groundnut, Green Chillies" },
  { id: "hooghly-kolkata", name: "Hooghly Agro Hub – Kolkata Koley Market", origin: "Hooghly, West Bengal", destination: "Kolkata, West Bengal", region: "East", distance: 110, highway: "NH-19", typicalCommodity: "Jyoti Potato, Jute, Seasonal Greens" },
  { id: "patna-kolkata", name: "Patna Bazaar Samiti – Kolkata APMC", origin: "Patna, Bihar", destination: "Kolkata, West Bengal", region: "East", distance: 580, highway: "NH-19 / NH-2", typicalCommodity: "Maize, Makhana, Litchi, Mango" },
  { id: "bbsr-hyderabad", name: "Bhubaneswar APMC – Hyderabad Bowenpally", origin: "Bhubaneswar, Odisha", destination: "Hyderabad, Telangana", region: "National", distance: 1050, highway: "NH-16 / NH-65", typicalCommodity: "Ginger, Turmeric, Coastal Produce" },
  { id: "bbsr-delhi", name: "Odisha Coastal Hub – Delhi Azadpur Mandi", origin: "Bhubaneswar, Odisha", destination: "Delhi NCR", region: "National", distance: 1520, highway: "NH-19 / NH-16", typicalCommodity: "Bulk Agricultural Consignments" },
];

const TRUCK_TYPES = [
  {
    id: "tata-ace",
    name: "Tata Ace / Bolero Pickup",
    capacityText: "1.0 – 2.0 MT",
    maxWeight: 2,
    baseFare: 1200,
    perKmMin: 26,
    perKmMax: 32,
    tollPer100Km: 150,
    description: "Best for farm gate to local district APMC mandi runs",
  },
  {
    id: "canter-14",
    name: "14ft – 17ft Canter / Eicher",
    capacityText: "3.0 – 5.0 MT",
    maxWeight: 5,
    baseFare: 3500,
    perKmMin: 36,
    perKmMax: 44,
    tollPer100Km: 280,
    description: "Ideal for regional intra-state mandi hauls & inter-district trade",
  },
  {
    id: "truck-19",
    name: "19ft – 22ft 6-Wheeler",
    capacityText: "7.0 – 10.0 MT",
    maxWeight: 10,
    baseFare: 7000,
    perKmMin: 48,
    perKmMax: 58,
    tollPer100Km: 450,
    description: "Standard truck for inter-state bulk grain, onion, and vegetable transport",
  },
  {
    id: "taurus-multi",
    name: "10/12-Wheeler Multi-Axle Taurus",
    capacityText: "15.0 – 25.0 MT",
    maxWeight: 25,
    baseFare: 14000,
    perKmMin: 65,
    perKmMax: 85,
    tollPer100Km: 750,
    description: "Heavy commercial long-haul for grain, paddy, fertiliser and national bulk freight",
  },
  {
    id: "reefer-cold",
    name: "Reefer / Refrigerated Cold-Chain Truck",
    capacityText: "3.0 – 10.0 MT",
    maxWeight: 10,
    baseFare: 8000,
    perKmMin: 58,
    perKmMax: 76,
    tollPer100Km: 450,
    description: "Temperature controlled (0°C to 12°C) for perishable fruits, tomatoes, capsicum & dairy",
  },
];

const POPULAR_ORIGINS = [
  "Delhi NCR",
  "Mumbai, Maharashtra",
  "Nashik, Maharashtra",
  "Bhubaneswar, Odisha",
  "Kolkata, West Bengal",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Khanna, Punjab",
  "Ahmedabad, Gujarat",
  "Indore, Madhya Pradesh",
  "Patna, Bihar",
  "Shimla, Himachal Pradesh",
];

export default function TransportationPage() {
  const [fromCity, setFromCity] = useState("Delhi NCR");
  const [selectedCorridorId, setSelectedCorridorId] = useState("delhi-agra");
  const [customDestination, setCustomDestination] = useState("");
  const [customDistance, setCustomDistance] = useState<number | "">("");
  const [commodity, setCommodity] = useState("Fruits & Vegetables (Fresh Mandi Harvest)");
  const [weightMt, setWeightMt] = useState<number>(5);
  const [selectedTruckId, setSelectedTruckId] = useState("canter-14");
  const [corridorRegionFilter, setCorridorRegionFilter] = useState<string>("All");
  const [selectedCorridorDetail, setSelectedCorridorDetail] = useState<FreightCorridorDetail | null>(null);

  // Determine active distance
  const activeDistance = useMemo(() => {
    if (selectedCorridorId === "custom") {
      return typeof customDistance === "number" && customDistance > 0 ? customDistance : 150;
    }
    const c = PRESET_CORRIDORS.find((item) => item.id === selectedCorridorId);
    return c ? c.distance : 150;
  }, [selectedCorridorId, customDistance]);

  const activeDestination = useMemo(() => {
    if (selectedCorridorId === "custom") {
      return customDestination || "Custom Mandi Destination";
    }
    const c = PRESET_CORRIDORS.find((item) => item.id === selectedCorridorId);
    return c ? c.destination : "Mandi Destination";
  }, [selectedCorridorId, customDestination]);

  const activeTruck = useMemo(() => {
    return TRUCK_TYPES.find((t) => t.id === selectedTruckId) || TRUCK_TYPES[1];
  }, [selectedTruckId]);

  // Freight calculation based on All India Transport commercial freight rates
  const calculation = useMemo(() => {
    const distance = Math.max(activeDistance, 10);
    const weight = Math.max(weightMt || 1, 0.5);

    const baseMin = Math.max(activeTruck.baseFare, distance * activeTruck.perKmMin);
    const baseMax = Math.max(Math.round(activeTruck.baseFare * 1.15), distance * activeTruck.perKmMax);

    // Commodity multiplier
    let factor = 1.0;
    if (commodity.includes("Perishables") || commodity.includes("Reefer")) {
      factor = 1.18;
    } else if (commodity.includes("Seeds") || commodity.includes("Fertilizers")) {
      factor = 1.05;
    }

    const estTolls = Math.round((distance / 100) * activeTruck.tollPer100Km);
    const hamali = Math.round(weight * 190); // ~Rs 190 / MT loading/unloading hamali

    const totalMin = Math.round(baseMin * factor + estTolls + hamali);
    const totalMax = Math.round(baseMax * factor + estTolls + hamali);

    const totalQuintals = weight * 10;
    const totalKg = weight * 1000;

    const perQuintalMin = Math.round(totalMin / totalQuintals);
    const perQuintalMax = Math.round(totalMax / totalQuintals);

    const perKgMin = (totalMin / totalKg).toFixed(2);
    const perKgMax = (totalMax / totalKg).toFixed(2);

    const hours = Math.round(distance / 45);
    const transitTime =
      hours <= 3
        ? "2 – 4 Hours (Same Day)"
        : hours <= 12
        ? `${hours - 1} – ${hours + 3} Hours (Same Day / Overnight)`
        : `${Math.ceil(hours / 24)} – ${Math.ceil(hours / 24) + 1} Days (Interstate)`;

    return {
      totalMin,
      totalMax,
      baseMin: Math.round(baseMin),
      baseMax: Math.round(baseMax),
      estTolls,
      hamali,
      perQuintal: `₹${perQuintalMin} – ₹${perQuintalMax}`,
      perKg: `₹${perKgMin} – ₹${perKgMax}`,
      transitTime,
    };
  }, [activeDistance, weightMt, activeTruck, commodity]);

  const filteredCorridors = useMemo(() => {
    if (corridorRegionFilter === "All") return PRESET_CORRIDORS;
    return PRESET_CORRIDORS.filter(
      (c) => c.region === corridorRegionFilter || (corridorRegionFilter === "National" && c.distance > 800)
    );
  }, [corridorRegionFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1 font-medium">
              <Globe2 className="h-3.5 w-3.5 text-emerald-600" /> Pan-India Verified Freight Network
            </Badge>
            <Badge variant="secondary" className="text-xs">
              All India Transport Service
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" />
            Pan-India Agricultural Transportation & Freight
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Calculate mandi freight charges, vehicle hire rates, and book nationwide commercial transport across 28 states.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <a
            href="https://allindiatransport.in/bhubaneswar-transport-service.html"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-liquid-glass-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-[0_0_15px_rgba(20,122,77,0.25)] group"
          >
            <Truck className="h-4 w-4 shrink-0 text-emerald-300 group-hover:scale-110 transition-transform" />
            <span>Book All-India Transport</span>
            <ExternalLink className="h-3 w-3 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>

          <a
            href="https://trucksuvidha.com/FreightCalculator.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-liquid-glass inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-white transition-all shadow-xs group"
          >
            <span>Freight Rate Engine</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-white shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>

      {/* Main Grid: Calculator Form + Output Card */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Calculator Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                Trip Route & Consignment Details
              </CardTitle>
              <CardDescription>
                Specify pickup point, destination APMC mandi, cargo type and truck capacity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* From / Origin */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">From (Origin Mandi / Farm Hub)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                  <Input
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    placeholder="Enter pickup mandi or city (e.g. Nashik, Delhi, Bhubaneswar)..."
                    className="pl-9 bg-card font-medium"
                  />
                </div>
                {/* Quick origin buttons across Pan-India */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {POPULAR_ORIGINS.slice(0, 8).map((city) => (
                    <button
                      key={city}
                      onClick={() => setFromCity(city)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                        fromCity === city ? "bg-primary/10 border-primary text-primary font-medium" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {city.split(",")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* To / Destination */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">To (Destination Mandi / Market)</Label>
                <select
                  value={selectedCorridorId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCorridorId(val);
                    if (val !== "custom") {
                      const found = PRESET_CORRIDORS.find((c) => c.id === val);
                      if (found) setFromCity(found.origin);
                    }
                  }}
                  className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                >
                  <optgroup label="North India Agri Corridors">
                    {PRESET_CORRIDORS.filter((c) => c.region === "North").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.distance} km) • {c.highway}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="West India Agri Corridors">
                    {PRESET_CORRIDORS.filter((c) => c.region === "West").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.distance} km) • {c.highway}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="South India Agri Corridors">
                    {PRESET_CORRIDORS.filter((c) => c.region === "South").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.distance} km) • {c.highway}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="East & Central Agri Corridors">
                    {PRESET_CORRIDORS.filter((c) => c.region === "East" || c.region === "Central").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.distance} km) • {c.highway}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Pan-India National Corridors">
                    {PRESET_CORRIDORS.filter((c) => c.region === "National").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.distance} km) • {c.highway}
                      </option>
                    ))}
                  </optgroup>
                  <option value="custom">-- Custom Pan-India Destination & Distance --</option>
                </select>

                {selectedCorridorId === "custom" && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Destination Mandi / City</Label>
                      <Input
                        placeholder="e.g. Vashi Mumbai, Jaipur"
                        value={customDestination}
                        onChange={(e) => setCustomDestination(e.target.value)}
                        className="bg-card mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Road Distance (km)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 420"
                        value={customDistance}
                        onChange={(e) => setCustomDistance(e.target.value ? parseFloat(e.target.value) : "")}
                        className="bg-card mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Commodity & Weight */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Crop / Commodity</Label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Fruits & Vegetables (Fresh Mandi Harvest)">Fruits & Vegetables (Fresh Mandi Harvest)</option>
                    <option value="Grains & Cereals (Paddy, Rice, Wheat, Maize)">Grains & Cereals (Paddy, Rice, Wheat, Maize)</option>
                    <option value="Onions & Potatoes (Heavy Root Crop)">Onions & Potatoes (Heavy Root Crop)</option>
                    <option value="Perishables & Horticulture (Reefer Cold Chain)">Perishables & Horticulture (Reefer Cold Chain)</option>
                    <option value="Spices, Chillies & Oilseeds">Spices, Chillies & Oilseeds</option>
                    <option value="Seeds & Organic Fertilizers">Seeds & Organic Fertilizers</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Consignment Weight</Label>
                    <span className="text-xs font-bold text-primary">{weightMt} Metric Tons ({weightMt * 10} Quintals)</span>
                  </div>
                  <Input
                    type="number"
                    min={0.5}
                    max={40}
                    step={0.5}
                    value={weightMt}
                    onChange={(e) => setWeightMt(parseFloat(e.target.value) || 1)}
                    className="bg-card font-medium"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>1 MT (Mini Truck)</span>
                    <span>5 MT (Canter)</span>
                    <span>15 MT+ (Taurus Multi-Axle)</span>
                  </div>
                </div>
              </div>

              {/* Truck Type Selection */}
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Select Truck / Vehicle Category</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {TRUCK_TYPES.map((truck) => {
                    const isSelected = selectedTruckId === truck.id;
                    return (
                      <div
                        key={truck.id}
                        onClick={() => setSelectedTruckId(truck.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary"
                            : "border-border bg-card hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-foreground">{truck.name}</span>
                          <Badge variant={isSelected ? "default" : "outline"} className="text-[10px]">
                            {truck.capacityText}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{truck.description}</p>
                        <div className="mt-2 text-xs font-medium text-foreground/80">
                          ₹{truck.perKmMin} – ₹{truck.perKmMax} <span className="text-[10px] text-muted-foreground">/ km</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Rate Breakdown & Booking CTA (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Calculation Card */}
          <Card className="border-primary/30 shadow-md bg-gradient-to-b from-card via-card to-primary/[0.02]">
            <CardHeader className="pb-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-bold text-xs">
                  Pan-India Freight Estimate
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {calculation.transitTime}
                </span>
              </div>

              {/* RATE KE SAAMNE BOOK BUTTON (ALL INDIA TRANSPORT INTEGRATION) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3 pt-1">
                <div>
                  <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    <AnimatedNumber value={calculation.totalMin} prefix="₹" springOptions={{ bounce: 0, duration: 1500 }} /> – <AnimatedNumber value={calculation.totalMax} prefix="₹" springOptions={{ bounce: 0, duration: 1500 }} />
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Estimated freight for <AnimatedNumber value={activeDistance} suffix=" km" springOptions={{ bounce: 0, duration: 1400 }} /> haul
                  </CardDescription>
                </div>

                {/* Booking Button right next to rate */}
                <a
                  href="https://allindiatransport.in/bhubaneswar-transport-service.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-liquid-glass-primary inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-[0_0_15px_rgba(20,122,77,0.3)] shrink-0 transition-all group"
                >
                  <Truck className="h-4 w-4 shrink-0 text-emerald-300 group-hover:scale-110 transition-transform" />
                  <span>Book Truck</span>
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-80" />
                </a>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Impact on Crop Profit (Farmer Centric) */}
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-emerald-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Impact on Mandi Crop Selling Price
                    </span>
                  </div>
                  <a
                    href="https://allindiatransport.in/bhubaneswar-transport-service.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-[#0066cc] underline hover:text-[#0052a3] inline-flex items-center gap-0.5"
                  >
                    Book Now
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Cost per Quintal (100 kg)</span>
                    <span className="text-base font-extrabold text-emerald-900">{calculation.perQuintal}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Cost per Kilogram</span>
                    <span className="text-base font-extrabold text-emerald-900">{calculation.perKg} / kg</span>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-800/80 pt-1 border-t border-emerald-500/15">
                  Producers can factor this ₹{calculation.perKg} / kg transport cost directly into their inter-mandi sales quote.
                </p>
              </div>

              {/* Itemized Cost Breakdown */}
              <div className="space-y-2 text-sm pt-1">
                <span className="text-xs font-semibold uppercase text-muted-foreground block">Itemized Cost Breakdown</span>
                <div className="flex justify-between py-1.5 border-b text-xs">
                  <span className="text-muted-foreground">Vehicle Hire ({activeTruck.name})</span>
                  <span className="font-semibold text-foreground"><AnimatedNumber value={calculation.baseMin} prefix="₹" springOptions={{ bounce: 0, duration: 1400 }} /> – <AnimatedNumber value={calculation.baseMax} prefix="₹" springOptions={{ bounce: 0, duration: 1400 }} /></span>
                </div>
                <div className="flex justify-between py-1.5 border-b text-xs">
                  <span className="text-muted-foreground">National Highway Tolls & FASTag (Est.)</span>
                  <span className="font-semibold text-foreground"><AnimatedNumber value={calculation.estTolls} prefix="₹" springOptions={{ bounce: 0, duration: 1400 }} /></span>
                </div>
                <div className="flex justify-between py-1.5 border-b text-xs">
                  <span className="text-muted-foreground">Loading / Unloading Hamali ({weightMt} MT)</span>
                  <span className="font-semibold text-foreground"><AnimatedNumber value={calculation.hamali} prefix="₹" springOptions={{ bounce: 0, duration: 1400 }} /></span>
                </div>
                <div className="flex justify-between py-1.5 text-xs">
                  <span className="text-muted-foreground">Estimated Route Distance</span>
                  <span className="font-semibold text-primary"><AnimatedNumber value={activeDistance} suffix=" km" springOptions={{ bounce: 0, duration: 1400 }} /></span>
                </div>
              </div>

              {/* Dedicated Online Booking Card with All India Transport */}
              <div className="pt-2">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#004d99] flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-[#0066cc]" /> All India Transport Service (AIT)
                    </span>
                    <Badge variant="outline" className="border-[#0066cc] text-[#0066cc] text-[10px] bg-white font-semibold">
                      Pan-India Dispatch
                    </Badge>
                  </div>
                  <p className="text-xs text-[#003366] leading-relaxed">
                    Book verified commercial trucks across India from <strong>₹1.3/Kg</strong>. Full Truck Load (FTL), Part Load (PTL), and Reefer fleets with live GPS tracking, in-transit transit insurance, and guaranteed vehicle placement across all states.
                  </p>
                  <a
                    href="https://allindiatransport.in/bhubaneswar-transport-service.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-liquid-glass-primary w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white shadow-[0_0_15px_rgba(20,122,77,0.3)] transition-all group"
                  >
                    <Truck className="h-4 w-4 shrink-0 text-emerald-300 group-hover:scale-110 transition-transform" />
                    <span>Book All India Commercial Truck</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  </a>
                  <div className="flex items-center justify-between text-[11px] text-[#004d99] pt-1">
                    <a
                      href="tel:+919310123456"
                      className="flex items-center gap-1 hover:underline font-medium"
                    >
                      <PhoneCall className="h-3 w-3 text-[#0066cc]" /> 24/7 Helpline: +91 9310-123456
                    </a>
                    <span className="text-muted-foreground">Pan-India Branch Network</span>
                  </div>
                </div>
              </div>

              {/* Secondary Reference */}
              <div className="pt-1">
                <div className="p-3 rounded-lg bg-[#fff8f5] border border-[#fbd4c2]/70 flex items-center justify-between text-xs text-[#7c2d0f]">
                  <div>
                    <span className="font-semibold block">Need rate verification?</span>
                    <span className="text-[11px] text-muted-foreground">TruckSuvidha National Freight Engine</span>
                  </div>
                  <a
                    href="https://trucksuvidha.com/FreightCalculator.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-liquid-glass inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground hover:text-white transition-all shrink-0 group"
                  >
                    <span>Rate Engine</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-white shrink-0 opacity-70" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Popular Agricultural Trade Corridors Table */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Pan-India Agricultural Mandi Freight Corridors
            </h2>
            <p className="text-xs text-muted-foreground">
              National trade benchmarks with direct All India Transport freight booking
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {["All", "North", "West", "South", "East", "National"].map((reg) => (
              <Button
                key={reg}
                size="sm"
                variant={corridorRegionFilter === reg ? "default" : "outline"}
                onClick={() => setCorridorRegionFilter(reg)}
                className="text-xs h-7 px-2.5"
              >
                {reg}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card shadow-xs overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Corridor Route</TableHead>
                <TableHead className="text-center">Region</TableHead>
                <TableHead className="text-center">Distance</TableHead>
                <TableHead>National Highway</TableHead>
                <TableHead>Primary Cargo</TableHead>
                <TableHead className="text-center">Vehicle Class</TableHead>
                <TableHead className="text-right">Est. Freight (5 MT)</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCorridors.map((corridor) => {
                const est5Mt = Math.round(corridor.distance * 40 + 3500);
                const estHours = Math.max(1, Math.round(corridor.distance / 45));
                const truckClass =
                  corridor.distance < 200
                    ? "Tata Ace / 14ft Eicher"
                    : corridor.distance < 600
                    ? "14ft - 19ft Truck"
                    : "19ft / Taurus Multi-Axle";
                const detailObj: FreightCorridorDetail = {
                  id: corridor.id,
                  route: corridor.name,
                  origin: corridor.origin,
                  destination: corridor.destination,
                  region: corridor.region,
                  dist: corridor.distance,
                  cost: est5Mt,
                  truck: truckClass,
                  time: estHours <= 12 ? `${estHours} hrs` : `${Math.ceil(estHours / 24)} days`,
                  highway: corridor.highway,
                  commodity: corridor.typicalCommodity,
                };
                return (
                  <TableRow
                    key={corridor.id}
                    onClick={() => setSelectedCorridorDetail(detailObj)}
                    className="cursor-pointer hover:bg-muted/60 transition-colors"
                    title={`Click for full freight & load breakdown on ${corridor.name}`}
                  >
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <span>{corridor.name}</span>
                          <span className="block text-[11px] font-normal text-muted-foreground">
                            {corridor.origin} → {corridor.destination}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-[10px]">
                        {corridor.region}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium text-foreground">
                      {corridor.distance} km
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {corridor.highway}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {corridor.typicalCommodity}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {corridor.distance < 200 ? "Tata Ace / 14ft Eicher" : corridor.distance < 600 ? "14ft - 19ft Truck" : "19ft / Taurus Multi-Axle"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      ₹{est5Mt.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCorridorId(corridor.id);
                            setFromCity(corridor.origin);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                        >
                          Select
                        </Button>
                        <a
                          href="https://allindiatransport.in/bhubaneswar-transport-service.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-liquid-glass-primary inline-flex items-center gap-1 text-xs h-7 px-2.5 rounded-lg font-semibold text-white shadow-xs transition-all"
                        >
                          <span>Book</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-80" />
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <FreightDetailModal
        corridor={selectedCorridorDetail}
        isOpen={!!selectedCorridorDetail}
        onClose={() => setSelectedCorridorDetail(null)}
        onLoadInCalculator={(corridor) => {
          if (corridor.id) setSelectedCorridorId(corridor.id);
          if (corridor.origin) setFromCity(corridor.origin);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
