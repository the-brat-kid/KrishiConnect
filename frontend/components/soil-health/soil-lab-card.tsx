"use client";

import React from "react";
import { SoilHealthLab } from "@/types/soil-health";
import {
  FlaskConical,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Clock,
  Truck,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SoilLabCardProps {
  lab: SoilHealthLab;
  onBook: (lab: SoilHealthLab) => void;
  onViewDetails?: (lab: SoilHealthLab) => void;
}

export function SoilLabCard({ lab, onBook, onViewDetails }: SoilLabCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => (onViewDetails ? onViewDetails(lab) : onBook(lab))}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (onViewDetails ? onViewDetails(lab) : onBook(lab))}
      className="cursor-pointer relative group rounded-2xl border border-white/10 dark:border-white/10 bg-white/70 dark:bg-[#0c0d0e]/80 backdrop-blur-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-emerald-500/40 flex flex-col justify-between"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
                  {lab.district} Hub
                </span>
                <span className="flex items-center text-[11px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-amber-500 mr-1" />
                  {lab.rating}
                </span>
              </div>
              <h3 className="font-bold text-base text-foreground leading-snug line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {lab.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Location & Accreditation */}
        <div className="space-y-1.5 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
            <span>{lab.location}, {lab.district}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400/90 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{lab.accreditation}</span>
          </div>
        </div>

        {/* Quick Highlights / Badges */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{lab.turnaround_days} Days Report</span>
          </div>
          <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
            <Truck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{lab.doorstep_collection ? "Doorstep Pickup" : "Lab Drop-off"}</span>
          </div>
        </div>

        {/* Supported Test Packages */}
        <div className="mb-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Test Panels Available
          </span>
          <div className="flex flex-wrap gap-1.5">
            {lab.supported_tests.slice(0, 3).map((test, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
              >
                <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-500" />
                {test}
              </span>
            ))}
            {lab.supported_tests.length > 3 && (
              <span className="text-[11px] text-muted-foreground px-1 py-0.5">
                +{lab.supported_tests.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer & CTA */}
      <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            Govt Subsidized From
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-foreground">₹{lab.base_fee}</span>
            <span className="text-[11px] text-muted-foreground">/ sample</span>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <a
            href={`tel:${lab.contact_phone}`}
            className="p-2.5 rounded-xl border border-input hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Call Laboratory"
          >
            <Phone className="w-4 h-4" />
          </a>
          <Button
            onClick={() => onBook(lab)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 h-9 shadow-sm flex items-center gap-1.5"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Book Check</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
