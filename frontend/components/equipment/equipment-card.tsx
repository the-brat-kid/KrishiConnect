"use client";

import React from "react";
import {
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Fuel,
  UserCheck,
  Layers,
  Sparkles,
  Tractor,
  Eye,
  Info,
} from "lucide-react";
import { EquipmentItem } from "@/types/equipment";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EquipmentCardProps {
  item: EquipmentItem;
  onBook: (item: EquipmentItem) => void;
  onViewDetails?: (item: EquipmentItem) => void;
}

const CATEGORY_LABELS: Record<EquipmentItem["category"], string> = {
  tractors: "Tractor",
  harvesters: "Harvester",
  tillage: "Tillage",
  sowing: "Sowing",
  sprayers: "Sprayers & Drones",
  irrigation: "Irrigation & Threshing",
};

export function EquipmentCard({ item, onBook, onViewDetails }: EquipmentCardProps) {
  const handleOpenDetails = () => {
    if (onViewDetails) {
      onViewDetails(item);
    } else {
      onBook(item);
    }
  };

  return (
    <Card
      onClick={handleOpenDetails}
      className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0c0c0e]/90 backdrop-blur-xl shadow-md hover:border-emerald-500/40 hover:shadow-xl transition-all cursor-pointer group"
    >
      <CardHeader className="p-4 pb-3 space-y-2 border-b border-white/[0.06]">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 border-white/15 bg-white/[0.04] text-[#C0C0C0]"
          >
            {CATEGORY_LABELS[item.category] || item.category}
          </Badge>

          <div className="flex items-center gap-1.5">
            {item.verified && (
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-1.5 border-emerald-500/40 text-emerald-400 bg-emerald-500/10 gap-1 font-medium"
              >
                <ShieldCheck className="h-3 w-3" />
                Verified
              </Badge>
            )}
            <span
              className={`h-2 w-2 rounded-full ${
                item.isAvailable ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-zinc-600"
              }`}
              title={item.isAvailable ? "Available" : "Currently Engaged"}
            />
          </div>
        </div>

        {/* Title & Brand */}
        <div>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {item.brand}
          </span>
          <h3 className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-emerald-400 transition-colors">
            {item.name}
          </h3>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {item.location}, {item.district}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 flex-1 text-xs">
        {/* Key Technical Specs */}
        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Capacity / Power</span>
            <span className="font-semibold text-white">
              {item.powerHp || item.capacity || "Standard"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {item.specs}
          </p>
        </div>

        {/* Policy Badges (Operator / Fuel) */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/10 text-[10px] text-muted-foreground font-medium">
            <UserCheck className="h-3 w-3 text-muted-foreground" />
            {item.operatorIncluded ? "Operator Included" : "Self Operate"}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/10 text-[10px] text-muted-foreground font-medium">
            <Fuel className="h-3 w-3 text-muted-foreground" />
            {item.fuelPolicy === "operator"
              ? "Operator Fuel"
              : item.fuelPolicy === "included"
              ? "Fuel Included"
              : "Renter Fuel"}
          </span>
        </div>

        {/* Transparent Rates Grid */}
        <div className="pt-2 border-t border-white/[0.06]">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">
            Rental Rates
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div
              className={`p-1.5 rounded-md border ${
                item.primaryPricing === "hour"
                  ? "bg-white/[0.05] border-white/20"
                  : "bg-white/[0.01] border-white/5"
              }`}
            >
              <span className="block text-[10px] text-muted-foreground">Hourly</span>
              <span className="font-mono text-xs font-bold text-white">
                {item.pricePerHour ? `₹${item.pricePerHour}` : "N/A"}
              </span>
            </div>
            <div
              className={`p-1.5 rounded-md border ${
                item.primaryPricing === "acre"
                  ? "bg-white/[0.05] border-white/20"
                  : "bg-white/[0.01] border-white/5"
              }`}
            >
              <span className="block text-[10px] text-muted-foreground">Per Acre</span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {item.pricePerAcre ? `₹${item.pricePerAcre}` : "N/A"}
              </span>
            </div>
            <div
              className={`p-1.5 rounded-md border ${
                item.primaryPricing === "day"
                  ? "bg-white/[0.05] border-white/20"
                  : "bg-white/[0.01] border-white/5"
              }`}
            >
              <span className="block text-[10px] text-muted-foreground">Daily</span>
              <span className="font-mono text-xs font-bold text-white">
                {item.pricePerDay ? `₹${item.pricePerDay}` : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter
        className="p-4 pt-0 gap-2 border-t border-white/[0.04]"
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href={`tel:${item.contactPhone}`}
          className="inline-flex items-center justify-center h-9 px-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-muted-foreground hover:text-white transition-colors text-xs font-medium"
          title={`Call hub: ${item.contactPhone}`}
        >
          <Phone className="h-3.5 w-3.5" />
        </a>
        <Button
          type="button"
          variant="outline"
          onClick={handleOpenDetails}
          className="h-9 px-3 text-xs border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-white font-medium"
        >
          Details
        </Button>
        <Button
          onClick={() => onBook(item)}
          disabled={!item.isAvailable}
          className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors"
        >
          {item.isAvailable ? "Book Now" : "Unavailable"}
        </Button>
      </CardFooter>
    </Card>
  );
}
