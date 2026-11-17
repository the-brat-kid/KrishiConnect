"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressTrackVariants = cva(
  "relative w-full overflow-hidden rounded-full transition-all duration-300",
  {
    variants: {
      size: {
        xs: "h-1",
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-3.5",
        xl: "h-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const progressBarVariants = cva(
  "h-full rounded-full relative transition-all duration-500 ease-out",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)] dark:bg-emerald-400",
        primary:
          "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 shadow-[0_0_14px_rgba(16,185,129,0.5)]",
        secondary:
          "bg-zinc-700 dark:bg-zinc-300 shadow-xs",
        accent:
          "bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]",
        emerald:
          "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.5)]",
        gradient:
          "bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-[0_0_14px_rgba(16,185,129,0.4)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ProgressContextValue {
  value?: number;
  max: number;
  percentage: number;
  isIndeterminate: boolean;
  variant: "default" | "primary" | "secondary" | "accent" | "destructive" | "emerald" | "gradient";
  size: "xs" | "sm" | "md" | "lg" | "xl";
  striped?: boolean;
  animatedStripes?: boolean;
}

const ProgressContext = React.createContext<ProgressContextValue | null>(null);

function useProgressContext() {
  const ctx = React.useContext(ProgressContext);
  if (!ctx) {
    throw new Error("Progress compound components must be rendered within a <Progress> root.");
  }
  return ctx;
}

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressTrackVariants>,
    VariantProps<typeof progressBarVariants> {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  showValue?: boolean;
  label?: React.ReactNode;
  striped?: boolean;
  animatedStripes?: boolean;
  children?: React.ReactNode;
}

function Progress({
  className,
  children,
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
  const isIndeterminate = indeterminate || value === undefined;
  const clampedValue = Math.min(Math.max(value || 0, 0), max);
  const percentage = Math.round((clampedValue / max) * 100);

  const contextValue = React.useMemo<ProgressContextValue>(
    () => ({
      value: clampedValue,
      max,
      percentage,
      isIndeterminate,
      variant: (variant || "default") as ProgressContextValue["variant"],
      size: (size || "md") as ProgressContextValue["size"],
      striped,
      animatedStripes,
    }),
    [clampedValue, max, percentage, isIndeterminate, variant, size, striped, animatedStripes]
  );

  const hasExplicitChildren = Boolean(children);

  return (
    <ProgressContext.Provider value={contextValue}>
      <div
        data-slot="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={isIndeterminate ? undefined : clampedValue}
        className={cn("w-full space-y-1.5 select-none", className)}
        {...props}
      >
        {hasExplicitChildren ? (
          children
        ) : (
          <>
            {(label || showValue) && (
              <div className="flex items-center justify-between text-xs font-semibold">
                {label && <ProgressLabel>{label}</ProgressLabel>}
                {showValue && <ProgressValue />}
              </div>
            )}
            <ProgressTrack>
              <ProgressIndicator />
            </ProgressTrack>
          </>
        )}
      </div>
    </ProgressContext.Provider>
  );
}

function ProgressTrack({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { size } = useProgressContext();

  return (
    <div
      data-slot="progress-track"
      className={cn(
        "bg-zinc-200/70 dark:bg-zinc-800/70 border border-black/5 dark:border-white/10",
        "backdrop-blur-md shadow-inner flex w-full items-center",
        progressTrackVariants({ size }),
        className
      )}
      {...props}
    >
      {children || <ProgressIndicator />}
    </div>
  );
}

function ProgressIndicator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { percentage, isIndeterminate, variant, striped, animatedStripes } = useProgressContext();

  if (isIndeterminate) {
    return (
      <div
        data-slot="progress-indicator"
        className={cn(
          progressBarVariants({ variant }),
          "absolute top-0 bottom-0 rounded-full animate-[progressIndeterminate_1.6s_ease-in-out_infinite]",
          className
        )}
        style={{ width: "40%" }}
        {...props}
      />
    );
  }

  return (
    <div
      data-slot="progress-indicator"
      className={cn(
        progressBarVariants({ variant }),
        "overflow-hidden",
        striped &&
          "bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]",
        animatedStripes && "animate-[progressStripes_1s_linear_infinite]",
        className
      )}
      style={{ width: `${percentage}%` }}
      {...props}
    >
      {/* Liquid Glass Specular Shimmer Ray */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-[progressShimmer_2.4s_infinite_linear]"
      />
    </div>
  );
}

function ProgressLabel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="progress-label"
      className={cn("text-xs font-semibold text-foreground/90 flex items-center gap-1.5", className)}
      {...props}
    >
      {children}
    </span>
  );
}

function ProgressValue({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const { percentage, isIndeterminate } = useProgressContext();

  return (
    <span
      data-slot="progress-value"
      className={cn("text-muted-foreground ml-auto text-xs font-mono font-bold tabular-nums", className)}
      {...props}
    >
      {children || (isIndeterminate ? (
        <span className="animate-pulse">Processing...</span>
      ) : (
        `${percentage}%`
      ))}
    </span>
  );
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
};

export default function ProgressDemo() {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(72), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-md p-4 space-y-4">
      <Progress value={progress} className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          <ProgressLabel>Mandi Quota Allocated</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  );
}
