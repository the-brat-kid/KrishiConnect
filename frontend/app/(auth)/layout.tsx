import Link from "next/link";
import { ParallaxBackground } from "@/components/layout/parallax-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background relative overflow-hidden">
      {/* Background depth parallax */}
      <ParallaxBackground intensity={0.5} showMistyCanopy={false} />

      {/* Left: brand / marketing panel - hidden on small screens */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-[#242424]/90 backdrop-blur-md border-r border-[#3D3D3D] text-[#C0C0C0] z-10">
        {/* subtle signal red tint glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#E10600]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#E10600]/5 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#E5E5E5]">KrishiConnect</span>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <h1 className="font-editorial text-3xl sm:text-4xl font-light leading-tight text-[#F5F5F5]">
            From farm gate to buyer: sell at the right price and get paid on the spot.
          </h1>
          <p className="text-[#A6A6A6] text-sm leading-relaxed">
            Simple invoices, UPI and Razorpay payments, and daily crop rates, built for farmers, FPOs and buyers.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {["Farmer invoices", "UPI & Razorpay", "Live dashboard"].map((tag) => (
              <span key={tag} className="rounded-md border border-[#3D3D3D] bg-[#2A2A2A] px-3 py-1 text-xs text-[#C0C0C0]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-[#8A8A8A] pt-4 border-t border-[#3D3D3D]">
          <p>© {new Date().getFullYear()} KrishiConnect. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/contact" className="hover:text-[#E5E5E5] transition-colors">
              Contact
            </Link>
            <Link href="/copyright" className="hover:text-[#E5E5E5] transition-colors">
              Copyright
            </Link>
            <Link href="/privacy" className="hover:text-[#E5E5E5] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#E5E5E5] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="relative z-10 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* mobile-only brand mark */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">KrishiConnect</span>
          </div>
          {children}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/contact" className="hover:text-foreground">Contact Us</Link>
            <Link href="/copyright" className="hover:text-foreground">Copyright</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
