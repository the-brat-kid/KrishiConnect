"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  ShieldCheck,
  Building2,
  User,
  Calendar,
  Receipt,
  FileCheck,
  QrCode,
  Banknote,
  Clock,
} from "lucide-react";
import axios from "axios";
import { PaymentQR } from "@/components/invoices/payment-qr";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PublicInvoice {
  id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  status: string;
  payment_method?: string;
  subtotal: number;
  gst_total: number;
  grand_total: number;
  notes?: string;
  terms?: string;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
  };
  business?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    gst_rate: number;
    total: number;
  }>;
}

export default function PublicPaymentPage() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingCash, setConfirmingCash] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<"upi" | "cash" | "later">("upi");

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/v1/invoices/public/${id}`);
      setInvoice(res.data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invoice not found or expired.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  // Handle return redirect verification
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (paymentStatus === "success" && sessionId && id) {
      (async () => {
        try {
          setVerifying(true);
          const res = await axios.post(`${API_BASE_URL}/api/v1/payments/stripe/verify`, {
            session_id: sessionId,
            invoice_id: id,
          });

          if (res.data?.success) {
            setVerifySuccess(true);
            setMessage("Payment verified successfully! Receipt updated.");
            await fetchInvoice();
          } else {
            setMessage("Payment pending or incomplete. Please check with your bank.");
          }
        } catch (err: any) {
          setMessage(err?.response?.data?.detail || "Could not verify payment automatically.");
        } finally {
          setVerifying(false);
          window.history.replaceState({}, "", `/pay/${id}`);
        }
      })();
    } else if (paymentStatus === "cancelled") {
      setMessage("Payment was cancelled. You can retry whenever you're ready.");
      window.history.replaceState({}, "", `/pay/${id}`);
    }
  }, [searchParams, id]);

  const handleCashPaid = async () => {
    if (!invoice) return;
    try {
      setConfirmingCash(true);
      await axios.post(`${API_BASE_URL}/api/v1/payments/public/confirm-cash`, {
        invoice_id: invoice.id,
      });
      setVerifySuccess(true);
      setMessage("Invoice confirmed paid in Cash!");
      await fetchInvoice();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to confirm cash payment");
    } finally {
      setConfirmingCash(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-muted-foreground font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Loading Invoice details...</span>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
        <div className="liquid-glass max-w-md w-full rounded-3xl p-8 border border-white/10 bg-black/50 text-center space-y-4 shadow-2xl backdrop-blur-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Invoice Unavailable</h2>
          <p className="text-sm text-muted-foreground">{error || "This invoice link is invalid or has expired."}</p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === "paid" || verifySuccess;

  return (
    <div className="min-h-screen bg-[#080808] py-8 px-4 sm:px-6 lg:px-8 text-foreground relative selection:bg-emerald-500/25">
      {/* Living Ambient Glow Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-[#0a0f0d]/80 to-[#050505] -z-10" />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Verification in Progress Banner */}
        {verifying && (
          <div className="liquid-glass p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 flex items-center gap-3 text-indigo-300 animate-pulse backdrop-blur-xl">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400 shrink-0" />
            <span className="text-sm font-semibold">
              Verifying payment in real-time... Please do not close this window.
            </span>
          </div>
        )}

        {/* Message notification */}
        {message && (
          <div
            className={`liquid-glass p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-medium backdrop-blur-xl ${
              verifySuccess
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                : "bg-amber-950/40 border-amber-500/30 text-amber-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {verifySuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <span>{message}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-xs font-bold uppercase tracking-wider underline hover:opacity-75"
            >
              OK
            </button>
          </div>
        )}

        {/* Main Liquid Glass Invoice Card */}
        <div className="liquid-glass rounded-3xl shadow-2xl border border-white/15 bg-black/60 backdrop-blur-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-emerald-900/90 via-emerald-950/80 to-black/90 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Receipt className="w-4 h-4" /> KrishiConnect Digital Invoice
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white tracking-tight">
                #{invoice.invoice_number}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isPaid
                    ? "badge-liquid-glass-emerald"
                    : "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                }`}
              >
                {isPaid ? "Paid & Settled" : "Payment Pending"}
              </span>

              <button
                onClick={() => window.print()}
                className="btn-liquid-glass p-2.5 rounded-xl text-white transition-colors no-print"
                title="Print Invoice"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Business & Customer Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-white/10">
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Billed By (Seller)
                </div>
                <div className="font-bold text-base text-foreground">
                  {invoice.business?.name || "KrishiConnect Verified Merchant"}
                </div>
                {invoice.business?.address && (
                  <p className="text-xs text-muted-foreground">{invoice.business.address}</p>
                )}
                {invoice.business?.phone && (
                  <p className="text-xs text-muted-foreground">Phone: {invoice.business.phone}</p>
                )}
                {invoice.business?.email && (
                  <p className="text-xs text-muted-foreground">Email: {invoice.business.email}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:text-right">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 sm:justify-end">
                  <User className="w-3.5 h-3.5 text-emerald-400" /> Billed To (Buyer)
                </div>
                <div className="font-bold text-base text-foreground">
                  {invoice.customer?.name || "Valued Customer"}
                </div>
                {invoice.customer?.phone && (
                  <p className="text-xs text-muted-foreground">Phone: {invoice.customer.phone}</p>
                )}
                {invoice.customer?.email && (
                  <p className="text-xs text-muted-foreground">Email: {invoice.customer.email}</p>
                )}
                <div className="text-xs text-muted-foreground pt-1 flex items-center gap-2 sm:justify-end">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Issued: {formatDate(invoice.date)}</span>
                  {invoice.due_date && <span>• Due: {formatDate(invoice.due_date)}</span>}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Commodities &amp; Line Items
              </div>
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Rate</th>
                      <th className="py-3 px-4 text-right">GST %</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-foreground">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition">
                        <td className="py-3 px-4 font-medium text-foreground">{item.description}</td>
                        <td className="py-3 px-4 text-center font-mono text-muted-foreground">{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">{item.gst_rate}%</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-4 border-t border-white/10">
              <div className="space-y-1 text-xs text-muted-foreground max-w-sm">
                {invoice.notes && (
                  <p>
                    <strong className="text-foreground">Notes:</strong> {invoice.notes}
                  </p>
                )}
                {invoice.terms && (
                  <p>
                    <strong className="text-foreground">Terms:</strong> {invoice.terms}
                  </p>
                )}
              </div>

              <div className="w-full sm:w-72 space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono text-foreground">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>GST Total</span>
                  <span className="font-mono text-foreground">{formatCurrency(invoice.gst_total)}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-base font-bold text-foreground">
                  <span>Grand Total</span>
                  <span className="font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                    {formatCurrency(invoice.grand_total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Card: Pay or Receipt */}
            <div className="no-print pt-6 border-t border-white/10">
              {isPaid ? (
                <div className="liquid-glass p-6 rounded-3xl border border-emerald-500/40 bg-emerald-950/40 backdrop-blur-2xl text-center space-y-3 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Payment Settled</h3>
                  <p className="text-xs text-emerald-200/80 max-w-md mx-auto">
                    This invoice was settled via {invoice.payment_method || "UPI"}. Thank you for your business!
                  </p>
                  <button
                    onClick={() => window.print()}
                    className="btn-liquid-glass inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Receipt</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Payment Method Selector Tabs: Cash, UPI, Pay Later */}
                  <div className="grid grid-cols-3 gap-2.5 p-1.5 rounded-2xl bg-white/5 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setPayMethod("cash")}
                      className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                        payMethod === "cash"
                          ? "btn-liquid-glass-primary shadow-[0_0_15px_rgba(20,122,77,0.35)]"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Banknote className="w-4 h-4 shrink-0" />
                      <span>Cash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayMethod("upi")}
                      className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                        payMethod === "upi"
                          ? "btn-liquid-glass-primary shadow-[0_0_15px_rgba(20,122,77,0.35)]"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <QrCode className="w-4 h-4 shrink-0" />
                      <span>UPI QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayMethod("later")}
                      className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                        payMethod === "later"
                          ? "btn-liquid-glass border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Pay Later</span>
                    </button>
                  </div>

                  {/* Cash Flow */}
                  {payMethod === "cash" && (
                    <div className="liquid-glass p-6 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-2xl text-center space-y-4 max-w-md mx-auto shadow-xl">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                        <Banknote className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-base">Cash on Hand / Delivery</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                          Settle the amount of <strong className="text-white font-mono">{formatCurrency(invoice.grand_total)}</strong> in cash directly with <strong className="text-white">{invoice.business?.name}</strong> upon receiving your produce.
                        </p>
                      </div>
                      <button
                        onClick={handleCashPaid}
                        disabled={confirmingCash}
                        className="btn-liquid-glass-primary w-full py-3 rounded-xl font-bold text-xs shadow-[0_0_15px_rgba(20,122,77,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {confirmingCash ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                        <span>Confirm Cash Payment</span>
                      </button>
                    </div>
                  )}

                  {/* UPI QR Flow with FreePay Real-Time Auto-Verification */}
                  {payMethod === "upi" && (
                    <div className="max-w-md mx-auto">
                      <PaymentQR
                        amount={invoice.grand_total}
                        invoiceNumber={invoice.invoice_number}
                        invoiceId={invoice.id}
                        onPaymentSuccess={() => {
                          setVerifySuccess(true);
                          setMessage("UPI Payment received and verified! Receipt generated.");
                          fetchInvoice();
                        }}
                      />
                    </div>
                  )}

                  {/* Pay Later Flow */}
                  {payMethod === "later" && (
                    <div className="liquid-glass p-6 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-2xl text-center space-y-4 max-w-md mx-auto shadow-xl">
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-base">Pay Later / Credit Balance</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                          This invoice of <strong className="text-white font-mono">{formatCurrency(invoice.grand_total)}</strong> will remain recorded as receivable under your account with <strong className="text-white">{invoice.business?.name}</strong>.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-semibold text-amber-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due Date: {formatDate(invoice.due_date || invoice.date)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Powered by KrishiConnect Agriculture Management Platform</p>
        </div>
      </div>
    </div>
  );
}
