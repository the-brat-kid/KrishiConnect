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
  ArrowRight,
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
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in zoom-in-95 duration-300">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="font-bold text-emerald-900 text-base">Payment Verified via UPI!</div>
        <p className="text-xs text-emerald-700">
          {formatCurrency(amount)} settled automatically to <span className="font-mono font-medium">{upiVpa}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 text-center">
      {/* Title */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> FreePay Real-Time UPI
        </div>
        <div className="text-xs text-slate-500">Scan &amp; pay with GPay, PhonePe, Paytm, or BHIM</div>
      </div>

      {/* QR Code Container */}
      <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-inner relative">
        {qrSrc ? (
          <Image
            src={qrSrc}
            alt="UPI QR Code"
            width={160}
            height={160}
            className="w-40 h-40 object-contain rounded"
          />
        ) : (
          <div className="w-40 h-40 bg-slate-50 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Generating UPI QR...</span>
          </div>
        )}
      </div>

      {/* Amount and UPI ID info */}
      <div className="space-y-1.5 w-full">
        <div className="font-mono font-bold text-lg text-slate-900">{formatCurrency(amount)}</div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
          <span>{upiVpa}</span>
          <button
            type="button"
            onClick={handleCopyUpi}
            className="text-slate-400 hover:text-slate-700 ml-1"
            title="Copy UPI ID"
          >
            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div>
          <Link
            href="/settings"
            className="text-[10px] text-emerald-600 hover:text-emerald-700 underline font-medium inline-block"
          >
            Change UPI ID in Settings
          </Link>
        </div>
        {tn && <p className="text-[10px] text-slate-400 font-mono">Ref: {tn}</p>}
      </div>

      {/* Real-time watcher status indicator */}
      <div className="w-full pt-3 border-t border-slate-100 space-y-2.5">
        <div className="flex items-center justify-center gap-2 text-xs text-indigo-700 font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 shrink-0" />
          <span>Auto-listening for GPay/PhonePe confirmation...</span>
        </div>

        {/* Instant Confirm Action Button */}
        <button
          type="button"
          onClick={handleConfirmPaid}
          disabled={isConfirming || !tn}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isConfirming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span>Maine Payment Kar Diya (Instant Confirm)</span>
        </button>

        {/* Optional UTR / Reference ID Field */}
        <div className="pt-1">
          {!showUtrField ? (
            <button
              type="button"
              onClick={() => setShowUtrField(true)}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline inline-flex items-center gap-1"
            >
              <span>+ Enter 12-digit UPI UTR / Ref No (Optional)</span>
            </button>
          ) : (
            <div className="space-y-1.5 text-left bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block">
                12-Digit Bank UTR / Reference No:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. 412345678901"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                />
                <button
                  type="button"
                  onClick={handleConfirmPaid}
                  disabled={isConfirming}
                  className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors shrink-0"
                >
                  Verify
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FreePay Explanatory Helper Notice */}
        <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900/80 text-left flex items-start gap-1.5 leading-snug">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Real-time auto-detection works when FreePay Android listener is active on merchant phone. Agar aapne pay kar diya hai, toh upar <strong>&apos;Maine Payment Kar Diya&apos;</strong> par click karein.
          </span>
        </div>

        {/* Demo instant test verification button */}
        {tn && (
          <div className="pt-1 flex items-center justify-center">
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={simulating}
              className="text-[11px] text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-full font-medium inline-flex items-center gap-1 transition-colors"
              title="Simulate GPay webhook for instant testing"
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              {simulating ? "Verifying..." : "⚡ 1-Click Instant Test Verify"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
