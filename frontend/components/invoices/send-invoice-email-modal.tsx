"use client";

import React, { useEffect, useState } from "react";
import { Mail, FileText, Loader2, Send, CheckCircle2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SendInvoiceEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNumber: string;
  customerName?: string;
  defaultEmail?: string;
  amountText?: string;
  isSending?: boolean;
  onSend: (email: string) => Promise<void>;
}

export function SendInvoiceEmailModal({
  isOpen,
  onClose,
  invoiceNumber,
  customerName,
  defaultEmail = "",
  amountText,
  isSending = false,
  onSend,
}: SendInvoiceEmailModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail || "");
      setErrorMsg(null);
    }
  }, [isOpen, defaultEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = email.trim();
    if (!cleaned || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setErrorMsg("Please enter a valid recipient email address.");
      return;
    }
    setErrorMsg(null);
    await onSend(cleaned);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSending && onClose()}>
      <DialogContent className="max-w-md w-[95vw] p-0 rounded-3xl border border-white/20 bg-gradient-to-b from-[#131d17]/95 via-[#0a100c]/95 to-[#060907]/98 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_24px_60px_rgba(0,0,0,0.8)] text-foreground overflow-hidden">
        {/* Specular top glint */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="pointer-events-none absolute -top-20 -right-16 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl" />

        <DialogHeader className="p-6 pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 via-emerald-900/20 to-transparent border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="badge-liquid-glass-emerald text-[10px] py-0.5 px-2">
                  <Sparkles className="w-3 h-3 text-emerald-300" />
                  <span>PDF Attached</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-emerald-400">
                  #{invoiceNumber}
                </span>
              </div>
              <DialogTitle className="text-lg font-extrabold text-white tracking-tight">
                Send Invoice PDF via Email
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Deliver a verified copy directly to the buyer&apos;s inbox.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-5 space-y-4 relative z-10">
          {/* Invoice Snapshot Pill */}
          {(customerName || amountText) && (
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl flex items-center justify-between gap-3 text-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Recipient / Buyer
                  </span>
                  <span className="font-semibold text-white truncate block">
                    {customerName || "Mandi Buyer"}
                  </span>
                </div>
              </div>
              {amountText && (
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Invoice Total
                  </span>
                  <span className="font-mono font-bold text-emerald-400">{amountText}</span>
                </div>
              )}
            </div>
          )}

          {/* Recipient Email Field */}
          <div className="space-y-2">
            <Label htmlFor="invoice-recipient-email" className="text-xs font-bold text-foreground/90 flex items-center justify-between">
              <span>Recipient Email Address</span>
              {defaultEmail && email !== defaultEmail && (
                <button
                  type="button"
                  onClick={() => setEmail(defaultEmail)}
                  className="text-[11px] font-medium text-emerald-400 hover:underline"
                >
                  Use saved email
                </button>
              )}
            </Label>

            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-400/80 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="invoice-recipient-email"
                type="email"
                autoFocus
                required
                disabled={isSending}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="buyer@example.com"
                className="pl-10 h-11 rounded-2xl border border-white/20 bg-white/[0.06] text-sm text-white placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-emerald-400 focus-visible:border-emerald-400/60 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]"
              />
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-400 font-medium">{errorMsg}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Attaches official GST/Mandi PDF bill &amp; UPI payment link.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={isSending}
              onClick={onClose}
              className="btn-liquid-glass px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="btn-liquid-glass-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-[0_0_20px_rgba(20,122,77,0.4)] transition-all disabled:opacity-60"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending PDF...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Invoice PDF</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
