"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Truck,
  LineChart,
  Settings,
  TrendingUp,
  Sprout,
  LogOut,
  ChevronRight,
  CloudSun,
  Warehouse,
  Phone,
  Copyright,
} from "lucide-react";

interface SidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

const MENU_GROUPS = [
  {
    title: "Mandi Intelligence",
    routes: [
      { href: "/crop-rates", label: "Daily Crop Rates", icon: TrendingUp, badge: "Live" },
      { href: "/rate-trends", label: "7-Day Rate Trends", icon: LineChart },
      { href: "/transportation", label: "Transportation", icon: Truck },
      { href: "/customers", label: "Crop Buyers", icon: Users },
    ],
  },
  {
    title: "Farm Operations",
    routes: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/cold-storage", label: "Cold Storage", icon: Warehouse, badge: "New" },
      { href: "/crop-planner", label: "Next Season Planner", icon: Sprout, badge: "New" },
      { href: "/weather", label: "Farm Weather & Map", icon: CloudSun, badge: "Live" },
      { href: "/products", label: "Crops Inventory", icon: Package },
      { href: "/invoices", label: "Invoices & Billing", icon: FileText },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    title: "Support & Legal",
    routes: [
      { href: "/contact", label: "Contact Us & WhatsApp", icon: Phone },
      { href: "/copyright", label: "Copyright Policy", icon: Copyright },
    ],
  },
];

export function Sidebar({ isMobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, businessProfile, logout } = useAuth();

  const displayName = user?.full_name || user?.name || businessProfile?.business_name || "Kisan";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        "flex h-full flex-col select-none transition-all duration-300 relative",
        // Apple Liquid Glass Deep Obsidian Base (#080808) with 36px Refraction
        "bg-[#080808]/82 backdrop-blur-3xl backdrop-saturate-[190%]",
        "border-r border-white/[0.09]",
        "shadow-[inset_-1px_0_1px_rgba(255,255,255,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.12),16px_0_48px_rgba(0,0,0,0.6)]",
        isMobile ? "w-full" : "w-64"
      )}
    >
      {/* Apple Subtle Top Ambient Specular Sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.04] to-transparent" />

      {/* 1. Apple Cut-Glass Brand Header */}
      <div className="relative z-10 flex h-16 items-center justify-between px-5 border-b border-white/[0.08]">
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onNavigate}>
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-b from-white/[0.14] to-white/[0.03] backdrop-blur-2xl flex items-center justify-center text-[#D41514] border border-white/25 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45),0_4px_16px_rgba(0,0,0,0.3),0_0_12px_rgba(212,21,20,0.2)] group-hover:scale-105 transition-all duration-200">
            <Sprout className="h-4.5 w-4.5 text-[#D41514] drop-shadow-[0_0_6px_rgba(212,21,20,0.6)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-[#CDCBCA] leading-none group-hover:text-white transition-colors">
              KrishiConnect
            </span>
            <span className="text-[10px] font-semibold text-[#8E8D8A] mt-0.5 tracking-tight">
              Odisha Mandi OS
            </span>
          </div>
        </Link>
        <span className="flex h-2 w-2 rounded-full bg-[#D41514] shadow-[0_0_10px_#D41514,0_0_4px_#ff4d4b] animate-pulse" title="Mandi Live" />
      </div>

      {/* 2. Apple Liquid Glass Nav Groups & Floating Crystal Trays */}
      <nav className="relative z-10 flex-1 space-y-6 px-3 py-4 overflow-y-auto">
        {MENU_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1.5">
            {/* Section Header */}
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#8A8987] flex items-center justify-between">
              <span>{group.title}</span>
              <span className="h-px flex-1 ml-2 bg-gradient-to-r from-white/[0.08] to-transparent" />
            </div>

            {/* Apple Floating Glass Tray */}
            <div className="space-y-1 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.008] p-1.5 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_10px_28px_rgba(0,0,0,0.35)]">
              {group.routes.map((route) => {
                const active = pathname === route.href || (route.href !== "/dashboard" && pathname.startsWith(route.href));
                const Icon = route.icon;

                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-200 outline-none overflow-hidden",
                      active
                        ? [
                            // Apple Signature Liquid Glass Active Capsule
                            "bg-gradient-to-b from-white/[0.12] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl",
                            "border border-white/25",
                            "shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.35),0_0_16px_rgba(212,21,20,0.18)]",
                            "font-bold",
                          ]
                        : [
                            // Apple Frosted Glass Inactive Hover Pill
                            "text-[#CDCBCA] font-medium border border-transparent",
                            "hover:bg-gradient-to-b hover:from-white/[0.06] hover:to-white/[0.02]",
                            "hover:border-white/[0.12] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] hover:text-white",
                          ]
                    )}
                  >
                    {/* Active Razor-Thin Glass Rim Reflection Highlight */}
                    {active && (
                      <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0 z-10">
                      {/* Active Crystal Red Glow Pill */}
                      {active && (
                        <span className="w-1 h-4 rounded-full bg-gradient-to-b from-[#ff4d4b] to-[#D41514] shadow-[0_0_10px_#D41514,0_0_4px_#ff4d4b] -ml-0.5 flex-shrink-0 animate-in fade-in duration-300" />
                      )}
                      <Icon
                        className={cn(
                          "h-4 w-4 flex-shrink-0 transition-all duration-200",
                          active
                            ? "text-[#D41514] scale-110 drop-shadow-[0_0_10px_rgba(212,21,20,0.7)]"
                            : "text-[#CDCBCA] group-hover:text-white group-hover:scale-105"
                        )}
                      />
                      <span className={cn(
                        "truncate transition-colors",
                        active 
                          ? "text-[#D41514] font-bold drop-shadow-[0_0_8px_rgba(212,21,20,0.55)]" 
                          : "text-[#CDCBCA] group-hover:text-white"
                      )}>
                        {route.label}
                      </span>
                    </div>

                    {route.badge && (
                      <span
                        className={cn(
                          "z-10 text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-all",
                          active
                            ? "bg-[#D41514]/15 text-[#D41514] border border-[#D41514]/35 shadow-[0_0_10px_rgba(212,21,20,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                            : "bg-white/[0.05] text-[#CDCBCA] border border-white/[0.08] group-hover:text-white"
                        )}
                      >
                        {route.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. Apple Liquid Glass User Profile Pod */}
      <div className="relative z-10 p-3 border-t border-white/[0.08]">
        <div className="flex items-center justify-between p-2.5 rounded-2xl border border-white/[0.12] bg-gradient-to-b from-white/[0.05] to-white/[0.015] backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_8px_20px_rgba(0,0,0,0.3)] hover:border-white/[0.2] hover:bg-white/[0.06] transition-all duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-white/[0.12] to-white/[0.02] text-[#D41514] border border-white/20 flex items-center justify-center font-black text-xs flex-shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_0_10px_rgba(212,21,20,0.2)]">
              {initials || "K"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#CDCBCA] truncate">{displayName}</span>
              <span className="text-[10px] text-[#807F7D] truncate font-medium">{user?.email || "Odisha Mandi Account"}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-xl hover:bg-[#D41514]/20 text-[#CDCBCA] hover:text-[#D41514] transition-colors"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
