"use client";

import { useEffect, useState } from "react";

interface ParallaxBackgroundProps {
  intensity?: number;
  showMistyCanopy?: boolean;
}

export function ParallaxBackground({
  intensity = 1,
  showMistyCanopy = true,
}: ParallaxBackgroundProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const bgOffset = scrollY * 0.12 * intensity;
  const midOffset = scrollY * 0.28 * intensity;
  const fogOffset = scrollY * 0.45 * intensity;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#242424]"
    >
      {/* Layer 1: Base Charcoal Depth Gradient */}
      <div className="absolute inset-0 bg-radial from-[#2E2E2E] via-[#242424] to-[#171717] opacity-90" />

      {/* Layer 2: Deep Atmospheric Valley Horizon (Moves slowest) */}
      <div
        className="absolute -inset-x-12 -top-12 h-[120vh] will-change-transform opacity-35"
        style={{
          transform: `translate3d(0, ${bgOffset}px, 0)`,
        }}
      >
        <svg
          viewBox="0 0 1440 800"
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
        >
          <path
            d="M0 450 Q 360 380 720 430 T 1440 400 L 1440 800 L 0 800 Z"
            fill="#1A1A1A"
          />
          <path
            d="M0 520 Q 480 440 960 510 T 1440 480 L 1440 800 L 0 800 Z"
            fill="#141414"
          />
        </svg>
      </div>

      {/* Layer 3: Soft Luminous Lunar Mist Sphere */}
      <div
        className="absolute top-[12%] right-[18%] w-80 h-80 rounded-full blur-3xl opacity-20 bg-radial from-[#FFFFFF] via-[#C0C0C0] to-transparent will-change-transform"
        style={{
          transform: `translate3d(0, ${bgOffset * 1.5}px, 0)`,
        }}
      />

      {/* Layer 4: Organic Midground Ridge Silhouettes */}
      {showMistyCanopy && (
        <div
          className="absolute -inset-x-8 bottom-0 h-[65vh] will-change-transform opacity-45"
          style={{
            transform: `translate3d(0, ${midOffset}px, 0)`,
          }}
        >
          <svg
            viewBox="0 0 1440 600"
            className="w-full h-full object-cover"
            preserveAspectRatio="none"
          >
            {/* Soft Organic Canopy Contours */}
            <path
              d="M-40 280 C 180 220 320 340 540 260 C 760 180 940 320 1200 240 C 1360 190 1480 270 1520 280 L 1520 600 L -40 600 Z"
              fill="#181818"
            />
            {/* Subtle Caustic Wave Line Highlights in Moonlight Silver */}
            <path
              d="M-40 280 C 180 220 320 340 540 260 C 760 180 940 320 1200 240 C 1360 190 1480 270 1520 280"
              fill="none"
              stroke="#C0C0C0"
              strokeWidth="0.75"
              opacity="0.2"
            />
          </svg>
        </div>
      )}

      {/* Layer 5: Ambient Floating Mist Bands (Fastest subtle drift) */}
      <div
        className="absolute -inset-x-12 bottom-0 h-[45vh] will-change-transform opacity-30 mix-blend-screen pointer-events-none"
        style={{
          transform: `translate3d(0, ${fogOffset}px, 0)`,
        }}
      >
        <div className="w-full h-full bg-gradient-to-t from-[#242424] via-[#333333]/20 to-transparent" />
      </div>

      {/* Layer 6: Signal Red 1px Precision Horizon Hairline */}
      <div className="absolute bottom-[18vh] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E10600]/40 to-transparent opacity-60" />
    </div>
  );
}
