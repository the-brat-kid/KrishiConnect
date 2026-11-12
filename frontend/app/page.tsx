"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Phone, Mail, Copyright, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwitchMode } from "@/components/ui/switch-mode";
import { DynamicFarmWeatherBackground } from "@/components/layout/dynamic-farm-weather-background";

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
        <nav className="hidden md:flex items-center gap-7 text-xs tracking-wider uppercase text-muted-foreground font-medium">
          <Link href="/crop-rates" className="hover:text-foreground transition-colors">
            Mandi Rates
          </Link>
          <Link href="/transportation" className="hover:text-foreground transition-colors">
            Logistics
          </Link>
          <Link href="/invoices" className="hover:text-foreground transition-colors">
            Invoicing
          </Link>
          <Link href="/customers" className="hover:text-foreground transition-colors">
            Buyers
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold text-foreground">
            Contact Us
          </Link>
        </nav>

        {/* Right Header Utilities: Theme Switch & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            className="md:hidden p-2 rounded-lg bg-card/60 backdrop-blur-md border border-border/80 text-foreground hover:bg-muted transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="relative z-30 md:hidden px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="rounded-2xl border border-white/10 bg-card/95 dark:bg-black/90 backdrop-blur-2xl p-5 shadow-2xl space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                href="/crop-rates"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors flex flex-col gap-1 border border-border/40"
              >
                <span className="text-foreground font-bold">Mandi Rates</span>
                <span className="text-[10px] text-muted-foreground font-normal">Live Odisha APMC</span>
              </Link>
              <Link
                href="/transportation"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors flex flex-col gap-1 border border-border/40"
              >
                <span className="text-foreground font-bold">Freight & Routes</span>
                <span className="text-[10px] text-muted-foreground font-normal">Distance & Rates</span>
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
                href="/customers"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors flex flex-col gap-1 border border-border/40"
              >
                <span className="text-foreground font-bold">Trade Buyers</span>
                <span className="text-[10px] text-muted-foreground font-normal">Directory & ledger</span>
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
                  <span>Contact Us (Email & WhatsApp)</span>
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
      <main className="relative z-20 flex-1 flex flex-col justify-center px-4 sm:px-12 md:px-16 max-w-4xl py-6 sm:py-12">
        <div className="space-y-4 sm:space-y-6 animate-page-enter">
          {/* Subtle Live Status */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-muted-foreground w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tracking-wider uppercase text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Bhubaneswar APMC Live
            </span>
          </div>

          {/* High-Impact Responsive Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-foreground leading-[1.15] sm:leading-[1.08] font-plus-jakarta">
            Sovereign trade at the <span className="font-extrabold text-primary">farm gate.</span>
          </h1>

          {/* Clean Subcopy */}
          <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed max-w-xl">
            Odisha agricultural commerce simplified: verified daily mandi modal prices, calibrated freight routing, and instant digital GST billing for farmers and traders.
          </p>

          {/* Phone-Compatible Focused Action Area */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
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

            <Link
              href="/contact"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors text-center sm:text-left py-1"
            >
              Contact Support & WhatsApp →
            </Link>
          </div>
        </div>
      </main>

      {/* 3. Responsive Quiet Footer */}
      <footer className="relative z-20 w-full px-4 sm:px-12 md:px-16 py-4 sm:pb-6 sm:pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-[11px] text-muted-foreground border-t border-border/40 sm:border-0 bg-background/40 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none">
        <span className="text-center sm:text-left">
          © {new Date().getFullYear()} KrishiConnect. Odisha Agrarian Exchange.
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link href="/contact" className="hover:text-primary transition-colors font-medium">
            Contact Us
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
            Trader Sign In
          </Link>
        </div>
      </footer>
    </div>
  );
}
