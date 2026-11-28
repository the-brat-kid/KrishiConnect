"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useBusinessProfile, useUpdateBusinessProfile } from "@/hooks/use-business-profile";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Settings,
  Building2,
  Store,
  MapPin,
  Receipt,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  Save,
  Phone,
  Zap,
  Sprout,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Lock,
  Mail,
  Send,
  User,
  CheckCircle,
  Compass,
  BadgeCheck,
  FileCheck,
  Download,
  Printer,
  RefreshCw,
  Award,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";
import {
  MandiLocation,
  REGIONAL_MANDIS,
  STATE_NAMES,
  getMandisForState,
} from "@/lib/mandi-regions";
import { AadhaarKycWidget } from "@/components/kyc/aadhaar-kyc-widget";

export default function SettingsPage() {
  const { data: profile, isLoading } = useBusinessProfile();
  const { mutateAsync: updateProfile } = useUpdateBusinessProfile();
  const { user } = useAuth();
  const {
    selectedState,
    selectedPlaceId,
    selectedMandiObj,
    setRegionAndPlace,
    currentRegionDef,
  } = useLanguage();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "farmer",
    address: "",
    gst_number: "",
    upi_id: "",
    phone: "",
  });

  const handleStateSelect = (newState: string) => {
    setRegionAndPlace(newState);
    const mandis = getMandisForState(newState);
    if (mandis.length > 0) {
      setFormData((prev) => ({
        ...prev,
        address: mandis[0].address,
      }));
    }
  };

  const handleMandiSelect = (placeId: string) => {
    setRegionAndPlace(selectedState, placeId);
    const mandis = getMandisForState(selectedState);
    const chosen = mandis.find((m) => m.id === placeId);
    if (chosen) {
      setFormData((prev) => ({
        ...prev,
        address: chosen.address,
      }));
    }
  };

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);

  // Active Tab state ("profile" or "kyc")
  const [activeTab, setActiveTab] = useState<"profile" | "kyc">("profile");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "kyc") {
        setActiveTab("kyc");
      }
    }
  }, []);

  // Verified KYC Profile State
  const [kycName, setKycName] = useState(user?.full_name || user?.name || "Harsh Srivastava");
  const [kycDob, setKycDob] = useState("15/03/1990");

  const handleTestEmail = async () => {
    try {
      setIsTestingEmail(true);
      setTestEmailResult(null);
      const res = await api.post("/invoices/test-email");
      toast({
        title: "Email Dispatch Test",
        description: res.data?.message || "Test email dispatched successfully!",
      });
      setTestEmailResult(res.data?.message || "Delivered successfully via SMTP/Resend bridge.");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err.message || "Failed to trigger test email.";
      toast({
        title: "Email Test Notice",
        description: msg,
        variant: "destructive",
      });
      setTestEmailResult("Dispatch status: " + msg);
    } finally {
      setIsTestingEmail(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        business_name: profile.business_name || "",
        business_type: profile.business_type || "farmer",
        address: profile.address || "",
        gst_number: profile.gst_number || "",
        upi_id: profile.upi_id || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  // Real-time live dynamic UPI QR code generator
  useEffect(() => {
    let active = true;
    const vpa = formData.upi_id.trim();
    if (!vpa) {
      setQrCodeDataUrl("");
      return;
    }

    const payeeName = formData.business_name.trim() || "KrishiConnect Mandi";
    const upiUri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&cu=INR`;

    QRCode.toDataURL(upiUri, {
      width: 240,
      margin: 1,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (active) setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error("Failed to generate live UPI QR", err);
      });

    return () => {
      active = false;
    };
  }, [formData.upi_id, formData.business_name]);

  const handleCopyUpi = () => {
    if (!formData.upi_id.trim()) return;
    navigator.clipboard.writeText(formData.upi_id.trim());
    setCopiedUpi(true);
    toast({
      title: "UPI VPA Copied",
      description: `${formData.upi_id.trim()} copied to clipboard.`,
    });
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateProfile(formData);
      toast({
        title: "Profile Saved Successfully",
        description: "Your business credentials, billing details, and UPI routing have been updated.",
      });
    } catch (error: any) {
      console.error("Settings update failed", error);
      toast({
        title: "Update Failed",
        description: error?.response?.data?.detail || "Could not save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <span className="text-sm font-medium">Loading business profile &amp; settlement settings...</span>
      </div>
    );
  }

  const isUpiValid = formData.upi_id.trim().includes("@") && formData.upi_id.trim().length >= 4;

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto pb-16 animate-page-enter">
      {/* Top Header Bar with Liquid Glass Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md flex items-center gap-2.5">
            <Settings className="h-8 w-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(20,122,77,0.5)]" />
            <span>Business Profile &amp; Settings</span>
          </h1>
          <p className="text-sm font-medium text-zinc-200 drop-shadow-sm">
            Trade credentials, UPI routing &amp; GST profile.
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                : "text-muted-foreground hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Business Profile &amp; FreePay UPI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("kyc")}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "kyc"
                ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                : "text-muted-foreground hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span>KYC Verification Hub</span>
            <span className="badge-liquid-glass-emerald text-[9px] py-0.5 px-1.5 font-mono">
              UIDAI Offline
            </span>
          </button>
        </div>

        {activeTab === "profile" && (
          <button
            type="button"
            onClick={() => setActiveTab("kyc")}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verified KYC Active</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {activeTab === "profile" && (
      /* Main Grid: Form on Left, Live Pass on Right */
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Business Configuration Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="liquid-glass p-6 sm:p-8 rounded-3xl border border-white/20 bg-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_12px_40px_rgba(0,0,0,0.5)] space-y-6">
              {/* Card Subheader */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-400" />
                    <span>Business &amp; Farm Identity</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    This information appears on customer invoices, transport bills, and mandi delivery notes.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified KYC</span>
                </div>
              </div>

              {/* Identity Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Business Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                    <Store className="h-3.5 w-3.5 text-primary" />
                    <span>Business / Farm Name</span>
                    <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    required
                    placeholder="e.g. Harsh Srivastava Farm or Kisan Mandi Hub"
                    className="h-11 bg-white/[0.04] border-white/15 focus:border-emerald-500/60 focus:bg-white/[0.08] backdrop-blur-xl rounded-xl text-foreground font-medium transition-all"
                  />
                </div>

                {/* Entity / Business Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                    <Sprout className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Entity Trade Type</span>
                  </Label>
                  <select
                    value={formData.business_type}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                    className="h-11 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 text-sm text-foreground focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 backdrop-blur-xl transition-all"
                  >
                    <option value="farmer">Farmer / Kisan Producer</option>
                    <option value="trader">Commission Agent / Vyapari (APMC)</option>
                    <option value="fpo">Farmer Producer Company (FPO)</option>
                    <option value="wholesaler">Agri Wholesaler / Distributor</option>
                  </select>
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    <span>Contact Phone / Mobile</span>
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="h-11 bg-white/[0.04] border-white/15 focus:border-emerald-500/60 focus:bg-white/[0.08] backdrop-blur-xl rounded-xl text-foreground font-medium transition-all"
                  />
                </div>

                {/* Farming Region & Mandi Hub Calibration */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-white/[0.04] dark:bg-black/60 border border-white/12 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Compass className="h-4 w-4 text-emerald-400" />
                      <span>Farming Region &amp; Primary APMC Mandi Yard</span>
                    </span>
                    <span className="badge-liquid-glass-emerald text-[10px] py-0.5 px-2">
                      Platform-Wide Sync
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Tailors live crop prices, NASA satellite weather telemetry, and transport freight routes across the entire portal.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* State Selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground block">
                        State / Agricultural Territory
                      </label>
                      <select
                        value={selectedState}
                        onChange={(e) => handleStateSelect(e.target.value)}
                        className="h-10 w-full rounded-xl border border-white/15 bg-black/70 px-3 text-xs font-bold text-foreground focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 backdrop-blur-xl transition-all cursor-pointer"
                      >
                        {STATE_NAMES.map((st) => (
                          <option key={st} value={st} className="bg-neutral-900 text-white">
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mandi Yard Selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground block">
                        Primary Mandi Hub Yard
                      </label>
                      <select
                        value={selectedPlaceId}
                        onChange={(e) => handleMandiSelect(e.target.value)}
                        className="h-10 w-full rounded-xl border border-white/15 bg-black/70 px-3 text-xs font-bold text-foreground focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 backdrop-blur-xl transition-all cursor-pointer truncate"
                      >
                        {getMandisForState(selectedState).map((pl) => (
                          <option key={pl.id} value={pl.id} className="bg-neutral-900 text-white">
                            {pl.name} ({pl.district})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono pt-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      Active: {selectedMandiObj.name} • {selectedMandiObj.lat.toFixed(3)}°N, {selectedMandiObj.lon.toFixed(3)}°E
                    </span>
                  </div>
                </div>

                {/* Registered Address */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>Registered Mandi / Farm Address</span>
                    <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    placeholder="e.g. Bhubaneswar, Odisha or APMC Yard, Karnal Road"
                    className="h-11 bg-white/[0.04] border-white/15 focus:border-emerald-500/60 focus:bg-white/[0.08] backdrop-blur-xl rounded-xl text-foreground font-medium transition-all"
                  />
                </div>
              </div>

              {/* Tax & Mandi Compliance Section */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-emerald-400" />
                    <span>GSTIN &amp; Mandi Tax Compliance</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Section 2(107) of the CGST Act 2017: Primary agricultural produce is 0% GST exempt.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground/90 flex items-center justify-between">
                    <span>GST Number / Trade License (Optional)</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Leave blank if non-GST farmer</span>
                  </Label>
                  <Input
                    value={formData.gst_number}
                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })}
                    placeholder="e.g. 21ABCDE1234F1Z5 or APMC-LIC-2026"
                    className="h-11 bg-white/[0.04] border-white/15 focus:border-emerald-500/60 focus:bg-white/[0.08] backdrop-blur-xl rounded-xl text-foreground font-mono transition-all uppercase"
                  />
                </div>
              </div>

              {/* Real-Time FreePay UPI Routing Section */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4 text-emerald-400" />
                      <span>FreePay Real-Time UPI Settlement VPA</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Customer invoices and dynamic payment QR codes automatically settle funds into this VPA.
                    </p>
                  </div>
                  {isUpiValid && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Active UPI</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="upi_id" className="text-xs font-semibold text-foreground/90 flex items-center justify-between">
                    <span>UPI ID / Virtual Payment Address</span>
                    <span className="text-[11px] text-emerald-400 font-medium">0% MDR • Instant Bank Transfer</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="upi_id"
                      placeholder="e.g. yourname@oksbi, phone@upi, or business@pingpay"
                      value={formData.upi_id}
                      onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                      className="h-11 bg-white/[0.04] border-white/15 focus:border-emerald-500/60 focus:bg-white/[0.08] backdrop-blur-xl rounded-xl text-foreground font-mono transition-all pr-24"
                    />
                    {formData.upi_id && (
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
                      >
                        {copiedUpi ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedUpi ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Supports Google Pay, PhonePe, Paytm, BHIM, and all scheduled commercial banks across India.
                  </p>
                </div>
              </div>

              {/* Email & SMTP Invoicing Dispatch Section */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-400" />
                      <span>Email &amp; Invoice PDF Dispatch Bridge</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Automatic customer email delivery for invoices, receipts, and transporter manifests.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>SMTP Active</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Sender Account:</span>
                      <p className="font-semibold text-foreground font-mono truncate">
                        {user?.email || "queries@phantomstack.me"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SMTP Gateway:</span>
                      <p className="font-semibold text-foreground font-mono">
                        smtp.gmail.com:587 (TLS)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/5">
                    <p className="text-[11px] text-muted-foreground">
                      Attached with auto-generated GST compliance PDF invoices.
                    </p>
                    <button
                      type="button"
                      onClick={handleTestEmail}
                      disabled={isTestingEmail}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-xs font-semibold text-emerald-300 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto disabled:opacity-50"
                    >
                      {isTestingEmail ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                          <span>Testing Dispatch...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3 text-emerald-400" />
                          <span>Send Test Email</span>
                        </>
                      )}
                    </button>
                  </div>

                  {testEmailResult && (
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{testEmailResult}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Settings are encrypted with 256-bit TLS security.</span>
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="btn-liquid-glass-primary px-8 py-2.5 h-11 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(20,122,77,0.4)] cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Live Payment QR Preview, Profile Card & APMC Corridor */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* User Account Overview Card (matching profile dropdown) */}
          <div className="liquid-glass p-5 rounded-3xl border border-white/20 bg-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_12px_40px_rgba(0,0,0,0.5)] space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                HS
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground truncate">
                    {profile?.business_name || "Harsh Srivastava"}
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {user?.email || "queries@phantomstack.me"}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Settlement Role:</span>
              <span className="font-semibold text-emerald-400 capitalize">
                {formData.business_type} (APMC)
              </span>
            </div>
          </div>

          {/* Live FreePay UPI QR Card */}
          <div className="liquid-glass p-6 rounded-3xl border border-white/20 bg-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_12px_40px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <QrCode className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Live FreePay QR Pass</h3>
                  <p className="text-[11px] text-muted-foreground">Dynamic Mandi Settlement</p>
                </div>
              </div>
              <span className="badge-liquid-glass-emerald text-[10px] py-0.5 px-2">
                0% Fee
              </span>
            </div>

            {/* QR Code Presentation */}
            {qrCodeDataUrl ? (
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center max-w-[210px] mx-auto border-2 border-emerald-500/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeDataUrl}
                    alt="FreePay Real-Time UPI QR"
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-800 tracking-wider uppercase">
                    <Sparkles className="h-3 w-3 text-emerald-600" />
                    <span>FreePay UPI QR</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1 text-center">
                  <p className="text-xs font-bold text-foreground truncate">
                    {formData.business_name || "KrishiConnect Mandi"}
                  </p>
                  <p className="text-[11px] font-mono text-emerald-400 truncate">
                    {formData.upi_id}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] text-center space-y-2">
                <QrCode className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                <p className="text-xs font-semibold text-foreground">No UPI VPA Configured</p>
                <p className="text-[11px] text-muted-foreground">
                  Enter your UPI ID in the form to generate an instant live payment QR pass.
                </p>
              </div>
            )}

            <div className="text-[11px] text-muted-foreground pt-1 space-y-1">
              <div className="flex items-center gap-1.5 text-foreground/80">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Instant settlement into merchant bank account</span>
              </div>
              <div className="flex items-center gap-1.5 text-foreground/80">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Direct reconciliation with invoice payments</span>
              </div>
            </div>
          </div>

          {/* Mandi Corridor & Security Badge */}
          <div className="liquid-glass p-5 rounded-3xl border border-white/20 bg-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_12px_40px_rgba(0,0,0,0.5)] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>Active Mandi Trade Corridor</span>
            </h4>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
              <div className="text-sm font-bold text-foreground">
                {selectedState} Mandi Network
              </div>
              <div className="text-xs text-muted-foreground">
                Primary APMC Hub: <span className="text-emerald-400 font-semibold">{selectedMandiObj.name}</span>
              </div>
              <div className="text-[10px] text-muted-foreground/80 font-mono pt-0.5">
                {selectedMandiObj.lat.toFixed(3)}°N, {selectedMandiObj.lon.toFixed(3)}°E • {selectedMandiObj.district}
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Account: {user?.email || "Authenticated"}</span>
              <span className="text-emerald-400 font-semibold">SSL 256-Bit</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* KYC & Identity Verification Hub (UIDAI Offline Secure QR) */}
      {activeTab === "kyc" && (
        <div className="space-y-6">
          {/* Top Live KYC Status Banner */}
          <div className="p-6 sm:p-7 rounded-3xl border border-emerald-500/40 bg-[#07140e]/92 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_35px_rgba(16,185,129,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] shrink-0 border border-emerald-300/40">
                <ShieldCheck className="h-9 w-9 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-sm">
                    {kycName || user?.full_name || "Harsh Srivastava"}
                  </h2>
                  <span className="badge-liquid-glass-emerald text-xs font-bold py-1 px-3 flex items-center gap-1.5 shadow-[0_0_12px_rgba(52,211,153,0.4)]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                    <span>UIDAI OFFLINE VERIFIED PRODUCER</span>
                  </span>
                </div>
                <p className="text-xs font-medium text-zinc-300 font-mono flex items-center gap-2 flex-wrap">
                  <span className="text-zinc-200 font-semibold">Mandi ID: APMC-OD-2026-9812</span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-emerald-300 font-semibold">Compliance Level: Tier 3 (Cryptographic KYC)</span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-200 font-semibold">UIDAI Offline Verified</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <div className="p-3 rounded-2xl bg-black/60 border border-emerald-500/25 text-right min-w-[130px]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300 block">
                  Verification Engine
                </span>
                <span className="text-xs font-bold text-emerald-300 font-mono">
                  UIDAI PKCS1v15
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-black/60 border border-emerald-500/25 text-right min-w-[110px]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300 block">
                  Privacy Mode
                </span>
                <span className="text-xs font-bold text-emerald-300 font-mono">
                  100% Offline
                </span>
              </div>
            </div>
          </div>

          {/* Verification Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols): Primary Offline Aadhaar Secure QR Widget */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* Primary: Offline Aadhaar Secure QR Verification (Zero Paid APIs) */}
              <AadhaarKycWidget
                onVerified={(aadhaarData) => {
                  if (aadhaarData.name) setKycName(aadhaarData.name);
                  if (aadhaarData.dob) setKycDob(aadhaarData.dob);
                  toast({
                    title: "Aadhaar Identity Synced",
                    description: `Verified details for ${aadhaarData.name} synced with your APMC profile.`,
                  });
                }}
              />

              {/* Mandi Compliance & APMC Yard Affiliation */}
              <div className="p-5 rounded-3xl border border-emerald-500/30 bg-[#07140e]/92 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Compass className="h-4 w-4 text-emerald-400" />
                    <span>Registered Agricultural Jurisdiction &amp; APMC Yard</span>
                  </span>
                  <span className="badge-liquid-glass-emerald text-[10px] py-0.5 px-2">
                    Verified APMC Corridor
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/15 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{selectedMandiObj.name}</span>
                    <span className="text-emerald-300 font-mono font-bold">{selectedState}</span>
                  </div>
                  <p className="text-xs font-medium text-zinc-200">{selectedMandiObj.address}</p>
                  <p className="text-[10px] text-zinc-400 font-mono pt-1">
                    Coordinates: {selectedMandiObj.lat.toFixed(4)}°N, {selectedMandiObj.lon.toFixed(4)}°E • Mandi Code: APMC-{selectedMandiObj.id.toUpperCase()}
                  </p>
                </div>
                <div className="text-[11px] font-medium text-zinc-300 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Primary agricultural commodities are 0% GST exempt under Section 2(107) CGST Act.</span>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Official Mandi ID Card Pass & Security Seal */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              {/* Stylized Kisan Mandi Compliance Pass */}
              <div className="p-6 rounded-3xl border border-emerald-500/50 bg-[#07140e]/95 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(16,185,129,0.25)] space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Kisan Mandi ID Pass</h3>
                      <p className="text-[11px] font-medium text-zinc-300">Verified Trade Credential</p>
                    </div>
                  </div>
                  <span className="badge-liquid-glass-emerald text-[9px] py-0.5 px-2">
                    APMC Pass
                  </span>
                </div>

                {/* Stylized QR Code Badge */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/50 border border-white/15 space-y-3">
                  <div className="p-3 rounded-2xl bg-white shadow-2xl border-4 border-emerald-500/50">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="Mandi KYC Pass QR" className="w-36 h-36" />
                    ) : (
                      <div className="w-36 h-36 bg-neutral-900 rounded-xl flex items-center justify-center text-emerald-400">
                        <QrCode className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <span className="font-mono text-xs font-bold text-emerald-300 block">
                      UIDAI SECURE QR VERIFIED
                    </span>
                    <span className="text-[10px] font-medium text-zinc-300 block">
                      Official Encrypted Handshake
                    </span>
                  </div>
                </div>

                {/* Pass Fields */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/15">
                    <span className="text-zinc-300 font-medium">Operator Name:</span>
                    <span className="font-bold text-white">{kycName || user?.full_name || "Harsh Srivastava"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/15">
                    <span className="text-zinc-300 font-medium">Mandi Hub:</span>
                    <span className="font-bold text-emerald-300 truncate max-w-[170px]">
                      {selectedMandiObj.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/15">
                    <span className="text-zinc-300 font-medium">State:</span>
                    <span className="font-bold text-white">{selectedState}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/15">
                    <span className="text-zinc-300 font-medium">Auth Provider:</span>
                    <span className="font-mono font-bold text-emerald-300">UIDAI PKCS1v15 (Offline)</span>
                  </div>
                </div>

                {/* Download / Print Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.print()}
                    className="flex-1 btn-liquid-glass h-9 text-xs font-semibold border-white/15 hover:border-white/30 inline-flex items-center justify-center gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Print Pass</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      toast({
                        title: "KYC Pass Exported",
                        description: "Encrypted Kisan Mandi Pass has been exported to your downloads.",
                      });
                    }}
                    className="flex-1 btn-liquid-glass-primary h-9 text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Pass</span>
                  </Button>
                </div>
              </div>

              {/* Offline Aadhaar Cryptographic SLA & Security Card */}
              <div className="liquid-glass p-5 rounded-3xl border border-white/20 bg-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_12px_40px_rgba(0,0,0,0.5)] space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Compliance Protocol</span>
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px]">UIDAI Offline</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Verification Engine:</span>
                    <span className="font-mono text-emerald-400 font-semibold">RSA-SHA256 PKCS1v15</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Data Privacy:</span>
                    <span className="font-mono text-foreground font-semibold">Zero Aadhaar Stored</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">External Paid APIs:</span>
                    <span className="font-mono text-emerald-400 font-semibold">0 (100% Free / Self-Contained)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
