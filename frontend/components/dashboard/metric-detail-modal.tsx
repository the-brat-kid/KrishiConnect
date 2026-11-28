"use client";

import React from "react";
import Link from "next/link";
import {
  IndianRupee,
  Receipt,
  Users,
  Package,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type FinancialMetricType = "revenue" | "invoices" | "customers" | "products";

interface FinancialOverviewDetailModalProps {
  metric: FinancialMetricType | null;
  stats: {
    total_revenue?: number;
    total_invoices?: number;
    paid_invoices?: number;
    unpaid_invoices?: number;
    total_customers?: number;
    total_products?: number;
  } | null;
  onClose: () => void;
}

export function FinancialOverviewDetailModal({
  metric,
  stats,
  onClose,
}: FinancialOverviewDetailModalProps) {
  if (!metric) return null;

  const totalRevenue = stats?.total_revenue || 0;
  const totalInvoices = stats?.total_invoices || 0;
  const paidInvoices = stats?.paid_invoices || 0;
  const unpaidInvoices = stats?.unpaid_invoices || 0;
  const totalCustomers = stats?.total_customers || 0;
  const totalProducts = stats?.total_products || 0;
  const paidPct = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;

  const configMap: Record<
    FinancialMetricType,
    {
      title: string;
      subtitle: string;
      primaryValue: string;
      icon: React.ReactNode;
      primaryHref: string;
      primaryLabel: string;
      secondaryHref?: string;
      secondaryLabel?: string;
      rows: { label: string; value: string; highlight?: boolean }[];
    }
  > = {
    revenue: {
      title: "Total Verified Turnover",
      subtitle: "Revenue across mandi invoices, direct trade & digital UPI QR settlements",
      primaryValue: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: <IndianRupee className="w-5 h-5 text-emerald-400" />,
      primaryHref: "/invoices",
      primaryLabel: "View All Invoices",
      secondaryHref: "/invoices/new",
      secondaryLabel: "Create Invoice",
      rows: [
        { label: "Total Invoices Recorded", value: `${totalInvoices}`, highlight: true },
        { label: "Settled / Paid Bills", value: `${paidInvoices} (${paidPct}%)`, highlight: true },
        { label: "Pending Receivables", value: `${unpaidInvoices} bills` },
        { label: "Avg. Ticket Size", value: totalInvoices > 0 ? `₹${Math.round(totalRevenue / totalInvoices).toLocaleString("en-IN")}` : "₹0" },
      ],
    },
    invoices: {
      title: "Invoices & Settlement Status",
      subtitle: "Breakdown of paid bills, UPI receivables, and mandi khata dues",
      primaryValue: `${totalInvoices} Invoices`,
      icon: <Receipt className="w-5 h-5 text-primary" />,
      primaryHref: "/invoices",
      primaryLabel: "Manage Invoices",
      secondaryHref: "/invoices/new",
      secondaryLabel: "New Mandi Bill",
      rows: [
        { label: "Paid Invoices", value: `${paidInvoices}`, highlight: true },
        { label: "Unpaid / Credit Bills", value: `${unpaidInvoices}` },
        { label: "Settlement Ratio", value: `${paidPct}%`, highlight: true },
        { label: "Total Billed Value", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
      ],
    },
    customers: {
      title: "Active Buyers & CRM Ledger",
      subtitle: "Registered FPOs, commission agents, rice mills, and wholesale merchants",
      primaryValue: `${totalCustomers} Buyers`,
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      primaryHref: "/customers",
      primaryLabel: "Open Buyer Directory",
      secondaryHref: "/invoices/new",
      secondaryLabel: "Bill Customer",
      rows: [
        { label: "Verified CRM Accounts", value: `${totalCustomers}`, highlight: true },
        { label: "Linked Invoices", value: `${totalInvoices}` },
        { label: "Verified Trade Network", value: "Odisha & Pan-India APMC" },
      ],
    },
    products: {
      title: "Tracked Produce & Lots",
      subtitle: "Active inventory commodities calibrated with daily APMC mandi modal rates",
      primaryValue: `${totalProducts} Products`,
      icon: <Package className="w-5 h-5 text-amber-400" />,
      primaryHref: "/products",
      primaryLabel: "Open Inventory & Bidding",
      secondaryHref: "/crop-rates",
      secondaryLabel: "Check Mandi Rates",
      rows: [
        { label: "Cataloged Produce Lots", value: `${totalProducts}`, highlight: true },
        { label: "Mandi Sync Status", value: "Live AGMARKNET Calibrated", highlight: true },
        { label: "GST Classification", value: "0% Exempt Fresh Agri Produce" },
      ],
    },
  };

  const info = configMap[metric];

  return (
    <Dialog open={!!metric} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[95vw] p-0 rounded-2xl border border-white/15 bg-[#0c0d0e]/95 backdrop-blur-2xl shadow-2xl text-foreground overflow-hidden">
        <DialogHeader className="p-5 pb-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/15 flex items-center justify-center shrink-0">
              {info.icon}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-extrabold text-foreground">
                {info.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {info.subtitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 block">
                Current Metric Value
              </span>
              <span className="text-2xl font-extrabold font-mono text-foreground mt-0.5 block">
                {info.primaryValue}
              </span>
            </div>
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.02]">
            {info.rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  {r.highlight ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span>{r.label}</span>
                </span>
                <span className="font-mono font-bold text-foreground">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-2">
          {info.secondaryHref && (
            <Button type="button" variant="outline" size="sm" asChild className="text-xs border-white/15">
              <Link href={info.secondaryHref} className="inline-flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>{info.secondaryLabel}</span>
              </Link>
            </Button>
          )}

          <Button type="button" size="sm" asChild className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">
            <Link href={info.primaryHref} className="inline-flex items-center gap-1.5">
              <span>{info.primaryLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
