"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  User,
  CreditCard,
  Package,
  ExternalLink,
  Receipt,
  ArrowRight,
  TrendingUp,
  Calculator,
  ClipboardCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface CropBuyerDetail {
  id?: string;
  businessName: string;
  contactPerson?: string;
  category: string;
  cropsNeeded: string[];
  volumeRequirement: string;
  location: string;
  state?: string;
  paymentTerms?: string;
  verified?: boolean;
  activeDeal?: string;
  contactPhone?: string;
}

interface BuyerDetailModalProps {
  buyer: CropBuyerDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BuyerDetailModal({ buyer, isOpen, onClose }: BuyerDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "quote">("profile");
  const [lotWeightQtl, setLotWeightQtl] = useState<number>(25);

  if (!buyer) return null;

  const primaryCrop = buyer.cropsNeeded[0] || "Paddy";
  const estRatePerQtl = primaryCrop.toLowerCase().includes("turmeric")
    ? 12500
    : primaryCrop.toLowerCase().includes("ginger")
    ? 8500
    : primaryCrop.toLowerCase().includes("mustard")
    ? 5950
    : primaryCrop.toLowerCase().includes("paddy")
    ? 3100
    : 2800;

  const estOrderValue = lotWeightQtl * estRatePerQtl;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col p-0 rounded-2xl border border-white/15 bg-[#0c0d0e]/95 backdrop-blur-2xl shadow-2xl text-foreground overflow-hidden">
        <DialogHeader className="p-5 pb-4 border-b border-white/10 bg-white/[0.02] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold tracking-wider border-amber-500/40 text-amber-400 bg-amber-500/10"
                >
                  {buyer.category}
                </Badge>
                {buyer.verified !== false && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 flex items-center gap-1 font-semibold"
                  >
                    <ShieldCheck className="w-3 h-3" /> Verified Buyer
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="truncate">{buyer.businessName}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {buyer.location}
                  {buyer.state ? `, ${buyer.state}` : ""}
                </span>
              </DialogDescription>
            </div>

            <div className="text-right shrink-0 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] uppercase text-muted-foreground block font-semibold">
                Procurement Cap
              </span>
              <span className="text-base font-extrabold font-mono text-emerald-400">
                {buyer.volumeRequirement}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "profile"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Buyer Specs &amp; Payment Terms</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quote")}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "quote"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Lot Value &amp; Invoice Estimator</span>
            </button>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1 min-h-0">
          {activeTab === "profile" ? (
            <>
              {buyer.activeDeal && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Active Procurement Requirement
                    </span>
                    <p className="text-foreground font-medium mt-0.5 leading-relaxed">
                      {buyer.activeDeal}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                    <User className="w-3 h-3 text-primary" /> Procurement Lead
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    {buyer.contactPerson || "Procurement Desk"}
                  </p>
                  {buyer.contactPhone && (
                    <p className="text-[11px] font-mono text-emerald-400">{buyer.contactPhone}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-amber-400" /> Payment Settlement
                  </span>
                  <p className="text-xs font-semibold text-foreground leading-snug">
                    {buyer.paymentTerms || "Same-day Mandi Settlement / Instant RTGS"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-primary" />
                  <span>Crops Actively Sourcing</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {buyer.cropsNeeded.map((crop) => (
                    <span
                      key={crop}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-semibold text-[11px]"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                <span className="font-bold text-foreground block">Quality &amp; Weighment Protocol</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Electronic weighbridge slip issued on arrival at {buyer.location}. Moisture tolerance up to 14% for grain/oilseeds; FAQ grade sorting done on spot with zero hidden mandi deductions.
                </p>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-sm">
                  Sell Lot Estimator ({primaryCrop})
                </span>
                <span className="font-mono font-bold text-emerald-400">{lotWeightQtl} Quintals</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[10, 25, 50, 100, 250].map((qtl) => (
                  <button
                    key={qtl}
                    type="button"
                    onClick={() => setLotWeightQtl(qtl)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold border transition-all ${
                      lotWeightQtl === qtl
                        ? "bg-emerald-600 text-white border-emerald-500"
                        : "bg-white/[0.03] border-white/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {qtl} Qtl ({qtl / 10} MT)
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground block">
                    Indicative Mandi Benchmark (~₹{estRatePerQtl.toLocaleString("en-IN")}/Qtl)
                  </span>
                  <span className="text-xl font-extrabold font-mono text-emerald-400">
                    ₹{estOrderValue.toLocaleString("en-IN")}
                  </span>
                </div>
                <Link
                  href={`/invoices/new?customer=${encodeURIComponent(buyer.businessName)}&crop=${encodeURIComponent(primaryCrop)}&price=${estRatePerQtl}&qty=${lotWeightQtl}&unit=Quintal`}
                  className="btn-liquid-glass inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-white"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Draft Invoice</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            {buyer.contactPhone && (
              <a
                href={`tel:${buyer.contactPhone}`}
                className="btn-liquid-glass inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:text-white"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Desk</span>
              </a>
            )}
            <Button type="button" variant="outline" size="sm" asChild className="text-xs border-white/15">
              <Link href="/customers" className="inline-flex items-center gap-1.5">
                <span>All Crop Buyers</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>

          <a
            href="https://agrodealz.in/find-buyers"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-liquid-glass-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md"
          >
            <span>Connect &amp; Pitch Lot</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
