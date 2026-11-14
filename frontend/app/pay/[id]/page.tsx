"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
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
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<"upi" | "stripe">("upi");

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

  // Handle Stripe redirect back to this page: ?payment=success&session_id=...
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
            setMessage("Payment verified successfully via Stripe! Receipt updated.");
            await fetchInvoice();
          } else {
            setMessage("Stripe payment pending or incomplete. Please check with your bank.");
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

  const handlePay = async () => {
    if (!invoice) return;
    try {
      setPaying(true);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const success_url = `${origin}/pay/${invoice.id}?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancel_url = `${origin}/pay/${invoice.id}?payment=cancelled`;

      const res = await axios.post(`${API_BASE_URL}/api/v1/payments/public/stripe/checkout-session`, {
        invoice_id: invoice.id,
        success_url,
        cancel_url,
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to start Stripe checkout session");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          Loading Invoice details...
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Invoice Unavailable</h2>
          <p className="text-sm text-slate-600">{error || "This invoice link is invalid or has expired."}</p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === "paid" || verifySuccess;

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Verification in Progress Banner */}
        {verifying && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center gap-3 text-indigo-900 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600 shrink-0" />
            <span className="text-sm font-semibold">
              Verifying Stripe payment in real-time... Please do not close this window.
            </span>
          </div>
        )}

        {/* Message notification */}
        {message && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-medium ${
              verifySuccess
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {verifySuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
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

        {/* Main Invoice Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Receipt className="w-4 h-4" /> KrishiConnect Digital Invoice
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
                Invoice #{invoice.invoice_number}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-extrabold uppercase tracking-wide px-3.5 py-1.5 rounded-full ${
                  isPaid
                    ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                    : "bg-amber-400/20 text-amber-200 border border-amber-400/40"
                }`}
              >
                {isPaid ? "✓ Paid & Settled" : "● Payment Pending"}
              </span>
              <button
                onClick={() => window.print()}
                className="no-print p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Print Receipt"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Business & Customer Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Billed By (Seller)
                </div>
                <div className="font-bold text-base text-slate-900">
                  {invoice.business?.name || "KrishiConnect Verified Merchant"}
                </div>
                {invoice.business?.address && (
                  <p className="text-xs text-slate-500">{invoice.business.address}</p>
                )}
                {invoice.business?.phone && (
                  <p className="text-xs text-slate-500">Phone: {invoice.business.phone}</p>
                )}
                {invoice.business?.email && (
                  <p className="text-xs text-slate-500">Email: {invoice.business.email}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:text-right">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 sm:justify-end">
                  <User className="w-3.5 h-3.5" /> Billed To (Buyer)
                </div>
                <div className="font-bold text-base text-slate-900">
                  {invoice.customer?.name || "Valued Customer"}
                </div>
                {invoice.customer?.phone && (
                  <p className="text-xs text-slate-500">Phone: {invoice.customer.phone}</p>
                )}
                {invoice.customer?.email && (
                  <p className="text-xs text-slate-500">Email: {invoice.customer.email}</p>
                )}
                <div className="text-xs text-slate-400 pt-1 flex items-center gap-2 sm:justify-end">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Issued: {formatDate(invoice.date)}</span>
                  {invoice.due_date && <span>• Due: {formatDate(invoice.due_date)}</span>}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Items / Commodities
              </div>
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Rate</th>
                      <th className="py-3 px-4 text-right">GST %</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-medium text-slate-800">{item.description}</td>
                        <td className="py-3 px-4 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500">{item.gst_rate}%</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-1 text-xs text-slate-500 max-w-sm">
                {invoice.notes && (
                  <p>
                    <strong className="text-slate-700">Notes:</strong> {invoice.notes}
                  </p>
                )}
                {invoice.terms && (
                  <p>
                    <strong className="text-slate-700">Terms:</strong> {invoice.terms}
                  </p>
                )}
              </div>

              <div className="w-full sm:w-72 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>GST Total</span>
                  <span className="font-mono">{formatCurrency(invoice.gst_total)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span className="font-mono text-emerald-700">
                    {formatCurrency(invoice.grand_total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Card: Pay or Receipt */}
            <div className="no-print pt-6 border-t border-slate-100">
              {isPaid ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950">Payment Settled</h3>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    This invoice was settled via {invoice.payment_method || "Stripe"}. Thank you for your business!
                  </p>
                  <Button
                    variant="outline"
                    className="border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                    onClick={() => window.print()}
                  >
                    <Printer className="mr-2 h-4 w-4" /> Print Receipt
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Payment Method Selector Tabs */}
                  <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPayMethod("upi")}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                        payMethod === "upi"
                          ? "bg-white text-emerald-800 shadow-sm border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>FreePay UPI (0% Fee)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayMethod("stripe")}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                        payMethod === "stripe"
                          ? "bg-white text-indigo-800 shadow-sm border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <span>Cards / Stripe</span>
                    </button>
                  </div>

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

                  {/* Stripe Card/Checkout Flow */}
                  {payMethod === "stripe" && (
                    <div className="space-y-4">
                      <Button
                        onClick={handlePay}
                        disabled={paying || verifying}
                        size="lg"
                        className="w-full h-16 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-bold text-base shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 transition-all"
                      >
                        {paying ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CreditCard className="w-6 h-6" />
                        )}
                        <span>Pay {formatCurrency(invoice.grand_total)} with Stripe</span>
                      </Button>

                      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-2">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" /> 256-bit SSL Secure
                        </span>
                        <span>•</span>
                        <span>Credit / Debit Cards, Apple &amp; Google Pay</span>
                        <span>•</span>
                        <span>Instant Auto-Verification</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>Powered by KrishiConnect Business Management Platform</p>
          <p>Strict data isolation &amp; automated payment reconciliation</p>
        </div>
      </div>
    </div>
  );
}
