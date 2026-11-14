"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useInvoice, useUpdateInvoiceStatus } from "@/hooks/use-invoices";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { useCustomers } from "@/hooks/use-customers";
import { useCreateStripeCheckout, useVerifyStripePayment } from "@/hooks/use-payments";
import { Button } from "@/components/ui/button";
import { PaymentQR } from "@/components/invoices/payment-qr";
import { InvoiceSheet } from "@/components/invoices/invoice-sheet";
import { formatCurrency } from "@/lib/utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";
import {
  Download,
  Printer,
  ArrowLeft,
  CheckCircle2,
  Banknote,
  QrCode,
  Loader2,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  unpaid: "bg-amber-100 text-amber-700 border-amber-200",
  partial: "bg-emerald-100 text-emerald-700 border-emerald-200",
  overdue: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function InvoiceDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: invoice, isLoading, refetch } = useInvoice(id);
  const { data: profile } = useBusinessProfile();
  const { data: customers } = useCustomers();
  const { mutateAsync: updateStatus } = useUpdateInvoiceStatus();
  const { mutateAsync: createCheckout, isPending: isCreatingCheckout } = useCreateStripeCheckout();
  const { mutateAsync: verifyStripe, isPending: isVerifyingStripe } = useVerifyStripePayment();

  const [isClient, setIsClient] = useState(false);
  const [showUpiQR, setShowUpiQR] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle Stripe redirect parameters (?payment=success&session_id=...)
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (paymentStatus === "success" && sessionId && invoice && invoice.status !== "paid") {
      let isSubscribed = true;
      (async () => {
        try {
          const res = await verifyStripe({
            session_id: sessionId,
            invoice_id: invoice.id,
          });
          if (!isSubscribed) return;
          if (res.success) {
            setVerificationMessage(res.message || "Payment verified successfully!");
            await refetch();
          } else {
            setVerificationError(res.message || "Could not confirm payment yet.");
          }
        } catch (err: any) {
          if (!isSubscribed) return;
          setVerificationError(err?.response?.data?.detail || "Error verifying payment");
        } finally {
          // Clean URL params so duplicate verification isn't fired on re-render
          window.history.replaceState({}, "", `/invoices/${id}`);
        }
      })();

      return () => {
        isSubscribed = false;
      };
    } else if (paymentStatus === "cancelled") {
      setVerificationError("Payment checkout was cancelled. You can try again at any time.");
      window.history.replaceState({}, "", `/invoices/${id}`);
    }
  }, [searchParams, invoice, id, verifyStripe, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading invoice...
      </div>
    );
  }
  if (!invoice) return <div className="py-24 text-center text-muted-foreground">Invoice not found</div>;

  const customer = customers?.find((c) => c.id === invoice.customer_id);
  const status = invoice.status || "unpaid";
  const badgeStyle = STATUS_BADGE[status] || STATUS_BADGE.unpaid;

  const handleCopyPaymentLink = () => {
    if (typeof window === "undefined") return;
    const payUrl = `${window.location.origin}/pay/${invoice.id}`;
    navigator.clipboard.writeText(payUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="no-print space-y-4">
        <button
          onClick={() => router.push("/invoices")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Invoices
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Invoice {invoice.invoice_number}
            </h1>
            <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full border ${badgeStyle}`}>
              {status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={handleCopyPaymentLink}>
              {copiedLink ? <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copiedLink ? "Link Copied!" : "Share Link"}
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => window.print()}>
              <Printer className="mr-1.5 h-4 w-4" /> Print
            </Button>
            {isClient && profile && (
              <PDFDownloadLink
                document={<InvoicePDF invoice={invoice} businessProfile={profile} customer={customer} />}
                fileName={`Invoice-${invoice.invoice_number}.pdf`}
              >
                <Button size="sm" className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Download className="mr-1.5 h-4 w-4" /> PDF
                </Button>
              </PDFDownloadLink>
            )}
          </div>
        </div>
      </div>

      {/* Auto-Verification Feedback Banner */}
      {isVerifyingStripe && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600 shrink-0" />
          <div className="text-sm font-medium">
            Verifying payment in real-time... Please wait while your transaction is confirmed.
          </div>
        </div>
      )}

      {verificationMessage && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{verificationMessage}</span>
          </div>
          <button
            onClick={() => setVerificationMessage(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {verificationError && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <span className="text-sm font-medium">{verificationError}</span>
          </div>
          <button
            onClick={() => setVerificationError(null)}
            className="text-xs text-amber-700 hover:text-amber-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Invoice sheet */}
        <div className="md:col-span-2 space-y-6">
          {profile && <InvoiceSheet invoice={invoice} businessProfile={profile} customer={customer} />}
        </div>

        {/* Payment panel */}
        <div className="no-print md:sticky md:top-6 space-y-4">
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Payment</h2>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Auto-Verify
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {status === "paid" ? "This invoice has been settled" : "Collect payment via Cash, UPI, or Pay Later"}
              </p>
            </div>

            <div className="p-6">
              {status === "paid" ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center gap-2 py-8 px-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                    <div className="font-bold text-emerald-800">Payment Received</div>
                    <div className="text-xs text-emerald-600">{formatCurrency(invoice.grand_total)} settled</div>
                    {invoice.payment_method && (
                      <span className="text-[11px] font-medium text-emerald-700 mt-1 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200/60">
                        Via {invoice.payment_method}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-slate-700 text-xs"
                    onClick={() => {
                      setShowUpiQR(false);
                      updateStatus({ id: invoice.id, status: "unpaid" });
                    }}
                  >
                    Mark as Unpaid (Pay Later)
                  </Button>
                </div>
              ) : !showUpiQR ? (
                <div className="space-y-3">
                  {/* UPI QR Payment Button */}
                  <Button
                    className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 flex items-center justify-center gap-2.5 font-semibold text-sm transition-all"
                    onClick={() => setShowUpiQR(true)}
                  >
                    <QrCode className="h-5 w-5" />
                    <span>Pay via UPI (GPay / PhonePe / QR)</span>
                  </Button>

                  {/* Cash Payment Button */}
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 flex items-center justify-center gap-2 font-semibold text-xs transition-all"
                    onClick={async () => {
                      await updateStatus({ id: invoice.id, status: "paid" });
                      await refetch();
                    }}
                  >
                    <Banknote className="h-4 w-4 text-emerald-600" />
                    <span>Received via Cash (Mark as Paid)</span>
                  </Button>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs font-medium rounded-lg text-slate-700 flex items-center justify-center gap-1.5"
                      onClick={handleCopyPaymentLink}
                    >
                      {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedLink ? "Link Copied to Clipboard!" : "Copy Customer Payment Link"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground hover:text-slate-700 flex items-center justify-center gap-1.5"
                      onClick={() => updateStatus({ id: invoice.id, status: "unpaid" })}
                    >
                      <span>Pay Later (Keep as Unpaid)</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-2">
                    <PaymentQR
                      amount={invoice.grand_total}
                      invoiceNumber={invoice.invoice_number}
                      invoiceId={invoice.id}
                      onPaymentSuccess={() => {
                        setShowUpiQR(false);
                        refetch();
                        setVerificationMessage("Payment verified automatically in real-time via UPI!");
                      }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Ask customer to scan with any UPI app (GPay, PhonePe, Paytm).
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setShowUpiQR(false)}>
                      Back
                    </Button>
                    <Button
                      className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={async () => {
                        setShowUpiQR(false);
                        await updateStatus({ id: invoice.id, status: "paid" });
                        await refetch();
                      }}
                    >
                      Confirm Paid
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Secure Payment Assurance Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Instant Payment Settlement</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              When paid via UPI or Cash, the invoice is immediately stamped as Paid and settled in your ledger. Buyers can also view and pay via the digital payment link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
