"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwitchMode } from "@/components/ui/switch-mode";
import { DynamicFarmWeatherBackground } from "@/components/layout/dynamic-farm-weather-background";

export default function HomePage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary relative select-none">
      {/* Living Dynamic Farm & Weather Canvas Background */}
      <DynamicFarmWeatherBackground showControls={true} />

      {/* 1. Minimal Top Navigation */}
      <header className="relative z-20 w-full px-6 sm:px-12 md:px-16 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
            KC
          </div>
          <span className="font-bold text-base tracking-tight text-foreground">
            KrishiConnect
          </span>
        </div>

        <nav className="hidden sm:flex items-center gap-8 text-xs tracking-wider uppercase text-muted-foreground">
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
        </nav>

        <div className="flex items-center gap-3">
          {/* Animated Sliding SwitchMode Component */}
          <SwitchMode width={60} height={30} />

          <Button size="sm" asChild className="h-8 px-3.5 text-xs shadow-xs">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5">
              <span>Open Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      {/* 2. Focused Minimal Hero Viewport */}
      <main className="relative z-20 flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-3xl pb-10">
        <div className="space-y-6 animate-page-enter">
          {/* Subtle Live Status */}
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tracking-wider uppercase text-[11px] font-semibold text-primary">
              Bhubaneswar APMC Live
            </span>
          </div>

          {/* High-Impact Minimal Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-foreground leading-[1.08]">
            Sovereign trade at the <span className="font-semibold text-primary">farm gate.</span>
          </h1>

          {/* Clean Subcopy */}
          <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed max-w-xl">
            Odisha agricultural commerce simplified: verified daily mandi modal prices, calibrated freight routing, and instant digital GST billing for farmers and traders.
          </p>

          {/* Single Focused Action Area */}
          <div className="pt-2 flex items-center gap-6">
            <Button size="lg" asChild className="h-11 px-6 shadow-sm hover:shadow-md transition-all">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm">
                <span>Enter Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Link
              href="/crop-rates"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors border-b border-border pb-0.5"
            >
              Check Today&apos;s Mandi Rates
            </Link>
          </div>
        </div>
      </main>

      {/* 3. Minimal Quiet Footer */}
      <footer className="relative z-20 w-full px-6 sm:px-12 md:px-16 pb-6 pt-2 flex flex-wrap items-center justify-between gap-4 text-[11px] text-muted-foreground">
        <span>© {new Date().getFullYear()} KrishiConnect. Odisha Agrarian Exchange.</span>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/dashboard" className="hover:text-primary transition-colors">
            Trader Sign In
          </Link>
        </div>
      </footer>
    </div>
  );
}
