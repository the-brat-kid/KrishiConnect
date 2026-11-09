"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import {
  Sprout,
  Users2,
  Store,
  Loader2,
  Lock,
  Phone,
  User,
  MapPin,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

const ODISHA_DISTRICTS = [
  "Khordha (Bhubaneswar)",
  "Cuttack",
  "Puri",
  "Sambalpur",
  "Balasore",
  "Ganjam (Berhampur)",
  "Bhadrak",
  "Angul",
  "Bargarh",
  "Kalahandi",
  "Koraput",
  "Mayurbhanj",
  "Sundargarh",
  "Other / Outside Odisha",
];

export default function RegisterPage() {
  const [role, setRole] = useState<"Individual" | "Merchant" | "F&O Buyer">("Individual");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [district, setDistrict] = useState("Khordha (Bhubaneswar)");
  const [address, setAddress] = useState("");

  // Optional fields
  const [showOptional, setShowOptional] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [upiId, setUpiId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    if (cleanPhone.length !== 10) {
      toast({
        title: "Invalid Mobile",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    // Auto-generate clean email if not supplied
    const finalEmail = email.trim() || `user_${cleanPhone}@krishiconnect.in`;
    const finalAddress = address.trim() ? `${address.trim()}, ${district}` : `${district}, Odisha`;

    try {
      setIsLoading(true);
      await register({
        full_name: name.trim(),
        email: finalEmail,
        password: password,
        phone: cleanPhone,
        business_name: name.trim(),
        business_type: role,
        address: finalAddress,
        gst_number: gstNumber.trim() || undefined,
        upi_id: upiId.trim() || undefined,
      });

      toast({
        title: "Account Created!",
        description: `Welcome to KrishiConnect, ${name}!`,
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.detail || error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" /> New Account
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Join KrishiConnect</h1>
        <p className="text-sm text-muted-foreground">
          Sign up to access live mandi crop rates, freight transport & verified buyers
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Step 1: Select Your Role */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            I am joining as:
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setRole("Individual")}
              className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                role === "Individual"
                  ? "border-emerald-600 bg-emerald-50/80 text-emerald-950 font-semibold ring-1 ring-emerald-600 shadow-xs"
                  : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <Sprout className={`h-4 w-4 ${role === "Individual" ? "text-emerald-600" : "text-muted-foreground"}`} />
              <span className="text-xs">Farmer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("Merchant")}
              className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                role === "Merchant"
                  ? "border-emerald-600 bg-emerald-50/80 text-emerald-950 font-semibold ring-1 ring-emerald-600 shadow-xs"
                  : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <Users2 className={`h-4 w-4 ${role === "Merchant" ? "text-emerald-600" : "text-muted-foreground"}`} />
              <span className="text-xs">FPO / Group</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("F&O Buyer")}
              className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                role === "F&O Buyer"
                  ? "border-emerald-600 bg-emerald-50/80 text-emerald-950 font-semibold ring-1 ring-emerald-600 shadow-xs"
                  : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <Store className={`h-4 w-4 ${role === "F&O Buyer" ? "text-emerald-600" : "text-muted-foreground"}`} />
              <span className="text-xs">Buyer / Trader</span>
            </button>
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold uppercase text-muted-foreground">
            {role === "Merchant" ? "FPO / Organization Name" : role === "F&O Buyer" ? "Business / Trader Name" : "Full Name"}
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder={role === "Individual" ? "e.g. Ramesh Sahoo" : "e.g. Utkal Agro Traders"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9 text-sm"
              required
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div className="space-y-1.5">
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
                className="text-sm font-medium tracking-wider"
                required
              />
            </div>
          </div>
        </div>

        {/* District / Mandi */}
        <div className="space-y-1.5">
          <Label htmlFor="district" className="text-xs font-semibold uppercase text-muted-foreground">
            Primary District / Mandi Hub
          </Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
            <select
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-card text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
            >
              {ODISHA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold uppercase text-muted-foreground">
            Set Password / PIN
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 characters"
              className="pl-9 pr-9 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Optional Section Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowOptional((v) => !v)}
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            {showOptional ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>Additional Details: Email, GSTIN, UPI ID (Optional)</span>
          </button>

          {showOptional && (
            <div className="mt-3 p-3.5 rounded-lg bg-muted/40 border space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs text-muted-foreground">
                  Email Address (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-xs bg-card"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="address" className="text-xs text-muted-foreground">
                  Village / Street Address (Optional)
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="e.g. Unit-1 Mandi, Rasulgarh"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-8 text-xs bg-card"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="gstNumber" className="text-xs text-muted-foreground">
                    GST Number (Optional)
                  </Label>
                  <Input
                    id="gstNumber"
                    type="text"
                    placeholder="21AAAAA0000A1Z5"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="h-8 text-xs bg-card font-mono uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="upiId" className="text-xs text-muted-foreground">
                    UPI ID for Payments (Optional)
                  </Label>
                  <Input
                    id="upiId"
                    type="text"
                    placeholder="name@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="h-8 text-xs bg-card"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 text-sm shadow-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
            </span>
          ) : (
            "Create Account & Start"
          )}
        </Button>
      </form>

      <p className="text-sm text-center text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
