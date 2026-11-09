

"use client"

import React from "react"
import { Thermometer, Droplets, MapPin, Phone, ShieldCheck, Zap } from "lucide-react"
import { ColdStorageFacility } from "@/types/cold-storage"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ColdStorageCardProps {
  facility: ColdStorageFacility
  onBook: (facility: ColdStorageFacility) => void
}

export function ColdStorageCard({ facility, onBook }: ColdStorageCardProps) {
  const capacityUsedPercent = Math.round(
    ((facility.total_capacity_quintals - facility.available_capacity_quintals) /
      facility.total_capacity_quintals) *
      100
  )

  const isLowCapacity = facility.available_capacity_quintals < facility.total_capacity_quintals * 0.15

  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl p-5 shadow-lg flex flex-col justify-between hover:border-primary/40 transition-all duration-200">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-foreground tracking-tight">{facility.name}</h3>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{facility.location}, {facility.district}</span>
            </p>
          </div>

          {/* Live Temperature Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-mono font-bold">
            <Thermometer className="h-3.5 w-3.5" />
            <span>{facility.current_temp_celsius}°C</span>
          </div>
        </div>

        {/* Capacity Indicator */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Available Space:</span>
            <span className="font-bold text-foreground font-mono">
              {facility.available_capacity_quintals} / {facility.total_capacity_quintals} Qtl
            </span>
          </div>
          <Progress
            value={capacityUsedPercent}
            variant={isLowCapacity ? "accent" : "primary"}
            size="sm"
          />
        </div>

        {/* Specs Pill List */}
        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border/40">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Droplets className="h-3.5 w-3.5 text-blue-400" />
            <span>Humidity: <strong className="text-foreground">{facility.humidity_percentage}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>{facility.has_backup_power ? "24/7 Genset" : "Standard Grid"}</span>
          </div>
        </div>

        {/* Crop Suitability Badges */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Suitable Crops</span>
          <div className="flex flex-wrap gap-1.5">
            {facility.suitable_crops.map((crop) => (
              <Badge key={crop} variant="secondary" className="text-[10px] px-2 py-0.5">
                {crop}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground">Storage Rate</span>
          <p className="text-base font-extrabold text-foreground font-mono">
            ₹{facility.daily_rate_per_quintal}
            <span className="text-[11px] font-normal text-muted-foreground"> /qtl/day</span>
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => onBook(facility)}
          disabled={facility.available_capacity_quintals <= 0}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {facility.available_capacity_quintals > 0 ? "Book Space" : "Full"}
        </Button>
      </div>
    </div>
  )
}