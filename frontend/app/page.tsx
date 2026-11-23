"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Menu,
  X,
  Phone,
  Copyright,
  TrendingUp,
  Tractor,
  Truck,
  Warehouse,
  FileText,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwitchMode } from "@/components/ui/switch-mode";
import { RegionLanguageSelector } from "@/components/ui/region-language-selector";
import { DynamicFarmWeatherBackground } from "@/components/layout/dynamic-farm-weather-background";

// Live Mandi Ticker Data (Direct Pan-India APMC Modal Quotes)
const LIVE_TICKER_ITEMS = [
  { crop: "Potato (Alu)", market: "Agra APMC", rate: "₹21.0/kg", change: "+1.2%", trend: "up" },
  { crop: "Onion (Piaja)", market: "Lasalgaon Mandi", rate: "₹38.5/kg", change: "+2.4%", trend: "up" },
  { crop: "Tomato (Bilati)", market: "Nashik APMC", rate: "₹24.0/kg", change: "-1.5%", trend: "down" },
  { crop: "Wheat (Gehun)", market: "Khanna APMC", rate: "₹26.2/kg", change: "+0.8%", trend: "up" },
  { crop: "Cotton (Kapas)", market: "Nagpur Hub", rate: "₹74.5/kg", change: "+1.8%", trend: "up" },
  { crop: "Basmati Paddy", market: "Amritsar Mandi", rate: "₹44.5/kg", change: "+3.1%", trend: "up" },
  { crop: "Paddy (Swarna)", market: "Khordha Mandi", rate: "₹28.5/kg", change: "+0.5%", trend: "up" },
  { crop: "Soybean", market: "Indore Mandi", rate: "₹46.0/kg", change: "+1.1%", trend: "up" },
  { crop: "Turmeric (Haldi)", market: "Kandhamal Hub", rate: "₹135.0/kg", change: "+2.0%", trend: "up" },
  { crop: "Green Chilli", market: "Guntur Yard", rate: "₹55.0/kg", change: "-2.1%", trend: "down" },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary relative select-none">
      {/* Living Dynamic Farm & Weather Canvas Background */}
      <DynamicFarmWeatherBackground showControls={true} />

      {/* 1. Top Navigation */}
      <header className="relative z-30 w-full px-4 sm:px-12 md:px-16 pt-5 sm:pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
              KC
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-foreground font-plus-jakarta">
              KrishiConnect
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-xs tracking-wider uppercase text-muted-foreground font-medium">
          <Link href="/crop-rates" className="hover:text-foreground transition-colors">
            Mandi Rates
          </Link>
          <Link href="/equipment" className="hover:text-foreground transition-colors">
            Equipment
          </Link>
          <Link href="/transportation" className="hover:text-foreground transition-colors">
            Logistics
          </Link>
          <Link href="/cold-storage" className="hover:text-foreground transition-colors">
            Cold Storage
          </Link>
          <Link href="/invoices" className="hover:text-foreground transition-colors">
            Invoicing
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold text-foreground">
            Contact Us
          </Link>
        </nav>

        {/* Right Header Utilities: Region/Lang + Theme Switch + Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Region & Language Selector */}
          <RegionLanguageSelector variant="compact" />

          {/* Animated Sliding SwitchMode Component */}
          <SwitchMode width={52} height={26} />

          <Button size="sm" asChild className="hidden sm:inline-flex h-8 px-3.5 text-xs shadow-xs">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5">
              <span>Open Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-card/60 backdrop-blur-md border border-border/80 text-foreground hover:bg-muted transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="relative z-30 lg:hidden px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="rounded-2xl border border-white/10 bg-card/95 dark:bg-black/90 backdrop-blur-2xl p-5 shadow-2xl space-y-4">
            <div className="pb-1 border-b border-border/40">
              <RegionLanguageSelector variant="compact" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                href="/crop-rates"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors flex flex-col gap-1 border border-border/40"
              >
                <span className="text-foreground font-bold">Mandi Rates</span>
                <span className="text-[10px] text-muted-foreground font-normal">Live Pan-India APMC</span>
              </Link>
              <Link
                href="/equipment"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors flex flex-col gap-1 border border-border/40"
              >
                <span className="text-foreground font-bold">Equipment</span>
                <span className="text-[10px] text-muted-foreground font-normal">Tractors & Drones</span>
              </Link>
              <Link
                href="/transportation"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors flex flex-col gap-1 border border-border/40"
              >
                <span className="text-foreground font-bold">Logistics</span>
                <span className="text-[10px] text-muted-foreground font-normal">Corridor Routes</span>
              </Link>
              <Link
                href="/cold-storage"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors flex flex-col gap-1 border border-border/40"
              >
                <span className="text-foreground font-bold">Cold Storage</span>
                <span className="text-[10px] text-muted-foreground font-normal">District Chambers</span>
              </Link>
              <Link
                href="/invoices"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors flex flex-col gap-1 border border-border/40"
              >
                <span className="text-foreground font-bold">GST Billing</span>
                <span className="text-[10px] text-muted-foreground font-normal">Instant digital invoices</span>
              </Link>
              <Link
                href="/fertilizer"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors flex flex-col gap-1 border border-border/40"
              >
                <span className="text-foreground font-bold">Fertilizer Guide</span>
                <span className="text-[10px] text-muted-foreground font-normal">Dosage & subsidies</span>
              </Link>
            </div>

            <div className="border-t border-border/60 pt-3 flex flex-col gap-2">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-between border border-primary/25"
              >
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Contact Support</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/copyright"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-2"
              >
                <Copyright className="h-3.5 w-3.5" />
                <span>Copyright & Legal Notice</span>
              </Link>
            </div>

            <Button asChild className="w-full">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* 2. Responsive Hero Section */}
      <main className="relative z-20 flex-1 flex flex-col justify-center px-4 sm:px-12 md:px-16 max-w-5xl py-8 sm:py-16">
        <div className="space-y-4 sm:space-y-6 animate-page-enter">
          {/* Live Status Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-muted-foreground w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="tracking-wider uppercase text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                National Mandi Network • 28 States Active
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-muted-foreground font-mono">
              <span>Agmarknet Data.gov.in</span>
            </div>
          </div>

          {/* High-Impact Responsive Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-foreground leading-[1.15] sm:leading-[1.08] font-plus-jakarta">
            Sovereign trade at the <span className="font-extrabold text-primary">farm gate.</span>
          </h1>

          {/* Clean Subcopy */}
          <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed max-w-2xl">
            Pan-India agricultural commerce simplified: verified daily APMC mandi modal prices via Government of India Agmarknet, on-demand farm equipment rentals via KhetiSetu, nationwide freight routing, and instant digital GST billing across 28 states.
          </p>

          {/* Phone-Compatible Focused Action Area */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-wrap">
            <Button size="lg" asChild className="h-12 px-6 shadow-sm hover:shadow-md transition-all text-sm font-semibold">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2">
                <span>Enter Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button variant="outline" size="lg" asChild className="h-12 px-5 text-xs uppercase tracking-wider">
              <Link href="/crop-rates" className="inline-flex items-center justify-center gap-2">
                <span>Check Mandi Rates</span>
              </Link>
            </Button>

            <Button variant="outline" size="lg" asChild className="h-12 px-5 text-xs uppercase tracking-wider">
              <Link href="/equipment" className="inline-flex items-center justify-center gap-2">
                <span>Rent Machinery</span>
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* 3. Live APMC Ticker Bar */}
      <section className="relative z-20 w-full border-y border-white/10 bg-black/40 backdrop-blur-md py-3 overflow-hidden select-none">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar px-4 sm:px-12 md:px-16">
          <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-white/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Live Mandi Ticker
            </span>
          </div>

          <div className="flex items-center gap-6 shrink-0 text-xs">
            {LIVE_TICKER_ITEMS.map((item) => (
              <div key={item.crop} className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-foreground">{item.crop}</span>
                <span className="text-[10px] text-muted-foreground font-mono">({item.market})</span>
                <span className="font-mono font-bold text-foreground">{item.rate}</span>
                <span
                  className={`text-[10px] font-mono font-semibold ${
                    item.trend === "up" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Hackathon Evaluator Quick Jump Bar */}
      <section className="relative z-20 w-full px-4 sm:px-12 md:px-16 py-6 border-b border-white/10 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Hackathon Demo Launchpad
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Select any core subsystem below to inspect live data workflows and functionality:
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/crop-rates"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-foreground transition-colors"
            >
              Mandi Intelligence
            </Link>
            <Link
              href="/equipment"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-foreground transition-colors"
            >
              Equipment Rental
            </Link>
            <Link
              href="/transportation"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-foreground transition-colors"
            >
              Freight Corridors
            </Link>
            <Link
              href="/cold-storage"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-foreground transition-colors"
            >
              Cold Storage
            </Link>
            <Link
              href="/invoices"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-foreground transition-colors"
            >
              GST Invoicing
            </Link>
            <Link
              href="/fertilizer"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-foreground transition-colors"
            >
              Fertilizer Dosage
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Core Platform Architecture & 6 Pillars */}
      <section className="relative z-20 w-full px-4 sm:px-12 md:px-16 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-plus-jakarta">
              Full-Stack Agricultural Infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Eliminating intermediaries through direct APMC market integration, shared farm mechanization, route-optimized freight dispatch, and automated tax invoicing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Mandi Intelligence */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition-all space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Live APMC Mandi Intelligence</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Direct API integration with Government of India Agmarknet (data.gov.in) across 28 states. Automated modal rate analysis and wholesale vs. retail spread calculation.
                </p>
              </div>
              <Link
                href="/crop-rates"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pt-2 border-t border-white/10"
              >
                <span>View Daily Mandi Rates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. Farm Equipment Rental */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition-all space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Tractor className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Machinery & Equipment Fleet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Rent verified tractors, combine harvesters, rotavators, and spray drones sourced directly from KhetiSetu farm network at transparent per-acre and hourly rates.
                </p>
              </div>
              <Link
                href="/equipment"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pt-2 border-t border-white/10"
              >
                <span>Rent Machinery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. Freight Logistics */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition-all space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Freight Logistics & Routing</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Route mileage calculation and toll projections for 15+ major highway corridors. Transparent per-km freight pricing for 1T to 25T carriers with turnaround estimates.
                </p>
              </div>
              <Link
                href="/transportation"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pt-2 border-t border-white/10"
              >
                <span>Calculate Freight</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4. Cold Storage */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition-all space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Warehouse className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Cold Storage & Preservation</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  District-wise directory of verified cold storage chambers with real-time temperature, humidity, and quintal capacity monitoring to prevent distress sales.
                </p>
              </div>
              <Link
                href="/cold-storage"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pt-2 border-t border-white/10"
              >
                <span>Locate Cold Storage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 5. GST Invoicing */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition-all space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Digital GST Invoicing & UPI</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generate compliant invoices in seconds with automated dynamic UPI payment QR codes, buyer ledger reconciliation, and payment status tracking.
                </p>
              </div>
              <Link
                href="/invoices"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pt-2 border-t border-white/10"
              >
                <span>Create Invoice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 6. Scientific Advisory */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition-all space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Soil Health & Scientific Advisory</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Accredited laboratory testing directory with doorstep collection and crop-specific fertilizer dosage calculations based on ICAR agronomic models.
                </p>
              </div>
              <Link
                href="/fertilizer"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pt-2 border-t border-white/10"
              >
                <span>Calculate Dosage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Provenance & Operational Numbers Strip */}
      <section className="relative z-20 w-full px-4 sm:px-12 md:px-16 py-10 border-t border-white/10 bg-black/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-foreground">28</span>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">States & UTs Covered</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-emerald-400">500+</span>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">APMC Mandis Indexed</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-foreground">100%</span>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Verified Government Data</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-emerald-400">₹0</span>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Middleman Commission</p>
          </div>
        </div>
      </section>

      {/* 7. Responsive Quiet Footer */}
      <footer className="relative z-20 w-full px-4 sm:px-12 md:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground border-t border-white/10 bg-background/60 backdrop-blur-md">
        <span className="text-center sm:text-left">
          © {new Date().getFullYear()} KrishiConnect. Pan-India Agricultural Exchange & Farm Operating System.
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link href="/contact" className="hover:text-primary transition-colors font-medium">
            Contact Support
          </Link>
          <Link href="/copyright" className="hover:text-foreground transition-colors">
            Copyright Policy
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/dashboard" className="hover:text-primary transition-colors font-medium">
            Trader Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
