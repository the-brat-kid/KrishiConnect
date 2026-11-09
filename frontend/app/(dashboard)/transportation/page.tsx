"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AnimatedNumber } from "@/components/core/animated-number";
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
} from "lucide-react";

interface Corridor {
  id: string;
  name: string;
  destination: string;
  distance: number;
  highway: string;
  typicalCommodity: string;
}

const PRESET_CORRIDORS: Corridor[] = [
  { id: "cuttack", name: "Cuttack Mandi Hub", destination: "Cuttack, Odisha", distance: 28, highway: "NH-16", typicalCommodity: "Daily Vegetables, Greens" },
  { id: "puri", name: "Puri Coastal Market", destination: "Puri, Odisha", distance: 60, highway: "NH-316", typicalCommodity: "Coconut, Vegetables, Fish" },
  { id: "berhampur", name: "Berhampur Mandi", destination: "Berhampur, Odisha", distance: 170, highway: "NH-16", typicalCommodity: "Pulses, Vegetables, Grains" },
  { id: "balasore", name: "Balasore Mandi", destination: "Balasore, Odisha", distance: 205, highway: "NH-16", typicalCommodity: "Paddy, Betel Leaf, Tomato" },
  { id: "sambalpur", name: "Sambalpur Agri Market", destination: "Sambalpur, Odisha", distance: 280, highway: "NH-55", typicalCommodity: "Paddy, Groundnut, Chillies" },
  { id: "kolkata", name: "Kolkata Posta / Koley Mandi", destination: "Kolkata, West Bengal", distance: 440, highway: "NH-16", typicalCommodity: "Vegetables, Betel, Fruits" },
  { id: "ranchi", name: "Ranchi Daily Market", destination: "Ranchi, Jharkhand", distance: 500, highway: "NH-20 / NH-55", typicalCommodity: "Seasonal Vegetables, Pulses" },
  { id: "raipur", name: "Raipur Agri Mandi", destination: "Raipur, Chhattisgarh", distance: 550, highway: "NH-53", typicalCommodity: "Paddy, Pulses, Spices" },
  { id: "hyderabad", name: "Hyderabad Bowenpally", destination: "Hyderabad, Telangana", distance: 1050, highway: "NH-16 / NH-65", typicalCommodity: "Ginger, Spices, Perishables" },
  { id: "delhi", name: "Delhi Azadpur Mandi", destination: "Delhi NCR", distance: 1520, highway: "NH-19 / NH-16", typicalCommodity: "Bulk Agricultural Consignments" },
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
    description: "Best for farm gate to local Bhubaneswar / Cuttack mandi supply",
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
    description: "Ideal for regional intra-state mandi hauls (Puri, Balasore, Berhampur)",
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
    description: "Standard truck for inter-district & neighbouring state bulk cargo",
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
    description: "Heavy commercial long-haul for grain, paddy and interstate bulk",
  },
  {
    id: "reefer-cold",
    name: "Reefer / Refrigerated Truck",
    capacityText: "3.0 – 10.0 MT",
    maxWeight: 10,
    baseFare: 8000,
    perKmMin: 58,
    perKmMax: 76,
    tollPer100Km: 450,
    description: "Cold-chain temperature controlled for perishable tomatoes, mushrooms, fruits",
  },
];

