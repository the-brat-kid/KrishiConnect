"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Copy,
  Check,
  Send,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Sparkles,
  ExternalLink,
  Copyright,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ParallaxBackground } from "@/components/layout/parallax-background";
import { useToast } from "@/components/ui/use-toast";

const EMAIL_ADDRESS = "harshsrivastava0315@gmail.com";
const WHATSAPP_RAW = "9470182871";
const WHATSAPP_INTERNATIONAL = "+91 9470182871";
const WHATSAPP_LINK = `https://wa.me/919470182871?text=${encodeURIComponent(
  "Hello KrishiConnect Support, I have an inquiry regarding the platform."
)}`;

export default function ContactUsPage() {
  const { toast } = useToast();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("farmer");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const copyToClipboard = async (text: string, type: "email" | "phone") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
        toast({
          title: "Email Copied",
          description: `${text} copied to your clipboard.`,
        });
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
        toast({
          title: "WhatsApp Number Copied",
          description: `${text} copied to your clipboard.`,
        });
      }
    } catch {
      toast({
        title: "Copy Failed",
        description: text,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please enter your name and message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate instant sending with pleasant UI feedback
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast({
        title: "Inquiry Recorded!",
        description: "Thank you for reaching out. We will get back to you shortly.",
      });
    }, 700);
  };

  const handleSendViaWhatsApp = () => {
    const text = `*New KrishiConnect Inquiry*\nName: ${name || "User"}\nRole: ${role}\nContact: ${email || phone || "Not specified"}\nSubject: ${subject || "General Inquiry"}\nMessage: ${message}`;
    window.open(`https://wa.me/919470182871?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <ParallaxBackground intensity={0.4} showMistyCanopy={false} />

      {/* Top Header */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
            >
              Home
            </Link>
            <span className="hidden sm:inline text-muted-foreground/40">•</span>
            <Link
              href="/copyright"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Copyright className="h-3.5 w-3.5" />
              <span>Copyright</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Title Block */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Direct Support & Mandi Assistance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground font-plus-jakarta">
            Contact <span className="text-primary">KrishiConnect</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Have questions about Odisha APMC mandi rates, GST digital billing, freight routing, or cold storage? Our support desk and platform engineers are here to assist you.
          </p>
        </div>

        {/* 2 Main Direct Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Email Channel Card */}
          <div className="relative rounded-2xl border border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-2xl p-6 sm:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between hover:border-primary/40 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Official Email
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Email Support</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  For formal inquiries, partnership proposals, and account assistance.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-background/80 dark:bg-white/[0.03] border border-border/80 flex items-center justify-between gap-3">
                <a
                  href={`mailto:${EMAIL_ADDRESS}?subject=KrishiConnect%20Inquiry`}
                  className="font-mono text-sm font-semibold text-foreground hover:text-primary transition-colors truncate"
                  title="Click to email"
                >
                  {EMAIL_ADDRESS}
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(EMAIL_ADDRESS, "email")}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Copy email to clipboard"
                  aria-label="Copy email"
                >
                  {copiedEmail ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1 shadow-sm">
                <a href={`mailto:${EMAIL_ADDRESS}?subject=KrishiConnect%20Support%20Request`}>
                  <Mail className="h-4 w-4 mr-2" />
                  <span>Send Email</span>
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(EMAIL_ADDRESS, "email")}
                className="shrink-0"
              >
                {copiedEmail ? "Copied!" : "Copy Address"}
              </Button>
            </div>
          </div>

          {/* WhatsApp Channel Card */}
          <div className="relative rounded-2xl border border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-2xl p-6 sm:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between hover:border-emerald-500/40 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Instant WhatsApp
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">WhatsApp Chat & Call</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Fastest response for farmers, mandi traders, and logistic updates.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-background/80 dark:bg-white/[0.03] border border-border/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-foreground">
                    {WHATSAPP_INTERNATIONAL}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">({WHATSAPP_RAW})</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(WHATSAPP_RAW, "phone")}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy number to clipboard"
                    aria-label="Copy phone number"
                  >
                    {copiedPhone ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <a
                    href={`tel:+91${WHATSAPP_RAW}`}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Call directly"
                    aria-label="Call phone number"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-70" />
                </a>
              </Button>
              <Button asChild variant="outline" className="shrink-0">
                <a href={`tel:+91${WHATSAPP_RAW}`}>
                  <Phone className="h-4 w-4 mr-1.5" />
                  <span>Call Us</span>
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Form & Office Info Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inquiry Form */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-2xl p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)] space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Send Us a Direct Message</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Fill in the form below and we will respond via email or WhatsApp within a few hours.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">Inquiry Received!</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    Thank you {name}. Our team has received your query and will reply to{" "}
                    <strong className="text-foreground">{email || phone || EMAIL_ADDRESS}</strong>{" "}
                    shortly.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                      setSubject("");
                    }}
                  >
                    Send Another Message
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleSendViaWhatsApp}
                  >
                    <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                    Also send via WhatsApp
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Your Name <span className="text-primary">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Ramesh Mohapatra"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Business Type / Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="farmer">Farmer / Cultivator</option>
                      <option value="fpo">Farmer Producer Organisation (FPO)</option>
                      <option value="trader">Mandi Commission Agent / Trader</option>
                      <option value="buyer">Wholesale Buyer / Food Processor</option>
                      <option value="transporter">Logistics & Freight Operator</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Email Address</label>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">WhatsApp / Phone</label>
                    <Input
                      type="tel"
                      placeholder="e.g. 9470182871"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Subject</label>
                  <Input
                    placeholder="e.g. Inquiry regarding Mandi Rates API / Invoicing setup"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Message <span className="text-primary">*</span>
                  </label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Describe how we can help your farm trade or business..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <Button type="submit" disabled={isSubmitting} className="shadow-sm">
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        <span>Submit Inquiry</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendViaWhatsApp}
                    className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <MessageCircle className="h-4 w-4 mr-1.5 text-emerald-500" />
                    <span>Quick Send via WhatsApp</span>
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Location & Support Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Office Details Card */}
            <div className="rounded-2xl border border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-2xl p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)] space-y-5">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>Headquarters & Operational Desk</span>
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block">Registered Office</strong>
                    <span>KrishiConnect Operations Desk, Bhubaneswar, Odisha 751024, India</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block">Operational Timings</strong>
                    <span>Monday to Saturday: 8:00 AM – 8:00 PM IST (Mandi Trading Hours)</span>
                    <span className="block text-[11px] text-muted-foreground/80 mt-0.5">
                      Sunday: Automated live rates & 24/7 WhatsApp emergency support
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block">Verified Agro-Trading Network</strong>
                    <span>Registered under Indian Digital Data & Commerce Standards.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Copyright Information Banner */}
            <div className="rounded-2xl border border-primary/25 bg-primary/[0.04] backdrop-blur-2xl p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)] space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Copyright className="h-4 w-4" />
                <span>Copyright & Intellectual Property</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All software code, user interface designs, logos, mandi price calculation engines, and content of KrishiConnect are protected under the <strong>Indian Copyright Act, 1957</strong> and international intellectual property treaties.
              </p>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-mono">
                  © {new Date().getFullYear()} KrishiConnect
                </span>
                <Link
                  href="/copyright"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>View Full Copyright Policy</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-border pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} KrishiConnect. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/copyright" className="hover:text-foreground underline">
              Copyright Policy
            </Link>
            <Link href="/privacy" className="hover:text-foreground underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground underline">
              Terms of Service
            </Link>
            <Link href="/dashboard" className="hover:text-foreground underline">
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
