"use client";

import { Suspense } from "react";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { ArrowLeft, PlusCircle, Receipt } from "lucide-react";
import Link from "next/link";

export default function NewInvoicePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-page-enter">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
        <Link
          href="/invoices"
          className="btn-liquid-glass inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-foreground hover:text-white w-fit transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-emerald-400" />
          <span>Back to Invoices</span>
        </Link>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Receipt className="h-8 w-8 text-primary drop-shadow-[0_0_10px_rgba(20,122,77,0.5)]" />
            <span>Create New Invoice</span>
          </h1>
          <span className="badge-liquid-glass-emerald">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>New Sale Entry</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter customer information, commodities, pricing, and choose settlement terms (Cash, UPI, or Pay Later).
        </p>
      </div>

      <div className="liquid-glass border border-white/15 bg-black/40 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-2xl">
        <Suspense fallback={<div className="p-12 text-center text-sm text-muted-foreground">Loading invoice editor...</div>}>
          <InvoiceForm />
        </Suspense>
      </div>
    </div>
  );
}
