"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  Info,
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

  // Initialize FreePay dynamic order
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
          console.error("FreePay QR order creation failed, falling back to profile UPI:", err);
        }
      }

      // Fallback for draft/new invoices without an ID yet
      const vpa = profile?.upi_id || "harshsrivastava0315@pingpay";
      const name = profile?.business_name || "KrishiConnect";
      const fallbackTn = `Invoice-${invoiceNumber}`;
      const url = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(fallbackTn)}`;

      setUpiVpa(vpa);
      setUpiUrl(url);

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

  // Polling watcher for real-time auto-verification
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
      alert("Verification error: " + (err?.response?.data?.detail || err.message));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSimulatePayment = async () => {
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
      alert("Failed to simulate payment: " + (err?.response?.data?.detail || err.message));
    } finally {
      setSimulating(false);
    }
  };

  if (status === "paid") {
    return (
      <div className="liquid-glass flex flex-col items-center justify-center p-6 rounded-3xl border border-emerald-500/40 bg-emerald-950/40 backdrop-blur-2xl text-center space-y-3 animate-in zoom-in-95 duration-300 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_15px_rgba(16,185,129,0.4)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="font-extrabold text-emerald-300 text-lg tracking-tight">Payment Verified via UPI!</div>
        <p className="text-xs text-emerald-200/80">
          {formatCurrency(amount)} settled automatically to <span className="font-mono font-bold text-white">{upiVpa}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="liquid-glass flex flex-col items-center p-6 rounded-3xl border border-white/15 bg-black/50 backdrop-blur-2xl shadow-2xl space-y-4 text-center text-foreground">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-400 uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Real-Time FreePay UPI</span>
        </div>
        <div className="text-xs text-muted-foreground">Scan with Google Pay, PhonePe, Paytm, or BHIM</div>
      </div>

      {/* QR Code Container with High-Contrast White Surface */}
      <div className="p-3 bg-white rounded-2xl border border-white/40 shadow-xl relative inline-block mx-auto group">
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
            <span>Generating UPI QR...</span>
          </div>
        )}
      </div>

      {/* Amount and UPI ID info */}
      <div className="space-y-2 w-full">
        <div className="font-mono font-extrabold text-2xl text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
          {formatCurrency(amount)}
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-emerald-300 backdrop-blur-md">
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
            className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium inline-block transition-colors"
          >
            Change UPI ID in Settings
          </Link>
        </div>
        {tn && <p className="text-[10px] text-muted-foreground font-mono">Ref: {tn}</p>}
      </div>

      {/* Real-time watcher status indicator */}
      <div className="w-full pt-3 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
          <span>Auto-listening for GPay/PhonePe confirmation...</span>
        </div>

        {/* Instant Confirm Action Button with Liquid Glass Primary Style */}
        <button
          type="button"
          onClick={handleConfirmPaid}
          disabled={isConfirming || !tn}
          className="btn-liquid-glass-primary w-full py-3 px-4 rounded-xl font-bold text-xs shadow-[0_0_20px_rgba(20,122,77,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {isConfirming ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-white" />
          )}
          <span>Maine Payment Kar Diya (Instant Confirm)</span>
        </button>

        {/* Optional UTR / Reference ID Field */}
        <div className="pt-0.5">
          {!showUtrField ? (
            <button
              type="button"
              onClick={() => setShowUtrField(true)}
              className="text-[11px] text-muted-foreground hover:text-foreground underline inline-flex items-center gap-1 transition-colors"
            >
              <span>+ Enter 12-digit UPI UTR / Ref No (Optional)</span>
            </button>
          ) : (
            <div className="space-y-1.5 text-left bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                12-Digit Bank UTR / Reference No:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 412345678901"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-black/40 border border-white/15 rounded-xl font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleConfirmPaid}
                  disabled={isConfirming}
                  className="btn-liquid-glass-primary px-3 py-1.5 text-xs font-semibold rounded-xl text-white transition-all shrink-0"
                >
                  Verify
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Helper Notice */}
        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 text-left flex items-start gap-2 leading-relaxed">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Payment scan ke baad screen turant auto-detect karti hai. Agar detect na ho, toh upar <strong>&apos;Maine Payment Kar Diya&apos;</strong> par click karein.
          </span>
        </div>

        {/* 1-Click Instant Test Verify button */}
        {tn && (
          <div className="pt-1 flex items-center justify-center">
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={simulating}
              className="btn-liquid-glass inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-foreground hover:text-white transition-all"
              title="Simulate GPay webhook for instant testing"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{simulating ? "Verifying..." : "⚡ 1-Click Instant Test Verify"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
