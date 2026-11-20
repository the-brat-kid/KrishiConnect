"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import {
  TrendingUp,
  Sprout,
  CloudSun,
  Truck,
  FileText,
  UserCircle,
  LogOut,
  Phone,
  Settings,
  Users,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Building2,
  MapPin,
  Sparkles,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "./notification-bell";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { STATE_NAMES, getMandisForState } from "@/lib/mandi-regions";
import { RegionLanguageSelector } from "@/components/ui/region-language-selector";
import { SwitchMode } from "@/components/ui/switch-mode";
import { TooltipNavbar, TooltipItem } from "@/components/ui/tooltip-navbar";
import { GlowEffect } from "@/components/core/glow-effect";

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { setTheme, theme } = useTheme();
  const { user, businessProfile, logout } = useAuth();
  const {
    currentRegionDef,
    t,
    selectedState,
    selectedPlaceId,
    selectedMandiObj,
    setRegionAndPlace,
  } = useLanguage();

  const currentPlaces = getMandisForState(selectedState);

  const displayName = user?.full_name || user?.name || businessProfile?.business_name || "Kisan";
  const userInitials = (displayName || "Kisan")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "KC";

  // Upgraded interactive Tooltip Navbar items with dynamic multilingual labels
  const quickNavItems: TooltipItem[] = [
    {
      icon: <TrendingUp className="h-full w-full" />,
      label: t("nav.dailyCropRates"),
      labelHasKeyword: ["R"],
      hasBadge: false,
      href: "/crop-rates",
    },
    {
      icon: <Sprout className="h-full w-full" />,
      label: t("nav.cropPlanner"),
      labelHasKeyword: ["P"],
      hasBadge: false,
      href: "/crop-planner",
    },
    {
      icon: <CloudSun className="h-full w-full" />,
      label: t("nav.weather"),
      labelHasKeyword: ["W"],
      hasBadge: false,
      href: "/weather",
    },
    {
      icon: <Truck className="h-full w-full" />,
      label: t("nav.transportation"),
      labelHasKeyword: ["T"],
      hasBadge: false,
      href: "/transportation",
    },
    {
      icon: <FileText className="h-full w-full" />,
      label: t("nav.invoices"),
      labelHasKeyword: ["I"],
      hasBadge: false,
      href: "/invoices",
    },
  ];

  return (
    <header className="flex h-16 w-full items-center justify-between px-1 sm:px-4 md:px-5 min-w-0">
      {/* Title + Mandi Status */}
      <div className="flex items-center gap-2.5 min-w-0 shrink-0">
        <div className="relative group flex items-center">
          <GlowEffect
            colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
            mode="colorShift"
            blur="soft"
            duration={3}
            scale={0.92}
          />
          <Link
            href="/dashboard"
            className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/80 dark:bg-black/60 backdrop-blur-md border border-border/50 hover:border-primary/50 shadow-xs transition-all cursor-pointer"
          >
            <span className="font-extrabold text-base sm:text-lg md:text-xl text-foreground tracking-tight font-plus-jakarta group-hover:text-primary transition-colors">
              KrishiConnect
            </span>
          </Link>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#242424] border border-[#3D3D3D] text-[11px] font-semibold text-[#C0C0C0] max-w-[280px]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0 shadow-[0_0_6px_#34d399]" />
          <span className="truncate">{selectedMandiObj ? selectedMandiObj.name : `${currentRegionDef.primaryHubs[0]} APMC`} {t("common.live")}</span>
        </div>
      </div>

      {/* Right Actions: Upgraded TooltipNavbar + Region/Lang + Notifications + SwitchMode + Account */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Modern Interactive Tooltip Navbar Dock */}
        <div className="hidden md:block">
          <TooltipNavbar items={quickNavItems} tooltipPosition="bottom" tooltipDelay={100} />
        </div>

        {/* Region & Language Selector Pill */}
        <RegionLanguageSelector variant="compact" />

        {/* Live Notifications */}
        <NotificationBell />

        {/* Animated Sliding SwitchMode Component */}
        <SwitchMode width={52} height={26} />

        {/* User Account Menu with Liquid Glass & Detailed Profile Card */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-white/20 bg-white/[0.05] dark:bg-black/40 hover:bg-white/[0.1] backdrop-blur-xl transition-all duration-200 cursor-pointer shadow-xs group focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              aria-label="User account menu"
            >
              <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-[0_0_10px_rgba(16,185,129,0.35)]">
                {userInitials}
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-black shadow-[0_0_6px_#34d399]" />
              </div>
              <span className="hidden xl:inline-block max-w-[100px] truncate text-xs font-semibold text-foreground/90 group-hover:text-white transition-colors">
                {displayName.split(" ")[0]}
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[330px] sm:w-[370px] p-0 rounded-2xl border border-white/20 dark:border-white/15 bg-neutral-950/95 dark:bg-[#0a0b0d]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_25px_rgba(16,185,129,0.18)] text-foreground overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
          >
            {/* Header Identity Card */}
            <div className="p-4 bg-linear-to-b from-emerald-950/40 via-emerald-950/15 to-transparent border-b border-white/10">
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-linear-to-tr from-emerald-500 via-teal-500 to-emerald-400 flex items-center justify-center text-white text-base font-extrabold shadow-[0_0_18px_rgba(16,185,129,0.45)] border border-white/20">
                    {userInitials}
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/80 border border-emerald-500/50">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm sm:text-base text-foreground truncate tracking-tight">
                      {displayName}
                    </h3>
                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                    {user?.email || "Pan-India Mandi Account"}
                  </p>
                  
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="badge-liquid-glass-emerald text-[10px] py-0.5 px-2">
                      <Sprout className="h-3 w-3" />
                      <span>{user?.role === "trader" ? "Mandi Trader" : "Farmer / Producer"}</span>
                    </span>
                    <Link
                      href="/settings?tab=kyc"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-colors cursor-pointer"
                      title="Offline Aadhaar Secure QR KYC Hub"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                      <span>Verified KYC</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>


            {/* Platform Region & Place Controller in User Login Menu */}
            <div className="p-3 mx-3 mt-3 rounded-2xl bg-white/[0.04] dark:bg-black/60 border border-white/12 backdrop-blur-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Region &amp; Mandi Yard</span>
                </span>
                <span className="badge-liquid-glass-emerald text-[9px] py-0.5 px-2">
                  Site Sync
                </span>
              </div>

              {/* Dual Controls: State & Mandi */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* State Select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground block">
                    State / Region
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setRegionAndPlace(e.target.value)}
                    className="w-full h-8 rounded-xl bg-black/80 border border-white/15 px-2 text-[11px] font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                  >
                    {STATE_NAMES.map((st) => (
                      <option key={st} value={st} className="bg-neutral-900 text-white">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mandi/Place Select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground block">
                    Mandi Hub
                  </label>
                  <select
                    value={selectedPlaceId}
                    onChange={(e) => setRegionAndPlace(selectedState, e.target.value)}
                    className="w-full h-8 rounded-xl bg-black/80 border border-white/15 px-2 text-[11px] font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer truncate"
                  >
                    {currentPlaces.map((pl) => (
                      <option key={pl.id} value={pl.id} className="bg-neutral-900 text-white">
                        {pl.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono pt-0.5 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">Active: {selectedMandiObj.name}</span>
              </div>
            </div>

            {/* Farm / Business Context Card */}
            <div className="p-3 mx-3 mt-2 rounded-xl bg-white/[0.04] dark:bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span>Enterprise / Farm</span>
                </span>
                <span className="text-emerald-400 text-[11px] font-mono">
                  {businessProfile?.gst_number ? `GST: ${businessProfile.gst_number.slice(0, 10)}...` : "Verified APMC"}
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground truncate">
                {businessProfile?.business_name || `${displayName}'s Mandi Trade Hub`}
              </p>
            </div>

            {/* Quick Actions & Navigation List */}
            <div className="p-2 space-y-1 mt-1">
              <DropdownMenuItem asChild className="cursor-pointer rounded-xl p-2.5 hover:bg-white/[0.08] focus:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10">
                <Link href="/settings?tab=kyc" className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground group-hover:text-white transition-colors flex items-center gap-1.5">
                        <span>KYC &amp; Identity Verification</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">LIVE</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        Offline Aadhaar Secure QR &amp; APMC status
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors shrink-0" />
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="cursor-pointer rounded-xl p-2.5 hover:bg-white/[0.08] focus:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10">
                <Link href="/settings" className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground group-hover:text-white transition-colors">
                        Business &amp; Tax Settings
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        Bank account, UPI QR, and GST profile
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors shrink-0" />
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="cursor-pointer rounded-xl p-2.5 hover:bg-white/[0.08] focus:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10">
                <Link href="/customers" className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground group-hover:text-white transition-colors">
                        Buyers &amp; FPO Directory
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        Verified mandi traders, buyers and contacts
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors shrink-0" />
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="cursor-pointer rounded-xl p-2.5 hover:bg-white/[0.08] focus:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10">
                <Link href="/contact" className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground group-hover:text-white transition-colors">
                        Helpdesk &amp; Support
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        24/7 dedicated Kisan helpline &amp; support
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors shrink-0" />
                </Link>
              </DropdownMenuItem>
            </div>

            {/* Footer with Security Tag & Sign Out */}
            <div className="p-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between gap-2 mt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>KrishiConnect v2.4</span>
              </div>

              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all focus:bg-rose-500/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
