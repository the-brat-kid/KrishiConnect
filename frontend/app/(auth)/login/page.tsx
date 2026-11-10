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
} from "lucide-react";

export default function LoginPage() {
  const { login, loginWithOtp, demoLogin } = useAuth();
  const { toast } = useToast();

  // Mobile + OTP State
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Email + Password State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Demo Login State
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSendingOtp(true);
      await api.post("/auth/otp/send", { phone: cleanPhone });
      setOtpSent(true);
      setResendTimer(30);
      toast({
        title: "OTP Sent!",
        description: `OTP sent to +91 ${cleanPhone}. (Use test OTP: 1234)`,
      });

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
        description: error.response?.data?.detail || "Failed to send OTP",
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
      toast({ title: "OTP Required", description: "Please enter the 4-digit OTP", variant: "destructive" });
      return;
    }

    try {
      setIsVerifyingOtp(true);
      await loginWithOtp(cleanPhone, otp.trim(), farmerName.trim() || undefined, "Individual");
      toast({ title: "Welcome to KrishiConnect!", description: "Successfully verified and logged in." });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.response?.data?.detail || "Invalid OTP. Use demo OTP: 1234",
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
                <p className="text-[11px] text-muted-foreground">
                  We will send a 4-digit verification code to this mobile number.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 text-sm shadow-sm"
                disabled={isSendingOtp || phone.replace(/\D/g, "").length !== 10}
              >
                {isSendingOtp ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending OTP...
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
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-800 font-semibold block">OTP Sent to:</span>
                  <span className="text-sm font-bold text-emerald-950">+91 {phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className="text-xs text-emerald-700 underline hover:text-emerald-900 font-medium"
                >
                  Change
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp" className="text-xs font-semibold uppercase text-muted-foreground">
                    Enter 4-Digit OTP
                  </Label>
                  <span className="text-[11px] text-emerald-700 font-medium bg-emerald-100/70 px-2 py-0.5 rounded">
                    Demo OTP: <strong>1234</strong>
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="1234"
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
                  <span className="text-muted-foreground">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Resend OTP
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
                  "Verify & Sign In"
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
