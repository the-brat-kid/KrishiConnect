import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "pulse" | "shimmer" | "none"
}

function Skeleton({ className, variant = "shimmer", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/70 dark:bg-muted/40",
        variant === "pulse" && "animate-pulse",
        variant === "shimmer" &&
          "relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/15 dark:before:via-white/8 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

/** Pre-composed Skeleton for Text Paragraphs */
interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  lastLineWidth?: string
}

function SkeletonText({
  lines = 3,
  lastLineWidth = "60%",
  className,
  ...props
}: SkeletonTextProps) {
  const widths = ["100%", "92%", "85%", "78%", "96%"]

  return (
    <div className={cn("space-y-2.5", className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => {
        const isLast = index === lines - 1
        const width = isLast ? lastLineWidth : widths[index % widths.length]
        return (
          <Skeleton
            key={index}
            className="h-4 rounded"
            style={{ width }}
          />
        )
      })}
    </div>
  )
}

/** Pre-composed Skeleton for Avatars */
interface SkeletonAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  rounded?: "full" | "md" | "lg"
}

function SkeletonAvatar({
  size = "md",
  rounded = "full",
  className,
  ...props
}: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
    xl: "h-20 w-20",
  }[size]

  return (
    <Skeleton
      className={cn(
        sizeClasses,
        rounded === "full" ? "rounded-full" : rounded === "lg" ? "rounded-xl" : "rounded-md",
        "shrink-0",
        className
      )}
      {...props}
    />
  )
}

/** Pre-composed Skeleton for Generic Cards */
interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hasImage?: boolean
}

function SkeletonCard({ hasImage = true, className, ...props }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-xs",
        className
      )}
      {...props}
    >
      {hasImage && <Skeleton className="h-40 w-full rounded-lg" />}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-1/3 rounded" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <SkeletonText lines={2} lastLineWidth="80%" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  )
}

/** Pre-composed Skeleton for KrishiConnect Mandi Rate Cards */
function SkeletonMandiRate({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs space-y-3 shadow-xs",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex items-baseline justify-between pt-2 border-t border-border/40">
        <div className="space-y-1">
          <Skeleton className="h-3 w-14 rounded" />
          <Skeleton className="h-6 w-24 rounded" />
        </div>
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
  )
}

/** Pre-composed Skeleton for Data Tables */
interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number
  columns?: number
}

function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  ...props
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-border/60 overflow-hidden bg-card shadow-xs",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-muted/40 border-b border-border/60 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between p-4 gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className="h-4 flex-1 rounded"
                style={{
                  width: `${60 + ((r * 13 + c * 17) % 35)}%`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonMandiRate,
  SkeletonTable,
}
