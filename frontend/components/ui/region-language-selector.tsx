"use client";

import React, { useState } from "react";
import {
  useLanguage,
  REGIONS,
  RegionId,
  LanguageCode,
  LANGUAGE_METADATA,
} from "@/lib/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, MapPin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_LANGUAGES: LanguageCode[] = [
  "en",
  "hi",
  "or",
  "mr",
  "pa",
  "gu",
  "kn",
  "ta",
  "te",
  "bn",
  "ml",
];

interface RegionLanguageSelectorProps {
  variant?: "login" | "header" | "compact";
  className?: string;
}

export function RegionLanguageSelector({
  variant = "login",
  className,
}: RegionLanguageSelectorProps) {
  const {
    region,
    setRegion,
    language,
    setLanguage,
    currentRegionDef,
  } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);

  // Variant A: Embedded Login Card Experience with Apple Liquid Glass
  if (variant === "login") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-4.5 backdrop-blur-3xl backdrop-saturate-[190%]",
          "border border-white/20 dark:border-white/15",
          "bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-white/[0.01] dark:from-white/[0.08] dark:via-black/35 dark:to-black/60",
          "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_12px_36px_rgba(0,0,0,0.35)] space-y-3.5",
          className
        )}
      >
        {/* Subtle Top Specular Sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.15] to-transparent" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
          {/* State Picker */}
          <div>
            <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>State</span>
            </label>

            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as RegionId)}
              className="w-full h-11 rounded-xl border border-white/20 bg-white/[0.08] dark:bg-black/50 px-3.5 text-sm font-bold text-foreground backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25)] cursor-pointer transition-all hover:border-white/35"
            >
              {Object.values(REGIONS).map((reg) => (
                <option key={reg.id} value={reg.id} className="bg-card text-foreground py-1">
                  {reg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language Picker */}
          <div>
            <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Language</span>
            </label>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(currentRegionDef.supportedLangs.length > 0
                ? currentRegionDef.supportedLangs
                : ALL_LANGUAGES
              ).map((langCode) => {
                const isCurrent = language === langCode;
                const meta = LANGUAGE_METADATA[langCode];
                return (
                  <button
                    key={langCode}
                    type="button"
                    onClick={() => setLanguage(langCode)}
                    className={cn(
                      "h-9 px-3 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center",
                      isCurrent
                        ? "bg-gradient-to-b from-emerald-400 to-emerald-600 text-black font-extrabold shadow-[0_0_14px_rgba(16,185,129,0.45),inset_0_1px_1.5px_rgba(255,255,255,0.5)] scale-102"
                        : "bg-white/[0.06] hover:bg-white/[0.12] text-foreground/80 hover:text-white border border-white/15 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                    )}
                  >
                    {meta.nativeName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variant B & C: Larger Prominent Liquid Glass Button for Header / Top Nav
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "group relative h-10 sm:h-10.5 px-3.5 sm:px-4.5 rounded-full overflow-hidden transition-all duration-200",
              // Liquid Glass Base with heavy refraction & specular highlight
              "bg-gradient-to-b from-white/[0.16] via-white/[0.06] to-white/[0.02] dark:from-white/[0.12] dark:via-black/40 dark:to-black/60",
              "backdrop-blur-2xl backdrop-saturate-[200%]",
              "border border-white/25 dark:border-white/20 hover:border-emerald-500/60",
              "shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),inset_0_-1px_1px_rgba(0,0,0,0.3),0_6px_20px_rgba(0,0,0,0.35)]",
              "hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_8px_28px_rgba(16,185,129,0.3)]",
              "hover:-translate-y-0.5 active:translate-y-0 active:scale-98"
            )}
          >
            {/* Ambient Top Specular Arc */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-full" />

            <div className="relative z-10 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] shrink-0" />
              <span className="font-bold text-xs sm:text-sm text-foreground tracking-tight group-hover:text-white transition-colors">
                {currentRegionDef.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70 ml-0.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </Button>
        </DropdownMenuTrigger>

        {/* Liquid Glass Crystal Tray Popup Container */}
        <DropdownMenuContent
          align="end"
          className={cn(
            "w-60 p-2 rounded-2xl max-h-[26rem] overflow-y-auto",
            "bg-[#07140e]/90 dark:bg-[#040c07]/95 backdrop-blur-3xl backdrop-saturate-[200%]",
            "border border-white/20 dark:border-white/15",
            "shadow-[inset_0_1px_2px_rgba(255,255,255,0.35),0_20px_50px_rgba(0,0,0,0.7)]"
          )}
        >
          {/* State List - ONLY CLEAN STATE NAMES with Liquid Glass Hover Effect */}
          <div className="space-y-1">
            {Object.values(REGIONS).map((reg) => {
              const isSelected = reg.id === region;
              return (
                <DropdownMenuItem
                  key={reg.id}
                  onSelect={() => {
                    setRegion(reg.id as RegionId);
                    setIsOpen(false);
                  }}
                  onClick={() => {
                    setRegion(reg.id as RegionId);
                    setIsOpen(false);
                  }}
                  onPointerDown={() => {
                    setRegion(reg.id as RegionId);
                  }}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-150",
                    isSelected
                      ? "bg-gradient-to-r from-emerald-500/25 to-emerald-500/10 border border-emerald-400/40 text-emerald-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_0_16px_rgba(16,185,129,0.2)]"
                      : "text-foreground/85 hover:text-white hover:bg-white/[0.08] hover:border hover:border-white/15"
                  )}
                >
                  <span className="tracking-tight">{reg.name}</span>
                  {isSelected && (
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator className="my-2 bg-white/10" />

          {/* Clean Liquid Glass Language Selector Row */}
          <div className="p-1.5">
            <div className="text-[10px] font-bold text-emerald-400/90 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>Language</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {ALL_LANGUAGES.map((langCode) => {
                const isCurrent = language === langCode;
                return (
                  <button
                    key={langCode}
                    type="button"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setLanguage(langCode);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLanguage(langCode);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 cursor-pointer",
                      isCurrent
                        ? "bg-gradient-to-b from-emerald-400 to-emerald-600 text-black font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)]"
                        : "bg-white/[0.05] hover:bg-white/[0.12] text-foreground/80 hover:text-white border border-white/10 backdrop-blur-md"
                    )}
                  >
                    {LANGUAGE_METADATA[langCode].nativeName}
                  </button>
                );
              })}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
