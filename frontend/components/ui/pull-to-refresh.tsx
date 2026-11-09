"use client"

import * as React from "react"
import { ArrowDown, Check, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

export interface PullToRefreshProps extends React.HTMLAttributes<HTMLDivElement> {
  onRefresh: () => Promise<void> | void
  pullDownThreshold?: number
  maxPullDownDistance?: number
  disabled?: boolean
  refreshingText?: string
  pullText?: string
  releaseText?: string
  children: React.ReactNode
}

export function PullToRefresh({
  onRefresh,
  pullDownThreshold = 70,
  maxPullDownDistance = 110,
  disabled = false,
  refreshingText = "Refreshing mandi data...",
  pullText = "Pull down to refresh",
  releaseText = "Release to refresh",
  className,
  children,
  ...props
}: PullToRefreshProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [pullDistance, setPullDistance] = React.useState(0)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const startYRef = React.useRef(0)
  const isDraggingRef = React.useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return
    // Only allow pull-down if container or window is at the top
    const scrollTop = containerRef.current?.scrollTop || window.scrollY
    if (scrollTop <= 2) {
      startYRef.current = e.touches[0].clientY
      isDraggingRef.current = true
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || disabled || isRefreshing) return
    const currentY = e.touches[0].clientY
    const deltaY = currentY - startYRef.current

    if (deltaY > 0) {
      // Apply elastic logarithmic friction
      const friction = 0.5
      const calculatedDistance = Math.min(deltaY * friction, maxPullDownDistance)
      setPullDistance(calculatedDistance)
    } else {
      setPullDistance(0)
      isDraggingRef.current = false
    }
  }

  const handleTouchEnd = async () => {
    if (!isDraggingRef.current || disabled || isRefreshing) return
    isDraggingRef.current = false

    if (pullDistance >= pullDownThreshold) {
      triggerRefresh()
    } else {
      setPullDistance(0)
    }
  }

  const triggerRefresh = async () => {
    setIsRefreshing(true)
    setPullDistance(pullDownThreshold)

    try {
      await Promise.resolve(onRefresh())
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
      }, 800)
    } catch (err) {
      console.error("Refresh error:", err)
    } finally {
      setTimeout(() => {
        setIsRefreshing(false)
        setPullDistance(0)
      }, 400)
    }
  }

  const progressPercent = Math.min((pullDistance / pullDownThreshold) * 100, 100)
  const canRelease = pullDistance >= pullDownThreshold

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn("relative w-full", className)}
      {...props}
    >
      {/* Pull / Full to Refresh Indicator Header */}
      <div
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 10 ? 1 : 0,
        }}
        className={cn(
          "w-full overflow-hidden flex items-center justify-center transition-all duration-150 ease-out",
          !isDraggingRef.current && "transition-all duration-300"
        )}
      >
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-card/90 dark:bg-neutral-900/90 border border-border/80 shadow-md backdrop-blur-md">
          {isRefreshing ? (
            <>
              <Spinner size="sm" variant="primary" styleVariant="sprout" />
              <span className="text-xs font-semibold text-primary">{refreshingText}</span>
            </>
          ) : isSuccess ? (
            <>
              <Check className="h-4 w-4 text-emerald-500 animate-in zoom-in" />
              <span className="text-xs font-semibold text-emerald-500">Updated!</span>
            </>
          ) : (
            <>
              <div
                className="transition-transform duration-200"
                style={{
                  transform: `rotate(${canRelease ? 180 : progressPercent * 1.8}deg)`,
                }}
              >
                <ArrowDown className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {canRelease ? releaseText : pullText}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Manual Full Refresh Button (For Desktop Users) */}
      <div className="hidden md:flex justify-end mb-2">
        <button
          type="button"
          onClick={() => triggerRefresh()}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/80 rounded-md border border-border/40 transition-colors"
          title="Click to refresh live data"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-primary")} />
          <span>{isRefreshing ? "Refreshing..." : "Full Refresh"}</span>
        </button>
      </div>

      {/* Content wrapper */}
      <div
        style={{
          transform: `translateY(${isDraggingRef.current ? pullDistance * 0.2 : 0}px)`,
        }}
        className="transition-transform duration-200"
      >
        {children}
      </div>
    </div>
  )
}
