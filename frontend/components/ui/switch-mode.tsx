"use client";

import { useEffect, useState, type FC } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export interface SwitchModeProps {
  width?: number;
  height?: number;
  darkColor?: string;
  lightColor?: string;
  knobDarkColor?: string;
  knobLightColor?: string;
  borderDarkColor?: string;
  borderLightColor?: string;
  className?: string;
}

export const SwitchMode: FC<SwitchModeProps> = ({
  width = 68,
  height = 34,
  darkColor = "#0B140E",
  lightColor = "#F4F7F5",
  knobDarkColor = "#16281E",
  knobLightColor = "#FFFFFF",
  borderDarkColor = "#244231",
  borderLightColor = "#D5E3DB",
  className = "",
}) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ width, height }}
        className={`rounded-full border-2 border-transparent opacity-0 ${className}`}
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  const iconSize = Math.max(14, Math.round(height * 0.46));
  const knobTravel = width - height;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme mode"
      className={`relative flex items-center rounded-full border-2 cursor-pointer transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      style={{
        width,
        height,
        backgroundColor: isDark ? darkColor : lightColor,
        borderColor: isDark ? borderDarkColor : borderLightColor,
      }}
    >
      {/* Sliding Knob */}
      <span
        className="absolute rounded-full border-2 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-10 shadow-xs"
        style={{
          width: height - 4,
          height: height - 4,
          top: 0,
          left: 0,
          transform: isDark ? `translateX(${knobTravel}px)` : "translateX(0px)",
          backgroundColor: isDark ? knobDarkColor : knobLightColor,
          borderColor: isDark ? borderDarkColor : borderLightColor,
        }}
      />

      {/* Sun Slot (Left) */}
      <div
        className="relative z-20 flex items-center justify-center transition-transform duration-300"
        style={{
          width: height - 4,
          height: height - 4,
          transform: isDark ? "rotate(45deg)" : "rotate(0deg)",
        }}
      >
        <Sun
          style={{ width: iconSize, height: iconSize }}
          className={`transition-colors duration-200 ${
            isDark ? "text-muted-foreground/60" : "text-amber-500 fill-amber-500"
          }`}
        />
      </div>

      {/* Moon Slot (Right) */}
      <div
        className="relative z-20 flex items-center justify-center transition-transform duration-300 ml-auto"
        style={{
          width: height - 4,
          height: height - 4,
          transform: isDark ? "rotate(0deg)" : "rotate(-15deg)",
        }}
      >
        <Moon
          style={{ width: iconSize, height: iconSize }}
          className={`transition-colors duration-200 ${
            isDark ? "text-emerald-400 fill-emerald-400" : "text-muted-foreground/60"
          }`}
        />
      </div>
    </button>
  );
};

export default SwitchMode;
