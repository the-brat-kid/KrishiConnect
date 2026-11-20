"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  QrCode,
  FileText,
  User,
  Calendar,
  MapPin,
  Lock,
  ArrowRight,
  ExternalLink,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

export interface AadhaarVerifiedData {
  success: boolean;
  status: string;
  name: string;
  dob: string;
  gender: string;
  pincode: string;
  state: string;
  district: string;
  address: string;
  reference_id: string;
  photo_base64?: string;
  verified_at: string;
}

interface AadhaarKycWidgetProps {
  onVerified?: (data: AadhaarVerifiedData) => void;
  className?: string;
}

export function AadhaarKycWidget({ onVerified, className = "" }: AadhaarKycWidgetProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"upload" | "camera">("upload");

  // Loading & Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"xml" | "tampered" | "blurry" | "duplicate" | "cert" | "general" | null>(null);

  // Selected Upload File
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera Scanning
  const [isCameraActive, setIsCameraActive] = useState(false);
  const html5QrCodeRef = useRef<any>(null);
  const scannerContainerId = "aadhaar-camera-viewfinder";

  // Verification Result
  const [verifiedData, setVerifiedData] = useState<AadhaarVerifiedData | null>(null);

  // Check initial verification status on mount
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const res = await api.get("/kyc/aadhaar/status");
        if (isMounted && res.data?.kyc_status === "VERIFIED") {
          setVerifiedData({
            success: true,
            status: "VERIFIED",
            name: res.data.kyc_name || "Verified Kisan",
            dob: res.data.kyc_dob || "",
            gender: "Citizen",
            pincode: res.data.kyc_pincode || "",
            state: "India",
            district: "",
            address: `Pincode: ${res.data.kyc_pincode || ""}`,
            reference_id: "UIDAI-OFFLINE",
            verified_at: res.data.kyc_verified_at || new Date().toISOString(),
          });
        }
      } catch (err) {
        // Guest or unauthenticated state
      }
    }
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  // Stop camera helper
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn("Camera stop notice:", e);
      } finally {
        html5QrCodeRef.current = null;
        setIsCameraActive(false);
      }
    }
  };

  // Cleanup camera on unmount or tab switch
  useEffect(() => {
    if (activeTab !== "camera") {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  // Handle Drag & Drop / File Selection
  const handleFileChange = (file: File) => {
    setErrorMessage(null);
    setErrorType(null);
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, WebP, or e-Aadhaar crop).");
      setErrorType("general");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Process File Upload via API
  const handleUploadVerification = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setErrorType(null);
      setStatusMessage("Extracting dense QR code matrix with computer vision...");

      const formData = new FormData();
      formData.append("file", selectedFile);

      setStatusMessage("Decompressing & verifying 256-byte RSA-SHA256 UIDAI signature...");
      const res = await api.post("/kyc/aadhaar/verify-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatusMessage("Aadhaar identity confirmed authentic!");
      setVerifiedData(res.data);
      if (onVerified) onVerified(res.data);

      toast({
        title: "Aadhaar KYC Verified",
        description: `Successfully verified ${res.data.name} via offline UIDAI signature.`,
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || "Failed to verify Aadhaar image.";
      categorizeAndSetError(detail);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // Start Camera Scanning
  const startCamera = async () => {
    setErrorMessage(null);
    setErrorType(null);
    try {
      setIsCameraActive(true);
      const { Html5Qrcode } = await import("html5-qrcode");

      // Small delay to ensure DOM element exists
      setTimeout(async () => {
        try {
          const scanner = new Html5Qrcode(scannerContainerId);
          html5QrCodeRef.current = scanner;

          await scanner.start(
            { facingMode: "environment" },
            {
              fps: 12,
              qrbox: { width: 280, height: 280 },
              aspectRatio: 1.0,
            },
            async (decodedText: string) => {
              // Successfully read QR code
              await stopCamera();
              await handleVerifyQrString(decodedText);
            },
            (errorMessage: string) => {
              // Frame reading pass-through
            }
          );
        } catch (camErr: any) {
          console.error("Camera startup error:", camErr);
          setErrorMessage("Could not access camera. Please allow camera permissions or use the 'Upload QR Image' tab.");
          setErrorType("general");
          setIsCameraActive(false);
        }
      }, 150);
    } catch (err: any) {
      setErrorMessage("Camera scanning library could not be loaded.");
      setIsCameraActive(false);
    }
  };

  // Process Scanned BigInt QR String
  const handleVerifyQrString = async (qrData: string) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setErrorType(null);
      setStatusMessage("Validating numeric BigInt payload format...");

      setStatusMessage("Verifying RSA-SHA256 digital signature against UIDAI public key...");
      const res = await api.post("/kyc/aadhaar/verify-qr", {
        qr_data: qrData.trim(),
      });

      setStatusMessage("Aadhaar signature verified successfully!");
      setVerifiedData(res.data);
      if (onVerified) onVerified(res.data);

      toast({
        title: "Aadhaar KYC Verified",
        description: `Successfully verified ${res.data.name} via official UIDAI digital signature.`,
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || "Failed to verify scanned QR code.";
      categorizeAndSetError(detail);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // Categorize errors into actionable guidance
  const categorizeAndSetError = (detail: string) => {
    setErrorMessage(detail);
    const lower = detail.toLowerCase();
    if (lower.includes("xml") || lower.includes("pre-2018") || lower.includes("legacy")) {
      setErrorType("xml");
    } else if (lower.includes("signature") || lower.includes("cryptographic") || lower.includes("tampered")) {
      setErrorType("tampered");
    } else if (lower.includes("no qr") || lower.includes("detected") || lower.includes("blurry")) {
      setErrorType("blurry");
    } else if (lower.includes("already verified") || lower.includes("another") || lower.includes("conflict")) {
      setErrorType("duplicate");
    } else if (lower.includes("certificate") || lower.includes("certs")) {
      setErrorType("cert");
    } else {
      setErrorType("general");
    }
  };

  const resetVerification = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    setErrorType(null);
    setVerifiedData(null);
    stopCamera();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. VERIFIED SUMMARY STATE */}
      {verifiedData ? (
        <div className="liquid-glass p-6 sm:p-7 rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-black/80 to-emerald-950/30 backdrop-blur-2xl shadow-[0_0_35px_rgba(16,185,129,0.2)] space-y-6 animate-page-enter">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Offline Aadhaar Secure QR Verified</span>
                  <span className="badge-liquid-glass-emerald text-[10px] py-0.5 px-2 font-mono">
                    UIDAI Certified
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cryptographically verified using UIDAI RSA-SHA256 signature without third-party APIs.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetVerification}
              className="btn-liquid-glass text-xs font-semibold h-8 border-white/15 hover:border-white/30"
            >
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400 mr-1.5" />
              <span>Verify Another Card</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Extracted Biometric Photo */}
            <div className="md:col-span-3 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              {verifiedData.photo_base64 ? (
                <div className="relative group">
                  <img
                    src={verifiedData.photo_base64}
                    alt="Aadhaar Biometric Photo"
                    className="w-28 h-32 object-cover rounded-xl border-2 border-emerald-500/50 shadow-lg group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2 py-0.5 rounded-full bg-emerald-500/90 text-[9px] font-bold text-white shadow-md">
                    UIDAI Photo
                  </div>
                </div>
              ) : (
                <div className="w-28 h-32 rounded-xl bg-white/5 border border-white/15 flex flex-col items-center justify-center text-muted-foreground">
                  <User className="h-10 w-10 text-emerald-400/60 mb-1" />
                  <span className="text-[10px]">Photo Verified</span>
                </div>
              )}
            </div>

            {/* Demographic Details Grid */}
            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
                  Full Name (as per UIDAI)
                </span>
                <span className="text-sm font-bold text-foreground block truncate">
                  {verifiedData.name}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
                  Date of Birth &amp; Gender
                </span>
                <span className="text-sm font-bold text-foreground block">
                  {verifiedData.dob} • {verifiedData.gender === "M" ? "Male" : verifiedData.gender === "F" ? "Female" : verifiedData.gender}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-0.5 sm:col-span-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
                  Registered Address &amp; Jurisdiction
                </span>
                <span className="text-xs font-medium text-foreground/90 block leading-relaxed">
                  {verifiedData.address || `${verifiedData.district}, ${verifiedData.state} - ${verifiedData.pincode}`}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 sm:col-span-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Verified at: {new Date(verifiedData.verified_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </span>
                <span className="font-mono text-[10px] opacity-80">
                  Ref: {verifiedData.reference_id || "OFFLINE-UIDAI-SEEDED"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. UNVERIFIED SCAN / UPLOAD WIDGET */
        <div className="liquid-glass p-6 sm:p-7 rounded-3xl border border-white/20 bg-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_12px_40px_rgba(0,0,0,0.5)] space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <QrCode className="h-5 w-5 text-emerald-400" />
                <span>Offline Aadhaar Secure QR KYC</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Official UIDAI digital signature verification. 100% offline, privacy-compliant, zero third-party APIs.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/15 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("upload");
                  setErrorMessage(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "upload"
                    ? "bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload QR Image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("camera");
                  setErrorMessage(null);
                  startCamera();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "camera"
                    ? "bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Scan with Camera</span>
              </button>
            </div>
          </div>

          {/* TAB 1: UPLOAD QR IMAGE (DEFAULT) */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  className="p-8 border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer text-center space-y-3 group"
                >
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      Click to upload or drag &amp; drop your Aadhaar QR code
                    </p>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Supports high-resolution camera photos, screenshots from the <strong>mAadhaar app</strong>, or cropped QR codes from an <strong>e-Aadhaar PDF</strong>.
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-muted-foreground">
                    PNG, JPG, or WEBP up to 10MB
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={previewUrl}
                      alt="Aadhaar QR Preview"
                      className="w-20 h-20 object-contain rounded-xl bg-black border border-white/15 p-1"
                    />
                    <div>
                      <p className="text-xs font-bold text-foreground truncate max-w-[220px]">
                        {selectedFile?.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {(Number(selectedFile?.size || 0) / 1024).toFixed(1)} KB • Ready for verification
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline mt-1"
                      >
                        Choose another file
                      </button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleUploadVerification}
                    disabled={isProcessing}
                    className="btn-liquid-glass-primary px-6 h-11 rounded-xl font-bold text-xs inline-flex items-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying UIDAI Signature...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Verify Aadhaar QR</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCAN WITH CAMERA */}
          {activeTab === "camera" && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black min-h-[320px] flex items-center justify-center">
                <div id={scannerContainerId} className="w-full max-w-sm mx-auto" />

                {!isCameraActive && !isProcessing && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 p-4 text-center">
                    <Camera className="h-10 w-10 text-emerald-400 animate-pulse" />
                    <p className="text-xs font-semibold text-foreground">
                      Camera viewfinder stopped
                    </p>
                    <Button
                      type="button"
                      onClick={startCamera}
                      className="btn-liquid-glass-primary text-xs font-bold h-9 px-4 rounded-xl"
                    >
                      Restart Camera
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground text-center">
                Point your camera at the large square QR code on your Aadhaar PVC card or printed e-Aadhaar.
              </p>
            </div>
          )}

          {/* Processing / Progress State */}
          {isProcessing && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 text-xs text-emerald-300 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400 shrink-0" />
              <span>{statusMessage || "Cryptographically verifying payload against official UIDAI public key..."}</span>
            </div>
          )}

          {/* Actionable Error Alerts */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2 text-xs">
              <div className="flex items-start gap-2.5 font-bold text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span>Verification Notice</span>
                  <p className="font-normal text-rose-200 leading-relaxed text-xs">
                    {errorMessage}
                  </p>
                </div>
              </div>

              {/* Contextual guidance */}
              {errorType === "xml" && (
                <div className="pt-2 border-t border-rose-500/20 text-[11px] text-rose-300 flex items-center justify-between">
                  <span>Need an updated Aadhaar QR? Download instant e-Aadhaar:</span>
                  <a
                    href="https://myaadhaar.uidai.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold underline text-white hover:text-emerald-400"
                  >
                    <span>myaadhaar.uidai.gov.in</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {errorType === "blurry" && (
                <div className="pt-2 border-t border-rose-500/20 text-[11px] text-rose-300">
                  Tip: Clean your lens, avoid reflections/glare, or upload a direct digital PDF crop instead.
                </div>
              )}
            </div>
          )}

          {/* Privacy & Compliance Footer */}
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Lock className="h-3 w-3" /> Zero Aadhaar Number Storage Guarantee
            </span>
            <span>Cryptographic RSA Verification • UIDAI Certified</span>
          </div>
        </div>
      )}
    </div>
  );
}
