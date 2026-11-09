import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva("animate-spin shrink-0", {
  variants: {
    variant: {
      default: "text-primary",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
      accent: "text-accent",
      muted: "text-muted-foreground",
      white: "text-white",
      destructive: "text-destructive",
      emerald: "text-emerald-500",
    },
    size: {
      xs: "h-3 w-3 border-[1.5px]",
      sm: "h-4 w-4 border-2",
      md: "h-6 w-6 border-2",
      lg: "h-8 w-8 border-[3px]",
      xl: "h-12 w-12 border-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
  showLabel?: boolean
  styleVariant?: "ring" | "dots" | "sprout"
}

export function Spinner({
  className,
  variant,
  size,
  label,
  showLabel = false,
  styleVariant = "ring",
  ...props
}: SpinnerProps) {
  const sizeMap: Record<string, number> = {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  }
  const pixelSize = sizeMap[size || "md"] || 24

  return (
    <div
      role="status"
      aria-label={label || "Loading"}
      className={cn("inline-flex items-center justify-center gap-2.5", className)}
      {...props}
    >
      {styleVariant === "sprout" ? (
        <svg
          className={cn(spinnerVariants({ variant, size }), "border-0 animate-spin")}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M12 2C6.477 2 2 6.477 2 12c0 2.21.72 4.253 1.935 5.908l1.458-1.458A7.957 7.957 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8a7.957 7.957 0 01-1.393 4.45l1.458 1.458A9.96 9.96 0 0022 12c0-5.523-4.477-10-10-10z"
          />
          {/* Sprout Leaf motif inside */}
          <path
            d="M12 7c-2 2-2 5 0 7 2-2 2-5 0-7z"
            fill="currentColor"
            className="animate-pulse"
          />
        </svg>
      ) : styleVariant === "dots" ? (
        <svg
          className={cn(spinnerVariants({ variant, size }), "border-0 animate-spin")}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="3" r="2.5" fill="currentColor" className="opacity-100" />
          <circle cx="18.36" cy="5.64" r="2.2" fill="currentColor" className="opacity-80" />
          <circle cx="21" cy="12" r="2" fill="currentColor" className="opacity-60" />
          <circle cx="18.36" cy="18.36" r="1.8" fill="currentColor" className="opacity-40" />
          <circle cx="12" cy="21" r="1.5" fill="currentColor" className="opacity-30" />
          <circle cx="5.64" cy="18.36" r="1.3" fill="currentColor" className="opacity-20" />
          <circle cx="3" cy="12" r="1.2" fill="currentColor" className="opacity-15" />
          <circle cx="5.64" cy="5.64" r="1.5" fill="currentColor" className="opacity-20" />
        </svg>
      ) : (
        /* Classic high-performance dual-track SVG ring spinner */
        <svg
          className={cn(spinnerVariants({ variant, size }), "border-0")}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="9.5"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-95"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V1.5C6.201 1.5 1.5 6.201 1.5 12H4zm2 5.291A7.962 7.962 0 014 12H1.5c0 2.899 1.173 5.525 3.07 7.42l1.43-1.629z"
          />
        </svg>
      )}

      {(label || showLabel) && (
        <span className="text-xs font-medium text-muted-foreground select-none">
          {label || "Loading..."}
        </span>
      )}
      <span className="sr-only">{label || "Loading"}</span>
    </div>
  )
}

export interface SpinnerOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
  description?: string
  fullScreen?: boolean
  blur?: boolean
}

export function SpinnerOverlay({
  message = "Loading...",
  description,
  fullScreen = false,
  blur = true,
  className,
  ...props
}: SpinnerOverlayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 z-50 text-center transition-all",
        fullScreen
          ? "fixed inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
          : "absolute inset-0 bg-background/70 dark:bg-black/60 rounded-xl",
        blur && "backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/80 dark:bg-neutral-900/80 border border-border/60 shadow-xl max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-200">
        <Spinner size="lg" variant="primary" styleVariant="sprout" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground tracking-tight">{message}</p>
          {description && (
            <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
