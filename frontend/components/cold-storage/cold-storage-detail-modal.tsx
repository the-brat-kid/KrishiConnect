"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Warehouse,
  Thermometer,
  Droplets,
  MapPin,
  Phone,
  ShieldCheck,
  Zap,
  Camera,
  CheckCircle2,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { ColdStorageFacility } from "@/types/cold-storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ColdStorageDetailModalProps {
  facility: ColdStorageFacility | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (facility: ColdStorageFacility) => void;
}

export function ColdStorageDetailModal({
  facility,
  isOpen,
  onClose,
  onBook,
}: ColdStorageDetailModalProps) {
  const [simQuintals, setSimQuintals] = useState<number>(50);
  const [simDays, setSimDays] = useState<number>(30);

  if (!facility) return null;

  const capacityUsedPercent = Math.round(
    ((facility.total_capacity_quintals - facility.available_capacity_quintals) /
      facility.total_capacity_quintals) *
      100
  );

  const estimatedRent = Math.round(simQuintals * facility.daily_rate_per_quintal * simDays);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl w-[95vw] max-h-[90vh] flex flex-col p-0 rounded-2xl border border-white/15 bg-[#0c0d0e]/95 backdrop-blur-2xl shadow-2xl text-foreground overflow-hidden">
        <DialogHeader className="p-5 pb-4 border-b border-white/10 bg-white/[0.02] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold tracking-wider border-cyan-500/40 text-cyan-400 bg-cyan-500/10"
                >
                  Live Telemetry Vault
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10 flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" /> WDRA e-NWR Eligible
                </Badge>
              </div>
              <DialogTitle className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="truncate">{facility.name}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  {facility.location}, {facility.district}, {facility.state}
                  {facility.pincode ? ` (${facility.pincode})` : ""}
                </span>
              </DialogDescription>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shrink-0">
              <Thermometer className="w-3.5 h-3.5" />
              <span>{facility.current_temp_celsius}°C</span>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Chamber Telemetry Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-semibold">
                <Thermometer className="w-3 h-3 text-cyan-400" /> Temp Band
              </span>
              <p className="text-sm font-extrabold font-mono text-foreground mt-1">
                {facility.temp_min_celsius}°C – {facility.temp_max_celsius}°C
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-semibold">
                <Droplets className="w-3 h-3 text-blue-400" /> Humidity
              </span>
              <p className="text-sm font-extrabold font-mono text-foreground mt-1">
                {facility.humidity_percentage}% RH
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Daily Rent
              </span>
              <p className="text-sm font-extrabold font-mono text-emerald-400 mt-1">
                ₹{facility.daily_rate_per_quintal}/qtl/day
              </p>
            </div>
          </div>

          {/* Capacity Progress */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Chamber Vacancy &amp; Utilization</span>
              <span className="font-mono font-bold text-cyan-400">
                {facility.available_capacity_quintals.toLocaleString("en-IN")} /{" "}
                {facility.total_capacity_quintals.toLocaleString("en-IN")} Qtl Free
              </span>
            </div>
            <Progress value={capacityUsedPercent} size="sm" />
            <p className="text-[11px] text-muted-foreground">
              Currently {capacityUsedPercent}% occupied. Instant chamber allocation available.
            </p>
          </div>

          {/* Infrastructure Features */}
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{facility.has_backup_power ? "24/7 DG Backup" : "Grid Power"}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{facility.has_cctv ? "24x7 CCTV Audit" : "Monitored"}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{facility.has_humidity_control ? "Auto RH Control" : "Standard"}</span>
            </div>
          </div>

          {/* Suitable Crops */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Approved Crops &amp; Commodities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {facility.suitable_crops.map((crop) => (
                <span
                  key={crop}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-semibold text-[11px]"
                >
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  {crop}
                </span>
              ))}
            </div>
          </div>

          {/* Rent Estimator */}
          <div className="p-4 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/25 space-y-3">
            <span className="font-bold text-foreground block">Storage Rent Estimator</span>
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Lot:</span>
                {[25, 50, 100, 200].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSimQuintals(q)}
                    className={`px-2 py-1 rounded-md font-mono text-[11px] font-semibold border ${
                      simQuintals === q
                        ? "bg-emerald-600 text-white border-emerald-500"
                        : "bg-white/[0.03] border-white/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {q} Qtl
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Days:</span>
                {[15, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSimDays(d)}
                    className={`px-2 py-1 rounded-md font-mono text-[11px] font-semibold border ${
                      simDays === d
                        ? "bg-cyan-600 text-white border-cyan-500"
                        : "bg-white/[0.03] border-white/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-muted-foreground">
                {simQuintals} Qtl × {simDays} days @ ₹{facility.daily_rate_per_quintal}/qtl/day
              </span>
              <span className="text-lg font-extrabold font-mono text-emerald-400">
                ₹{estimatedRent.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${facility.contact_phone}`}
              className="btn-liquid-glass inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-white"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>{facility.contact_phone}</span>
            </a>
            <Button type="button" variant="outline" size="sm" asChild className="text-xs border-white/15">
              <Link href="/cold-storage" className="inline-flex items-center gap-1.5">
                <span>All Vaults</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>

          <Button
            type="button"
            onClick={() => {
              onClose();
              onBook(facility);
            }}
            disabled={facility.available_capacity_quintals <= 0}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 h-9"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            <span>Book Chamber Space</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
