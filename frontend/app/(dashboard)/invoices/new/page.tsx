"use client";

import { Suspense } from "react";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default function NewInvoicePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Create Invoice</h1>
      <div className="bg-card border rounded-lg p-6">
        <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading invoice editor...</div>}>
          <InvoiceForm />
        </Suspense>
      </div>
    </div>
  );
}
