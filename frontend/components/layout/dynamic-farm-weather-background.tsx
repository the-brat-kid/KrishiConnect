"use client";

import { useState, useEffect, useMemo } from "react";
import { Mountain, Flame, Eye, EyeOff } from "lucide-react";

interface DynamicFarmWeatherBackgroundProps {
  className?: string;
  showControls?: boolean;
}

interface EmberParticle {
  id: number;
  left: number; // percentage
  bottom: number; // px
  size: number; // px
  duration: number; // seconds
  delay: number; // seconds
  sway: number; // px
  opacity: number;
}

const LODGE_SCENES = {
  ridge: {
    id: "ridge",
    title: "Misty Pine Ridge",
    subtitle: "Moody Alpine Forest",
    localImg: "/lodge-luxury-background.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2560&auto=format&fit=crop",
  },
  cabin: {
    id: "cabin",
    title: "A-Frame Cabin Retreat",
    subtitle: "Wilderness Timber Lodge",
    localImg: "/lodge-cabin-retreat.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=2560&auto=format&fit=crop",
  },
};

type SceneKey = keyof typeof LODGE_SCENES;

export function DynamicFarmWeatherBackground({
  className = "",
  showControls = false,
}: DynamicFarmWeatherBackgroundProps) {
  const [currentScene, setCurrentScene] = useState<SceneKey>("ridge");
  const [showEmbers, setShowEmbers] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Synchronize initial preference from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const savedScene = localStorage.getItem("krishi-lodge-scene") as SceneKey;
      if (savedScene && LODGE_SCENES[savedScene]) {
        setCurrentScene(savedScene);
      }
      const savedEmbers = localStorage.getItem("krishi-lodge-embers");
      if (savedEmbers !== null) {
        setShowEmbers(savedEmbers === "true");
      }
    } catch {
      // localStorage may fail in private mode or SSR
    }
  }, []);

  const handleSceneChange = (scene: SceneKey) => {
    setCurrentScene(scene);
    try {
      localStorage.setItem("krishi-lodge-scene", scene);
    } catch {}
  };

  const handleToggleEmbers = () => {
    const next = !showEmbers;
    setShowEmbers(next);
    try {
      localStorage.setItem("krishi-lodge-embers", String(next));
    } catch {}
  };

  // Generate 18 organic floating warm firefly embers
  const embers = useMemo<EmberParticle[]>(() => {
    const items: EmberParticle[] = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random generation to avoid SSR hydration mismatches
      const seed1 = (i * 17 + 13) % 100;
      const seed2 = (i * 23 + 29) % 100;
      const seed3 = (i * 31 + 7) % 100;
      const seed4 = (i * 41 + 19) % 100;

      items.push({
        id: i,
        left: 4 + (seed1 / 100) * 92, // 4% to 96%
        bottom: -5 - (seed2 % 15), // -5px to -20px
        size: 2.5 + (seed3 % 3) * 0.8, // 2.5px to 4.9px
        duration: 13 + (seed4 % 9), // 13s to 21s
        delay: (i * 1.1) % 12, // 0s to 11s staggered
        sway: (seed2 % 2 === 0 ? 1 : -1) * (18 + (seed3 % 26)), // -44px to +44px
        opacity: 0.55 + (seed4 % 35) / 100, // 0.55 to 0.90
      });
    }
    return items;
  }, []);

  const activeSceneConfig = LODGE_SCENES[currentScene] || LODGE_SCENES.ridge;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#050b08] ${className}`}
    >
      {/* 1. Base High-Definition Moody Mountain Forest Landscape */}
      <div
        className="absolute inset-[-4%] bg-cover bg-center transition-all duration-1000 ease-out animate-lodge-breathe will-change-transform"
        style={{
          backgroundImage: `url('${activeSceneConfig.localImg}'), url('${activeSceneConfig.fallbackUrl}')`,
          backgroundPosition: "center 38%",
          backgroundSize: "cover",
        }}
      />

      {/* 2. Deep Obsidian-Emerald Ambient Undertone */}
      <div className="absolute inset-0 bg-[#040807]/35 dark:bg-[#030705]/50 mix-blend-multiply" />

      {/* 3. Layered Rolling Mountain Mist / Fog Drifts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-35">
        {/* Lower Ridge Floating Valley Fog Bank */}
        <div
          className="absolute -inset-x-[30%] top-[40%] h-[45%] animate-mist-slow pointer-events-none will-change-transform"
          style={{
            background:
              "radial-gradient(ellipse 70% 35% at 50% 50%, rgba(220, 245, 235, 0.18) 0%, rgba(180, 220, 210, 0.08) 50%, transparent 80%)",
            filter: "blur(24px)",
          }}
        />
        {/* Upper Mountain Whispering Clouds Drift */}
        <div
          className="absolute -inset-x-[25%] top-[15%] h-[40%] animate-mist-fast pointer-events-none will-change-transform"
          style={{
            background:
              "radial-gradient(ellipse 60% 30% at 50% 45%, rgba(240, 250, 245, 0.12) 0%, rgba(200, 230, 220, 0.05) 55%, transparent 75%)",
            filter: "blur(30px)",
          }}
        />
      </div>

      {/* 4. Warm Volumetric Horizon / Lodge Hearth Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 35% at 50% 88%, rgba(245, 158, 11, 0.13) 0%, rgba(217, 119, 6, 0.05) 45%, transparent 75%)",
        }}
      />

      {/* 5. Floating Cozy Cabin Embers & Fireflies */}
      {showEmbers && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {embers.map((e) => (
            <span
              key={e.id}
              className="lodge-ember"
              style={
                {
                  left: `${e.left}%`,
                  bottom: `${e.bottom}px`,
                  width: `${e.size}px`,
                  height: `${e.size}px`,
                  "--ember-duration": `${e.duration}s`,
                  "--ember-delay": `${e.delay}s`,
                  "--ember-sway": `${e.sway}px`,
                  "--ember-opacity": e.opacity,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* 6. Precision Apple-Grade Vignette & Contrast Mask (Dual-Mode Legibility) */}
      {/* Dark Mode: Deep obsidian frames with soft emerald mist undertone */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-background/60 dark:from-[#050b08]/90 dark:via-[#030605]/35 dark:to-[#040807]/75 backdrop-blur-[0.5px]" />

      {/* Top Header Scrim Gradient for Razor-Sharp Navigation Legibility */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-background/70 via-background/25 to-transparent dark:from-black/80 dark:via-black/20 dark:to-transparent pointer-events-none" />

      {/* 7. Interactive Ambient Scene Pill Controller (Only when showControls is true) */}
      {showControls && mounted && (
        <div className="pointer-events-auto fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-black/60 dark:bg-black/70 backdrop-blur-xl border border-white/10 shadow-2xl text-[11px] text-white/80 transition-all hover:bg-black/80">
          <button
            type="button"
            onClick={() => handleSceneChange(currentScene === "ridge" ? "cabin" : "ridge")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all font-medium text-white shadow-xs"
            title="Toggle Moody Alpine Ridge / Wilderness Cabin Retreat"
          >
            <Mountain className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline font-mono text-[10px] tracking-wide">
              {currentScene === "ridge" ? "Alpine Mist" : "Cabin Retreat"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleToggleEmbers}
            className={`p-1.5 rounded-full transition-all ${
              showEmbers
                ? "bg-amber-500/25 text-amber-300 hover:bg-amber-500/35"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
            }`}
            title={showEmbers ? "Disable Fireflies & Embers" : "Enable Fireflies & Embers"}
            aria-label="Toggle embers"
          >
            {showEmbers ? <Flame className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}
