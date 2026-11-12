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

  const displayName = user?.full_name || user?.name || businessProfile?.business_name || "Kisan";

  // Upgraded interactive Tooltip Navbar items for Odisha Mandi operations
  const quickNavItems: TooltipItem[] = [
    {
      icon: <TrendingUp className="h-full w-full" />,
      label: "Mandi Rates",
      labelHasKeyword: ["R"],
      hasBadge: false,
      href: "/crop-rates",
    },
    {
      icon: <Sprout className="h-full w-full" />,
      label: "Season Planner",
      labelHasKeyword: ["P"],
      hasBadge: false,
      href: "/crop-planner",
    },
    {
      icon: <CloudSun className="h-full w-full" />,
      label: "Weather & Rain",
      labelHasKeyword: ["W"],
      hasBadge: false,
      href: "/weather",
    },
    {
      icon: <Truck className="h-full w-full" />,
      label: "Logistics",
      labelHasKeyword: ["T"],
      hasBadge: false,
      href: "/transportation",
    },
    {
      icon: <FileText className="h-full w-full" />,
      label: "Invoices",
      labelHasKeyword: ["I"],
      hasBadge: false,
      href: "/invoices",
    },
  ];

  return (
    <header className="flex h-16 w-full items-center justify-between px-2 sm:px-4 md:px-5">
      {/* Title + Mandi Status */}
      <div className="flex items-center gap-2.5">
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
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#242424] border border-[#3D3D3D] text-[11px] font-semibold text-[#C0C0C0]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E10600] animate-pulse" />
          <span>Bhubaneswar APMC Live</span>
        </div>
      </div>

      {/* Right Actions: Upgraded TooltipNavbar + Notifications + SwitchMode + Account */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Modern Interactive Tooltip Navbar Dock */}
        <div className="hidden md:block">
          <TooltipNavbar items={quickNavItems} tooltipPosition="bottom" tooltipDelay={100} />
        </div>

        {/* Live Notifications */}
        <NotificationBell />

        {/* Animated Sliding SwitchMode Component */}
        <SwitchMode width={52} height={26} />

        {/* User Account Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md hover:bg-muted">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">User account menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-md border-border/80">
            <DropdownMenuLabel className="font-semibold text-sm text-foreground">
              {displayName}
            </DropdownMenuLabel>
            <DropdownMenuLabel className="font-normal text-xs text-muted-foreground -mt-1 truncate">
              {user?.email || "Odisha Mandi Account"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer text-xs">
              <Link href="/contact" className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span>Contact & Support</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer text-xs flex items-center gap-2">
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
