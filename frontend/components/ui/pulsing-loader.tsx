import * as React from "react"
import { cn } from "@/lib/utils"

export interface PulsingLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rings" | "dots" | "orb" | "beacon"
  color?: "primary" | "accent" | "destructive" | "emerald" | "white"
  size?: "sm" | "md" | "lg"
  label?: string
}

export function PulsingLoader({
  variant = "rings",
  color = "primary",
  size = "md",
  label,
  className,
  ...props
}: PulsingLoaderProps) {
  const colorMap = {
    primary: {
      bg: "bg-primary",
      ring: "border-primary/40 bg-primary/20",
      glow: "shadow-[0_0_20px_hsl(var(--primary)/0.6)]",
      text: "text-primary",
    },
    emerald: {
      bg: "bg-emerald-500",
      ring: "border-emerald-500/40 bg-emerald-500/20",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.6)]",
      text: "text-emerald-500",
    },
    accent: {
      bg: "bg-amber-500",
      ring: "border-amber-500/40 bg-amber-500/20",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.6)]",
      text: "text-amber-500",
    },
    destructive: {
      bg: "bg-destructive",
      ring: "border-destructive/40 bg-destructive/20",
      glow: "shadow-[0_0_20px_hsl(var(--destructive)/0.6)]",
      text: "text-destructive",
    },
    white: {
      bg: "bg-white",
      ring: "border-white/40 bg-white/20",
      glow: "shadow-[0_0_20px_rgba(255,255,255,0.6)]",
      text: "text-white",
    },
  }[color]

  const sizeDims = {
    sm: { box: "h-6 w-6", dot: "h-1.5 w-1.5", orb: "h-4 w-4", text: "text-xs" },
    md: { box: "h-10 w-10", dot: "h-2.5 w-2.5", orb: "h-8 w-8", text: "text-sm" },
    lg: { box: "h-16 w-16", dot: "h-3.5 w-3.5", orb: "h-12 w-12", text: "text-base" },
  }[size]

  return (
    <div
      role="status"
      aria-label={label || "Loading..."}
      className={cn("inline-flex items-center gap-3", className)}
      {...props}
    >
      {/* 1. Radar / Sonar Concentric Rings */}
      {variant === "rings" && (
        <div className={cn("relative flex items-center justify-center", sizeDims.box)}>
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
              colorMap.bg
            )}
            style={{ animationDuration: "1.6s" }}
          />
          <span
            className={cn(
              "absolute inline-flex h-3/4 w-3/4 rounded-full opacity-50 animate-ping",
              colorMap.bg
            )}
            style={{ animationDuration: "2s", animationDelay: "0.4s" }}
          />
          <span
            className={cn(
              "relative inline-flex rounded-full shadow-xs",
              sizeDims.dot,
              colorMap.bg
            )}
          />
        </div>
      )}

      {/* 2. Staggered Jumping Wave Dots */}
      {variant === "dots" && (
        <div className="flex items-center gap-1.5 py-1">
          <span
            className={cn(
              "rounded-full animate-bounce",
              sizeDims.dot,
              colorMap.bg
            )}
            style={{ animationDelay: "0ms", animationDuration: "0.8s" }}
          />
          <span
            className={cn(
              "rounded-full animate-bounce",
              sizeDims.dot,
              colorMap.bg
            )}
            style={{ animationDelay: "150ms", animationDuration: "0.8s" }}
          />
          <span
            className={cn(
              "rounded-full animate-bounce",
              sizeDims.dot,
              colorMap.bg
            )}
            style={{ animationDelay: "300ms", animationDuration: "0.8s" }}
          />
        </div>
      )}

      {/* 3. Luminous Breathing Orb */}
      {variant === "orb" && (
        <div className="relative flex items-center justify-center">
          <div
            className={cn(
              "rounded-full animate-pulse transition-all",
              sizeDims.orb,
              colorMap.bg,
              colorMap.glow
            )}
            style={{ animationDuration: "1.8s" }}
          />
        </div>
      )}

      {/* 4. Live Beacon Pill/Indicator */}
      {variant === "beacon" && (
        <span className="relative flex h-3 w-3">
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              colorMap.bg
            )}
            style={{ animationDuration: "1.2s" }}
          />
          <span
            className={cn("relative inline-flex rounded-full h-3 w-3", colorMap.bg)}
          />
        </span>
      )}

      {label && (
        <span className={cn("font-medium select-none text-muted-foreground", sizeDims.text)}>
          {label}
        </span>
      )}
      <span className="sr-only">{label || "Loading"}</span>
    </div>
  )
}
