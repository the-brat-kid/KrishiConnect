"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { RegionLanguageSelector } from "@/components/ui/region-language-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import api from "@/lib/api";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  TypingText,
  TypingTextCursor,
} from "@/components/ui/typing-text";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  REGEXP_ONLY_DIGITS,
} from "@/components/ui/input-otp";
import {
  Phone,
  Mail,
  Loader2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Sprout,
  Store,
  KeyRound,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const { loginWithOtp, loginWithFirebasePhone, demoLogin } = useAuth();
  const { t, currentRegionDef, language } = useLanguage();
  const { toast } = useToast();

  // Mobile + Email OTP State
  const [otpChannel, setOtpChannel] = useState<"email" | "phone">("email");
  const [emailOtp, setEmailOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [sentOtpTarget, setSentOtpTarget] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isFirebaseMode, setIsFirebaseMode] = useState(false);

  // Demo Login State
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);

  // Handle Send OTP (Real Email via otp@phantomstack.me OR Phone SMS)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpChannel === "email") {
      const cleanEmail = emailOtp.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsSendingOtp(true);
        await api.post("/auth/otp/send", { email: cleanEmail });
        setSentOtpTarget(cleanEmail);
        setOtpSent(true);
        setResendTimer(60);
        setIsFirebaseMode(false);
        toast({
          title: "OTP Dispatched!",
          description: `6-digit verification code sent to ${cleanEmail} from otp@phantomstack.me. Check Inbox & Spam!`,
        });

        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (error: any) {
        toast({
          title: "Error Sending OTP",
          description: error.response?.data?.detail || error.message || "Failed to send OTP",
          variant: "destructive",
        });
      } finally {
        setIsSendingOtp(false);
      }
      return;
    }

    // Phone channel flow
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid 10-digit Indian mobile number.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSendingOtp(true);
      let sentViaFirebase = false;
      try {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            callback: () => {},
            "expired-callback": () => {
              if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = undefined;
              }
            },
          });
        }

        const formattedPhone = `+91${cleanPhone}`;
        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
        setConfirmationResult(confirmation);
        window.confirmationResult = confirmation;
        setIsFirebaseMode(true);
        sentViaFirebase = true;

        toast({
          title: "Real SMS OTP Dispatched!",
          description: `Google Firebase has sent a 6-digit SMS code to +91 ${cleanPhone}.`,
        });
      } catch (fbErr: any) {
        console.error("Firebase Phone Auth error:", fbErr);
        // Fallback to local OTP dispatch
        await api.post("/auth/otp/send", { phone: cleanPhone });
        setIsFirebaseMode(false);
        toast({
          title: "SMS Gateway Notice",
          description: "Firebase SMS offline. Local test OTP is active (Code: 1234).",
        });
      }

      setSentOtpTarget(cleanPhone);
      setOtpSent(true);
      setResendTimer(60);

      // Countdown timer
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error sending OTP",
        description: error.message || error.response?.data?.detail || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Verify OTP (Email or Phone)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast({ title: "OTP Required", description: "Please enter the OTP code", variant: "destructive" });
      return;
    }

    try {
      setIsVerifyingOtp(true);
      if (otpChannel === "email") {
        const cleanEmail = (sentOtpTarget || emailOtp).trim().toLowerCase();
        await loginWithOtp({ email: cleanEmail }, otp.trim(), farmerName.trim() || undefined, "Individual");
        toast({ title: "Welcome to KrishiConnect!", description: "Successfully verified via Email OTP." });
      } else {
        const cleanPhone = (sentOtpTarget || phone).replace(/\D/g, "").slice(-10);
        const activeConfirmation = confirmationResult || window.confirmationResult;

        if (activeConfirmation && isFirebaseMode) {
          // Verify 6-digit code with Google Firebase
          const credential = await activeConfirmation.confirm(otp.trim());
          const idToken = await credential.user.getIdToken();
          await loginWithFirebasePhone(idToken, cleanPhone, farmerName.trim() || undefined, "Individual");
          toast({ title: "Welcome to KrishiConnect!", description: "Phone successfully verified via Firebase." });
        } else {
          // Standard / demo verification
          await loginWithOtp({ phone: cleanPhone }, otp.trim(), farmerName.trim() || undefined, "Individual");
          toast({ title: "Welcome to KrishiConnect!", description: "Successfully verified and logged in." });
        }
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.response?.data?.detail || error.message || "Invalid OTP entered. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle 1-Click Demo Login
  const handleDemoLogin = async (role: "farmer" | "trader") => {
    try {
      setIsDemoLoading(role);
      await demoLogin(role);
      toast({
        title: role === "farmer" ? "Logged in as Demo Farmer!" : "Logged in as Demo Trader!",
        description: "Welcome to KrishiConnect dashboard.",
      });
    } catch (error: any) {
      toast({
        title: "Demo login failed",
        description: error.response?.data?.detail || "Could not log in with demo account",
        variant: "destructive",
      });
    } finally {
      setIsDemoLoading(null);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/12 bg-gradient-to-b from-white/[0.12] via-white/[0.05] to-white/[0.02] dark:from-white/[0.08] dark:via-black/45 dark:to-black/65 backdrop-blur-3xl shadow-[inset_0_1px_2.5px_rgba(255,255,255,0.4),0_24px_64px_rgba(0,0,0,0.5),0_0_45px_rgba(16,185,129,0.08)] p-6 sm:p-8 space-y-6">
      {/* Specular Top Sheen & Subtle Ambient Radial Lights */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/[0.18] via-emerald-500/[0.05] to-transparent" />
      <div className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative z-10 space-y-6">
        {/* Header with Liquid Glass Badge & Dynamic Typing Subtitle */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/35 bg-emerald-500/10 text-emerald-400 text-xs font-bold shadow-[0_0_14px_rgba(16,185,129,0.2),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>{t("login.secureBadge")}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/15 bg-white/5 text-[11px] font-semibold text-muted-foreground backdrop-blur-md shadow-xs">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>Live Mandi</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-plus-jakarta">
            {t("login.title")}
          </h1>

          {/* Dynamic Typing Subtitle using @animate-ui/react/primitives/texts/typing */}
          <div className="min-h-[24px] flex items-center overflow-hidden">
            <TypingText
              text={[
                "Select your farming region to unlock live mandi prices.",
                "Instant UPI & QR payment settlements direct to your bank.",
                "100% verified cold vaults & freight across 16 states.",
                "Zero-paperwork digital ledger for Kisan, FPOs & Traders.",
              ]}
              duration={40}
              holdDelay={1800}
              loop={true}
              className="text-xs sm:text-sm font-semibold text-emerald-400/90 font-mono tracking-tight"
            >
              <TypingTextCursor className="ml-1 h-3.5 w-1 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            </TypingText>
          </div>
        </div>

        {/* Prominent Regional & Language Calibration */}
        <RegionLanguageSelector variant="login" />

        {/* Google Sign In */}
        <div className="space-y-3">
          <GoogleSignInButton text="continue_with" />

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/12 dark:border-white/10" />
            </div>
            <span className="relative rounded-full border border-white/15 bg-black/60 px-3.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground backdrop-blur-xl shadow-xs">
              or continue with
            </span>
          </div>
        </div>

        {/* OTP Authentication Card */}
        <div className="space-y-4 pt-1">
          {/* Invisible Google reCAPTCHA Anchor */}
          <div id="recaptcha-container" />

          {/* Channel Switch: Email OTP vs Phone SMS */}
          {!otpSent && (
            <div className="grid grid-cols-2 p-1.5 rounded-2xl border border-white/18 dark:border-white/12 bg-white/[0.06] dark:bg-black/45 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25)]">
              <button
                type="button"
                onClick={() => {
                  setOtpChannel("email");
                  setOtpSent(false);
                  setOtp("");
                }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  otpChannel === "email"
                    ? "bg-gradient-to-b from-emerald-400 to-emerald-600 text-black font-extrabold shadow-[0_4px_16px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.6)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Email OTP</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtpChannel("phone");
                  setOtpSent(false);
                  setOtp("");
                }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  otpChannel === "phone"
                    ? "bg-gradient-to-b from-emerald-400 to-emerald-600 text-black font-extrabold shadow-[0_4px_16px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.6)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Mobile SMS</span>
              </button>
            </div>
          )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {otpChannel === "email" ? (
                  <div className="space-y-2">
                    <Label htmlFor="emailOtp" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Email Address</span>
                      <span className="text-[10px] text-emerald-400 font-semibold lowercase">instant verification code</span>
                    </Label>
                    <div className="relative flex items-center rounded-2xl border border-white/20 dark:border-white/15 bg-white/[0.08] dark:bg-black/50 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] focus-within:border-emerald-400/80 focus-within:ring-2 focus-within:ring-emerald-400/30 focus-within:shadow-[0_0_24px_rgba(16,185,129,0.25)] transition-all overflow-hidden group">
                      <div className="flex items-center gap-1.5 px-3.5 py-3.5 border-r border-white/12 dark:border-white/10 bg-white/[0.04] dark:bg-white/[0.02] text-sm font-extrabold text-foreground select-none">
                        <Mail className="h-4 w-4 text-emerald-400" />
                      </div>
                      <input
                        id="emailOtp"
                        type="email"
                        placeholder="Enter your email address"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        className="w-full bg-transparent px-3.5 py-3.5 text-base sm:text-sm font-bold text-foreground placeholder:text-muted-foreground/50 outline-none"
                        autoFocus
                        required
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Real 6-digit code will be sent to your email from otp@phantomstack.me</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>{t("login.phoneLabel")}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold lowercase">instant sms otp</span>
                    </Label>
                    <div className="relative flex items-center rounded-2xl border border-white/20 dark:border-white/15 bg-white/[0.08] dark:bg-black/50 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] focus-within:border-emerald-400/80 focus-within:ring-2 focus-within:ring-emerald-400/30 focus-within:shadow-[0_0_24px_rgba(16,185,129,0.25)] transition-all overflow-hidden group">
                      <div className="flex items-center gap-1.5 px-3.5 py-3.5 border-r border-white/12 dark:border-white/10 bg-white/[0.04] dark:bg-white/[0.02] text-sm font-extrabold text-foreground select-none">
                        <span className="text-sm">🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        placeholder={t("login.phonePlaceholder")}
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-transparent px-3.5 py-3.5 text-base sm:text-sm font-bold tracking-wider text-foreground placeholder:text-muted-foreground/50 outline-none"
                        autoFocus
                        required
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Real SMS OTP will be sent directly to your phone via Google Firebase.</span>
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="relative overflow-hidden w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm tracking-wide shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_10px_28px_rgba(16,185,129,0.35)] hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.6),0_14px_34px_rgba(16,185,129,0.45)] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group border border-emerald-400/30"
                  disabled={
                    isSendingOtp ||
                    (otpChannel === "email" ? !emailOtp.includes("@") : phone.replace(/\D/g, "").length !== 10)
                  }
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white/35 to-transparent" />
                  {isSendingOtp ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-white" /> {t("login.sendingOtp")}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 font-bold">
                      <span>{otpChannel === "email" ? "Send Code to Email" : t("login.sendOtp")}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl flex items-center justify-between shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.2)]">
                  <div>
                    <span className="text-[11px] text-emerald-400 font-bold block uppercase tracking-wider">
                      {otpChannel === "email"
                        ? "Code sent from otp@phantomstack.me to:"
                        : isFirebaseMode
                        ? "SMS Sent via Google Firebase:"
                        : "OTP Sent to:"}
                    </span>
                    <span className="text-base font-extrabold text-foreground">
                      {otpChannel === "email" ? (sentOtpTarget || emailOtp) : `+91 ${sentOtpTarget || phone}`}
                    </span>
                    {otpChannel === "email" ? (
                      <span className="text-[10px] text-emerald-400/80 block mt-0.5 font-medium">
                        Check your Inbox and Spam folder
                      </span>
                    ) : (
                      !isFirebaseMode && (
                        <span className="inline-block mt-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          Demo test code: 1234
                        </span>
                      )
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline font-bold transition-colors"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t("login.enterOtp")}
                    </Label>
                    {isFirebaseMode && (
                      <span className="text-[11px] text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>Live SMS</span>
                      </span>
                    )}
                  </div>

                  <div className="flex justify-center py-2">
                    <InputOTP
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      value={otp}
                      onChange={(val) => setOtp(val)}
                      autoFocus
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {/* Optional Name for new accounts */}
                <div className="space-y-1.5">
                  <Label htmlFor="farmerName" className="text-xs font-semibold text-muted-foreground">
                    {t("login.nameOptional")}
                  </Label>
                  <div className="relative rounded-2xl border border-white/18 dark:border-white/12 bg-white/[0.06] dark:bg-black/50 backdrop-blur-xl focus-within:border-emerald-400/80 transition-all">
                    <Input
                      id="farmerName"
                      type="text"
                      placeholder={t("login.namePlaceholder")}
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      className="bg-transparent border-0 text-sm font-medium focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>Didn&apos;t receive code?</span>
                  {resendTimer > 0 ? (
                    <span className="text-muted-foreground font-mono">
                      {t("login.resendIn", { s: resendTimer })}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" /> {t("login.resendOtp")}
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  className="relative overflow-hidden w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm tracking-wide shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_10px_28px_rgba(16,185,129,0.35)] active:scale-[0.99] transition-all border border-emerald-400/30"
                  disabled={isVerifyingOtp || otp.length < 4}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white/35 to-transparent" />
                  {isVerifyingOtp ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-white" /> {t("login.verifyingOtp")}
                    </span>
                  ) : (
                    t("login.verifyOtp")
                  )}
                </Button>
              </form>
            )}
        </div>

        {/* 1-CLICK INSTANT DEMO LOGIN */}
        <div className="pt-2 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-bold text-foreground flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> {t("login.quickAccess")}:
            </span>
            <span className="text-[11px] font-medium text-emerald-400/90">No credentials needed</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Farmer Demo (Emerald Liquid Glass) */}
            <button
              type="button"
              onClick={() => handleDemoLogin("farmer")}
              disabled={isDemoLoading !== null}
              className="relative overflow-hidden group flex items-center justify-center gap-2 h-11 px-3 rounded-2xl border border-emerald-500/35 hover:border-emerald-400/70 bg-gradient-to-b from-emerald-500/[0.14] via-emerald-500/[0.05] to-transparent hover:bg-emerald-500/[0.22] backdrop-blur-xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.3),0_6px_20px_rgba(16,185,129,0.2)] hover:shadow-[inset_0_1px_2.5px_rgba(255,255,255,0.45),0_10px_24px_rgba(16,185,129,0.3)] text-emerald-300 text-xs font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-white/20 to-transparent" />
              {isDemoLoading === "farmer" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
              ) : (
                <Sprout className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              )}
              <span className="truncate">{t("login.demoFarmer")}</span>
            </button>

            {/* Trader Demo (Sky Liquid Glass) */}
            <button
              type="button"
              onClick={() => handleDemoLogin("trader")}
              disabled={isDemoLoading !== null}
              className="relative overflow-hidden group flex items-center justify-center gap-2 h-11 px-3 rounded-2xl border border-sky-500/35 hover:border-sky-400/70 bg-gradient-to-b from-sky-500/[0.14] via-sky-500/[0.05] to-transparent hover:bg-sky-500/[0.22] backdrop-blur-xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.3),0_6px_20px_rgba(14,165,233,0.2)] hover:shadow-[inset_0_1px_2.5px_rgba(255,255,255,0.45),0_10px_24px_rgba(14,165,233,0.3)] text-sky-300 text-xs font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-white/20 to-transparent" />
              {isDemoLoading === "trader" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
              ) : (
                <Store className="h-4 w-4 text-sky-400 group-hover:scale-110 transition-transform" />
              )}
              <span className="truncate">{t("login.demoTrader")}</span>
            </button>
          </div>
        </div>

        {/* Footer link to register */}
        <p className="text-xs sm:text-sm text-center text-muted-foreground pt-1">
          {t("login.needAccount")}{" "}
          <Link href="/register" className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline underline-offset-4 transition-colors">
            {t("login.registerNow")}
          </Link>
        </p>
      </div>
    </div>
  );
}
