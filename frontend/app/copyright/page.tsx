import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Copyright,
  ShieldCheck,
  Scale,
  FileCheck,
  AlertCircle,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import { ParallaxBackground } from "@/components/layout/parallax-background";

export const metadata: Metadata = {
  title: "Copyright Policy & Intellectual Property",
  description:
    "KrishiConnect intellectual property rights, copyright ownership, APMC mandi data attribution, and compliance under the Indian Copyright Act, 1957.",
};

export default function CopyrightPage() {
  const lastUpdated = "November 2026";
  const contactEmail = "harshsrivastava0315@gmail.com";
  const contactPhone = "+91 9470182871";

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <ParallaxBackground intensity={0.4} showMistyCanopy={false} />

      {/* Top Header */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Effective Date: {lastUpdated}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Title Block */}
        <div className="space-y-3 border-b border-border pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
            <Copyright className="h-3.5 w-3.5" />
            <span>Intellectual Property & Legal Notice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-plus-jakarta">
            Copyright & IP Policy
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This Copyright and Intellectual Property Policy outlines the proprietary ownership of KrishiConnect, guidelines for fair utilization by agricultural trade participants, and the process for reporting alleged copyright infringements under the Indian Copyright Act, 1957.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            1. Ownership of Platform and Proprietary Materials
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All aspects of KrishiConnect—including but not limited to source code, algorithms, visual design, custom styling, logos, database schemas, digital invoicing templates, logistics calculation engines, and interactive widgets—are the exclusive intellectual property of KrishiConnect and its creators, protected under Indian and international copyright, trade dress, and trademark statutes.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">KrishiConnect Trademarks:</strong> The name &quot;KrishiConnect&quot;, logo, and associated branding are proprietary identifiers. Unauthorized commercial use is strictly prohibited.
            </li>
            <li>
              <strong className="text-foreground">Software Architecture:</strong> The backend microservices, real-time APMC scraping parsers, and machine-learning rate prediction scripts are protected proprietary trade secrets.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            2. APMC Mandi Data Attribution & Open Public Licensing
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            KrishiConnect compiles agricultural market prices from verified public mandi feeds, Odisha State Agricultural Marketing Boards (OSAMB), and APMC disclosures. While public factual commodity modal prices are public information, our normalized data models, real-time trend analytics, and proprietary valuation indices represent original compilations under Section 13 of the Indian Copyright Act, 1957.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            3. Permitted Use for Registered Farmers and Traders
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Registered farmers, Mandi traders, and logistics coordinators are granted a limited, non-exclusive, revocable license to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>Generate, download, print, and distribute GST-compliant trade invoices produced through KrishiConnect.</li>
            <li>Utilize rate intelligence and logistics estimates for internal agribusiness decision-making and price negotiations.</li>
            <li>Share generated crop bill PDFs directly with trade buyers and banking institutions.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            4. Prohibited Exploitation and Scraping
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You may not copy, reproduce, mirror, republish, distribute, reverse-engineer, or commercially syndicate KrishiConnect platform assets without explicit prior written authorization. Systematic automated scraping or extraction of price feeds, user directories, or platform code is strictly prohibited.
          </p>
        </section>

        {/* Section 5: Designated Copyright Officer */}
        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg font-bold text-foreground">
            5. Designated Copyright & Grievance Officer
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you believe any content or material on KrishiConnect infringes your copyright or intellectual property rights, please provide a formal written notice with proof of ownership to our designated officer:
          </p>

          <div className="rounded-2xl border border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl p-5 space-y-3 text-sm">
            <div className="font-bold text-foreground">Harsh Srivastava</div>
            <div className="text-xs text-muted-foreground">
              Designated Copyright & Compliance Officer — KrishiConnect
            </div>
            <div className="space-y-2 pt-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Email:</span>
                <a
                  href={`mailto:${contactEmail}?subject=Copyright%20Notice`}
                  className="font-mono text-foreground hover:text-primary underline"
                >
                  {contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-muted-foreground">WhatsApp / Phone:</span>
                <a
                  href={`https://wa.me/919470182871?text=${encodeURIComponent(
                    "Hello, I have an inquiry regarding KrishiConnect copyright & IP policy."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-foreground hover:text-emerald-500 underline"
                >
                  {contactPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Official Calling Line:</span>
                <a href="tel:+919470182871" className="font-mono text-foreground hover:text-primary">
                  +91 9470182871
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} KrishiConnect. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact" className="hover:text-foreground underline">
              Contact Us
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