export default function TransportationPage() {
  const [fromCity, setFromCity] = useState("Bhubaneswar, Odisha");
  const [selectedCorridorId, setSelectedCorridorId] = useState("cuttack");
  const [customDestination, setCustomDestination] = useState("");
  const [customDistance, setCustomDistance] = useState<number | "">("");
  const [commodity, setCommodity] = useState("Fruits & Vegetables (Fresh Mandi Harvest)");
  const [weightMt, setWeightMt] = useState<number>(3);
  const [selectedTruckId, setSelectedTruckId] = useState("canter-14");

  // Determine active destination and distance
  const activeDistance = useMemo(() => {
    if (selectedCorridorId === "custom") {
      return typeof customDistance === "number" && customDistance > 0 ? customDistance : 50;
    }
    const c = PRESET_CORRIDORS.find((item) => item.id === selectedCorridorId);
    return c ? c.distance : 50;
  }, [selectedCorridorId, customDistance]);

  const activeDestination = useMemo(() => {
    if (selectedCorridorId === "custom") {
      return customDestination || "Custom Destination";
    }
    const c = PRESET_CORRIDORS.find((item) => item.id === selectedCorridorId);
    return c ? c.destination : "Mandi Destination";
  }, [selectedCorridorId, customDestination]);

  const activeTruck = useMemo(() => {
    return TRUCK_TYPES.find((t) => t.id === selectedTruckId) || TRUCK_TYPES[1];
  }, [selectedTruckId]);

  // Freight calculation based on TruckSuvidha logistics standards
  const calculation = useMemo(() => {
    const distance = Math.max(activeDistance, 10);
    const weight = Math.max(weightMt || 1, 0.5);

    const baseMin = Math.max(activeTruck.baseFare, distance * activeTruck.perKmMin);
    const baseMax = Math.max(Math.round(activeTruck.baseFare * 1.15), distance * activeTruck.perKmMax);

    // Commodity multiplier
    let factor = 1.0;
    if (commodity.includes("Perishables") || commodity.includes("Cold Storage")) {
      factor = 1.15;
    } else if (commodity.includes("Seeds") || commodity.includes("Fertilizer")) {
      factor = 1.05;
    }

    const estTolls = Math.round((distance / 100) * activeTruck.tollPer100Km);
    const hamali = Math.round(weight * 180); // ~Rs 180 / MT loading/unloading

    const totalMin = Math.round(baseMin * factor + estTolls + hamali);
    const totalMax = Math.round(baseMax * factor + estTolls + hamali);

    const totalQuintals = weight * 10;
    const totalKg = weight * 1000;

    const perQuintalMin = Math.round(totalMin / totalQuintals);
    const perQuintalMax = Math.round(totalMax / totalQuintals);

    const perKgMin = (totalMin / totalKg).toFixed(2);
    const perKgMax = (totalMax / totalKg).toFixed(2);

    const hours = Math.round(distance / 40);
    const transitTime =
      hours <= 2
        ? "1 – 2 Hours (Same Day)"
        : hours <= 8
        ? `${hours - 1} – ${hours + 2} Hours (Same Day)`
        : `${Math.ceil(hours / 24)} – ${Math.ceil(hours / 24) + 1} Days`;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified Mandi Logistics
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" />
            Agricultural Transportation & Freight
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Calculate mandi freight charges, vehicle hire rates, and book commercial transport online.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <a
            href="https://www.trukky.com/bhubaneswar-transport-services"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="flex items-center gap-2 bg-[#0066cc] hover:bg-[#0052a3] text-white shadow-sm font-semibold">
              <Truck className="h-4 w-4" />
              <span>Book Truck Online</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>

          <a
            href="https://trucksuvidha.com/FreightCalculator.aspx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <span>Freight Calculator</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
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
                Specify pickup point, destination mandi, cargo type and truck size
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* From / Origin */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">From (Origin Mandi / Farm Gate)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                  <Input
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    placeholder="Enter pickup city or hub..."
                    className="pl-9 bg-card font-medium"
                  />
                </div>
                {/* Quick origin buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Bhubaneswar, Odisha", "Cuttack, Odisha", "Puri, Odisha", "Sambalpur, Odisha"].map((city) => (
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
                  onChange={(e) => setSelectedCorridorId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                >
                  <optgroup label="Odisha Mandi Corridors">
                    {PRESET_CORRIDORS.slice(0, 5).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.distance} km) • {c.highway}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Interstate Agricultural Hubs">
                    {PRESET_CORRIDORS.slice(5).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.distance} km) • {c.highway}
                      </option>
                    ))}
                  </optgroup>
                  <option value="custom">-- Custom Destination & Distance --</option>
                </select>

                {selectedCorridorId === "custom" && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Destination City</Label>
                      <Input
                        placeholder="e.g. Rourkela"
                        value={customDestination}
                        onChange={(e) => setCustomDestination(e.target.value)}
                        className="bg-card mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Road Distance (km)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 330"
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
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Crop / Material</Label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Fruits & Vegetables (Fresh Mandi Harvest)">Fruits & Vegetables (Fresh Mandi)</option>
                    <option value="Grains & Cereals (Paddy, Rice, Wheat)">Grains & Cereals (Paddy, Rice, Wheat)</option>
                    <option value="Perishables (Cold-Chain Reefer Required)">Perishables (Cold Chain Required)</option>
                    <option value="Seeds & Organic Fertilizers">Seeds & Fertilizers</option>
                    <option value="Processed Agri Food Bags">Processed Agri Food Bags</option>
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
                    max={30}
                    step={0.5}
                    value={weightMt}
                    onChange={(e) => setWeightMt(parseFloat(e.target.value) || 1)}
                    className="bg-card font-medium"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>1 MT (Mini Truck)</span>
                    <span>5 MT (Canter)</span>
                    <span>15 MT+ (Taurus)</span>
                  </div>
                </div>
              </div>

              {/* Truck Type Selection */}
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Select Truck / Vehicle Type</Label>
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
                  Freight Estimate
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {calculation.transitTime}
                </span>
              </div>

              {/* RATE KE SAAMNE BOOK BUTTON (DIRECT TRUKKY INTEGRATION) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3 pt-1">
                <div>
                  <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    <AnimatedNumber value={calculation.totalMin} prefix="₹" springOptions={{ bounce: 0, duration: 1500 }} /> – <AnimatedNumber value={calculation.totalMax} prefix="₹" springOptions={{ bounce: 0, duration: 1500 }} />
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Estimated freight for <AnimatedNumber value={activeDistance} suffix=" km" springOptions={{ bounce: 0, duration: 1400 }} /> trip
                  </CardDescription>
                </div>

                {/* Booking Button right next to rate */}
                <a
                  href="https://www.trukky.com/bhubaneswar-transport-services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button className="w-full sm:w-auto bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold flex items-center gap-1.5 shadow-md h-10 px-4">
                    <span>Book Truck</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
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
                    href="https://www.trukky.com/bhubaneswar-transport-services"
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
                  Farmers can factor this ₹{calculation.perKg} / kg transport cost directly into their mandi sales price.
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
                  <span className="text-muted-foreground">Highway Tolls & FASTag (Est.)</span>
                  <span className="font-semibold text-foreground"><AnimatedNumber value={calculation.estTolls} prefix="₹" springOptions={{ bounce: 0, duration: 1400 }} /></span>
                </div>
                <div className="flex justify-between py-1.5 border-b text-xs">
                  <span className="text-muted-foreground">Loading / Unloading Hamali ({weightMt} MT)</span>
                  <span className="font-semibold text-foreground"><AnimatedNumber value={calculation.hamali} prefix="₹" springOptions={{ bounce: 0, duration: 1400 }} /></span>
                </div>
                <div className="flex justify-between py-1.5 text-xs">
                  <span className="text-muted-foreground">Estimated Trip Distance</span>
                  <span className="font-semibold text-primary"><AnimatedNumber value={activeDistance} suffix=" km" springOptions={{ bounce: 0, duration: 1400 }} /></span>
                </div>
              </div>

              {/* Dedicated Online Booking Card */}
              <div className="pt-2">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#004d99] flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-[#0066cc]" /> Commercial Transport & Booking
                    </span>
                    <Badge variant="outline" className="border-[#0066cc] text-[#0066cc] text-[10px] bg-white font-semibold">
                      Online Booking
                    </Badge>
                  </div>
                  <p className="text-xs text-[#003366] leading-relaxed">
                    Book verified commercial trucks in Bhubaneswar from <strong>₹1.3/Kg</strong>. Full Truck Load (FTL) and Part Load (PTL) available with live GPS tracking, insurance, and 100% placement assurance.
                  </p>
                  <a
                    href="https://www.trukky.com/bhubaneswar-transport-services"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white flex items-center justify-center gap-2 text-sm h-10 shadow-sm font-semibold">
                      <span>Book Truck Online</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                  <div className="flex items-center justify-between text-[11px] text-[#004d99] pt-1">
                    <span className="flex items-center gap-1">
                      <PhoneCall className="h-3 w-3 text-[#0066cc]" /> Call: +91 72278 72278
                    </span>
                    <span className="text-muted-foreground">Instant Live Pricing</span>
                  </div>
                </div>
              </div>

              {/* Secondary Reference */}
              <div className="pt-1">
                <div className="p-3 rounded-lg bg-[#fff8f5] border border-[#fbd4c2]/70 flex items-center justify-between text-xs text-[#7c2d0f]">
                  <div>
                    <span className="font-semibold block">Need rate verification?</span>
                    <span className="text-[11px] text-muted-foreground">Check distance and live rates</span>
                  </div>
                  <a
                    href="https://trucksuvidha.com/FreightCalculator.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="h-7 text-xs border-[#d85c27] text-[#d85c27] hover:bg-[#fff0e8]">
                      <span>Rate Engine</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
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
              Popular Agricultural Mandi Trade Corridors from Bhubaneswar
            </h2>
            <p className="text-xs text-muted-foreground">
              Standard commercial freight benchmarks with direct online truck booking
            </p>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto text-xs">
            10 Regular Corridors
          </Badge>
        </div>

        <div className="rounded-lg border bg-card shadow-xs overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Destination Mandi</TableHead>
                <TableHead className="text-center">Distance</TableHead>
                <TableHead>Highway Route</TableHead>
                <TableHead>Typical Cargo</TableHead>
                <TableHead className="text-center">Recommended Vehicle</TableHead>
                <TableHead className="text-right">Est. Freight (5 MT)</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PRESET_CORRIDORS.map((corridor) => {
                const est5Mt = Math.round(corridor.distance * 40 + 3500);
                return (
                  <TableRow key={corridor.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{corridor.name}</span>
                      </div>
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
                      {corridor.distance < 100 ? "Tata Ace / 14ft Eicher" : corridor.distance < 300 ? "14ft - 19ft Truck" : "19ft / Taurus Multi-Axle"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      ₹{est5Mt.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCorridorId(corridor.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                        >
                          Calculate
                        </Button>
                        {/* Direct Booking Button right next to rate */}
                        <a
                          href="https://www.trukky.com/bhubaneswar-transport-services"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            className="text-xs h-7 px-2.5 bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold flex items-center gap-1 shadow-xs"
                          >
                            <span>Book Truck</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
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
    </div>
  );
}
