"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CloudSun,
  CloudRain,
  Sun,
  TrendingUp,
  AlertTriangle,
  Warehouse,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCheck,
  RefreshCw,
  ArrowRight,
  Droplets,
  Wind,
  Thermometer,
  ShieldAlert,
  Flame,
  Snowflake,
  ExternalLink,
} from "lucide-react";
import {
  useAgriNotifications,
  AgriNotification,
  AgriAlertCategory,
} from "@/hooks/use-agri-notifications";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegionLanguageSelector } from "@/components/ui/region-language-selector";

export default function NotificationsPage() {
  const { selectedState, selectedMandiObj } = useLanguage();
  const {
    notifications,
    stats,
    markAsRead,
    markAllAsRead,
    clearAllRead,
    weatherLoading,
  } = useAgriNotifications();

  const [activeTab, setActiveTab] = useState<AgriAlertCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Category tab
      if (activeTab !== "all" && item.category !== activeTab) {
        return false;
      }
      // Unread only
      if (showUnreadOnly && item.read) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q) || (item.hindiTitle && item.hindiTitle.toLowerCase().includes(q));
        const matchMsg = item.message.toLowerCase().includes(q) || (item.hindiMessage && item.hindiMessage.toLowerCase().includes(q));
        const matchCrop = item.cropName && item.cropName.toLowerCase().includes(q);
        const matchMandi = item.mandiName && item.mandiName.toLowerCase().includes(q);
        return matchTitle || matchMsg || matchCrop || matchMandi;
      }
      return true;
    });
  }, [notifications, activeTab, showUnreadOnly, searchQuery]);

  const mandiDisplayName = selectedMandiObj?.name || `${selectedState || "Pan-India"} Mandi`;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30">
              <Bell className="w-5 h-5 animate-bounce-slow" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-plus-jakarta">
              Agri Alerts & Notifications
            </h1>
            {stats.unread > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-2.5 py-0.5">
                {stats.unread} New
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            दैनिक मौसम अलर्ट, किस फसल पर अच्छा भाव है और कौन सी फसल अभी नहीं बेचनी है (कोल्ड स्टोरेज सलाह)
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-foreground/80">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-emerald-400">Live APMC Intelligence:</span>
            <span className="text-muted-foreground">{mandiDisplayName}</span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <RegionLanguageSelector variant="compact" />
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={stats.unread === 0}
            className="text-xs h-9 border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1 text-primary" />
            Mark all read
          </Button>
          <Link href="/cold-storage">
            <Button
              size="sm"
              className="text-xs h-9 bg-cyan-600/90 hover:bg-cyan-500 text-white border border-cyan-400/40 shadow-xs"
            >
              <Warehouse className="w-3.5 h-3.5 mr-1" />
              Cold Storage Vault
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Weather Card */}
        <Card className="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] backdrop-blur-xl p-4 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Daily Weather Status
              </p>
              <h3 className="text-lg font-bold text-foreground mt-1 flex items-center gap-1.5">
                {stats.hasRainRisk ? (
                  <>
                    <CloudRain className="w-4 h-4 text-amber-400" />
                    <span>Rain / Spray Alert</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-emerald-400" />
                    <span>Clear / Safe Drying</span>
                  </>
                )}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.weatherCount} Weather Advisories today
              </p>
            </div>
            <span className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
              <CloudSun className="w-5 h-5" />
            </span>
          </div>
          <Link
            href="/weather"
            className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium mt-3"
          >
            Open Live Weather Radar <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* Sell Now High Price Card */}
        <Card className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] backdrop-blur-xl p-4 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                High Price - Sell Now
              </p>
              <h3 className="text-lg font-bold text-foreground mt-1 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>{stats.sellCount} Crops High Rate</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Onion, Cotton, Jeera bullish
              </p>
            </div>
            <span className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <button
            onClick={() => setActiveTab("crop-sell")}
            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium mt-3 cursor-pointer"
          >
            View High Rate Crops <ArrowRight className="w-3 h-3" />
          </button>
        </Card>

        {/* Do Not Sell / Cold Storage Card */}
        <Card className="rounded-xl border border-rose-500/25 bg-rose-500/[0.04] backdrop-blur-xl p-4 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                Do NOT Sell (Hold Produce)
              </p>
              <h3 className="text-lg font-bold text-foreground mt-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{stats.holdCount} Crops Slump Alert</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tomato & Potato (Use Cold Storage)
              </p>
            </div>
            <span className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
              <Snowflake className="w-5 h-5" />
            </span>
          </div>
          <button
            onClick={() => setActiveTab("crop-hold")}
            className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium mt-3 cursor-pointer"
          >
            View Hold & Cold Storage Advice <ArrowRight className="w-3 h-3" />
          </button>
        </Card>

        {/* Total Active Alerts */}
        <Card className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Notifications
              </p>
              <h3 className="text-lg font-bold text-foreground mt-1">
                {stats.total} Alerts Active
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.unread} unread advisories
              </p>
            </div>
            <span className="p-2.5 rounded-lg bg-white/10 text-primary">
              <Bell className="w-5 h-5" />
            </span>
          </div>
          <button
            onClick={() => {
              setActiveTab("all");
              setShowUnreadOnly(false);
              setSearchQuery("");
            }}
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium mt-3 cursor-pointer"
          >
            Reset Filters
          </button>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-white/[0.05] hover:bg-white/[0.1] text-muted-foreground hover:text-foreground border border-white/10"
            }`}
          >
            All Alerts ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("weather")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === "weather"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white/[0.05] hover:bg-white/[0.1] text-muted-foreground hover:text-foreground border border-white/10"
            }`}
          >
            <CloudSun className="w-3.5 h-3.5 text-blue-400" />
            Weather Alerts ({stats.weatherCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("crop-sell")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === "crop-sell"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white/[0.05] hover:bg-white/[0.1] text-muted-foreground hover:text-foreground border border-white/10"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            Sell Now: High Price ({stats.sellCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("crop-hold")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === "crop-hold"
                ? "bg-rose-700 text-white shadow-xs"
                : "bg-white/[0.05] hover:bg-white/[0.1] text-muted-foreground hover:text-foreground border border-white/10"
            }`}
          >
            <Snowflake className="w-3.5 h-3.5 text-rose-400" />
            Do NOT Sell: Hold ({stats.holdCount})
          </button>
        </div>

        {/* Search Input & Unread Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search crop, mandi, alert..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs bg-white/[0.03] border-white/10 focus:border-primary/50"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`text-xs h-8 px-2.5 border-white/10 ${
              showUnreadOnly ? "bg-primary/20 text-primary border-primary/30" : "bg-white/[0.03]"
            }`}
          >
            Unread ({stats.unread})
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center border-white/10 bg-white/[0.02]">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-base font-semibold text-foreground">No alerts match your criteria</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try resetting the active tab or clearing the search query.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab("all");
                setSearchQuery("");
                setShowUnreadOnly(false);
              }}
              className="mt-4 text-xs"
            >
              Show All Alerts
            </Button>
          </Card>
        ) : (
          filteredNotifications.map((alert) => (
            <NotificationCard
              key={alert.id}
              alert={alert}
              onMarkAsRead={() => markAsRead(alert.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Individual Rich Notification Card Component
function NotificationCard({
  alert,
  onMarkAsRead,
}: {
  alert: AgriNotification;
  onMarkAsRead: () => void;
}) {
  const isWeather = alert.category === "weather";
  const isSell = alert.category === "crop-sell";
  const isHold = alert.category === "crop-hold";

  // Card theme classes
  const borderClass = isHold
    ? "border-rose-500/30 hover:border-rose-500/50 bg-gradient-to-r from-rose-950/20 via-black/30 to-black/40"
    : isSell
    ? "border-emerald-500/30 hover:border-emerald-500/50 bg-gradient-to-r from-emerald-950/20 via-black/30 to-black/40"
    : "border-blue-500/30 hover:border-blue-500/50 bg-gradient-to-r from-blue-950/20 via-black/30 to-black/40";

  return (
    <Card
      className={`rounded-2xl border transition-all duration-200 backdrop-blur-xl shadow-md p-4 sm:p-5 relative ${borderClass} ${
        alert.read ? "opacity-80" : "opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        {/* Left Icon + Content */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Badge Icon Container */}
          <div className="shrink-0 mt-0.5">
            {isHold && (
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
                <Snowflake className="w-6 h-6 animate-pulse" />
              </span>
            )}
            {isSell && (
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </span>
            )}
            {isWeather && (
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400">
                <CloudSun className="w-6 h-6" />
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Tag bar */}
            <div className="flex items-center gap-2 flex-wrap">
              {isHold && (
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold text-[11px] px-2 py-0.5 uppercase tracking-wide">
                  Hold Stock • Low Rate
                </Badge>
              )}
              {isSell && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold text-[11px] px-2 py-0.5 uppercase tracking-wide">
                  Sell Now • High Price
                </Badge>
              )}
              {isWeather && (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold text-[11px] px-2 py-0.5 uppercase tracking-wide">
                  Weather Advisory
                </Badge>
              )}

              {alert.mandiName && (
                <span className="text-xs text-muted-foreground font-medium">
                  • {alert.mandiName}
                </span>
              )}

              <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-auto sm:ml-0">
                <Clock className="w-3 h-3" />
                {alert.timestamp}
              </span>

              {!alert.read && (
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
              {alert.title}
            </h3>

            {/* Hindi Subtitle */}
            {alert.hindiTitle && (
              <p className="text-xs sm:text-sm font-semibold text-primary/90">
                {alert.hindiTitle}
              </p>
            )}

            {/* Message Body */}
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed pt-1">
              {alert.message}
            </p>

            {/* Hindi Advisory text */}
            {alert.hindiMessage && (
              <p className="text-xs text-muted-foreground bg-white/[0.02] p-2.5 rounded-lg border border-white/5 mt-2 italic">
                <span className="font-medium text-foreground/90">{alert.hindiMessage}</span>
              </p>
            )}

            {/* Metrics Highlight Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
              {alert.currentRate && (
                <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-[10px] text-muted-foreground block">Current Mandi Rate</span>
                  <span className="font-extrabold text-foreground text-sm">
                    {alert.currentRate}
                  </span>
                  {alert.rateUnit && (
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ({alert.rateUnit})
                    </span>
                  )}
                </div>
              )}

              {alert.rateChangePct !== undefined && (
                <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-[10px] text-muted-foreground block">Weekly Trend</span>
                  <span
                    className={`font-bold text-sm ${
                      alert.rateChangePct >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {alert.rateChangePct >= 0 ? `+${alert.rateChangePct}%` : `${alert.rateChangePct}%`}
                  </span>
                </div>
              )}

              {alert.potentialProfit && (
                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 col-span-2">
                  <span className="text-[10px] text-emerald-400 block">Expected Profit Window</span>
                  <span className="font-bold text-emerald-300">{alert.potentialProfit}</span>
                </div>
              )}

              {alert.potentialLoss && (
                <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/20 col-span-2">
                  <span className="text-[10px] text-rose-400 block">Avoid Loss Risk</span>
                  <span className="font-bold text-rose-300">{alert.potentialLoss}</span>
                </div>
              )}

              {alert.weatherDetails && (
                <>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                    <span className="text-[10px] text-muted-foreground block">Temperature</span>
                    <span className="font-bold text-foreground">
                      {alert.weatherDetails.temp}°C
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                    <span className="text-[10px] text-muted-foreground block">Rain Probability</span>
                    <span
                      className={`font-bold ${
                        alert.weatherDetails.rainProb > 40 ? "text-amber-400" : "text-foreground"
                      }`}
                    >
                      {alert.weatherDetails.rainProb}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                    <span className="text-[10px] text-muted-foreground block">Spray Safety</span>
                    <span className="font-bold text-cyan-400 truncate block">
                      {alert.weatherDetails.sprayWindowStatus || "Safe"}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                    <span className="text-[10px] text-muted-foreground block">Grain Drying</span>
                    <span className="font-bold text-emerald-400 truncate block">
                      {alert.weatherDetails.grainDryingStatus || "Safe"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
          {alert.actionHref && (
            <Link href={alert.actionHref} className="w-full sm:w-auto">
              <Button
                size="sm"
                className={`w-full sm:w-auto text-xs font-semibold h-8.5 px-3.5 shadow-xs ${
                  isHold
                    ? "bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/30"
                    : isSell
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30"
                    : "bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/30"
                }`}
              >
                {alert.actionLabel || "View Action"}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          )}

          {alert.secondaryActionHref && (
            <Link href={alert.secondaryActionHref} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs h-8 px-3 border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
              >
                {alert.secondaryActionLabel}
              </Button>
            </Link>
          )}

          {!alert.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAsRead}
              className="text-[11px] h-7 text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
            >
              Mark Read
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
