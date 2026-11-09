"use client"

import * as React from "react"

/**
 * GlobalClickAnimation
 * Provides a universal micro-interaction animation (fluid expanding ripple + tactile feedback)
 * whenever ANY button or element with role="button" is clicked throughout the entire application.
 */
export function GlobalClickAnimation() {
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find closest button or role="button" element
      const target = e.target as HTMLElement | null
      const button = target?.closest<HTMLElement>("button, [role='button'], .btn")

      if (!button || button.hasAttribute("disabled") || button.getAttribute("aria-disabled") === "true") {
        return
      }

      // Ensure button has relative positioning and overflow hidden for ripple containment
      const computedStyle = window.getComputedStyle(button)
      if (computedStyle.position === "static") {
        button.style.position = "relative"
      }
      if (computedStyle.overflow !== "hidden") {
        button.style.overflow = "hidden"
      }

      // Calculate click coordinates relative to button
      const rect = button.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const size = Math.max(rect.width, rect.height) * 2

      // Create ripple element
      const ripple = document.createElement("span")
      ripple.className = "global-button-ripple"
      ripple.style.width = `${size}px`
      ripple.style.height = `${size}px`
      ripple.style.left = `${x - size / 2}px`
      ripple.style.top = `${y - size / 2}px`

      button.appendChild(ripple)

      // Clean up ripple element after animation finishes
      setTimeout(() => {
        ripple.remove()
      }, 600)
    }

    document.addEventListener("pointerdown", handleClick, { passive: true })
    return () => {
      document.removeEventListener("pointerdown", handleClick)
    }
  }, [])

  return null
}
