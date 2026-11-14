"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Loader2, Sparkles, ShieldCheck } from "lucide-react";
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
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="font-bold text-emerald-900 text-base">Payment Verified via UPI!</div>
        <p className="text-xs text-emerald-700">
          {formatCurrency(amount)} settled automatically to {upiVpa}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 text-center">
      <div className="space-y-0.5">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> FreePay Real-Time UPI
        </div>
        <div className="text-xs text-slate-500">Scan &amp; pay with GPay, PhonePe, Paytm, or BHIM</div>
      </div>

      <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-inner">
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

      <div className="space-y-1">
        <div className="font-mono font-bold text-base text-slate-900">{formatCurrency(amount)}</div>
        <p className="text-[11px] font-mono text-slate-500 break-all">{upiVpa}</p>
        <Link
          href="/settings"
          className="text-[10px] text-emerald-600 hover:text-emerald-700 underline font-medium block"
        >
          Change UPI ID in Settings
        </Link>
        {tn && <p className="text-[10px] text-slate-400 font-mono">Ref: {tn}</p>}
      </div>

      {/* Real-time watcher status indicator */}
      <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-indigo-700 font-medium">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 shrink-0" />
        <span>Waiting for GPay/PhonePe confirmation...</span>
      </div>

      {/* Development / Demo simulate payment button */}
      {tn && (
        <button
          type="button"
          onClick={handleSimulatePayment}
          disabled={simulating}
          className="text-[11px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full font-medium inline-flex items-center gap-1 transition-colors"
          title="Simulate GPay notification webhook for instant testing"
        >
          <Sparkles className="w-3 h-3 text-emerald-600" />
          {simulating ? "Simulating..." : "Test Instant Verification"}
        </button>
      )}
    </div>
  );
}
