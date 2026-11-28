"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface LiquidConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export function LiquidConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: LiquidConfirmModalProps) {
  const isDanger = variant === "danger";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="max-w-md w-[95vw] p-0 rounded-3xl border border-white/20 bg-gradient-to-b from-[#161817]/95 via-[#0a0c0b]/95 to-[#060807]/98 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_24px_60px_rgba(0,0,0,0.8)] text-foreground overflow-hidden">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div
          className={`pointer-events-none absolute -top-20 -right-16 w-48 h-48 rounded-full blur-3xl ${
            isDanger ? "bg-rose-500/15" : "bg-emerald-500/15"
          }`}
        />

        <DialogHeader className="p-6 pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-start gap-3.5 text-left">
            <div
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                isDanger
                  ? "bg-rose-500/20 border-rose-400/40 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                  : "bg-emerald-500/20 border-emerald-400/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              }`}
            >
              {isDanger ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-extrabold text-white tracking-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 px-6 flex items-center justify-end gap-2.5 relative z-10">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="btn-liquid-glass px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onConfirm()}
            className={
              isDanger
                ? "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-b from-rose-500/90 to-rose-700/95 border border-rose-400/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_24px_rgba(244,63,94,0.3)] hover:brightness-110 transition-all disabled:opacity-60"
                : "btn-liquid-glass-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60"
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {isDanger ? <Trash2 className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
