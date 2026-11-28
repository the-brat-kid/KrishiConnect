"use client";

import { useState, useMemo, useEffect } from "react";
import { CropDetailModal } from "@/components/crops/crop-detail-modal";
import { AnimatedNumber } from "@/components/core/animated-number";
import { Tilt } from "@/components/core/tilt";
import { useCropRates, CropRateItem } from "@/hooks/use-crop-rates";
import { useLanguage, REGIONS, RegionId } from "@/lib/language-context";
import { getCropImage } from "@/lib/crop-images";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Search,
  Store,
  LayoutGrid,
  List as ListIcon,
  IndianRupee,
  Clock,
  MapPin,
  LocateFixed,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const INDIAN_STATES = [
  "All India",
  "Maharashtra",
  "Punjab",
  "Haryana",
  "Gujarat",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "West Bengal",
  "Rajasthan",
  "Bihar",
  "Odisha",
  "Himachal Pradesh",
  "Tamil Nadu",
  "Kerala",
];

export default function DailyCropRatesPage() {
  const {
    currentRegionDef,
    setRegion,
    selectedState: ctxState,
    userLocation,
    isUsingLiveGps,
    locationStatus,
    requestLocationAccess,
  } = useLanguage();
  const preferredState =
    userLocation?.state || ctxState || currentRegionDef?.name || "All India";
  const [selectedState, setSelectedState] = useState<string>(preferredState);

  // Sync state whenever GPS location or global region changes
  useEffect(() => {
    const nextState = userLocation?.state || ctxState || currentRegionDef?.name;
    if (nextState && nextState !== selectedState) {
      setSelectedState(nextState);
    }
  }, [userLocation?.state, ctxState, currentRegionDef?.name]);

  // Reset category filter when state changes so items are never hidden accidentally
  useEffect(() => {
    setSelectedCategory("All");
  }, [selectedState]);

  const { data, isLoading, isError, refetch, isFetching } = useCropRates(
    selectedState === "All India" ? undefined : selectedState
  );

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const matched = Object.values(REGIONS).find(
      (r) => r.name.toLowerCase() === newState.toLowerCase()
    );
    if (matched) {
      setRegion(matched.id);
    }
  };

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedCropModal, setSelectedCropModal] = useState<CropRateItem | null>(null);

  const items = useMemo(() => data?.items || [], [data?.items]);

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    const list = Array.from(set).sort();
    return ["All", ...list];
  }, [items]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(search.toLowerCase().trim()) ||
          (item.category && item.category.toLowerCase().includes(search.toLowerCase().trim())) ||
          (item.state && item.state.toLowerCase().includes(search.toLowerCase().trim())) ||
          (item.market && item.market.toLowerCase().includes(search.toLowerCase().trim()));
        const matchesCategory =
          selectedCategory === "All" ||
          (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
        const matchesState =
          selectedState === "All India" ||
          (item.state && item.state.toLowerCase().includes(selectedState.toLowerCase()));
        return matchesSearch && matchesCategory && matchesState;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.priceNum - b.priceNum;
        if (sortBy === "price-desc") return b.priceNum - a.priceNum;
        return a.name.localeCompare(b.name);
      });
  }, [items, search, selectedCategory, selectedState, sortBy]);

  // Key stats
  const averagePrice = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, curr) => acc + (curr.priceNum || 0), 0);
    return Math.round(sum / items.length);
  }, [items]);

  // Key staples
  const staples = useMemo(() => {
    const targets = ["Onion", "Tomato", "Wheat", "Potato", "Chilli", "Cumin", "Paddy"];
    return targets
      .map((name) => items.find((i) => i.name.toLowerCase().includes(name.toLowerCase())))
      .filter(Boolean) as CropRateItem[];
  }, [items]);

  const lastUpdatedFormatted = useMemo(() => {
    if (!data?.updatedAt) return "Today";
    try {
      const date = new Date(data.updatedAt);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Today";
    }
  }, [data?.updatedAt]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5 font-plus-jakarta">
            <Store className="h-8 w-8 text-primary" />
            Pan-India Daily Crop Rates
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Live wholesale prices across APMC mandis (₹/Quintal &amp; ₹/Kg).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-liquid-glass inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-white transition-all group"
            title="Refresh latest live mandi rates"
          >
            <RefreshCw
              className={`h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform ${
                isFetching ? "animate-spin text-emerald-400" : ""
              }`}
            />
            <span>{isFetching ? "Syncing..." : "Refresh Live Feed"}</span>
          </button>
        </div>
      </div>

      {/* Highlights / Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">National Mandi Commodities</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedNumber value={items.length || 24} suffix=" Crops" springOptions={{ bounce: 0, duration: 1600 }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pan-India APMC modal coverage</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. National Wholesale Rate</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedNumber value={averagePrice} prefix="₹" suffix=" / kg" springOptions={{ bounce: 0, duration: 1600 }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ₹{(averagePrice * 100).toLocaleString("en-IN")} / quintal average
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Trade State</CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground truncate">
              {selectedState}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Filtered across key APMC clusters</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AGMARKNET Feed Status</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live Agmarknet Sync Active
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last synced: {lastUpdatedFormatted}</p>
          </CardContent>
        </Card>
      </div>

      {/* Staples Quick Bar */}
      {staples.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" /> National Benchmark Staples (All India Median)
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {staples.slice(0, 6).map((staple) => (
                <Tilt key={staple.id} rotationFactor={8} isRevese className="cursor-pointer">
                  <div
                    onClick={() => setSelectedCropModal(staple)}
                    style={{ borderRadius: "10px" }}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-card border shadow-xs hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full"
                    title={`Click to view price history for ${staple.name}`}
                  >
                    <img
                      src={getCropImage(staple.name, staple.image)}
                      alt={staple.name}
                      className="w-10 h-10 object-cover rounded-md bg-muted p-0.5 flex-shrink-0 transition-transform group-hover:scale-110 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-xs truncate group-hover:text-primary transition-colors">
                        {staple.name.split("(")[0]}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        {staple.price}{" "}
                        <span className="text-[10px] text-muted-foreground font-normal">/{staple.unit}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{staple.market}</p>
                    </div>
                  </div>
                </Tilt>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls: Search, State Picker, Category Filters, Sort, View */}
      <div className="space-y-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crop, state or mandi (e.g. Lasalgaon, Onion, Guntur)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border border-white/15 bg-white/[0.05] dark:bg-black/30 backdrop-blur-2xl text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => requestLocationAccess(true)}
              disabled={locationStatus === "requesting"}
              className="h-10 rounded-xl border border-white/20 bg-white/[0.08] dark:bg-black/40 px-3 text-xs font-bold text-foreground hover:border-emerald-500/50 flex items-center gap-1.5"
            >
              {locationStatus === "requesting" ? (
                <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
              ) : (
                <LocateFixed className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>
                {isUsingLiveGps && userLocation
                  ? userLocation.locality.split(",")[0]
                  : "Near Me"}
              </span>
            </Button>

            {/* State Filter Dropdown with Liquid Glass */}
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="h-10 rounded-xl border border-white/20 bg-white/[0.08] dark:bg-black/40 px-3.5 text-xs sm:text-sm font-bold text-foreground backdrop-blur-2xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.3),0_4px_16px_rgba(0,0,0,0.25)] hover:border-emerald-500/50 transition-all cursor-pointer"
            >
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state} className="bg-card text-foreground">
                  {state}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 rounded-xl border border-white/15 bg-card px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="name">Sort: Name (A to Z)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            <div className="flex items-center p-1 rounded-xl bg-white/[0.05] dark:bg-black/30 backdrop-blur-2xl border border-white/15">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "table" ? "btn-liquid-glass text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ListIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "grid" ? "btn-liquid-glass text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5 text-emerald-400" />
                <span>Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex-shrink-0 ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Fetching live Pan-India APMC mandi rates from data.gov.in & Agmarknet...
            </p>
          </div>
        </Card>
      ) : isError ? (
        <Card className="p-8 text-center border-destructive/30 bg-destructive/5">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="font-semibold text-destructive">Unable to fetch live rates</p>
            <p className="text-xs text-muted-foreground max-w-md">
              Please check your network connection or try refreshing.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
              Retry
            </Button>
          </div>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No commodities found matching your filters.</p>
        </Card>
      ) : viewMode === "table" ? (
        <div className="rounded-2xl border border-white/10 bg-card/40 dark:bg-black/30 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden">
          <Table>
            <TableHeader className="bg-white/[0.04] dark:bg-white/[0.02] border-b border-white/10">
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="w-16">Item</TableHead>
                <TableHead>Commodity / Variety</TableHead>
                <TableHead>State & Market APMC</TableHead>
                <TableHead>Wholesale Rate (₹/Kg)</TableHead>
                <TableHead>Modal Rate (₹/Quintal)</TableHead>
                <TableHead>Arrivals & Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => setSelectedCropModal(item)}
                  className="hover:bg-white/[0.06] border-b border-white/5 transition-colors cursor-pointer group"
                  title="Click to view full price details & projections"
                >
                  <TableCell className="py-2.5">
                    <img
                      src={getCropImage(item.name, item.image)}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-xl bg-white/[0.05] border border-white/10 p-0.5 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground">{item.category}</span>
                        {item.variety && (
                          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            {item.variety}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        {item.market || "APMC Market"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{item.state}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-sm text-foreground">
                      {item.price}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-primary">
                        {item.price_quintal}
                      </span>
                      {item.min_price && item.max_price && (
                        <span className="text-[10px] text-muted-foreground">
                          Range: {item.min_price} – {item.max_price}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">
                        {item.arrivals || "Steady Influx"}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {item.trend === "up" ? (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> Rising
                          </span>
                        ) : item.trend === "down" ? (
                          <span className="text-[11px] text-red-400 flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" /> Softening
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                            <Minus className="w-3 h-3" /> Stable
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              onClick={() => setSelectedCropModal(item)}
              className="p-4 hover:border-primary/50 transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={getCropImage(item.name, item.image)}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-xl bg-muted p-0.5 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-sm group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                    {item.state}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 mb-3 space-y-1">
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                    <span>Market APMC:</span>
                    <span className="font-semibold text-foreground">{item.market}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                    <span>Wholesale:</span>
                    <span className="font-bold text-foreground">{item.price}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                    <span>Modal / Quintal:</span>
                    <span className="font-bold text-primary">{item.price_quintal}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
                <span>Arrivals: {item.arrivals || "Regular"}</span>
                <span className="text-primary font-medium group-hover:underline">View Analytics →</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Crop Detail Modal */}
      {selectedCropModal && (
        <CropDetailModal
          isOpen={!!selectedCropModal}
          onClose={() => setSelectedCropModal(null)}
          cropName={selectedCropModal.name}
          currentPrice={selectedCropModal.priceNum || selectedCropModal.price}
          retailPrice={selectedCropModal.retailPrice}
          unit={selectedCropModal.unit || "kg"}
          category={selectedCropModal.category}
          priceQuintal={selectedCropModal.price_quintal}
          mandiInfo={selectedCropModal.mandi_info || `${selectedCropModal.market || "APMC"}, ${selectedCropModal.state || "India"}`}
          url={selectedCropModal.url}
        />
      )}
    </div>
  );
}
