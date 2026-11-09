import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale, FileText, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { ParallaxBackground } from "@/components/layout/parallax-background";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "KrishiConnect commercial terms of service, mandi trade facilitation rules, invoicing policies, and platform disclaimers.",
};

export default function TermsPage() {
  const lastUpdated = "October 30, 2026";

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <ParallaxBackground intensity={0.4} showMistyCanopy={false} />

      {/* Top Header */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/90">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Effective Date: {lastUpdated}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Title Block */}
        <div className="space-y-3 border-b border-border pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
            <Scale className="h-3.5 w-3.5" />
            <span>Commercial Agreement</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light tracking-tight text-foreground">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Please read these Terms and Conditions carefully before using KrishiConnect. By registering an account, generating an invoice, or accessing our mandi rates data, you agree to be bound by these provisions under Indian law.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            1. Platform Role & Intermediary Status
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            KrishiConnect operates as an agricultural technology and software platform providing digitised invoicing, price discovery, and transport calculation tools. KrishiConnect is not a commission agent, broker, or financial custodian. We do not inspect, take title to, or store agricultural commodities exchanged between traders and buyers.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            2. Invoicing, Taxation, & GST Compliance
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Users generating digital bills and invoices through the platform remain solely responsible for the legal accuracy of GST numbers, commodity HSN codes, applied tax rates, and trade amounts. Invoices produced on KrishiConnect reflect transactions agreed upon directly between the respective buyer and seller.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            3. Mandi Price Disclaimers
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Daily commodity rates and market indicators displayed on KrishiConnect are aggregated from state APMC disclosures, Agmarknet feeds, and registered regional trade reports. While updated regularly, modal rates represent indicative market values and should not be construed as binding price guarantees or commercial warranties.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            4. Freight & Logistics Estimates
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Freight calculations generated on the platform are algorithmic estimates based on road distance, vehicle capacity brackets, and regional fuel averages. Actual loading, unloading, detention, and toll expenses remain subject to negotiation between trade partners and third-party transporters.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground">5. Governing Law & Jurisdiction</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These terms are governed by the laws of India. Any legal dispute, action, or proceeding arising under or in connection with the platform shall be subject to the exclusive jurisdiction of the competent courts in Bhubaneswar, Odisha.
          </p>
        </section>

        {/* Bottom Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} KrishiConnect. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground underline">Privacy Policy</Link>
            <Link href="/dashboard" className="hover:text-foreground underline">Dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
