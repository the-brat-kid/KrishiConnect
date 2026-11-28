"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Truck,
  MapPin,
  Navigation,
  Clock,
  IndianRupee,
  ExternalLink,
  ShieldCheck,
  Scale,
  ArrowRight,
  Route,
  Fuel,
  PackageCheck,
  PhoneCall,
  CheckCircle2,
  Calculator,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface FreightCorridorDetail {
  id?: string;
  route: string;
  origin?: string;
  destination?: string;
  region?: string;
  dist: number;
  cost: number;
  truck: string;
  time: string;
  highway?: string;
  commodity?: string;
}

interface FreightDetailModalProps {
  corridor: FreightCorridorDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onLoadInCalculator?: (corridor: FreightCorridorDetail) => void;
}

export function FreightDetailModal({
  corridor,
  isOpen,
  onClose,
  onLoadInCalculator,
}: FreightDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "calculator">("overview");
  const [loadTonnes, setLoadTonnes] = useState<number>(5);

  const breakdown = useMemo(() => {
    if (!corridor) return null;
    const baseFare = corridor.cost;
    const tollEstimate = Math.round((corridor.dist / 100) * 260);
    const hamaliEstimate = Math.round(loadTonnes * 190);
    const scaleFactor = Math.max(0.65, loadTonnes / 5);
    const adjustedFreight = Math.round(baseFare * scaleFactor);
    const totalEstimate = adjustedFreight + tollEstimate + hamaliEstimate;
    const costPerQuintal = Math.round(totalEstimate / (loadTonnes * 10));
    const costPerKg = (totalEstimate / (loadTonnes * 1000)).toFixed(2);

    return {
      adjustedFreight,
      tollEstimate,
      hamaliEstimate,
      totalEstimate,
      costPerQuintal,
      costPerKg,
    };
  }, [corridor, loadTonnes]);

  if (!corridor || !breakdown) return null;

  const originText = corridor.origin || "Bhubaneswar / Khordha Hub";
  const destinationText = corridor.destination || corridor.route;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col p-0 rounded-2xl border border-white/15 bg-[#0c0d0e]/95 backdrop-blur-2xl shadow-2xl text-foreground overflow-hidden">
        <DialogHeader className="p-5 pb-4 border-b border-white/10 bg-white/[0.02] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold tracking-wider border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                >
                  {corridor.region ? `${corridor.region} Corridor` : "Active Dispatch Corridor"}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono border-white/20 bg-white/[0.05] text-foreground"
                >
                  {corridor.highway || "NH-16 / APMC Freight"}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="truncate">{corridor.route}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {originText} → {destinationText}
                </span>
              </DialogDescription>
            </div>

            <div className="text-right shrink-0 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] uppercase text-muted-foreground block font-semibold">
                Base Route Fare
              </span>
              <span className="text-xl font-extrabold font-mono text-emerald-400">
                ₹{corridor.cost.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "overview"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Corridor &amp; Vehicle Specs</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("calculator")}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "calculator"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Load &amp; Fare Breakdown</span>
            </button>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1 min-h-0">
          {activeTab === "overview" ? (
            <>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-semibold">
                    <Route className="w-3 h-3 text-emerald-400" /> Distance
                  </span>
                  <p className="text-base font-extrabold text-foreground font-mono mt-1">
                    {corridor.dist} km
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-semibold">
                    <Clock className="w-3 h-3 text-amber-400" /> Transit Time
                  </span>
                  <p className="text-base font-extrabold text-foreground mt-1">{corridor.time}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-semibold">
                    <Truck className="w-3 h-3 text-blue-400" /> Vehicle Class
                  </span>
                  <p className="text-sm font-bold text-foreground mt-1 truncate">{corridor.truck}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-emerald-400" />
                    <span>Primary Agro Cargo &amp; Packaging</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                    GPS + Transit Insured
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {corridor.commodity || "Paddy, Potato, Onion, Fresh Vegetables, and Bulk Grain Bags"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dispatch Guarantees</span>
                  </span>
                  <ul className="space-y-1 text-muted-foreground text-[11px]">
                    <li>• Vehicle placement within 45–90 mins of booking</li>
                    <li>• Live GPS link shared with farmer &amp; mandi buyer</li>
                    <li>• Tarpaulin weather-shield protection included</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fleet Inclusion &amp; Support</span>
                  </span>
                  <ul className="space-y-1 text-muted-foreground text-[11px]">
                    <li>• Verified commercial driver &amp; diesel included</li>
                    <li>• Digital mandi gate pass &amp; e-Way bill support</li>
                    <li>• 24/7 Dispatch Desk: +91 9310-123456</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>Select Consignment Load Weight</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">{loadTonnes} MT</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[1.5, 3, 5, 9, 16].map((mt) => (
                  <button
                    key={mt}
                    type="button"
                    onClick={() => setLoadTonnes(mt)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold border transition-all ${
                      loadTonnes === mt
                        ? "bg-emerald-600 text-white border-emerald-500"
                        : "bg-white/[0.03] border-white/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mt} MT ({mt * 10} Qtl)
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex justify-between text-muted-foreground">
                  <span>Base Freight Hire ({corridor.truck})</span>
                  <span className="font-mono font-semibold text-foreground">
                    ₹{breakdown.adjustedFreight.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>FASTag &amp; Highway Tolls (Est.)</span>
                  <span className="font-mono font-semibold text-foreground">
                    ₹{breakdown.tollEstimate.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Loading / Unloading Hamali ({loadTonnes} MT)</span>
                  <span className="font-mono font-semibold text-foreground">
                    ₹{breakdown.hamaliEstimate.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold">
                  <span className="text-foreground">Estimated All-Inclusive Freight</span>
                  <span className="font-mono text-emerald-400">
                    ₹{breakdown.totalEstimate.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-black/30 border border-white/10 text-center">
                  <span className="text-[10px] text-muted-foreground block">Per Quintal Impact</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    ₹{breakdown.costPerQuintal} / qtl
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/30 border border-white/10 text-center">
                  <span className="text-[10px] text-muted-foreground block">Per Kg Transport Cost</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ₹{breakdown.costPerKg} / kg
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Verified All-India APMC Transport Partner</span>
            </span>
            <a href="tel:+919310123456" className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-semibold">
              <PhoneCall className="w-3 h-3" /> Helpline
            </a>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {onLoadInCalculator ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onLoadInCalculator(corridor);
                onClose();
              }}
              className="text-xs border-white/15"
            >
              <Navigation className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Load in Calculator
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" asChild className="text-xs border-white/15">
              <Link href="/transportation" className="inline-flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                <span>Full Freight Calculator</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          )}

          <a
            href="https://allindiatransport.in/bhubaneswar-transport-service.html"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-liquid-glass-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Book Commercial Truck</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
