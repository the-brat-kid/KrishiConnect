"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Home, Sprout, TrendingUp, FileText, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative subtle grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center space-y-8 p-8 md:p-12 rounded-2xl bg-card/70 dark:bg-neutral-900/70 border border-border/80 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Badge & Icon */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full bg-primary/20 animate-ping opacity-60" style={{ animationDuration: "3s" }} />
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-primary to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-primary/30">
              <Sprout className="h-10 w-10 animate-bounce" style={{ animationDuration: "2s" }} />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground border border-border">
            <Compass className="h-3.5 w-3.5 text-primary" />
            <span>Error 404 • Field Out of Bounds</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight font-editorial text-foreground">
            404
          </h1>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Crop Lost in Transit
          </h2>

          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            The page or mandi record you are looking for has either been harvested, relocated, or never planted in this field.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>

          <Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
        </div>

        {/* Quick Recommended Destinations */}
        <div className="pt-6 border-t border-border/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Popular Mandi Destinations
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Link
              href="/crop-rates"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/80 text-xs font-medium text-foreground transition-colors border border-border/40"
            >
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span>Mandi Rates</span>
            </Link>
            <Link
              href="/invoices"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/80 text-xs font-medium text-foreground transition-colors border border-border/40"
            >
              <FileText className="h-4 w-4 text-amber-500" />
              <span>Invoices</span>
            </Link>
            <Link
              href="/crop-planner"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/80 text-xs font-medium text-foreground transition-colors border border-border/40 col-span-2 sm:col-span-1"
            >
              <Sprout className="h-4 w-4 text-primary" />
              <span>Crop Planner</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
