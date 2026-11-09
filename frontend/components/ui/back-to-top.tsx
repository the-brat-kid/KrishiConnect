"use client"

import * as React from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BackToTopProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  threshold?: number
  showProgress?: boolean
}

export function BackToTop({
  threshold = 250,
  showProgress = true,
  className,
  ...props
}: BackToTopProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [scrollProgress, setScrollProgress] = React.useState(0)

  React.useEffect(() => {
    const handleScroll = () => {
      // Check both window scroll and document element scroll
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight

      if (scrollTop > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }

      if (scrollHeight > 0) {
        const progress = Math.min((scrollTop / scrollHeight) * 100, 100)
        setScrollProgress(progress)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    // Also attach to potential dashboard main scrollable container if any
    const mainEl = document.querySelector("main")
    const handleMainScroll = () => {
      if (!mainEl) return
      const scrollTop = mainEl.scrollTop
      const scrollHeight = mainEl.scrollHeight - mainEl.clientHeight
      if (scrollTop > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
      if (scrollHeight > 0) {
        setScrollProgress(Math.min((scrollTop / scrollHeight) * 100, 100))
      }
    }
    if (mainEl) {
      mainEl.addEventListener("scroll", handleMainScroll, { passive: true })
    }

    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (mainEl) {
        mainEl.removeEventListener("scroll", handleMainScroll)
      }
    }
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    const mainEl = document.querySelector("main")
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  if (!isVisible) return null

  // Circle parameters for SVG ring
  const size = 44
  const strokeWidth = 2.5
  const center = size / 2
  const radius = center - strokeWidth * 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className={cn(
        "fixed bottom-6 right-6 z-40 flex items-center justify-center rounded-full bg-card/90 dark:bg-neutral-900/90 text-foreground border border-border shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-primary/20 hover:border-primary/50 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 animate-in fade-in slide-in-from-bottom-4",
        className
      )}
      style={{ width: `${size}px`, height: `${size}px` }}
      {...props}
    >
      {showProgress && (
        <svg
          className="absolute inset-0 -rotate-90 pointer-events-none"
          width={size}
          height={size}
        >
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/40"
            fill="transparent"
          />
          {/* Active progress indicator ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-primary transition-all duration-150"
            fill="transparent"
          />
        </svg>
      )}

      <ArrowUp className="h-5 w-5 text-foreground group-hover:text-primary transition-colors group-hover:-translate-y-0.5 duration-200" />
    </button>
  )
}
