"use client";

import { Eye, ArrowRight, Receipt } from "lucide-react";
import { useRecentTransactions } from "@/hooks/use-dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function RecentTransactions() {
  const { data: transactions, isLoading } = useRecentTransactions();

  return (
    <div className="flex flex-col rounded-2xl border border-white/12 dark:border-white/[0.09] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] dark:from-white/[0.06] dark:via-black/25 dark:to-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_16px_40px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-300 w-full min-w-0">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/10 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-white/15 bg-primary/10 flex items-center justify-center text-primary shadow-xs shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2 truncate">
              Recent Transactions
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              Live ledger of recent verified trade invoices
            </p>
          </div>
        </div>

        <Link
          href="/invoices"
          className="btn-liquid-glass inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-foreground hover:text-white self-start sm:self-auto shrink-0"
        >
          <span>View all invoices</span>
          <ArrowRight className="w-3.5 h-3.5 text-primary" />
        </Link>
      </div>

      {/* Mobile Card List (Zero Horizontal Scroll on Phones) */}
      <div className="block md:hidden divide-y divide-white/[0.06] dark:divide-white/[0.05]">
        {isLoading && (
          <div className="py-8 text-center text-muted-foreground text-xs">
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Loading recent ledger entries...</span>
            </div>
          </div>
        )}

        {!isLoading &&
          transactions?.map((t) => {
            const isPaid = t.status?.toLowerCase() === "paid";
            const isUnpaid = t.status?.toLowerCase() === "unpaid";

            return (
              <div
                key={t.invoice_id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-white/[0.04] transition-colors"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/invoices/${t.invoice_id}`}
                      className="font-mono text-xs font-bold text-foreground hover:text-primary transition-colors truncate"
                    >
                      {t.invoice_number}
                    </Link>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isPaid
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : isUnpaid
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                      }`}
                    >
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground truncate">{t.customer_name}</p>
                  <p className="text-[10px] text-muted-foreground/70 font-mono">{formatDate(t.date)}</p>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <p className="text-xs font-mono font-bold text-foreground">{formatCurrency(t.amount)}</p>
                  <Link
                    href={`/invoices/${t.invoice_id}`}
                    className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                    title="View invoice"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}

        {!isLoading && (!transactions || transactions.length === 0) && (
          <div className="py-8 text-center text-muted-foreground text-xs">
            No recent transactions recorded in this ledger.
          </div>
        )}
      </div>

      {/* Desktop Glass Table */}
      <div className="hidden md:block w-full overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-white/[0.03] dark:bg-black/25 border-b border-white/10 dark:border-white/[0.07] text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3 px-5 sm:px-6 w-[22%]">Invoice</th>
              <th className="py-3 px-4 w-[28%]">Customer</th>
              <th className="py-3 px-4 w-[16%]">Date</th>
              <th className="py-3 px-4 text-right w-[16%]">Amount</th>
              <th className="py-3 px-4 text-center w-[12%]">Status</th>
              <th className="py-3 px-5 sm:px-6 text-right w-[6%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] dark:divide-white/[0.05] text-foreground text-sm">
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-muted-foreground text-xs">
                  <div className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span>Loading recent ledger entries...</span>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              transactions?.map((t) => {
                const isPaid = t.status?.toLowerCase() === "paid";
                const isUnpaid = t.status?.toLowerCase() === "unpaid";

                return (
                  <tr
                    key={t.invoice_id}
                    className="group hover:bg-white/[0.06] dark:hover:bg-white/[0.05] transition-colors duration-150"
                  >
                    {/* Invoice ID */}
                    <td className="py-3.5 px-5 sm:px-6">
                      <Link
                        href={`/invoices/${t.invoice_id}`}
                        className="font-mono text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5 truncate"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 group-hover:bg-primary shrink-0" />
                        <span className="truncate">{t.invoice_number}</span>
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full border border-white/15 bg-white/10 dark:bg-white/5 text-foreground flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs">
                          {initials(t.customer_name || "?")}
                        </div>
                        <span className="text-sm font-medium text-foreground truncate">
                          {t.customer_name}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-muted-foreground text-xs font-mono whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                      {formatCurrency(t.amount)}
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all ${
                          isPaid
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                            : isUnpaid
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                            : "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPaid
                              ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                              : isUnpaid
                              ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]"
                              : "bg-sky-400"
                          }`}
                        />
                        <span>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap">
                      <Link
                        href={`/invoices/${t.invoice_id}`}
                        className="inline-flex items-center justify-center p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 hover:border-white/25 text-muted-foreground hover:text-foreground transition-all shadow-xs"
                        title="View and print invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}

            {!isLoading && (!transactions || transactions.length === 0) && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground text-xs">
                  No recent transactions recorded in this ledger.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
