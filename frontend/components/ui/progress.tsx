import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressTrackVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-muted/80 dark:bg-muted/40 transition-all",
  {
    variants: {
      size: {
        xs: "h-1",
        sm: "h-2",
        md: "h-3",
        lg: "h-4",
        xl: "h-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const progressBarVariants = cva("h-full transition-all duration-300 ease-out", {
  variants: {
    variant: {
      default: "bg-primary",
      primary: "bg-primary shadow-xs shadow-primary/40",
      secondary: "bg-secondary-foreground",
      accent: "bg-accent shadow-xs shadow-accent/40",
      destructive: "bg-destructive",
      emerald: "bg-emerald-500 shadow-xs shadow-emerald-500/40",
      gradient: "bg-gradient-to-r from-emerald-600 via-primary to-amber-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressTrackVariants>,
    VariantProps<typeof progressBarVariants> {
  value?: number
  max?: number
  indeterminate?: boolean
  showValue?: boolean
  label?: string
  striped?: boolean
  animatedStripes?: boolean
}

export function Progress({
  className,
  value,
  max = 100,
  size = "md",
  variant = "default",
  indeterminate = false,
  showValue = false,
  label,
  striped = false,
  animatedStripes = false,
  ...props
}: ProgressProps) {
  const isIndeterminate = indeterminate || value === undefined
  const clampedValue = Math.min(Math.max(value || 0, 0), max)
  const percentage = Math.round((clampedValue / max) * 100)

  return (
    <div className="w-full space-y-1.5">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-medium text-foreground">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && !isIndeterminate && (
            <span className="font-mono tabular-nums text-foreground">{percentage}%</span>
          )}
          {isIndeterminate && <span className="text-muted-foreground animate-pulse">Processing...</span>}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={isIndeterminate ? undefined : clampedValue}
        className={cn(progressTrackVariants({ size }), className)}
        {...props}
      >
        {isIndeterminate ? (
          <div
            className={cn(
              progressBarVariants({ variant }),
              "absolute top-0 bottom-0 rounded-full animate-[progressIndeterminate_1.6s_ease-in-out_infinite]"
            )}
            style={{ width: "40%" }}
          />
        ) : (
          <div
            className={cn(
              progressBarVariants({ variant }),
              "rounded-full relative",
              striped &&
                "bg-[linear-gradient(45deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]",
              animatedStripes && "animate-[progressStripes_1s_linear_infinite]"
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  )
}
