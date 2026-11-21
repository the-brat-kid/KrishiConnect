"use client";

import { IndianRupee, Receipt, Users, Package, TrendingUp, CheckCircle2 } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { AnimatedNumber } from "@/components/core/animated-number";

export function StatsCards() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-36 rounded-2xl border border-white/10 bg-white/[0.04] dark:bg-black/30 backdrop-blur-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  const totalRevenue = stats?.total_revenue || 0;
  const totalInvoices = stats?.total_invoices || 0;
  const paidInvoices = stats?.paid_invoices || 0;
  const unpaidInvoices = stats?.unpaid_invoices || 0;
  const totalCustomers = stats?.total_customers || 0;
  const totalProducts = stats?.total_products || 0;
  const paidPct = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-w-0 w-full">
      {/* 1. Total Revenue Card (Liquid Glass) */}
      <div className="group relative flex flex-col justify-between p-5 rounded-2xl border border-white/12 dark:border-white/[0.09] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] dark:from-white/[0.06] dark:via-black/25 dark:to-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_12px_32px_rgba(0,0,0,0.35)] hover:border-emerald-500/40 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_16px_36px_rgba(0,0,0,0.45),0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 overflow-hidden min-w-0">
        {/* Specular Glint */}
        <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl border border-white/15 bg-white/10 dark:bg-white/5 backdrop-blur-md flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-xs">
              <IndianRupee className="w-[18px] h-[18px]" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-[28px] sm:text-[30px] leading-tight font-extrabold text-foreground tracking-tight font-plus-jakarta">
              <AnimatedNumber
                value={totalRevenue}
                prefix="₹"
                springOptions={{
                  bounce: 0,
                  duration: 2000,
                }}
              />
            </span>
          </div>
        </div>

        <div className="relative z-10 pt-4 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Verified turnover</span>
        </div>
      </div>

      {/* 2. Total Invoices Card (Liquid Glass with Progress Ring) */}
      <div className="group relative flex flex-col justify-between p-5 rounded-2xl border border-white/12 dark:border-white/[0.09] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] dark:from-white/[0.06] dark:via-black/25 dark:to-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_12px_32px_rgba(0,0,0,0.35)] hover:border-primary/40 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_16px_36px_rgba(0,0,0,0.45)] transition-all duration-300 overflow-hidden min-w-0">
        {/* Specular Glint */}
        <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-primary/10 blur-2xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Invoices
            </span>
            <div className="w-9 h-9 rounded-xl border border-white/15 bg-white/10 dark:bg-white/5 backdrop-blur-md flex items-center justify-center text-primary shadow-xs">
              <Receipt className="w-[18px] h-[18px]" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-[28px] sm:text-[30px] leading-tight font-extrabold text-foreground tracking-tight font-plus-jakarta">
              <AnimatedNumber
                value={totalInvoices}
                springOptions={{
                  bounce: 0,
                  duration: 1800,
                }}
              />
            </span>
          </div>
        </div>

        <div className="relative z-10 pt-4 flex items-center justify-between">
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span className="text-foreground font-semibold">
                <AnimatedNumber value={paidInvoices} springOptions={{ bounce: 0, duration: 1600 }} /> Paid
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              <span className="text-muted-foreground">
                <AnimatedNumber value={unpaidInvoices} springOptions={{ bounce: 0, duration: 1600 }} /> Unpaid
              </span>
            </div>
          </div>

          {/* Luminous Donut Ring */}
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 -rotate-90 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]" viewBox="0 0 36 36">
              <path
                className="text-white/10 dark:text-white/10"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-emerald-500 dark:text-emerald-400"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${paidPct}, 100`}
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-foreground">
              <AnimatedNumber value={paidPct} suffix="%" springOptions={{ bounce: 0, duration: 1800 }} />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Customers Card (Liquid Glass) */}
      <div className="group relative flex flex-col justify-between p-5 rounded-2xl border border-white/12 dark:border-white/[0.09] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] dark:from-white/[0.06] dark:via-black/25 dark:to-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_12px_32px_rgba(0,0,0,0.35)] hover:border-primary/40 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_16px_36px_rgba(0,0,0,0.45)] transition-all duration-300 overflow-hidden min-w-0">
        {/* Specular Glint */}
        <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-primary/10 blur-2xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Customers
            </span>
            <div className="w-9 h-9 rounded-xl border border-white/15 bg-white/10 dark:bg-white/5 backdrop-blur-md flex items-center justify-center text-primary shadow-xs">
              <Users className="w-[18px] h-[18px]" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-[28px] sm:text-[30px] leading-tight font-extrabold text-foreground tracking-tight font-plus-jakarta">
              <AnimatedNumber
                value={totalCustomers}
                springOptions={{
                  bounce: 0,
                  duration: 1800,
                }}
              />
            </span>
          </div>
        </div>

        <div className="relative z-10 pt-4 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Active buyers</span>
        </div>
      </div>

      {/* 4. Products Card (Liquid Glass) */}
      <div className="group relative flex flex-col justify-between p-5 rounded-2xl border border-white/12 dark:border-white/[0.09] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] dark:from-white/[0.06] dark:via-black/25 dark:to-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_12px_32px_rgba(0,0,0,0.35)] hover:border-primary/40 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_16px_36px_rgba(0,0,0,0.45)] transition-all duration-300 overflow-hidden min-w-0">
        {/* Specular Glint */}
        <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-primary/10 blur-2xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Products
            </span>
            <div className="w-9 h-9 rounded-xl border border-white/15 bg-white/10 dark:bg-white/5 backdrop-blur-md flex items-center justify-center text-foreground shadow-xs">
              <Package className="w-[18px] h-[18px]" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-[28px] sm:text-[30px] leading-tight font-extrabold text-foreground tracking-tight font-plus-jakarta">
              <AnimatedNumber
                value={totalProducts}
                springOptions={{
                  bounce: 0,
                  duration: 1800,
                }}
              />
            </span>
          </div>
        </div>

        <div className="relative z-10 pt-4 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Catalog synced</span>
        </div>
      </div>
    </div>
  );
}
