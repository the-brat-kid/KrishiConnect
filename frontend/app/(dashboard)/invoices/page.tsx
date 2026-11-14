// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useInvoices, useDeleteInvoice } from "@/hooks/use-invoices";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AnimatedNumber } from "@/components/core/animated-number";
import {
  Plus,
  Mail,
  Eye,
  Search,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";

const statusStyles: Record<string, string> = {
  paid: "badge-liquid-glass-emerald",
  unpaid: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]",
  partial: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  pending: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30",
};

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useInvoices();
  const { mutateAsync: deleteInvoice } = useDeleteInvoice();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteInvoice = async (id: string, invoiceNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete invoice #${invoiceNumber}?`)) {
      return;
    }
    try {
      setDeletingId(id);
      await deleteInvoice(id);
    } catch (err: any) {
      alert("Failed to delete invoice: " + (err?.response?.data?.detail || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyPayLink = (invoiceId: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/pay/${invoiceId}`;
      navigator.clipboard.writeText(url);
      alert("Customer payment link copied to clipboard: " + url);
    }
  };

  const handleSendEmail = async (invoiceId: string, defaultEmail?: string) => {
    const customerEmail = window.prompt("Enter customer email address to send this invoice:", defaultEmail || "");
    if (!customerEmail) return;

    try {
      const token = localStorage.getItem("access_token");
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiBaseUrl}/api/v1/invoices/${invoiceId}/send-email?email=${customerEmail}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Invoice email dispatch started in the background!");
      } else {
        alert("Failed to send email. Check backend logs.");
      }
    } catch (error) {
      console.error("Email error:", error);
      alert("An error occurred while sending the email.");
    }
  };

  const stats = useMemo(() => {
    const list = invoices || [];
    const total = list.reduce((sum: number, inv: any) => sum + (inv.grand_total || 0), 0);
    const paid = list.filter((inv: any) => inv.status === "paid");
    const paidAmount = paid.reduce((sum: number, inv: any) => sum + (inv.grand_total || 0), 0);
    const pending = list.filter((inv: any) => inv.status !== "paid");
    const pendingAmount = pending.reduce((sum: number, inv: any) => sum + (inv.grand_total || 0), 0);
    return {
      count: list.length,
      total,
      paidCount: paid.length,
      paidAmount,
      pendingCount: pending.length,
      pendingAmount,
    };
  }, [invoices]);

  const filtered = useMemo(() => {
    if (!invoices) return [];
    if (!search.trim()) return invoices;
    const q = search.toLowerCase();
    return invoices.filter((inv: any) =>
      inv.invoice_number?.toLowerCase().includes(q) ||
      inv.customer?.name?.toLowerCase().includes(q)
    );
  }, [invoices, search]);

  return (
    <div className="w-full space-y-6 animate-page-enter">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="badge-liquid-glass-emerald">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span>Real-Time Invoicing &amp; Settlements</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Receipt className="h-8 w-8 text-primary drop-shadow-[0_0_10px_rgba(20,122,77,0.5)]" />
            <span>Invoices &amp; Receivables</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage agricultural billing, UPI QR auto-verification, cash receipts, and customer ledger balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/invoices/new">
            <button className="btn-liquid-glass-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-[0_0_20px_rgba(20,122,77,0.4)] transition-all">
              <Plus className="w-4 h-4 text-white" />
              <span>Create Invoice</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Modern Liquid Glass KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Invoiced */}
        <div className="liquid-glass p-5 rounded-2xl border border-white/10 dark:border-white/10 bg-black/40 backdrop-blur-xl shadow-xl hover:border-emerald-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Invoiced
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground">
              <AnimatedNumber value={stats.total} prefix="₹" springOptions={{ bounce: 0, duration: 1800 }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span>Across</span>
              <strong className="text-foreground"><AnimatedNumber value={stats.count} springOptions={{ bounce: 0, duration: 1400 }} /></strong>
              <span>total invoices</span>
            </p>
          </div>
        </div>

        {/* Collected & Paid */}
        <div className="liquid-glass p-5 rounded-2xl border border-white/10 dark:border-white/10 bg-black/40 backdrop-blur-xl shadow-xl hover:border-emerald-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Settled &amp; Paid
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              <AnimatedNumber value={stats.paidAmount} prefix="₹" springOptions={{ bounce: 0, duration: 1800 }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <strong className="text-emerald-400"><AnimatedNumber value={stats.paidCount} springOptions={{ bounce: 0, duration: 1400 }} /></strong>
              <span>invoices settled in bank / cash</span>
            </p>
          </div>
        </div>

        {/* Pending / Unpaid */}
        <div className="liquid-glass p-5 rounded-2xl border border-white/10 dark:border-white/10 bg-black/40 backdrop-blur-xl shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Pending / Pay Later
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]">
              <AnimatedNumber value={stats.pendingAmount} prefix="₹" springOptions={{ bounce: 0, duration: 1800 }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <strong className="text-amber-400"><AnimatedNumber value={stats.pendingCount} springOptions={{ bounce: 0, duration: 1400 }} /></strong>
              <span>receivable balance</span>
            </p>
          </div>
        </div>
      </div>

      {/* Search Toolbar with Frosted Glass */}
      <div className="liquid-glass p-2.5 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl flex items-center gap-3 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all"
            placeholder="Search invoice number, buyer name, or reference..."
          />
        </div>
      </div>

      {/* Modern Invoices Table with Frosted Liquid Glass */}
      <div className="liquid-glass rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer / Buyer</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-foreground text-sm divide-y divide-white/5">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && filtered.map((inv: any) => {
                const isOverdue = inv.status !== "paid" && inv.due_date && new Date(inv.due_date) < new Date();
                const status = isOverdue ? "unpaid" : (inv.status || "unpaid");
                return (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link href={`/invoices/${inv.id}`} className="font-mono font-bold text-emerald-400 group-hover:underline inline-flex items-center gap-1.5">
                        <span>{inv.invoice_number}</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-foreground">
                      {inv.customer?.name || "Cash Customer"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground text-xs">
                      {formatDate(inv.date)}
                    </td>
                    <td className={`py-3.5 px-4 whitespace-nowrap text-xs ${isOverdue ? "text-rose-400 font-semibold" : "text-muted-foreground"}`}>
                      {formatDate(inv.due_date)}{isOverdue && " • Overdue"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-bold text-foreground">
                      {formatCurrency(inv.grand_total)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <span className={statusStyles[status] || statusStyles.unpaid}>
                        {isOverdue && <AlertTriangle className="w-3 h-3" />}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== "paid" && (
                          <button
                            onClick={() => handleCopyPayLink(inv.id)}
                            title="Copy UPI Customer Payment Link"
                            className="btn-liquid-glass p-2 rounded-xl text-emerald-400 hover:text-white transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleSendEmail(inv.id, inv.customer?.email)}
                          title="Send Invoice via Email"
                          className="btn-liquid-glass p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="btn-liquid-glass p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors inline-flex"
                          title="View Invoice Sheet"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteInvoice(inv.id, inv.invoice_number)}
                          disabled={deletingId === inv.id}
                          title="Delete Invoice"
                          className="btn-liquid-glass p-2 rounded-xl text-muted-foreground hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <div className="space-y-2">
                      <Receipt className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                      <p className="text-sm">No invoices found matching &ldquo;{search}&rdquo;</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
