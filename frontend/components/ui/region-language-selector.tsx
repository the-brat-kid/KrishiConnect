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
import { MapPin, Globe, Check, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
    availableLanguages,
    currentRegionDef,
    t,
  } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);

  // Variant A: Embedded Login Card Experience
  if (variant === "login") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-emerald-500/25 bg-emerald-950/20 dark:bg-[#071910]/80 p-4 backdrop-blur-md space-y-3.5 shadow-sm transition-all",
          className
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Region Picker Dropdown */}
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{t("login.regionPrompt")}</span>
            </label>

            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between h-9 px-3 bg-card/80 hover:bg-card border-emerald-500/30 text-xs font-medium"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-base">{currentRegionDef.flag}</span>
                    <span className="font-semibold text-foreground">
                      {currentRegionDef.name}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      ({currentRegionDef.nativeName})
                    </span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1.5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-72 max-h-80 overflow-y-auto p-1.5 bg-card/95 backdrop-blur-2xl border-emerald-500/20"
              >
                <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-1">
                  Select Agricultural Region of India
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

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
                        "flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs",
                        isSelected
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{reg.flag}</span>
                        <div className="flex flex-col">
                          <span>{reg.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {reg.nativeName} • APMC: {reg.primaryHubs[0]}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Language Pills for Active Region */}
          <div className="sm:w-auto">
            <label className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>{t("login.languagePrompt")}</span>
            </label>

            <div className="flex items-center gap-1.5 flex-wrap">
              {availableLanguages.map((langCode) => {
                const isCurrent = language === langCode;
                const meta = LANGUAGE_METADATA[langCode];
                return (
                  <button
                    key={langCode}
                    type="button"
                    onClick={() => setLanguage(langCode)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                      isCurrent
                        ? "bg-emerald-500 text-black font-bold shadow-xs scale-102"
                        : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                    )}
                  >
                    <span>{meta.nativeName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Context Notice */}
        <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 flex items-center gap-1.5 pt-1 border-t border-emerald-500/15">
          <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
          <span>
            {t("login.regionNotice", { region: `${currentRegionDef.name} (${currentRegionDef.nativeName})` })}
          </span>
        </div>
      </div>
    );
  }

  // Variant B: Header Utility Pill
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 rounded-full border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-1.5"
          >
            <span>{currentRegionDef.flag}</span>
            <span className="hidden sm:inline font-semibold">{currentRegionDef.name}</span>
            <span className="text-[10px] opacity-80">({LANGUAGE_METADATA[language].nativeName})</span>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 p-1.5 bg-card/95 backdrop-blur-2xl">
          <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-1">
            Change Region & Language
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Language Switch Section */}
          <div className="p-2 bg-muted/40 rounded-lg mb-2">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">
              Available Languages
            </div>
            <div className="flex flex-wrap gap-1">
              {availableLanguages.map((langCode) => (
                <button
                  key={langCode}
                  type="button"
                  onClick={() => setLanguage(langCode)}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs transition-all",
                    language === langCode
                      ? "bg-emerald-500 text-black font-bold"
                      : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                  )}
                >
                  {LANGUAGE_METADATA[langCode].nativeName}
                </button>
              ))}
            </div>
          </div>

          <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-1">
            Farming States
          </DropdownMenuLabel>

          {Object.values(REGIONS).map((reg) => (
            <DropdownMenuItem
              key={reg.id}
              onClick={() => setRegion(reg.id as RegionId)}
              className={cn(
                "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-xs",
                reg.id === region && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
              )}
            >
              <span className="flex items-center gap-2">
                <span>{reg.flag}</span>
                <span>{reg.name} ({reg.nativeName})</span>
              </span>
              {reg.id === region && <Check className="w-3.5 h-3.5 text-emerald-500" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
