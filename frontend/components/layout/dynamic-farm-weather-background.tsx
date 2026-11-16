"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Mountain, Flame, EyeOff, Sparkles } from "lucide-react";

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
  const [showMeteors, setShowMeteors] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Parallax container ref for smooth, zero-re-render mouse movement
  const parallaxRef = useRef<HTMLDivElement>(null);

  // Synchronize initial preferences from localStorage
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
      const savedMeteors = localStorage.getItem("krishi-lodge-meteors");
      if (savedMeteors !== null) {
        setShowMeteors(savedMeteors === "true");
      }
    } catch {
      // localStorage may fail in SSR / incognito
    }
  }, []);

  // Subtle interactive 3D mouse parallax (throttled by requestAnimationFrame, 0 React re-renders)
  useEffect(() => {
    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to range [-1, 1]
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const updateParallax = () => {
      // Smooth lerp easing
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      if (parallaxRef.current) {
        const moveX = (currentX * -12).toFixed(2);
        const moveY = (currentY * -8).toFixed(2);
        parallaxRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
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

  const handleToggleMeteors = () => {
    const next = !showMeteors;
    setShowMeteors(next);
    try {
      localStorage.setItem("krishi-lodge-meteors", String(next));
    } catch {}
  };

  // Generate 24 organic floating warm firefly embers with staggered trajectories
  const embers = useMemo<EmberParticle[]>(() => {
    const items: EmberParticle[] = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const seed1 = (i * 17 + 13) % 100;
      const seed2 = (i * 23 + 29) % 100;
      const seed3 = (i * 31 + 7) % 100;
      const seed4 = (i * 41 + 19) % 100;

      items.push({
        id: i,
        left: 3 + (seed1 / 100) * 94, // 3% to 97% across width
        bottom: -5 - (seed2 % 25), // -5px to -30px
        size: 2.2 + (seed3 % 3) * 0.9, // 2.2px to 4.9px
        duration: 11 + (seed4 % 9), // 11s to 20s ascending float
        delay: (i * 0.85) % 12, // 0s to 11.5s staggered
        sway: (seed2 % 2 === 0 ? 1 : -1) * (20 + (seed3 % 28)), // -48px to +48px horizontal sway
        opacity: 0.6 + (seed4 % 35) / 100, // 0.60 to 0.95
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
      {/* Parallax Container for Interactive Depth */}
      <div ref={parallaxRef} className="absolute -inset-6 pointer-events-none will-change-transform">
        {/* 1. Base Cinematic Mountain Forest Landscape (Ken-Burns Pan & Breathe) */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out animate-lodge-breathe will-change-transform"
          style={{
            backgroundImage: `url('${activeSceneConfig.localImg}'), url('${activeSceneConfig.fallbackUrl}')`,
            backgroundPosition: "center 38%",
            backgroundSize: "cover",
          }}
        />

        {/* 2. Deep Obsidian-Emerald Ambient Undertone */}
        <div className="absolute inset-0 bg-[#040807]/35 dark:bg-[#030705]/50 mix-blend-multiply" />

        {/* 3. Layered Rolling Mountain Mist / Fog Drifts */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-45 dark:opacity-40">
          {/* Lower Ridge Floating Valley Fog Bank */}
          <div
            className="absolute -inset-x-[35%] top-[38%] h-[48%] animate-mist-slow pointer-events-none will-change-transform"
            style={{
              background:
                "radial-gradient(ellipse 75% 35% at 50% 50%, rgba(220, 245, 235, 0.22) 0%, rgba(180, 220, 210, 0.09) 50%, transparent 80%)",
              filter: "blur(26px)",
            }}
          />
          {/* Upper Mountain Whispering Clouds Drift */}
          <div
            className="absolute -inset-x-[30%] top-[14%] h-[42%] animate-mist-fast pointer-events-none will-change-transform"
            style={{
              background:
                "radial-gradient(ellipse 65% 30% at 50% 45%, rgba(240, 250, 245, 0.15) 0%, rgba(200, 230, 220, 0.06) 55%, transparent 75%)",
              filter: "blur(32px)",
            }}
          />
        </div>

        {/* 4. Warm Volumetric Horizon / Lodge Hearth Glow (Breathing Hearth Pulse) */}
        <div
          className="absolute inset-0 pointer-events-none animate-hearth-pulse"
          style={{
            background:
              "radial-gradient(ellipse 65% 35% at 50% 88%, rgba(245, 158, 11, 0.14) 0%, rgba(217, 119, 6, 0.06) 45%, transparent 75%)",
          }}
        />

        {/* 5. Cinematic Night Sky Shooting Stars (Meteors) */}
        {showMeteors && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="lodge-meteor" />
            <div className="lodge-meteor lodge-meteor-delayed" />
          </div>
        )}

        {/* 6. Floating Cozy Cabin Embers & Fireflies (Luminescent Twinkling) */}
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
      </div>

      {/* 7. Precision Apple-Grade Vignette & Contrast Mask (Dual-Mode Legibility) */}
      {/* Dark Mode: Deep obsidian frames with soft emerald mist undertone */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-background/60 dark:from-[#050b08]/90 dark:via-[#030605]/35 dark:to-[#040807]/75 backdrop-blur-[0.5px]" />

      {/* Top Header Scrim Gradient for Razor-Sharp Navigation Legibility */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-background/70 via-background/25 to-transparent dark:from-black/80 dark:via-black/20 dark:to-transparent pointer-events-none" />

      {/* 8. Interactive Ambient Scene Controller Pill (Bottom Right) */}
      {showControls && mounted && (
        <div className="pointer-events-auto fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-black/60 dark:bg-black/75 backdrop-blur-xl border border-white/10 shadow-2xl text-[11px] text-white/80 transition-all hover:bg-black/85">
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

          <button
            type="button"
            onClick={handleToggleMeteors}
            className={`p-1.5 rounded-full transition-all ${
              showMeteors
                ? "bg-cyan-500/25 text-cyan-300 hover:bg-cyan-500/35"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
            }`}
            title={showMeteors ? "Disable Shooting Stars" : "Enable Shooting Stars"}
            aria-label="Toggle shooting stars"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
