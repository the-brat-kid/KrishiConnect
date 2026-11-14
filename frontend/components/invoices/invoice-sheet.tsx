"use client";
import { Invoice, BusinessProfile, Customer } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { amountInWords } from "@/lib/number-to-words";

interface InvoiceSheetProps {
  invoice: Invoice;
  businessProfile: BusinessProfile;
  customer?: Customer;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "badge-liquid-glass-emerald",
  unpaid: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30",
  partial: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  overdue: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30",
};

export function InvoiceSheet({ invoice, businessProfile, customer }: InvoiceSheetProps) {
  const status = (invoice.status || "unpaid").toLowerCase();
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.unpaid;

  const discountValue = invoice.discount_value || 0;
  const discountAmount =
    invoice.discount_type === "percent" ? invoice.subtotal * (discountValue / 100) : discountValue;

  const blendedGstRate = invoice.subtotal > 0 ? (invoice.gst_total / invoice.subtotal) * 100 : 0;
  const halfGst = invoice.gst_total / 2;

  return (
    <main
      className="invoice-sheet liquid-glass bg-card/95 dark:bg-[#0c0e12]/90 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 p-6 sm:p-10 relative overflow-hidden backdrop-blur-2xl text-foreground print:bg-white print:text-black print:border-none print:shadow-none"
      data-purpose="invoice-container"
    >
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

      {/* Header */}
      <section className="border-b border-border/60 pb-8 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 p-3 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-2xl border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                  {businessProfile.business_name}
                </h1>
                <span className={statusStyle}>
                  {status}
                </span>
              </div>
              {businessProfile.business_type && (
                <p className="text-xs text-muted-foreground mt-1">{businessProfile.business_type}</p>
              )}
              <p className="text-xs text-emerald-400 font-mono mt-0.5">Retail Tax Invoice</p>
            </div>
          </div>

          <div className="sm:text-right bg-white/5 dark:bg-black/30 sm:bg-transparent p-4 sm:p-0 rounded-2xl w-full sm:w-auto border sm:border-0 border-white/10">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Invoice Number</span>
            <span className="text-xl font-mono font-bold text-foreground tracking-tight">
              #{invoice.invoice_number}
            </span>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between sm:justify-end gap-3 text-muted-foreground">
                <span>Issue Date:</span>
                <span className="font-medium font-mono text-foreground">{formatDate(invoice.date)}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-3 text-muted-foreground">
                <span>Due Date:</span>
                <span className="font-medium font-mono text-foreground">{formatDate(invoice.due_date)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parties */}
      <section className="py-8 border-b border-border/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Billed By (Merchant)
            </span>
            <h3 className="text-base font-bold text-foreground">{businessProfile.business_name}</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">GSTIN:</span>
                <span className="bg-white/10 text-foreground px-2 py-0.5 rounded-lg font-mono text-[11px] border border-white/10">
                  {businessProfile.gst_number || "N/A (Unregistered)"}
                </span>
              </p>
              {businessProfile.address && <p>{businessProfile.address}</p>}
            </div>
          </div>

          <div className="space-y-2 sm:pl-6 sm:border-l sm:border-border/60">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Billed To (Customer)
            </span>
            <h3 className="text-base font-bold text-foreground">{customer?.name || "Customer Name"}</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">GSTIN:</span>
                <span className="bg-white/10 text-foreground px-2 py-0.5 rounded-lg font-mono text-[11px] border border-white/10">
                  {customer?.gst_number || "N/A"}
                </span>
              </p>
              {customer?.address && <p>{customer.address}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Items table */}
      <section className="py-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                <th className="pb-3.5 pl-1 w-12 text-center">#</th>
                <th className="pb-3.5 pr-4 font-semibold">Description</th>
                <th className="pb-3.5 px-4 text-center font-semibold w-24">Qty</th>
                <th className="pb-3.5 px-4 text-right font-semibold w-32">Price</th>
                <th className="pb-3.5 px-4 text-center font-semibold w-24">GST %</th>
                <th className="pb-3.5 pr-1 text-right font-semibold w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {invoice.items.map((item, i) => {
                const total = item.quantity * item.unit_price * (1 + item.gst_rate / 100);
                return (
                  <tr key={i} className="group hover:bg-white/5 transition">
                    <td className="py-4 pl-1 text-xs text-muted-foreground font-mono text-center">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="font-semibold text-foreground">{item.description}</div>
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-foreground font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-foreground">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block text-[11px] font-mono bg-white/10 text-foreground px-2 py-0.5 rounded-lg font-medium border border-white/10">
                        {item.gst_rate}%
                      </span>
                    </td>
                    <td className="py-4 pr-1 text-right font-mono font-bold text-foreground">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Totals + payment info */}
      <section className="border-t border-border/60 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-6 space-y-4">
            <div className="bg-white/5 dark:bg-black/30 rounded-2xl p-5 border border-white/10 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="font-bold text-foreground uppercase tracking-wide">Payment Details</span>
                {status === "paid" && (
                  <span className="text-emerald-400 font-semibold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-[10px]">
                    VERIFIED
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Payment Mode</span>
                  <span className="font-semibold text-foreground uppercase">{invoice.payment_method || "Not recorded"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Transaction Status</span>
                  <span className={`font-semibold ${status === "paid" ? "text-emerald-400" : "text-foreground"}`}>
                    {status === "paid" ? "Fully Settled" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>
              {blendedGstRate > 0 && (
                <p className="text-muted-foreground text-[11px] pt-1">
                  * Effective GST rate of {blendedGstRate.toFixed(0)}% includes CGST + SGST as applicable.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <p className="text-xs font-medium">
                Thank you for shopping with <span className="font-bold text-white">{businessProfile.business_name}</span>!
              </p>
            </div>
          </div>

          <div className="md:col-span-6 md:pl-6 space-y-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-muted-foreground py-1">
                <span className="font-medium">Subtotal (Base Price)</span>
                <span className="font-mono font-semibold text-foreground">{formatCurrency(invoice.subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-400 py-1">
                  <span className="font-medium">
                    Discount Applied {invoice.discount_type === "percent" ? `(${discountValue}%)` : ""}
                  </span>
                  <span className="font-mono font-semibold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              {invoice.gst_total > 0 && (
                <>
                  <div className="flex justify-between items-center text-muted-foreground py-0.5">
                    <span>CGST ({((blendedGstRate || 18) / 2).toFixed(1)}%)</span>
                    <span className="font-mono">{formatCurrency(halfGst)}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground py-0.5">
                    <span>SGST ({((blendedGstRate || 18) / 2).toFixed(1)}%)</span>
                    <span className="font-mono">{formatCurrency(halfGst)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-baseline pt-3 border-t-2 border-border text-foreground">
                <div>
                  <span className="text-sm font-bold uppercase tracking-wider block">Grand Total</span>
                  <span className="text-[10px] text-muted-foreground">Inclusive of all taxes</span>
                </div>
                <span className="text-2xl font-extrabold font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                  {formatCurrency(invoice.grand_total)}
                </span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <span className="text-[11px] text-muted-foreground uppercase font-bold block">Amount in Words</span>
              <p className="text-xs italic text-foreground font-serif capitalize">
                {amountInWords(invoice.grand_total)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Notes & Terms */}
      {(invoice.notes || invoice.terms) && (
        <section className="mt-8 pt-6 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-muted-foreground">
          {invoice.notes && (
            <div>
              <span className="font-bold uppercase tracking-wider text-foreground block mb-1">Notes</span>
              <p>{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <span className="font-bold uppercase tracking-wider text-foreground block mb-1">Terms &amp; Conditions</span>
              <p>{invoice.terms}</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
