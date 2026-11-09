"use client";

import { IndianRupee, Receipt, Users, Package, TrendingUp, CheckCircle2 } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { AnimatedNumber } from "@/components/core/animated-number";

export function StatsCards() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-stitch-surface-container animate-pulse" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md font-stitch-body">
      {/* 1. Total Revenue Card */}
      <div className="flex flex-col justify-between p-space-lg rounded-xl bg-stitch-surface-container hover:bg-stitch-surface-container-high transition-all shadow-md">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stitch-outline">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-stitch-primary-container/20 flex items-center justify-center text-stitch-primary">
              <IndianRupee className="w-[18px] h-[18px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-stitch-heading text-[28px] leading-[34px] font-bold text-stitch-on-background tracking-tight">
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
        <div className="pt-space-md flex items-center gap-1 text-xs text-stitch-tertiary">
          <TrendingUp className="w-[14px] h-[14px]" />
          <span>Verified Mandi turnover</span>
        </div>
      </div>

      {/* 2. Total Invoices Card */}
      <div className="flex flex-col justify-between p-space-lg rounded-xl bg-stitch-surface-container hover:bg-stitch-surface-container-high transition-all shadow-md">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stitch-outline">Total Invoices</span>
            <div className="w-8 h-8 rounded-lg bg-stitch-secondary/15 flex items-center justify-center text-stitch-secondary">
              <Receipt className="w-[18px] h-[18px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-stitch-heading text-[28px] leading-[34px] font-bold text-stitch-on-background tracking-tight">
              <AnimatedNumber
                value={totalInvoices}
                springOptions={{
                  bounce: 0,
                  duration: 1800,
                }}
              />
            </span>
            <span className="text-sm text-stitch-on-surface-variant">issued</span>
          </div>
        </div>
        <div className="pt-space-md flex items-center justify-between">
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stitch-tertiary" />
              <span className="text-stitch-on-background">
                <AnimatedNumber value={paidInvoices} springOptions={{ bounce: 0, duration: 1600 }} /> Paid
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stitch-secondary-container" />
              <span className="text-stitch-on-surface-variant">
                <AnimatedNumber value={unpaidInvoices} springOptions={{ bounce: 0, duration: 1600 }} /> Unpaid
              </span>
            </div>
          </div>
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
              <path className="text-stitch-surface-container-highest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
              <path className="text-stitch-tertiary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${paidPct}, 100`} strokeLinecap="round" strokeWidth="3.5" />
            </svg>
            <span className="absolute text-[10px] font-bold text-stitch-on-background">
              <AnimatedNumber value={paidPct} suffix="%" springOptions={{ bounce: 0, duration: 1800 }} />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Customers Card */}
      <div className="flex flex-col justify-between p-space-lg rounded-xl bg-stitch-surface-container hover:bg-stitch-surface-container-high transition-all shadow-md">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stitch-outline">Customers</span>
            <div className="w-8 h-8 rounded-lg bg-stitch-primary/15 flex items-center justify-center text-stitch-primary">
              <Users className="w-[18px] h-[18px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-stitch-heading text-[28px] leading-[34px] font-bold text-stitch-on-background tracking-tight">
              <AnimatedNumber
                value={totalCustomers}
                springOptions={{
                  bounce: 0,
                  duration: 1800,
                }}
              />
            </span>
            <span className="text-sm text-stitch-on-surface-variant">registered</span>
          </div>
        </div>
        <div className="pt-space-md flex items-center gap-1 text-xs text-stitch-tertiary">
          <TrendingUp className="w-[14px] h-[14px]" />
          <span>Active customer base</span>
        </div>
      </div>

      {/* 4. Products Card */}
      <div className="flex flex-col justify-between p-space-lg rounded-xl bg-stitch-surface-container hover:bg-stitch-surface-container-high transition-all shadow-md">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stitch-outline">Products</span>
            <div className="w-8 h-8 rounded-lg bg-stitch-surface-container-highest flex items-center justify-center text-stitch-on-background">
              <Package className="w-[18px] h-[18px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-stitch-heading text-[28px] leading-[34px] font-bold text-stitch-on-background tracking-tight">
              <AnimatedNumber
                value={totalProducts}
                springOptions={{
                  bounce: 0,
                  duration: 1800,
                }}
              />
            </span>
            <span className="text-sm text-stitch-on-surface-variant">SKUs</span>
          </div>
        </div>
        <div className="pt-space-md flex items-center gap-1 text-xs text-stitch-on-surface-variant">
          <CheckCircle2 className="w-[14px] h-[14px] text-stitch-tertiary" />
          <span>Catalog in sync</span>
        </div>
      </div>
    </div>
  );
}
