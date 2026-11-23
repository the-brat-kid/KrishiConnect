"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PaymentQRProps {
  amount: number;
  invoiceNumber: string;
  invoiceId?: string;
  onPaymentSuccess?: () => void;
}

export function PaymentQR({
  amount,
  invoiceNumber,
  invoiceId,
  onPaymentSuccess,
}: PaymentQRProps) {
  const { data: profile } = useBusinessProfile();
  const { toast } = useToast();
  const [qrSrc, setQrSrc] = useState<string>("");
  const [upiUrl, setUpiUrl] = useState<string>("");
  const [upiVpa, setUpiVpa] = useState<string>("");
  const [tn, setTn] = useState<string>("");
  const [status, setStatus] = useState<"pending" | "paid">("pending");
  const [simulating, setSimulating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showUtrField, setShowUtrField] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const isPaidRef = useRef(false);

  // Initialize UPI dynamic order
  useEffect(() => {
    let isSubscribed = true;

    async function initOrder() {
      if (invoiceId) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/v1/payments/upi/create-qr`, {
            invoice_id: invoiceId,
            upi_vpa: profile?.upi_id?.trim() || undefined,
            upi_name: profile?.business_name?.trim() || undefined,
          });
          if (!isSubscribed) return;

          const data = res.data;
          setTn(data.tn);
          setUpiUrl(data.upiUrl);
          setUpiVpa(data.upiVpa);

          const dataUrl = await QRCode.toDataURL(data.upiUrl, {
            width: 240,
            margin: 1,
            color: { dark: "#0f172a", light: "#ffffff" },
          });
          if (isSubscribed) setQrSrc(dataUrl);
          return;
        } catch (err) {
          console.error("UPI order creation failed, falling back to profile UPI:", err);
        }
      }

      // Fallback for draft invoices
      const vpa = profile?.upi_id || "harshsrivastava0315@pingpay";
      const name = profile?.business_name || "KrishiConnect";
      const fallbackTn = `krishi_inv_draft_${invoiceNumber || "new"}_${Date.now()}`;
      const url = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(fallbackTn)}`;

      setUpiVpa(vpa);
      setUpiUrl(url);
      setTn(fallbackTn);

      QRCode.toDataURL(url, { width: 240, margin: 1 })
        .then((dataUrl) => {
          if (isSubscribed) setQrSrc(dataUrl);
        })
        .catch((err) => console.error(err));
    }

    initOrder();

    return () => {
      isSubscribed = false;
    };
  }, [invoiceId, amount, invoiceNumber, profile]);

  // Polling watcher for real-time verification
  useEffect(() => {
    if (!tn || status === "paid" || isPaidRef.current) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/payments/upi/status/${tn}`);
        if (res.data?.status === "paid" || res.data?.status === "completed") {
          isPaidRef.current = true;
          setStatus("paid");
          clearInterval(interval);
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
        }
      } catch (err) {
        // Continue polling silently
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [tn, status, onPaymentSuccess]);

  const handleCopyUpi = () => {
    if (!upiVpa) return;
    navigator.clipboard.writeText(upiVpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleConfirmPaid = async () => {
    if (!invoiceId) {
      // Draft / New invoice preview - confirm locally and notify parent form
      setStatus("paid");
      isPaidRef.current = true;
      if (onPaymentSuccess) onPaymentSuccess();
      return;
    }
    if (!tn) return;
    try {
      setIsConfirming(true);
      await axios.post(`${API_BASE_URL}/api/v1/payments/upi/confirm-paid`, {
        tn,
        utr: utrNumber.trim() || undefined,
      });
      setStatus("paid");
      isPaidRef.current = true;
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err: any) {
      toast({
        title: "Verification Notice",
        description: err?.response?.data?.detail || err.message,
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!invoiceId) {
      // Draft / New invoice preview - simulate verify locally and notify parent form
      setStatus("paid");
      isPaidRef.current = true;
      if (onPaymentSuccess) onPaymentSuccess();
      return;
    }
    if (!tn) return;
    try {
      setSimulating(true);
      await axios.post(`${API_BASE_URL}/api/v1/payments/upi/simulate-test?tn=${tn}`);
      setStatus("paid");
      isPaidRef.current = true;
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err: any) {
      toast({
        title: "Simulation Notice",
        description: err?.response?.data?.detail || err.message,
        variant: "destructive",
      });
    } finally {
      setSimulating(false);
    }
  };

  if (status === "paid") {
    return (
      <div className="liquid-glass flex flex-col items-center justify-center p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-2xl text-center space-y-2 animate-in zoom-in-95 duration-300 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="font-semibold text-emerald-300 text-base">Payment Verified</div>
        <p className="text-xs text-muted-foreground font-mono">
          {formatCurrency(amount)} settled via UPI to {upiVpa}
        </p>
      </div>
    );
  }

  return (
    <div className="liquid-glass flex flex-col items-center p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-xl space-y-4 text-center text-foreground w-full max-w-sm mx-auto">
      {/* Header Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>UPI Instant Settlement</span>
      </div>

      {/* QR Code Container */}
      <div className="p-3 bg-white rounded-2xl border border-white/20 shadow-md inline-block">
        {qrSrc ? (
          <Image
            src={qrSrc}
            alt="UPI QR Code"
            width={160}
            height={160}
            className="w-40 h-40 object-contain rounded-lg"
          />
        ) : (
          <div className="w-40 h-40 bg-slate-100 flex flex-col items-center justify-center text-xs text-slate-500 gap-2 rounded-lg">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Generating QR...</span>
          </div>
        )}
      </div>

      {/* Amount & UPI Details */}
      <div className="space-y-1.5 w-full">
        <div className="font-mono font-bold text-2xl text-emerald-400 tracking-tight">
          {formatCurrency(amount)}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-300">
          <span>{upiVpa}</span>
          <button
            type="button"
            onClick={handleCopyUpi}
            className="text-white/60 hover:text-white transition-colors"
            title="Copy UPI ID"
          >
            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div>
          <Link
            href="/settings"
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Change UPI ID in Settings
          </Link>
        </div>
      </div>

      {/* Live Polling Status */}
      <div className="w-full pt-3 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
          <span>Listening for UPI confirmation...</span>
        </div>

        {/* Verification Actions */}
        <div className="flex flex-col gap-2 w-full">
          <button
            type="button"
            onClick={handleConfirmPaid}
            disabled={isConfirming}
            className="btn-liquid-glass-primary w-full py-2.5 px-4 rounded-xl font-medium text-xs text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
          >
            {isConfirming ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-white" />
            )}
            <span>Verify Payment</span>
          </button>

          {/* 1-Tap Test Verify Button */}
          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={simulating}
            className="btn-liquid-glass w-full py-2 px-3 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{simulating ? "Verifying..." : "1-Tap Test Verify"}</span>
          </button>
        </div>

        {/* Optional UTR Input */}
        <div className="pt-0.5">
          {!showUtrField ? (
            <button
              type="button"
              onClick={() => setShowUtrField(true)}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              + Add Bank UTR / Reference No (Optional)
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="12-digit UTR"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleConfirmPaid}
                disabled={isConfirming}
                className="btn-liquid-glass-primary px-3 py-1.5 text-xs font-medium rounded-xl text-white"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
