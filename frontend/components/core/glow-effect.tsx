"use client";

import React, { useMemo } from "react";
import { ArrowRight } from "lucide-react";

export interface GlowEffectProps {
  colors?: string[];
  mode?: "rotate" | "pulse" | "breathe" | "colorShift" | "flowHorizontal" | "static";
  blur?: "soft" | "medium" | "strong" | number;
  duration?: number;
  scale?: number;
  className?: string;
}

export function GlowEffect({
  colors = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
  mode = "colorShift",
  blur = "soft",
  duration = 3,
  scale = 0.9,
  className = "",
}: GlowEffectProps) {
  const blurFilter = useMemo(() => {
    if (typeof blur === "number") return `blur(${blur}px)`;
    switch (blur) {
      case "soft":
        return "blur(12px)";
      case "medium":
        return "blur(20px)";
      case "strong":
        return "blur(32px)";
      default:
        return "blur(12px)";
    }
  }, [blur]);

  const gradientBackground = useMemo(() => {
    const colorStr = colors.join(", ");
    if (mode === "rotate") {
      return `conic-gradient(from 0deg at 50% 50%, ${colorStr}, ${colors[0]})`;
    }
    return `linear-gradient(135deg, ${colorStr}, ${colors[0]})`;
  }, [colors, mode]);

  const animationStyle = useMemo(() => {
    switch (mode) {
      case "rotate":
        return `glowRotate ${duration}s linear infinite`;
      case "pulse":
      case "breathe":
        return `glowPulse ${duration}s ease-in-out infinite`;
      case "flowHorizontal":
        return `glowFlow ${duration}s linear infinite`;
      case "colorShift":
      default:
        return `glowShift ${duration}s ease infinite`;
    }
  }, [mode, duration]);

  return (
    <>
      <style jsx global>{`
        @keyframes glowShift {
          0% {
            background-position: 0% 50%;
            opacity: 0.7;
          }
          50% {
            background-position: 100% 50%;
            opacity: 0.95;
          }
          100% {
            background-position: 0% 50%;
            opacity: 0.7;
          }
        }
        @keyframes glowRotate {
          0% {
            transform: scale(${scale}) rotate(0deg);
          }
          100% {
            transform: scale(${scale}) rotate(360deg);
          }
        }
        @keyframes glowPulse {
          0%, 100% {
            transform: scale(${scale * 0.95});
            opacity: 0.55;
          }
          50% {
            transform: scale(${scale * 1.05});
            opacity: 0.95;
          }
        }
        @keyframes glowFlow {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 200% 0%;
          }
        }
      `}</style>
      <div
        className={`pointer-events-none absolute -inset-1 rounded-xl transition-all ${className}`}
        style={{
          background: gradientBackground,
          backgroundSize: mode === "rotate" ? "auto" : "300% 300%",
          filter: blurFilter,
          transform: mode === "rotate" ? undefined : `scale(${scale})`,
          animation: animationStyle,
          zIndex: 0,
        }}
      />
    </>
  );
}

export function GlowEffectButton() {
  return (
    <div className="relative">
      <GlowEffect
        colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
        mode="colorShift"
        blur="soft"
        duration={3}
        scale={0.9}
      />
      <button className="relative inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-50 outline outline-1 outline-[#fff2f21f]">
        Explore <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default GlowEffect;
