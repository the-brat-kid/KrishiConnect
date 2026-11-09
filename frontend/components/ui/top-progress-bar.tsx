"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

function TopProgressBarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)

  // Trigger brief top progress line on route navigation
  React.useEffect(() => {
    setLoading(true)
    setProgress(30)

    const timer1 = setTimeout(() => {
      setProgress(75)
    }, 120)

    const timer2 = setTimeout(() => {
      setProgress(100)
    }, 280)

    const timer3 = setTimeout(() => {
      setLoading(false)
      setProgress(0)
    }, 450)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [pathname, searchParams])

  if (!loading && progress === 0) return null

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-primary to-amber-400 transition-all duration-200 ease-out shadow-[0_0_10px_rgba(20,122,77,0.7)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: "width 200ms ease-out, opacity 150ms ease-in",
        }}
      />
    </div>
  )
}

export function TopProgressBar() {
  return (
    <React.Suspense fallback={null}>
      <TopProgressBarInner />
    </React.Suspense>
  )
}
