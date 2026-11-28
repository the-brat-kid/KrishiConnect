import Link from "next/link";
import { ParallaxBackground } from "@/components/layout/parallax-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background relative overflow-x-hidden overflow-y-auto">
      {/* Background depth parallax */}
      <ParallaxBackground intensity={0.5} showMistyCanopy={false} />

      {/* Left: brand / marketing panel - hidden on small screens */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-[#181d1a]/85 backdrop-blur-2xl border-r border-white/10 text-[#C0C0C0] z-10">
        {/* Emerald & teal luxury ambient glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_16px_rgba(16,185,129,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white font-plus-jakarta">KrishiConnect</span>
        </div>

        <div className="relative z-10 max-w-md space-y-5">
          <h1 className="font-editorial text-3xl sm:text-4xl font-light leading-tight text-white">
            From farm gate to buyer: sell at the right price and get paid on the spot.
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            GST billing, instant UPI payouts &amp; live APMC mandi rates.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {[
              "16 States Live Mandi",
              "Instant UPI & QR Billing",
              "Verified Cold Storage",
              "Freight & Transport Engine",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-emerald-300/90 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-white/10">
          <p>© {new Date().getFullYear()} KrishiConnect. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/contact" className="hover:text-emerald-400 transition-colors">
              Contact
            </Link>
            <Link href="/copyright" className="hover:text-emerald-400 transition-colors">
              Copyright
            </Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Right: form panel with comfortable vertical scroll & auto margins */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen py-12 sm:py-16">
        <div className="w-full max-w-[460px]">
          {/* mobile-only brand mark */}
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground font-plus-jakarta">KrishiConnect</span>
          </div>
          {children}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground font-medium">
            <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link>
            <Link href="/copyright" className="hover:text-emerald-400 transition-colors">Copyright</Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
