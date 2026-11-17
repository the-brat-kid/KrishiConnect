"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { loginSchema } from "@/lib/validations";
import Link from "next/link";
import api from "@/lib/api";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import {
  Phone,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
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
  const { login, loginWithOtp, loginWithFirebasePhone, demoLogin } = useAuth();
  const { toast } = useToast();

  // Mobile + OTP State
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isFirebaseMode, setIsFirebaseMode] = useState(false);

  // Email + Password State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Demo Login State
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);

  // Handle Send OTP (Real Google Firebase SMS with intelligent fallback)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Try sending real SMS via Google Firebase Phone Auth
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

        const isRegionBlocked = fbErr.message?.includes("region") || fbErr.code === "auth/operation-not-allowed";
        
        toast({
          title: isRegionBlocked ? "SMS Region / Phone Setup Required" : "SMS Notice",
          description: isRegionBlocked
            ? "Firebase Console me 'Phone' provider aur India (+91) SMS region enable karna baaki hai. (Use test OTP: 1234 to login right now)"
            : `${fbErr.message || "SMS could not be delivered"}. (Use test OTP: 1234)`,
          variant: "destructive",
        });
      }

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

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!otp.trim()) {
      toast({ title: "OTP Required", description: "Please enter the OTP code", variant: "destructive" });
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const activeConfirmation = confirmationResult || window.confirmationResult;

      if (activeConfirmation && isFirebaseMode) {
        // Verify 6-digit code with Google Firebase
        const credential = await activeConfirmation.confirm(otp.trim());
        const idToken = await credential.user.getIdToken();
        await loginWithFirebasePhone(idToken, cleanPhone, farmerName.trim() || undefined, "Individual");
        toast({ title: "Welcome to KrishiConnect!", description: "Phone successfully verified via Firebase." });
      } else {
        // Standard / demo verification
        await loginWithOtp(cleanPhone, otp.trim(), farmerName.trim() || undefined, "Individual");
        toast({ title: "Welcome to KrishiConnect!", description: "Successfully verified and logged in." });
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || error.response?.data?.detail || "Invalid OTP entered. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle Traditional Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = loginSchema.parse({ email, password });
      setIsEmailLoading(true);
      await login(data);
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.errors?.[0]?.message || error.response?.data?.detail || "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsEmailLoading(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" /> Secure Sign In
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in to KrishiConnect</h1>
        <p className="text-sm text-muted-foreground">
          Access daily crop mandi rates, logistics, buyers directory & invoicing
        </p>
      </div>

      {/* Google Sign In */}
      <div className="space-y-3">
        <GoogleSignInButton text="continue_with" />

        <div className="relative flex items-center justify-center pt-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <span className="relative bg-background px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>

      {/* Tabs: Mobile OTP vs Email */}
      <Tabs defaultValue="otp" className="space-y-5">
        <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg">
          <TabsTrigger value="otp" className="flex items-center gap-2 text-xs font-semibold">
            <Phone className="h-3.5 w-3.5" />
            <span>Mobile + OTP</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2 text-xs font-semibold">
            <Mail className="h-3.5 w-3.5" />
            <span>Email & Password</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MOBILE + OTP LOGIN */}
        <TabsContent value="otp" className="space-y-4 pt-1">
          {/* Invisible Google reCAPTCHA Anchor */}
          <div id="recaptcha-container" />

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold uppercase text-muted-foreground">
                  Mobile Number
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 border rounded-md bg-muted/40 text-sm font-semibold text-foreground select-none">
                    +91
                  </div>
                  <div className="relative flex-1">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="98765 43210"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="text-base tracking-wider font-medium"
                      autoFocus
                      required
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Real SMS OTP will be sent directly to your phone via Google Firebase.</span>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 text-sm shadow-sm"
                disabled={isSendingOtp || phone.replace(/\D/g, "").length !== 10}
              >
                {isSendingOtp ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending SMS OTP...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Send Verification OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                    {isFirebaseMode ? "SMS Sent via Google Firebase:" : "OTP Sent to:"}
                  </span>
                  <span className="text-sm font-bold text-foreground">+91 {phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className="text-xs text-primary underline hover:text-primary/80 font-medium"
                >
                  Change
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp" className="text-xs font-semibold uppercase text-muted-foreground">
                    {isFirebaseMode ? "Enter 6-Digit SMS Code" : "Enter OTP Code"}
                  </Label>
                  {isFirebaseMode ? (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>Live SMS</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-100/70 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      Test OTP: <strong>1234</strong>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder={isFirebaseMode ? "123456" : "1234"}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="pl-9 text-lg tracking-widest font-bold"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Optional Name for new accounts */}
              <div className="space-y-1.5">
                <Label htmlFor="farmerName" className="text-xs text-muted-foreground">
                  Your Name (Optional for first-time login)
                </Label>
                <Input
                  id="farmerName"
                  type="text"
                  placeholder="e.g. Ramesh Sahoo"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Didn&apos;t receive code?</span>
                {resendTimer > 0 ? (
                  <span className="text-muted-foreground font-mono">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Resend SMS OTP
                  </button>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 text-sm shadow-sm"
                disabled={isVerifyingOtp || otp.length < 4}
              >
                {isVerifyingOtp ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                  </span>
                ) : (
                  "Verify & Enter Platform"
                )}
              </Button>
            </form>
          )}
        </TabsContent>

        {/* TAB 2: EMAIL & PASSWORD LOGIN */}
        <TabsContent value="email" className="space-y-4 pt-1">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase text-muted-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase text-muted-foreground">
                  Password
                </Label>
                <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 font-semibold" disabled={isEmailLoading}>
              {isEmailLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                </span>
              ) : (
                "Sign in with Email"
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {/* 1-CLICK INSTANT DEMO LOGIN */}
      <div className="pt-2 border-t space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> 1-Click Instant Demo Login:
          </span>
          <span className="text-[11px]">No credentials needed</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin("farmer")}
            disabled={isDemoLoading !== null}
            className="flex items-center gap-1.5 h-9 text-xs border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-medium"
          >
            {isDemoLoading === "farmer" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
            ) : (
              <Sprout className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
            )}
            <span className="truncate">Demo Farmer</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin("trader")}
            disabled={isDemoLoading !== null}
            className="flex items-center gap-1.5 h-9 text-xs border-blue-300 hover:bg-blue-50 text-blue-800 font-medium"
          >
            {isDemoLoading === "trader" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
            ) : (
              <Store className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
            )}
            <span className="truncate">Demo Trader</span>
          </Button>
        </div>
      </div>

      {/* Footer link to register */}
      <p className="text-sm text-center text-muted-foreground pt-1">
        New to KrishiConnect?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
          Create new account
        </Link>
      </p>
    </div>
  );
}
