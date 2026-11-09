import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Bell } from "lucide-react";
import { ParallaxBackground } from "@/components/layout/parallax-background";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "KrishiConnect privacy policy, personal data protection, and compliance with the Digital Personal Data Protection Act (DPDP), 2023.",
};

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>KrishiConnect Compliance</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            KrishiConnect operates an agricultural trading, invoicing, and logistics ledger platform based in Bhubaneswar, Odisha. We are committed to safeguarding trader, farmer, and vendor records under the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            1. Information We Collect
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We collect only the essential business and transactional information necessary to issue invoices, verify trade counter-parties, and compute accurate freight costs:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Account and Profile Data:</strong> Business name, proprietor name, GSTIN (where applicable), mobile phone number, and physical office or mandi shop address.
            </li>
            <li>
              <strong className="text-foreground">Transactional Records:</strong> Invoice numbers, line items, crop varieties, quantities (quintals/kilograms), negotiated sale rates, payment status, and buyer details.
            </li>
            <li>
              <strong className="text-foreground">Logistics and Route Inputs:</strong> Origin mandi, destination warehouse, vehicle type, and distance metrics used for freight calculation.
            </li>
            <li>
              <strong className="text-foreground">Technical Logs:</strong> Session tokens, IP addresses, and device identifiers strictly used for account security and fraud prevention.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            2. How We Use Collected Data
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All data processed by KrishiConnect serves clear operational functions:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>Generating GST-compliant invoices and shareable digital bills for trade partners.</li>
            <li>Tracking receivables, customer dues, and payment reconciliation for your agricultural business.</li>
            <li>Providing local market trends based on aggregated, anonymized APMC mandi disclosures.</li>
            <li>Detecting unauthorized login attempts and safeguarding financial ledger integrity.</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We do not sell, rent, or monetize your individual customer lists, trade volumes, or pricing data to third-party advertisers or brokers.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            3. Data Storage and Security
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All user authentication tokens and sensitive records are encrypted in transit via TLS 1.3 and encrypted at rest. Password credentials are salted and hashed using industry-standard cryptographic functions. Database backups are strictly partitioned to prevent cross-tenant data leaks.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            4. Your Rights Under DPDP Act, 2023
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            As a registered business owner or trader, you retain the following statutory rights regarding personal data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>Right to access an itemized summary of personal data maintained in your account.</li>
            <li>Right to rectify incomplete or inaccurate vendor and customer directory entries.</li>
            <li>Right to request account closure and data erasure, subject to mandatory statutory tax and accounting retention requirements under Indian law.</li>
            <li>Right to lodge a grievance with our designated data protection officer.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground">5. Grievance Officer and Inquiries</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For questions regarding this policy or to exercise your statutory privacy rights, contact our compliance desk:
          </p>
          <div className="rounded-md border border-border bg-card p-4 text-sm space-y-1">
            <p className="font-semibold text-foreground">Grievance Desk: KrishiConnect Operations</p>
            <p className="text-muted-foreground">Location: Bhubaneswar, Odisha 751024, India</p>
            <p className="text-muted-foreground">Email: privacy@krishiconnect.in</p>
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} KrishiConnect. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground underline">Terms of Service</Link>
            <Link href="/dashboard" className="hover:text-foreground underline">Dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
