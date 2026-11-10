"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { CropDetailModal } from "@/components/crops/crop-detail-modal";
import { AnimatedNumber } from "@/components/core/animated-number";
import { Tilt } from "@/components/core/tilt";
import { useCropRates, CropRateItem } from "@/hooks/use-crop-rates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  RefreshCw,
  Search,
  ExternalLink,
  Store,
  LayoutGrid,
  List as ListIcon,
  IndianRupee,
  Clock,
  MapPin,
  CheckCircle2,
  Layers,
} from "lucide-react";

export default function DailyCropRatesPage() {
  const { data, isLoading, isError, refetch, isFetching } = useCropRates();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedCropModal, setSelectedCropModal] = useState<CropRateItem | null>(null);

  const items = data?.items || [];

  // Distinct categories available in items
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
          (item.category && item.category.toLowerCase().includes(search.toLowerCase().trim()));
        const matchesCategory =
          selectedCategory === "All" ||
          (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.priceNum - b.priceNum;
        if (sortBy === "price-desc") return b.priceNum - a.priceNum;
        return a.name.localeCompare(b.name);
      });
  }, [items, search, selectedCategory, sortBy]);

  // Key stats
  const averagePrice = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, curr) => acc + (curr.priceNum || 0), 0);
    return Math.round(sum / items.length);
  }, [items]);

  // Key staples for quick card
  const staples = useMemo(() => {
    const targets = ["Potato", "Onion", "Tomato", "Green Chilli", "Brinjal", "Ginger"];
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
          <div className="flex items-center gap-2 mb-1">
            <div className="badge-liquid-glass-emerald">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-400" /> Odisha Mandis • State-wide Rates (acrop.app)
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            Daily Crop Rates
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Live wholesale mandi rates across Odisha mandis powered by acrop.app (₹/Quintal & ₹/Kg).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-liquid-glass inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-white transition-all group"
            title="Refresh latest live mandi rates from acrop.app"
          >
            <RefreshCw
              className={`h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform ${
                isFetching ? "animate-spin text-emerald-400" : ""
              }`}
            />
            <span>{isFetching ? "Updating..." : "Refresh Rates"}</span>
          </button>
          <a
            href="https://acrop.app/mandi/odisha"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
          >
            <button
              type="button"
              className="btn-liquid-glass inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground/90 hover:text-white transition-all group"
            >
              <span>acrop.app/mandi/odisha</span>
              <ExternalLink className="h-3.5 w-3.5 text-emerald-400/80 group-hover:text-emerald-400 transition-colors" />
            </button>
          </a>
        </div>
      </div>

      {/* Highlights / Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Odisha Mandi Commodities</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedNumber value={items.length || 40} suffix=" Crops" springOptions={{ bounce: 0, duration: 1600 }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">State-wide modal coverage via acrop.app</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Wholesale Rate</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Key Staples (Potato / Onion)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold flex items-center justify-between">
              <span>Potato: <span className="text-foreground font-bold">₹{items.find((i) => i.name.toLowerCase().includes("potato"))?.priceNum || 20}/kg</span></span>
              <span className="text-muted-foreground font-normal">|</span>
              <span>Onion: <span className="text-foreground font-bold">₹{items.find((i) => i.name.toLowerCase().includes("onion"))?.priceNum || 32}/kg</span></span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Odisha Mandis wholesale median</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Feed Status</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live acrop.app Sync
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
              <Store className="h-4 w-4 text-primary" /> Essential Staples in Odisha Today (acrop.app)
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {staples.slice(0, 6).map((staple) => (
                <Tilt key={staple.name} rotationFactor={8} isRevese className="cursor-pointer">
                  <div
                    onClick={() => setSelectedCropModal(staple)}
                    style={{ borderRadius: "10px" }}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-card border shadow-xs hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full"
                    title={`Click to view price history and profit projection for ${staple.name}`}
                  >
                    {staple.image ? (
                      <img
                        src={staple.image}
                        alt={staple.name}
                        className="w-10 h-10 object-contain rounded-md bg-muted p-1 flex-shrink-0 transition-transform group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-2xl">{staple.emoji || "🌱"}</span>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-xs truncate group-hover:text-primary transition-colors">
                        {staple.name}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        {staple.price}{" "}
                        <span className="text-[10px] text-muted-foreground font-normal">/{staple.unit}</span>
                      </p>
                      {staple.price_quintal && (
                        <p className="text-[10px] text-muted-foreground">₹{staple.price_quintal}/qtl</p>
                      )}
                    </div>
                  </div>
                </Tilt>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls: Search, Category Filters, Sort, View */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crop or category (e.g. Tomato, Ginger, Cereals)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border border-white/15 bg-white/[0.05] dark:bg-black/30 backdrop-blur-2xl text-foreground placeholder:text-muted-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 rounded-xl border border-white/15 bg-white/[0.05] dark:bg-black/30 backdrop-blur-2xl px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
            >
              <option value="name" className="bg-[#1C1C1E] text-white">Sort: Name (A to Z)</option>
              <option value="price-asc" className="bg-[#1C1C1E] text-white">Price: Low to High</option>
              <option value="price-desc" className="bg-[#1C1C1E] text-white">Price: High to Low</option>
            </select>

            <div className="flex items-center p-1 rounded-xl bg-white/[0.05] dark:bg-black/30 backdrop-blur-2xl border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "table"
                    ? "btn-liquid-glass text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ListIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "grid"
                    ? "btn-liquid-glass text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
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
                    ? "bg-primary text-primary-foreground shadow-xs"
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
              Fetching live Odisha mandi rates from acrop.app...
            </p>
          </div>
        </Card>
      ) : isError ? (
        <Card className="p-8 text-center border-destructive/30 bg-destructive/5">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="font-semibold text-destructive">Unable to fetch live rates</p>
            <p className="text-xs text-muted-foreground max-w-md">
              The external market rate service could not be contacted directly. Please check your network connection or try refreshing.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
              Retry
            </Button>
          </div>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No crops or commodities found matching &quot;{search}&quot;.</p>
        </Card>
      ) : viewMode === "table" ? (
        <div className="rounded-2xl border border-white/10 bg-card/40 dark:bg-black/30 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden">
          <Table>
            <TableHeader className="bg-white/[0.04] dark:bg-white/[0.02] border-b border-white/10">
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="w-16">Item</TableHead>
                <TableHead>Commodity / Category</TableHead>
                <TableHead>Wholesale Rate (₹/Kg)</TableHead>
                <TableHead>Mandi Rate (₹/Quintal)</TableHead>
                <TableHead>Odisha Mandi Coverage</TableHead>
                <TableHead className="text-right">Market Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => setSelectedCropModal(item)}
                  className="hover:bg-white/[0.06] border-b border-white/5 transition-colors cursor-pointer group"
                  title="Click to view 7-day price history & future profit projection"
                >
                  <TableCell className="py-2.5">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-contain rounded-xl bg-white/[0.05] border border-white/10 p-1"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-lg">
                        {item.emoji || item.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                      {item.category && (
                        <span className="text-[11px] text-muted-foreground">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-base font-bold text-primary">
                      {item.price}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">/{item.unit}</span>
                  </TableCell>
                  <TableCell className="text-foreground/90 font-semibold">
                    {item.price_quintal
                      ? (item.price_quintal.startsWith("₹") ? item.price_quintal : `₹${item.price_quintal}`)
                      : `₹${(item.priceNum * 100).toLocaleString("en-IN")}`}
                    <span className="text-xs text-muted-foreground font-normal ml-1">/quintal</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {item.mandi_info || "Odisha Mandi Average"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="badge-liquid-glass-emerald">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                      <span>acrop.app</span>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              onClick={() => setSelectedCropModal(item)}
              className="overflow-hidden hover:shadow-md transition-all cursor-pointer hover:border-primary/50 bg-card group"
              title={`Click to view price history & profit projection for ${item.name}`}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-xl bg-muted/50 p-2 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-3xl">{item.emoji || "🌱"}</span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                {item.category && (
                  <Badge variant="outline" className="text-[10px] mt-1 text-muted-foreground">
                    {item.category}
                  </Badge>
                )}
                <div className="mt-2 text-lg font-extrabold text-primary">
                  {item.price} <span className="text-xs font-normal text-muted-foreground">/{item.unit}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Mandi:{" "}
                  <span className="font-semibold text-foreground">
                    {item.price_quintal
                      ? (item.price_quintal.startsWith("₹") ? item.price_quintal : `₹${item.price_quintal}`)
                      : `₹${(item.priceNum * 100).toLocaleString("en-IN")}`}/qtl
                  </span>
                </div>
                <span className="mt-3 badge-liquid-glass-emerald text-[10px]">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                  <span>{item.mandi_info?.split(" ")[0] || "Odisha"} Mandi</span>
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Commodity Intelligence Modal (Price History & Next-Season Profitability) */}
      {selectedCropModal && (
        <CropDetailModal
          isOpen={!!selectedCropModal}
          onClose={() => setSelectedCropModal(null)}
          cropName={selectedCropModal.name}
          currentPrice={selectedCropModal.price}
          retailPrice={selectedCropModal.retailPrice}
          unit={selectedCropModal.unit}
          category={selectedCropModal.category}
          priceQuintal={selectedCropModal.price_quintal}
          mandiInfo={selectedCropModal.mandi_info}
          url={selectedCropModal.url}
        />
      )}
    </div>
  );
}
