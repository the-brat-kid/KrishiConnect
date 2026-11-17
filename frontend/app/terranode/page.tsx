import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Cpu, Waves, Sun, Sparkles } from "lucide-react";
import KrishiTerraCanvasScroller from "@/components/KrishiTerraCanvasScroller";

export const metadata = {
  title: "KrishiConnect TerraNode Pro — Subterranean Soil Intelligence",
  description:
    "Autonomous agrarian IoT probe engineered from Grade-5 titanium and sapphire photovoltaic glass. Real-time NPK, moisture, and satellite telemetry synced directly to Odisha mandis.",
};

export default function TerraNodeLandingPage() {
  return (
    <main className="min-h-screen bg-[#060e0a] text-white selection:bg-emerald-500 selection:text-black font-sans">
      {/* 1. Sleek Floating Navigation */}
      <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 sm:px-12 py-5 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              KC
            </div>
            <span className="font-bold text-base tracking-tight text-white/95 font-plus-jakarta">
              KrishiConnect <span className="text-emerald-400 font-normal">TerraNode</span>
            </span>
          </Link>
        </div>

        <nav className="pointer-events-auto hidden md:flex items-center gap-8 text-xs font-mono tracking-widest text-emerald-400/60 uppercase">
          <Link href="/soil-health" className="hover:text-emerald-300 transition-colors">
            Soil Health
          </Link>
          <Link href="/crop-rates" className="hover:text-emerald-300 transition-colors">
            Mandi Rates
          </Link>
          <Link href="/transportation" className="hover:text-emerald-300 transition-colors">
            Logistics
          </Link>
          <a href="#specifications" className="hover:text-emerald-300 transition-colors">
            Hardware Specs
          </a>
        </nav>

        <div className="pointer-events-auto flex items-center gap-3">
          <Link
            href="/dashboard"
            className="scrolly-glass-pill px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider text-emerald-300 hover:text-white hover:bg-emerald-500/10 transition-all flex items-center gap-1.5"
          >
            <span>Open Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Main 400vh Sticky Canvas Scrollytelling Experience */}
      <KrishiTerraCanvasScroller
        totalFrames={120}
        framePrefix="/frames/terranode_"
        frameExtension="webp"
        zeroPad={3}
        backgroundColor="#060e0a"
      />

      {/* 3. Post-Scroll Engineering & Hardware Specifications Grid */}
      <section id="specifications" className="relative z-10 px-6 sm:px-14 lg:px-20 py-32 bg-[#060e0a] border-t border-emerald-950/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
            <div>
              <span className="text-xs font-mono tracking-[0.25em] text-emerald-400/70 uppercase">
                HARDWARE ARCHITECTURE MANIFEST
              </span>
              <h3 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-white/95 font-plus-jakarta">
                Subterranean Rigor. Farm-Gate Purity.
              </h3>
            </div>
            <p className="text-sm font-light text-white/60 max-w-md leading-relaxed">
              Engineered to survive corrosive acidic soil, torrential monsoon saturation, and scorching summer drought without physical maintenance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="scrolly-glass-card p-8 rounded-2xl flex flex-col justify-between h-80 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-emerald-400/70">01 / ELECTROCHEMICAL</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white/90 font-plus-jakarta">Quad NPK Blades</h4>
                <p className="mt-2 text-xs text-white/60 leading-relaxed font-light">
                  Gold-flashed ion-selective field effect electrodes measuring ionic Nitrogen, active Phosphorus, Potassium, and pH across stratified root profiles.
                </p>
              </div>
              <div className="font-mono text-[11px] text-emerald-400/50 pt-4 border-t border-emerald-900/40 flex justify-between">
                <span>ACCURACY: ±0.01 pH</span>
                <span>DEPTH: 10 - 90 CM</span>
              </div>
            </div>

            <div className="scrolly-glass-card p-8 rounded-2xl flex flex-col justify-between h-80 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-emerald-400/70">02 / EDGE AI INFERENCE</span>
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white/90 font-plus-jakarta">3nm KrishiEdge</h4>
                <p className="mt-2 text-xs text-white/60 leading-relaxed font-light">
                  Proprietary low-power neural silicon executing on-chip biological respiration models. Detects root rot and salinity spikes 14 days before visible leaf wilting.
                </p>
              </div>
              <div className="font-mono text-[11px] text-emerald-400/50 pt-4 border-t border-emerald-900/40 flex justify-between">
                <span>LATENCY: 0.8 MS</span>
                <span>SECURITY: SHA-256 HSM</span>
              </div>
            </div>

            <div className="scrolly-glass-card p-8 rounded-2xl flex flex-col justify-between h-80 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-emerald-400/70">03 / SATELLITE TELEMETRY</span>
                <Waves className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white/90 font-plus-jakarta">NavIC & LoRaWAN</h4>
                <p className="mt-2 text-xs text-white/60 leading-relaxed font-light">
                  Operates anywhere across rural Odisha without 4G or cellular infrastructure. Transmits compressed sensor packets up to 15km line-of-sight to local mandi clusters.
                </p>
              </div>
              <div className="font-mono text-[11px] text-emerald-400/50 pt-4 border-t border-emerald-900/40 flex justify-between">
                <span>RANGE: 15 KM LORA</span>
                <span>AUTONOMY: 10 YEARS</span>
              </div>
            </div>
          </div>

          {/* Integration Banner */}
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-black p-8 sm:p-12 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                ECOSYSTEM SYNERGY
              </span>
              <h4 className="text-2xl sm:text-3xl font-bold text-white font-plus-jakarta mt-1">
                Connected directly to the KrishiConnect Trading Desk.
              </h4>
              <p className="text-xs sm:text-sm text-white/60 max-w-xl mt-2 font-light">
                Soil telemetry feeds directly into your KrishiConnect dashboard, automatically calibrating mandi transport readiness, buyer crop grades, and GST invoicing.
              </p>
            </div>
            <Link
              href="/soil-health"
              className="px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs tracking-wider uppercase whitespace-nowrap transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Access Soil Health AI
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Minimalist Hardware Footer */}
      <footer className="px-6 sm:px-14 py-12 bg-[#060e0a] border-t border-emerald-950/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-emerald-400/50">
        <div>© {new Date().getFullYear()} KRISHICONNECT HARDWARE LABS. ODISHA, INDIA.</div>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-emerald-300 transition-colors">
            HOME
          </Link>
          <Link href="/crop-rates" className="hover:text-emerald-300 transition-colors">
            MANDI
          </Link>
          <Link href="/privacy" className="hover:text-emerald-300 transition-colors">
            PRIVACY
          </Link>
          <Link href="/contact" className="hover:text-emerald-300 transition-colors">
            SUPPORT
          </Link>
        </div>
      </footer>
    </main>
  );
}
