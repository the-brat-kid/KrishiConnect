"use client"

import * as React from "react"
import Link from "next/link"
import {
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
  ArrowUp,
  ExternalLink,
  Layers,
  Activity,
  Play,
  RotateCcw,
} from "lucide-react"

import { Spinner, SpinnerOverlay } from "@/components/ui/spinner"
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonMandiRate,
  SkeletonTable,
} from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { PulsingLoader } from "@/components/ui/pulsing-loader"
import { Button } from "@/components/ui/button"
import { PullToRefresh } from "@/components/ui/pull-to-refresh"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoadersDemoPage() {
  // 1. Progress State
  const [progressVal, setProgressVal] = React.useState(42)

  // 2. Button Loader States
  const [btn1Loading, setBtn1Loading] = React.useState(false)
  const [btn2Loading, setBtn2Loading] = React.useState(false)
  const [btn3Loading, setBtn3Loading] = React.useState(false)

  // 3. Overlay Spinner State
  const [showOverlay, setShowOverlay] = React.useState(false)

  // 4. Pull to Refresh State
  const [refreshCount, setRefreshCount] = React.useState(1)

  const handleSimulateRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setRefreshCount((prev) => prev + 1)
  }

  return (
    <PullToRefresh onRefresh={handleSimulateRefresh} refreshingText="Refreshing Mandi Market...">
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>UI Enhancements & Polish</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-editorial">
              Loaders & Animation Showcase
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Interactive preview and verification of all newly implemented loaders, progress bars, feedback animations, and navigation tools.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href="/this-page-does-not-exist">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Test Custom 404</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* 1. Spinner Loaders */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              <span>1. Spinner Loaders</span>
            </CardTitle>
            <CardDescription>
              Multiple sizes, themes, and styles (classic ring, dot orbit, and agricultural sprout).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sizes */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/40">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Sizes</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex flex-col items-center gap-1">
                    <Spinner size="xs" variant="primary" />
                    <span className="text-[10px] text-muted-foreground">xs (12px)</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Spinner size="sm" variant="primary" />
                    <span className="text-[10px] text-muted-foreground">sm (16px)</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Spinner size="md" variant="primary" />
                    <span className="text-[10px] text-muted-foreground">md (24px)</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Spinner size="lg" variant="primary" />
                    <span className="text-[10px] text-muted-foreground">lg (32px)</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Spinner size="xl" variant="primary" />
                    <span className="text-[10px] text-muted-foreground">xl (48px)</span>
                  </div>
                </div>
              </div>

              {/* Styles */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/40">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Styles</p>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-1">
                    <Spinner size="lg" styleVariant="ring" variant="primary" />
                    <span className="text-[10px] text-muted-foreground">Ring</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Spinner size="lg" styleVariant="dots" variant="accent" />
                    <span className="text-[10px] text-muted-foreground">Dots Orbit</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Spinner size="lg" styleVariant="sprout" variant="emerald" />
                    <span className="text-[10px] text-muted-foreground">Sprout</span>
                  </div>
                </div>
              </div>

              {/* Overlay Trigger */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/40 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Modal / Overlay Mode</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Full container or page backdrop with status message.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowOverlay(true)
                    setTimeout(() => setShowOverlay(false), 2500)
                  }}
                >
                  Trigger 2.5s Overlay
                </Button>
              </div>
            </div>

            {showOverlay && (
              <SpinnerOverlay
                message="Processing APMC Mandi Invoices..."
                description="Syncing ledger and calculating transport freight"
              />
            )}
          </CardContent>
        </Card>

        {/* 2. Skeleton Loaders */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <span>2. Skeleton Loaders</span>
            </CardTitle>
            <CardDescription>
              Lightweight shimmer-wave placeholders mimicking actual content layouts to prevent layout shifts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Text & Avatar Skeleton */}
              <div className="space-y-4 p-4 rounded-xl bg-muted/20 border border-border/40">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Text & Profile</p>
                <div className="flex items-center gap-3">
                  <SkeletonAvatar size="md" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
                <SkeletonText lines={3} lastLineWidth="55%" />
              </div>

              {/* Mandi Rate Card Skeleton */}
              <div className="space-y-2 p-4 rounded-xl bg-muted/20 border border-border/40">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Mandi Rate Card</p>
                <SkeletonMandiRate />
              </div>

              {/* Generic Content Card Skeleton */}
              <div className="space-y-2 p-4 rounded-xl bg-muted/20 border border-border/40">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Card Preview</p>
                <SkeletonCard hasImage={false} />
              </div>
            </div>

            {/* Table Skeleton */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Table Skeleton</p>
              <SkeletonTable rows={3} columns={4} />
            </div>
          </CardContent>
        </Card>

        {/* 3. Progress Bars */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>3. Progress Bar</span>
            </CardTitle>
            <CardDescription>
              Determinate, indeterminate, animated striped, and top navigation bar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Determinate Controls */}
              <div className="space-y-4 p-4 rounded-xl bg-muted/20 border border-border/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Determinate Progress</p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setProgressVal((v) => Math.max(v - 15, 0))}
                    >
                      -15%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setProgressVal((v) => Math.min(v + 15, 100))}
                    >
                      +15%
                    </Button>
                  </div>
                </div>

                <Progress
                  value={progressVal}
                  label="Crop Moisture Analysis"
                  showValue
                  variant="primary"
                  size="md"
                />
                <Progress
                  value={progressVal}
                  label="Harvest Gold (Striped)"
                  showValue
                  variant="accent"
                  striped
                  animatedStripes
                  size="lg"
                />
                <Progress
                  value={progressVal}
                  label="Multi-tone Gradient"
                  showValue
                  variant="gradient"
                  size="md"
                />
              </div>

              {/* Indeterminate & Running Beam */}
              <div className="space-y-4 p-4 rounded-xl bg-muted/20 border border-border/40">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Indeterminate Mode</p>
                <Progress
                  indeterminate
                  label="Live Mandi Stream Polling"
                  variant="primary"
                  size="sm"
                />
                <Progress
                  indeterminate
                  label="APMC Freight Sync"
                  variant="emerald"
                  size="md"
                />
                <Progress
                  indeterminate
                  label="AI Crop Doctor Analysis"
                  variant="accent"
                  size="lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Pulsing Loader */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              <span>4. Pulsing Loader</span>
            </CardTitle>
            <CardDescription>
              Concentric sonar radar rings, jumping wave dots, glowing breathing orbs, and live beacon pills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Radar Rings */}
              <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-muted/20 border border-border/40 space-y-3 text-center">
                <PulsingLoader variant="rings" color="primary" size="md" />
                <p className="text-xs font-semibold text-foreground">Concentric Rings</p>
                <p className="text-[11px] text-muted-foreground">Sonar radar ping</p>
              </div>

              {/* Wave Dots */}
              <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-muted/20 border border-border/40 space-y-3 text-center">
                <PulsingLoader variant="dots" color="accent" size="md" />
                <p className="text-xs font-semibold text-foreground">Wave Dots</p>
                <p className="text-[11px] text-muted-foreground">Staggered rhythm</p>
              </div>

              {/* Breathing Orb */}
              <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-muted/20 border border-border/40 space-y-3 text-center">
                <PulsingLoader variant="orb" color="emerald" size="md" />
                <p className="text-xs font-semibold text-foreground">Luminous Orb</p>
                <p className="text-[11px] text-muted-foreground">Bioluminescent breath</p>
              </div>

              {/* Live Beacon */}
              <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-muted/20 border border-border/40 space-y-3 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  <PulsingLoader variant="beacon" color="emerald" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Live APMC Feed
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground">Live Beacon</p>
                <p className="text-[11px] text-muted-foreground">Status badge ping</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Button Loader & 9. Click Animation */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              <span>5. Button Loader & 9. Universal Button Click Animation</span>
            </CardTitle>
            <CardDescription>
              Interactive states with integrated spinners, custom loading text, tactile bounce, and fluid click ripple.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Loader Button */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border/40">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Primary Action</p>
                <Button
                  loading={btn1Loading}
                  loadingText="Generating Invoice..."
                  onClick={() => {
                    setBtn1Loading(true)
                    setTimeout(() => setBtn1Loading(false), 2000)
                  }}
                  className="w-full"
                >
                  Generate Invoice
                </Button>
                <p className="text-[11px] text-muted-foreground">Click to trigger a 2-second loading state.</p>
              </div>

              {/* Secondary / Outline Button */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border/40">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Outline Variant</p>
                <Button
                  variant="outline"
                  loading={btn2Loading}
                  loadingText="Fetching APMC Rates..."
                  spinnerPlacement="end"
                  onClick={() => {
                    setBtn2Loading(true)
                    setTimeout(() => setBtn2Loading(false), 2000)
                  }}
                  className="w-full"
                >
                  Refresh Rates
                </Button>
                <p className="text-[11px] text-muted-foreground">End-aligned spinner with outline styling.</p>
              </div>

              {/* Destructive / Accent Button */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border/40">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Emerald / Destructive</p>
                <Button
                  variant="destructive"
                  loading={btn3Loading}
                  loadingText="Cancelling Order..."
                  onClick={() => {
                    setBtn3Loading(true)
                    setTimeout(() => setBtn3Loading(false), 2000)
                  }}
                  className="w-full"
                >
                  Cancel Order
                </Button>
                <p className="text-[11px] text-muted-foreground">Notice the ripple and tactile press on click!</p>
              </div>
            </div>

            {/* Click animation test palette */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Universal Click Animation Test Palette (Test the click ripples & active scaling)
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default">Default Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="emerald">Emerald Button</Button>
                <Button variant="destructive">Destructive Button</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. Pull to Refresh & 8. Back to Top info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <span>6. Pull / Full to Refresh Loader</span>
              </CardTitle>
              <CardDescription>
                Touch pull-down gesture on mobile or click the Full Refresh button above.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/40">
                <span className="text-muted-foreground">Total Refreshes Performed:</span>
                <span className="font-bold text-primary font-mono">{refreshCount}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Try dragging down from the top of this page on a mobile device or touch trackpad, or click the &quot;Full Refresh&quot; button in the upper right. The elastic resistance, spring physics, and animated status badge will activate seamlessly.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-xs">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowUp className="h-5 w-5 text-primary" />
                <span>8. Back to Top Button</span>
              </CardTitle>
              <CardDescription>
                Floating circular progress indicator that reveals itself on scroll.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scroll down this page past 250px! A floating button with an SVG scroll-percentage ring will appear in the bottom-right corner. Clicking it smoothly animates the viewport straight back to the top.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.scrollTo({ top: 1200, behavior: "smooth" })}
                >
                  Scroll Down to Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Extended spacer to make page easily scrollable for testing BackToTop */}
        <div className="p-8 rounded-2xl border border-dashed border-border/60 bg-muted/10 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">Extended Test Section</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            This section allows you to test the floating Back to Top button with its circular scroll-progress indicator ring.
          </p>
          <div className="h-96 flex items-center justify-center text-muted-foreground/40 text-xs">
            ↓ Scroll further down to inspect the floating Back to Top button in bottom right ↓
          </div>
        </div>
      </div>
    </PullToRefresh>
  )
}
