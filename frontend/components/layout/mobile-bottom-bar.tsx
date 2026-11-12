"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Truck,
  FileText,
  Menu,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomBarProps {
  onOpenMenu: () => void;
}

export function MobileBottomBar({ onOpenMenu }: MobileBottomBarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/crop-rates",
      label: "Rates",
      icon: TrendingUp,
      active: pathname.startsWith("/crop-rates"),
    },
    {
      href: "/transportation",
      label: "Logistics",
      icon: Truck,
      active: pathname.startsWith("/transportation"),
    },
    {
      href: "/invoices",
      label: "Invoices",
      icon: FileText,
      active: pathname.startsWith("/invoices"),
    },
    {
      href: "/contact",
      label: "Contact",
      icon: Phone,
      active: pathname === "/contact",
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-safe pt-1 bg-[#080808]/92 dark:bg-[#080808]/92 backdrop-blur-2xl border-t border-white/[0.12] shadow-[0_-8px_24px_rgba(0,0,0,0.5)] select-none no-tap-highlight"
    >
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative",
                item.active
                  ? "text-primary font-bold"
                  : "text-[#8E8D8A] hover:text-[#CDCBCA] active:scale-95"
              )}
            >
              {item.active && (
                <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
              )}
              <Icon className={cn("h-5 w-5 mb-0.5 transition-transform", item.active && "scale-110")} />
              <span className="text-[10px] leading-tight truncate font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Menu button to open the full drawer */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[#8E8D8A] hover:text-[#CDCBCA] active:scale-95 transition-all"
          aria-label="Open full menu"
        >
          <Menu className="h-5 w-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
}
