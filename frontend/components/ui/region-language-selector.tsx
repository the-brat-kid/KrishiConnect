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
  DropdownMenuLabel,
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

  // Variant A: Embedded Login Card Experience (Clean, no clutter)
  if (variant === "login") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-emerald-500/25 bg-emerald-950/20 dark:bg-[#071910]/80 p-3.5 backdrop-blur-md space-y-3 shadow-sm",
          className
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* State Picker */}
          <div>
            <label className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>State</span>
            </label>

            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as RegionId)}
              className="w-full h-9 rounded-lg border border-emerald-500/30 bg-card px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 shadow-xs"
            >
              {Object.values(REGIONS).map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language Picker */}
          <div>
            <label className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5" />
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
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                      isCurrent
                        ? "bg-emerald-500 text-black font-bold shadow-xs"
                        : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
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

  // Variant B: Header Utility Pill (Clean, only state name)
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-full border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>{currentRegionDef.name}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 p-1.5 bg-card/95 backdrop-blur-2xl max-h-96 overflow-y-auto">
          {/* State List - ONLY STATE NAMES */}
          <div className="space-y-0.5">
            {Object.values(REGIONS).map((reg) => {
              const isSelected = reg.id === region;
              return (
                <DropdownMenuItem
                  key={reg.id}
                  onClick={() => {
                    setRegion(reg.id as RegionId);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer text-xs font-medium transition-colors",
                    isSelected
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <span>{reg.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Clean Language Row */}
          <div className="p-1.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
              Language
            </div>
            <div className="flex flex-wrap gap-1">
              {ALL_LANGUAGES.map((langCode) => (
                <button
                  key={langCode}
                  type="button"
                  onClick={() => {
                    setLanguage(langCode);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-all",
                    language === langCode
                      ? "bg-emerald-500 text-black font-bold"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {LANGUAGE_METADATA[langCode].nativeName}
                </button>
              ))}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
