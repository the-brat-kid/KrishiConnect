"use client";
import Link from "next/link";
import { Store, ArrowRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AiInsightBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-900/10 via-primary/5 to-transparent border border-emerald-500/20 p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0 text-emerald-700">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-foreground">Bhubaneswar Daily Crop Rates</span>
              <span className="badge-liquid-glass-emerald">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                <span>Live Mandi</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Today&apos;s baseline prices: <strong>Onion ₹53/kg</strong>, <strong>Tomato ₹35/kg</strong>, <strong>Potato ₹28/kg</strong>, <strong>Green Chilli ₹53/kg</strong>. Sourced live from Bhubaneswar Mandi.
            </p>
          </div>
        </div>

        <Link
          href="/crop-rates"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap self-start md:self-center"
        >
          View all 50+ crop rates
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
