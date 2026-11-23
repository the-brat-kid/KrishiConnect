"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CloudSun,
  TrendingUp,
  Snowflake,
  CheckCheck,
  ArrowRight,
  Sparkles,
  AlertTriangle,
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
import { useAgriNotifications, AgriAlertCategory } from "@/hooks/use-agri-notifications";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
  const { notifications, stats, markAsRead, markAllAsRead } = useAgriNotifications();
  const [filter, setFilter] = useState<AgriAlertCategory | "all">("all");

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    return n.category === filter;
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-foreground hover:text-primary transition-colors cursor-pointer"
          aria-label="Agri Notifications & Alerts"
        >
          <Bell className="h-5 w-5" />
          {stats.unread > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 text-[9px] font-bold text-white items-center justify-center">
                {stats.unread > 9 ? "9+" : ""}
              </span>
            </span>
          )}
          <span className="sr-only">Notifications ({stats.unread} unread)</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[360px] sm:w-[420px] p-0 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 text-foreground overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/20 text-primary">
              <Bell className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-foreground leading-tight">
                Agri Alerts & Advisories
              </h4>
              <p className="text-[11px] text-muted-foreground">
                मौसम अलर्ट, बिक्री व कोल्ड स्टोरेज सलाह
              </p>
            </div>
          </div>
          {stats.unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-[11px] h-7 px-2 text-primary hover:text-primary/90 hover:bg-white/[0.05]"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10 bg-black/40 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("weather")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
              filter === "weather"
                ? "bg-blue-600 text-white"
                : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
            }`}
          >
            <CloudSun className="w-3 h-3 text-blue-400" />
            Weather ({stats.weatherCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("crop-sell")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
              filter === "crop-sell"
                ? "bg-emerald-600 text-white"
                : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            Sell Now ({stats.sellCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("crop-hold")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
              filter === "crop-hold"
                ? "bg-rose-700 text-white"
                : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
            }`}
          >
            <Snowflake className="w-3 h-3 text-rose-400" />
            Hold / Don&apos;t Sell ({stats.holdCount})
          </button>
        </div>

        {/* Scrollable Alerts List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-white/10">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No notifications in this category
            </div>
          ) : (
            filtered.slice(0, 6).map((n) => {
              const isHold = n.category === "crop-hold";
              const isSell = n.category === "crop-sell";
              const isWeather = n.category === "weather";

              return (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 transition-colors hover:bg-white/[0.04] cursor-pointer flex items-start gap-3 relative ${
                    n.read ? "opacity-75" : "bg-white/[0.02]"
                  }`}
                >
                  {/* Category Icon */}
                  <div className="shrink-0 mt-0.5">
                    {isHold && (
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        <Snowflake className="w-4 h-4" />
                      </span>
                    )}
                    {isSell && (
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <TrendingUp className="w-4 h-4" />
                      </span>
                    )}
                    {isWeather && (
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <CloudSun className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <Badge
                        className={`text-[9px] px-1.5 py-0 font-bold uppercase ${
                          isHold
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : isSell
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        }`}
                      >
                        {isHold ? "Do NOT Sell" : isSell ? "High Rate" : "Weather"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{n.timestamp}</span>
                    </div>

                    <h5 className="font-semibold text-xs text-foreground line-clamp-1 leading-snug">
                      {n.title}
                    </h5>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>

                    {/* Quick Action Link */}
                    {n.actionHref && (
                      <div className="pt-1">
                        <Link
                          href={n.actionHref}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold hover:underline ${
                            isHold
                              ? "text-rose-400"
                              : isSell
                              ? "text-emerald-400"
                              : "text-blue-400"
                          }`}
                        >
                          {n.actionLabel || "View Details"}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {!n.read && (
                    <span className="absolute top-3.5 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Link to Dedicated Page */}
        <div className="p-2.5 bg-black/60 border-t border-white/10 text-center">
          <Link href="/notifications" className="block w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold h-8 border-white/10 hover:bg-white/[0.08] text-foreground flex items-center justify-center gap-1.5"
            >
              <span>View All Alerts & Notification Page (सभी सूचनाएं)</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
