"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useInvoice, useUpdateInvoiceStatus, useDeleteInvoice, useSendInvoiceEmail } from "@/hooks/use-invoices";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { useCustomers } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PaymentQR } from "@/components/invoices/payment-qr";
import { InvoiceSheet } from "@/components/invoices/invoice-sheet";
import { SendInvoiceEmailModal } from "@/components/invoices/send-invoice-email-modal";
import { LiquidConfirmModal } from "@/components/ui/liquid-confirm-modal";
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
  Copy,
  Check,
  Clock,
  ShieldCheck,
  Share2,
  Trash2,
  Mail,
} from "lucide-react";

export default function InvoiceDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: invoice, isLoading, refetch } = useInvoice(id);
  const { data: profile } = useBusinessProfile();
  const { data: customers } = useCustomers();
  const { mutateAsync: updateStatus } = useUpdateInvoiceStatus();
  const { mutateAsync: deleteInvoice } = useDeleteInvoice();
  const { mutateAsync: sendInvoiceEmail } = useSendInvoiceEmail();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [showUpiQR, setShowUpiQR] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  const handleSendEmail = () => {
    if (!invoice) return;
    setIsEmailModalOpen(true);
  };

  const handleConfirmSendEmail = async (targetEmail: string) => {
    if (!invoice) return;
    try {
      setIsSendingEmail(true);
      const res = await sendInvoiceEmail({ id: invoice.id, email: targetEmail.trim() });
      const msg = res?.message || `Invoice PDF successfully emailed to ${targetEmail.trim()}`;
      setVerificationMessage(msg);
      setIsEmailModalOpen(false);
      toast({
        title: "Invoice PDF Dispatched",
        description: msg,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Failed to send email";
      toast({
        title: "Email Dispatch Notice",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDeleteInvoice = () => {
    if (!invoice) return;
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteInvoice = async () => {
    if (!invoice) return;
    try {
      setIsDeleting(true);
      await deleteInvoice(invoice.id);
      setIsDeleteModalOpen(false);
      toast({
        title: "Invoice Deleted",
        description: `Invoice #${invoice.invoice_number} has been removed.`,
      });
      router.push("/invoices");
    } catch (err: any) {
      toast({
        title: "Failed to Delete",
        description: err?.response?.data?.detail || err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-muted-foreground gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
        <span className="text-sm font-medium">Loading invoice sheet...</span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="liquid-glass max-w-md mx-auto my-24 p-8 rounded-3xl border border-white/10 bg-black/40 text-center space-y-4 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-foreground">Invoice Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested invoice ID does not exist or was deleted.</p>
        <Button onClick={() => router.push("/invoices")} className="btn-liquid-glass-primary">
          Back to Invoices
        </Button>
      </div>
    );
  }

  const customer = customers?.find((c) => c.id === invoice.customer_id) || invoice.customer;
  const status = invoice.status || "unpaid";

  const handleCopyPaymentLink = () => {
    if (typeof window === "undefined") return;
    const payUrl = `${window.location.origin}/pay/${invoice.id}`;
    navigator.clipboard.writeText(payUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-page-enter">
      {/* Header Actions Bar with Liquid Glass */}
      <div className="no-print space-y-4 border-b border-white/10 pb-4">
        <button
          onClick={() => router.push("/invoices")}
          className="btn-liquid-glass inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-foreground hover:text-white transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-emerald-400" />
          <span>Back to Invoices</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <span>Invoice</span>
              <span className="font-mono text-emerald-400">#{invoice.invoice_number}</span>
            </h1>

            {status === "paid" ? (
              <span className="badge-liquid-glass-emerald">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Paid</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                <Clock className="w-3.5 h-3.5" />
                <span>Pending</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleCopyPaymentLink}
              className="btn-liquid-glass inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-white transition-all"
              title="Copy public payment link to share with buyer"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-emerald-400" />}
              <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="btn-liquid-glass inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-white transition-all"
            >
              <Printer className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Print</span>
            </button>

            <button
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="btn-liquid-glass inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-white transition-all disabled:opacity-50"
              title="Email invoice with attached PDF"
            >
              {isSendingEmail ? (
                <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
              ) : (
                <Mail className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>{isSendingEmail ? "Sending..." : "Email PDF"}</span>
            </button>

            {isClient && profile && (
              <PDFDownloadLink
                document={<InvoicePDF invoice={invoice} businessProfile={profile} customer={customer} />}
                fileName={`Invoice-${invoice.invoice_number}.pdf`}
              >
                <button className="btn-liquid-glass-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-[0_0_15px_rgba(20,122,77,0.35)] transition-all">
                  <Download className="h-3.5 w-3.5" />
                  <span>PDF Download</span>
                </button>
              </PDFDownloadLink>
            )}

            <button
              onClick={handleDeleteInvoice}
              disabled={isDeleting}
              className="btn-liquid-glass inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 border-rose-500/30 transition-all cursor-pointer"
              title="Delete invoice"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Notification Feedback */}
      {verificationMessage && (
        <div className="liquid-glass flex items-center justify-between p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 backdrop-blur-xl animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">{verificationMessage}</span>
          </div>
          <button
            onClick={() => setVerificationMessage(null)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Invoice Document (Left) + Settlement Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Invoice Sheet View */}
        <div className="lg:col-span-2 space-y-6">
          {profile && <InvoiceSheet invoice={invoice} businessProfile={profile} customer={customer} />}
        </div>

        {/* Liquid Glass Payment Panel */}
        <div className="no-print lg:sticky lg:top-20 space-y-4">
          <div className="liquid-glass rounded-3xl border border-white/15 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Panel Header */}
            <div className="px-6 pt-6 pb-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Settlement</span>
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {status === "paid" ? "Invoice is settled in ledger" : "Collect payment via UPI, Cash, or Pay Later"}
              </p>
            </div>

            <div className="p-6">
              {status === "paid" ? (
                <div className="space-y-4">
                  {/* Paid Card */}
                  <div className="liquid-glass flex flex-col items-center text-center gap-2.5 py-7 px-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div className="font-extrabold text-base tracking-tight text-white">Payment Received</div>
                    <div className="text-xs text-emerald-300 font-mono font-bold">
                      {formatCurrency(invoice.grand_total)} settled
                    </div>
                    {invoice.payment_method && (
                      <span className="text-[10px] font-bold text-emerald-400 mt-1 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                        Via {invoice.payment_method}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowUpiQR(false);
                      updateStatus({ id: invoice.id, status: "unpaid" });
                    }}
                    className="btn-liquid-glass w-full py-2.5 rounded-xl text-muted-foreground hover:text-foreground text-xs font-semibold transition-all"
                  >
                    Mark as Unpaid (Pay Later)
                  </button>
                </div>
              ) : !showUpiQR ? (
                <div className="space-y-3">
                  {/* Primary UPI QR Button */}
                  <button
                    onClick={() => setShowUpiQR(true)}
                    className="btn-liquid-glass-primary w-full h-14 rounded-2xl shadow-[0_0_20px_rgba(20,122,77,0.4)] flex items-center justify-center gap-2.5 font-bold text-sm transition-all cursor-pointer"
                  >
                    <QrCode className="h-5 w-5 text-white" />
                    <span>Pay via UPI (GPay / PhonePe / QR)</span>
                  </button>

                  {/* Cash Payment Button */}
                  <button
                    onClick={async () => {
                      await updateStatus({ id: invoice.id, status: "paid" });
                      await refetch();
                    }}
                    className="btn-liquid-glass w-full h-12 rounded-2xl text-foreground hover:text-white flex items-center justify-center gap-2 font-semibold text-xs transition-all cursor-pointer"
                  >
                    <Banknote className="h-4 w-4 text-emerald-400" />
                    <span>Received via Cash (Mark as Paid)</span>
                  </button>

                  {/* Secondary Actions */}
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <button
                      onClick={handleCopyPaymentLink}
                      className="btn-liquid-glass w-full py-2.5 rounded-xl text-xs font-semibold text-foreground hover:text-white flex items-center justify-center gap-2 transition-all"
                    >
                      {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-emerald-400" />}
                      <span>{copiedLink ? "Link Copied to Clipboard!" : "Copy Customer Payment Link"}</span>
                    </button>

                    <button
                      onClick={() => updateStatus({ id: invoice.id, status: "unpaid" })}
                      className="w-full text-xs text-muted-foreground hover:text-foreground py-1 text-center font-medium transition-colors"
                    >
                      Pay Later (Keep as Unpaid)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden">
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
                    <button
                      className="btn-liquid-glass flex-1 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:text-white transition-all"
                      onClick={() => setShowUpiQR(false)}
                    >
                      Back
                    </button>
                    <button
                      className="btn-liquid-glass-primary flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all"
                      onClick={async () => {
                        setShowUpiQR(false);
                        await updateStatus({ id: invoice.id, status: "paid" });
                        await refetch();
                      }}
                    >
                      Confirm Paid
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Liquid Glass Assurance Card */}
          <div className="liquid-glass p-4 rounded-2xl border border-white/10 bg-emerald-950/20 text-emerald-200/90 text-xs space-y-1.5 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Instant Payment Settlement</span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              When paid via UPI or Cash, the invoice is immediately stamped as Paid and settled in your ledger. Buyers can also view and pay via the digital payment link.
            </p>
          </div>
        </div>
      </div>

      {/* Liquid Glass Email PDF Modal */}
      <SendInvoiceEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        invoiceNumber={invoice.invoice_number}
        customerName={customer?.name}
        defaultEmail={customer?.email || ""}
        amountText={formatCurrency(invoice.grand_total)}
        isSending={isSendingEmail}
        onSend={handleConfirmSendEmail}
      />

      {/* Liquid Glass Delete Confirmation Modal */}
      <LiquidConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteInvoice}
        title={`Delete Invoice #${invoice.invoice_number}`}
        description="Are you sure you want to permanently remove this invoice from your ledger? This action cannot be undone."
        confirmLabel="Delete Invoice"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
