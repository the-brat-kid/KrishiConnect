"use client";

import { useState, useMemo } from "react";
import { useCropHistory, CropHistoryItem } from "@/hooks/use-crop-history";
import { AnimatedNumber } from "@/components/core/animated-number";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Search,
  ExternalLink,
  LineChart as LineChartIcon,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  MapPin,
} from "lucide-react";

const DEFAULT_SELECTED_CROPS = ["onion-big", "tomato", "potato", "green-chilli"];

export default function RateTrendsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useCropHistory();
  const [search, setSearch] = useState("");
  const [trendFilter, setTrendFilter] = useState<"all" | "up" | "down" | "stable">("all");
  const [selectedForChart, setSelectedForChart] = useState<string[]>(DEFAULT_SELECTED_CROPS);

  const items = data?.items || [];
  const columns = data?.columns || [];

  // Filter items for the table
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase().trim()))
      .filter((item) => {
        if (trendFilter === "all") return true;
        return item.trend === trendFilter;
      })
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  }, [items, search, trendFilter]);

  // Key stats
  const stats = useMemo(() => {
    if (items.length === 0) return null;

    const gainers = [...items].filter((i) => i.change > 0).sort((a, b) => b.changePercent - a.changePercent);
    const losers = [...items].filter((i) => i.change < 0).sort((a, b) => a.changePercent - b.changePercent);
    const stable = items.filter((i) => i.change === 0);

    return {
      topGainer: gainers[0] || null,
      topLoser: losers[0] || null,
      stableCount: stable.length,
      gainerCount: gainers.length,
      loserCount: losers.length,
    };
  }, [items]);

  // Chart data formatting: [{ date: "21 Oct", "Onion Big": 53, "Tomato": 32, ... }]
  const chartData = useMemo(() => {
    if (columns.length === 0 || items.length === 0) return [];

    const activeItems = items.filter((i) => selectedForChart.includes(i.id));

    return columns.map((colName, colIdx) => {
      const point: Record<string, any> = { date: colName };
      activeItems.forEach((it) => {
        point[it.name] = it.dailyPrices[colIdx] ?? it.currentPrice;
      });
      return point;
    });
  }, [columns, items, selectedForChart]);

  const toggleChartCrop = (cropId: string) => {
    setSelectedForChart((prev) => {
      if (prev.includes(cropId)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((id) => id !== cropId);
      }
      if (prev.length >= 6) {
        // max 6 at once for chart clarity
        return [...prev.slice(1), cropId];
      }
      return [...prev, cropId];
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1 font-medium">
              <MapPin className="h-3 w-3" /> Bhubaneswar Mandi • 7-Day History
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {columns[0] && columns[columns.length - 1] ? `${columns[0]} – ${columns[columns.length - 1]}` : "Last 7 Days"}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LineChartIcon className="h-8 w-8 text-primary" />
            7-Day Rate Trends
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Historical price analytics and weekly rate volatility across 54 commodities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-liquid-glass inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-white transition-all group"
            title="Refresh 7-day rate trends"
          >
            <RefreshCw className={`h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform ${isFetching ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isFetching ? "Updating..." : "Refresh Trends"}</span>
          </button>
          <a
            href="https://vegetablemarketprice.com/market/bhubaneswar/history"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
          >
            <button
              type="button"
              className="btn-liquid-glass inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground/90 hover:text-white transition-all group"
            >
              <span>View Source</span>
              <ExternalLink className="h-3.5 w-3.5 text-emerald-400/80 group-hover:text-emerald-400 transition-colors" />
            </button>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Volatility (7 Days)</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedNumber value={items.length || 54} suffix=" Crops" springOptions={{ bounce: 0, duration: 1600 }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-600 font-semibold"><AnimatedNumber value={stats?.gainerCount ?? 0} suffix=" rose" springOptions={{ bounce: 0, duration: 1400 }} /></span> •{" "}
              <span className="text-rose-600 font-semibold"><AnimatedNumber value={stats?.loserCount ?? 0} suffix=" fell" springOptions={{ bounce: 0, duration: 1400 }} /></span> •{" "}
              <span><AnimatedNumber value={stats?.stableCount ?? 0} suffix=" stable" springOptions={{ bounce: 0, duration: 1400 }} /></span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Weekly Gainer</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {stats?.topGainer ? (
              <>
                <div className="text-xl font-bold truncate">{stats.topGainer.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    +{stats.topGainer.changePercent}% (+₹{stats.topGainer.change})
                  </Badge>
                  <span className="text-xs text-muted-foreground">Now ₹{stats.topGainer.currentPrice}/kg</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No rate hikes</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Weekly Price Drop</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            {stats?.topLoser ? (
              <>
                <div className="text-xl font-bold truncate">{stats.topLoser.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-rose-100 text-rose-800 border-rose-200">
                    {stats.topLoser.changePercent}% (-₹{Math.abs(stats.topLoser.change)})
                  </Badge>
                  <span className="text-xs text-muted-foreground">Now ₹{stats.topLoser.currentPrice}/kg</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No rate drops</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Price Stability</CardTitle>
            <Minus className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><AnimatedNumber value={stats?.stableCount ?? 0} suffix=" Crops" springOptions={{ bounce: 0, duration: 1600 }} /></div>
            <p className="text-xs text-muted-foreground mt-1">Unchanged rates over past 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                7-Day Price Trajectory (₹ / kg)
              </CardTitle>
              <CardDescription>
                Compare wholesale rate trends across selected crops over the past week
              </CardDescription>
            </div>
            <div className="text-xs text-muted-foreground">
              Select up to 6 crops to overlay below
            </div>
          </div>

          {/* Quick select buttons */}
          <div className="flex flex-wrap gap-1.5 pt-3">
            {items.slice(0, 10).map((crop) => {
              const isSelected = selectedForChart.includes(crop.id);
              return (
                <button
                  key={crop.id}
                  onClick={() => toggleChartCrop(crop.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-medium shadow-xs"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground border-border"
                  }`}
                >
                  <span>{crop.name}</span>
                  {isSelected && <Check className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => `₹${val}`}
                    domain={["dataMin - 5", "dataMax + 5"]}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [`₹${value}/kg`, name]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  {items
                    .filter((it) => selectedForChart.includes(it.id))
                    .map((it) => (
                      <Line
                        key={it.id}
                        type="monotone"
                        dataKey={it.name}
                        stroke={it.color || "#10b981"}
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={true}
                        animationDuration={1800}
                        animationEasing="ease-out"
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 7-Day Comparison Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crop in 7-day trends (e.g. Tomato, Onion)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Button
              variant={trendFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTrendFilter("all")}
              className="text-xs h-8"
            >
              All ({items.length})
            </Button>
            <Button
              variant={trendFilter === "up" ? "default" : "outline"}
              size="sm"
              onClick={() => setTrendFilter("up")}
              className="text-xs h-8 text-emerald-700 hover:text-emerald-800"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Increased ({stats?.gainerCount ?? 0})
            </Button>
            <Button
              variant={trendFilter === "down" ? "default" : "outline"}
              size="sm"
              onClick={() => setTrendFilter("down")}
              className="text-xs h-8 text-rose-700 hover:text-rose-800"
            >
              <TrendingDown className="h-3 w-3 mr-1" />
              Decreased ({stats?.loserCount ?? 0})
            </Button>
            <Button
              variant={trendFilter === "stable" ? "default" : "outline"}
              size="sm"
              onClick={() => setTrendFilter("stable")}
              className="text-xs h-8"
            >
              <Minus className="h-3 w-3 mr-1" />
              Stable ({stats?.stableCount ?? 0})
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Fetching 7-day rate trends for Bhubaneswar...</p>
          </Card>
        ) : isError ? (
          <Card className="p-8 text-center border-destructive/30 bg-destructive/5">
            <p className="font-semibold text-destructive">Failed to load rate trends</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
              Retry
            </Button>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No commodities found matching &quot;{search}&quot;.</p>
          </Card>
        ) : (
          <div className="rounded-lg border bg-card shadow-xs overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12">Item</TableHead>
                  <TableHead className="min-w-[160px]">Crop / Vegetable</TableHead>
                  {columns.map((col, idx) => (
                    <TableHead key={col} className={`text-center ${idx === columns.length - 1 ? "font-bold text-foreground bg-primary/5" : ""}`}>
                      {col}
                      {idx === columns.length - 1 && <span className="block text-[10px] text-primary">Today</span>}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">7-Day Change</TableHead>
                  <TableHead className="text-center">% Change</TableHead>
                  <TableHead className="text-center">Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const isUp = item.change > 0;
                  const isDown = item.change < 0;

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="py-2">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 object-contain rounded bg-muted/30 p-0.5"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {item.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {item.name}
                      </TableCell>
                      {item.dailyPrices.map((price, idx) => (
                        <TableCell
                          key={idx}
                          className={`text-center text-sm ${
                            idx === item.dailyPrices.length - 1
                              ? "font-bold text-foreground bg-primary/5"
                              : "text-muted-foreground"
                          }`}
                        >
                          ₹{price}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        {isUp ? (
                          <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                            <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +₹{item.change}
                          </span>
                        ) : isDown ? (
                          <span className="inline-flex items-center text-xs font-bold text-rose-600">
                            <TrendingDown className="h-3.5 w-3.5 mr-0.5" /> -₹{Math.abs(item.change)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-muted-foreground font-medium">
                            <Minus className="h-3.5 w-3.5 mr-0.5" /> ₹0
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            isUp
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : isDown
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : "border-gray-200 bg-gray-50 text-gray-700"
                          }
                        >
                          {isUp ? `+${item.changePercent}%` : `${item.changePercent}%`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {item.unit}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
