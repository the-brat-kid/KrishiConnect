"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Flame,
  CloudRain,
  X,
  ChevronUp,
  RefreshCw,
  Compass,
  Palette,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface DynamicFarmWeatherBackgroundProps {
  className?: string;
  showControls?: boolean;
}

interface EmberParticle {
  id: number;
  left: number;
  bottom: number;
  size: number;
  duration: number;
  delay: number;
  sway: number;
  opacity: number;
}

interface RainParticle {
  id: number;
  left: number;
  top: number;
  height: number;
  duration: number;
  delay: number;
  opacity: number;
}

export interface NanoScene {
  id: string;
  title: string;
  localImg?: string;
  fallbackUrl: string;
  fireflyColor: "amber" | "emerald" | "cyan";
  hasRain: boolean;
  hasMeteors: boolean;
  sunBeamPulse?: boolean;
}

// 7 Minimalist High-Definition Background Themes
export const NANO_BANANA_SCENES: Record<string, NanoScene> = {
  summer: {
    id: "summer",
    title: "Summer Theme",
    localImg: "/farm-sunny-day.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "amber",
    hasRain: false,
    hasMeteors: false,
    sunBeamPulse: true,
  },
  night: {
    id: "night",
    title: "Night Theme",
    localImg: "/starfall-night.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "cyan",
    hasRain: false,
    hasMeteors: true,
  },
  garden: {
    id: "garden",
    title: "Garden Theme",
    fallbackUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "emerald",
    hasRain: false,
    hasMeteors: false,
  },
  monsoon: {
    id: "monsoon",
    title: "Monsoon Theme",
    localImg: "/farm-background.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "emerald",
    hasRain: true,
    hasMeteors: false,
  },
  blossom: {
    id: "blossom",
    title: "Blossom Theme",
    fallbackUrl: "https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "amber",
    hasRain: false,
    hasMeteors: false,
  },
  alpine: {
    id: "alpine",
    title: "Mountain Theme",
    localImg: "/lodge-luxury-background.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "amber",
    hasRain: false,
    hasMeteors: false,
  },
  storm: {
    id: "storm",
    title: "Storm Theme",
    fallbackUrl: "https://images.unsplash.com/photo-1511289081-d06dda19034d?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "cyan",
    hasRain: true,
    hasMeteors: false,
  },
};

const SCENE_KEYS = Object.keys(NANO_BANANA_SCENES);

/**
 * Maps live meteorological condition from NASA / Open-Meteo into matching theme
 */
function determineWeatherTheme(weather: {
  condition?: string;
  isDay?: boolean;
  precipitationMm?: number;
  temp?: number;
  cloudFractionPct?: number;
}): string {
  const cond = (weather.condition || "").toLowerCase();
  const rain = weather.precipitationMm ?? 0;
  const isDay = weather.isDay !== undefined ? weather.isDay : true;
  const temp = weather.temp ?? 27;

  // 1. Regional Night
  if (!isDay) return "night";

  // 2. Active Rain / Showers / Monsoonal precipitation
  if (rain > 0.1 || cond.includes("rain") || cond.includes("drizzle") || cond.includes("shower")) {
    return "monsoon";
  }

  // 3. Thunderstorm
  if (cond.includes("thunder") || cond.includes("storm") || cond.includes("zap")) {
    return "storm";
  }

  // 4. Fog / Mist / Dense Overcast
  if (cond.includes("fog") || cond.includes("mist") || (weather.cloudFractionPct && weather.cloudFractionPct > 80)) {
    return "alpine";
  }

  // 5. Hot / Sunny / Summer Wheat harvest
  if (temp >= 29 || cond.includes("sun") || cond.includes("clear")) {
    return "summer";
  }

  // 6. Pleasant / Mild / Garden
  return "garden";
}

export function DynamicFarmWeatherBackground({
  className = "",
  showControls = true,
}: DynamicFarmWeatherBackgroundProps) {
  const { selectedMandiObj, selectedState } = useLanguage();

  // Active theme and blur cross-fade states - default to Summer (Bright Sunny Day)
  const [activeSceneKey, setActiveSceneKey] = useState<string>("summer");
  const [outgoingSceneKey, setOutgoingSceneKey] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto weather sync state (default false to keep user's bright daytime choice)
  const [isWeatherAuto, setIsWeatherAuto] = useState<boolean>(false);
  const [liveWeather, setLiveWeather] = useState<{
    condition: string;
    temp: number;
    isDay: boolean;
    precipitationMm: number;
    mandiName: string;
    stateName: string;
  } | null>(null);

  // Atmospheric particle states
  const [showEmbers, setShowEmbers] = useState<boolean>(true);
  const [showRain, setShowRain] = useState<boolean>(false);
  const [showMeteors, setShowMeteors] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  // Bottom-Left Theme Popover state
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Parallax container ref
  const parallaxRef = useRef<HTMLDivElement>(null);

  // Apply a theme with super-smooth cinematic blur-out GPU transition
  const applyThemeWithBlur = useCallback((targetKey: string, isManualChoice = false) => {
    setActiveSceneKey((currentActive) => {
      if (targetKey === currentActive) return currentActive;

      // Cancel previous transition timer if rapid clicks occur
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }

      // Stage outgoing scene for smooth blur cross-fade
      setOutgoingSceneKey(currentActive);
      setIsTransitioning(true);

      // Transition completes at 1000ms
      transitionTimerRef.current = setTimeout(() => {
        setOutgoingSceneKey(null);
        setIsTransitioning(false);
      }, 1000);

      return targetKey;
    });

    if (isManualChoice) {
      setIsWeatherAuto(false);
      try {
        localStorage.setItem("krishi-bg-auto", "false");
        localStorage.setItem("krishi-nano-scene", targetKey);
      } catch {}
    }
  }, []);

  // Preload all 7 high-definition scenes into browser GPU cache for instant, zero-delay switching
  useEffect(() => {
    if (typeof window === "undefined") return;
    SCENE_KEYS.forEach((key) => {
      const sc = NANO_BANANA_SCENES[key];
      if (sc) {
        if (sc.localImg) {
          const img = new Image();
          img.src = sc.localImg;
        }
        if (sc.fallbackUrl) {
          const img = new Image();
          img.src = sc.fallbackUrl;
        }
      }
    });
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // Initialize preferences from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedAuto = localStorage.getItem("krishi-bg-auto");
      const isAuto = savedAuto === "true";
      setIsWeatherAuto(isAuto);

      const savedScene = localStorage.getItem("krishi-nano-scene");
      if (savedScene && NANO_BANANA_SCENES[savedScene]) {
        setActiveSceneKey(savedScene);
      } else {
        setActiveSceneKey("summer");
      }

      const savedEmbers = localStorage.getItem("krishi-nano-embers");
      if (savedEmbers !== null) setShowEmbers(savedEmbers === "true");

      const savedRain = localStorage.getItem("krishi-nano-rain");
      if (savedRain !== null) setShowRain(savedRain === "true");
    } catch {}
  }, []);

  // Fetch live NASA & regional weather for the selected mandi
  useEffect(() => {
    let isCancelled = false;

    async function fetchRegionalWeather() {
      if (!selectedMandiObj) return;

      try {
        const query = new URLSearchParams({
          lat: selectedMandiObj.lat.toString(),
          lon: selectedMandiObj.lon.toString(),
          name: selectedMandiObj.name,
          state: selectedMandiObj.state || selectedState || "Odisha",
        });

        const res = await fetch(`/api/weather?${query.toString()}`);
        if (!res.ok) return;

        const data = await res.json();
        if (isCancelled || !data?.current) return;

        const current = data.current;
        const telemetry = {
          condition: current.condition || "Partly Cloudy",
          temp: current.temp ?? 28,
          isDay: current.isDay ?? true,
          precipitationMm: current.precipitationMm ?? 0,
          mandiName: selectedMandiObj.name,
          stateName: selectedMandiObj.state || selectedState,
        };

        setLiveWeather(telemetry);

        // If in Auto Weather mode, automatically calibrate the background theme
        const savedAuto = localStorage.getItem("krishi-bg-auto");
        if (savedAuto === "true") {
          const matchedTheme = determineWeatherTheme(current);
          applyThemeWithBlur(matchedTheme, false);
        }
      } catch (err) {
        // Fallback: estimate day/night from local client clock
        const hr = new Date().getHours();
        const isClientNight = hr < 6 || hr >= 18;
        setLiveWeather((prev) =>
          prev || {
            condition: isClientNight ? "Clear Night" : "Daylight Agro Farm",
            temp: 28,
            isDay: !isClientNight,
            precipitationMm: 0,
            mandiName: selectedMandiObj?.name || "APMC Mandi",
            stateName: selectedState || "India",
          }
        );
      }
    }

    fetchRegionalWeather();
    return () => {
      isCancelled = true;
    };
  }, [selectedMandiObj, selectedState, applyThemeWithBlur]);

  // Update rain and meteor particles when the active scene changes
  useEffect(() => {
    const sc = NANO_BANANA_SCENES[activeSceneKey] || NANO_BANANA_SCENES.night;
    setShowRain(sc.hasRain);
    setShowMeteors(sc.hasMeteors);
  }, [activeSceneKey]);

  // Click-outside listener to close bottom-left popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setIsThemeMenuOpen(false);
      }
    }
    if (isThemeMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isThemeMenuOpen]);

  // Interactive 3D mouse parallax (throttled by requestAnimationFrame, stops when idle)
  useEffect(() => {
    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isRunning = false;

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      if (parallaxRef.current) {
        const moveX = (currentX * -12).toFixed(2);
        const moveY = (currentY * -8).toFixed(2);
        parallaxRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      }

      const diffX = Math.abs(targetX - currentX);
      const diffY = Math.abs(targetY - currentY);
      if (diffX > 0.002 || diffY > 0.002) {
        animationFrameId = requestAnimationFrame(updateParallax);
      } else {
        isRunning = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    isRunning = true;
    animationFrameId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Quick 1-click cycle to the next background
  const handleCycleNextScene = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 650);

    const keys = SCENE_KEYS;
    const currentIdx = keys.indexOf(activeSceneKey);
    const nextIdx = (currentIdx + 1) % keys.length;
    applyThemeWithBlur(keys[nextIdx], true);
  };

  const handleToggleEmbers = () => {
    const next = !showEmbers;
    setShowEmbers(next);
    try {
      localStorage.setItem("krishi-nano-embers", String(next));
    } catch {}
  };

  const handleToggleRain = () => {
    const next = !showRain;
    setShowRain(next);
    try {
      localStorage.setItem("krishi-nano-rain", String(next));
    } catch {}
  };

  const handleToggleAutoWeather = () => {
    const next = !isWeatherAuto;
    setIsWeatherAuto(next);
    try {
      localStorage.setItem("krishi-bg-auto", String(next));
    } catch {}

    if (next && liveWeather) {
      const matched = determineWeatherTheme(liveWeather);
      applyThemeWithBlur(matched, false);
    }
  };

  // Generate 26 floating organic bio-luminescent fireflies
  const embers = useMemo<EmberParticle[]>(() => {
    const items: EmberParticle[] = [];
    const count = 26;
    for (let i = 0; i < count; i++) {
      const seed1 = (i * 19 + 11) % 100;
      const seed2 = (i * 23 + 29) % 100;
      const seed3 = (i * 31 + 7) % 100;
      const seed4 = (i * 43 + 17) % 100;

      items.push({
        id: i,
        left: 2 + (seed1 / 100) * 96,
        bottom: -5 - (seed2 % 25),
        size: 2.2 + (seed3 % 3) * 0.95,
        duration: 10 + (seed4 % 9),
        delay: (i * 0.8) % 11,
        sway: (seed2 % 2 === 0 ? 1 : -1) * (22 + (seed3 % 28)),
        opacity: 0.6 + (seed4 % 38) / 100,
      });
    }
    return items;
  }, []);

  // Generate 32 gentle monsoonal rain streaks
  const rainStreaks = useMemo<RainParticle[]>(() => {
    const items: RainParticle[] = [];
    const count = 32;
    for (let i = 0; i < count; i++) {
      const seed1 = (i * 29 + 13) % 100;
      const seed2 = (i * 37 + 19) % 100;
      const seed3 = (i * 41 + 23) % 100;
      const seed4 = (i * 47 + 31) % 100;

      items.push({
        id: i,
        left: (seed1 / 100) * 100,
        top: -10 - (seed2 % 20),
        height: 38 + (seed3 % 30),
        duration: 1.1 + (seed4 % 8) * 0.1,
        delay: (i * 0.12) % 2.5,
        opacity: 0.35 + (seed3 % 35) / 100,
      });
    }
    return items;
  }, []);

  const activeScene = NANO_BANANA_SCENES[activeSceneKey] || NANO_BANANA_SCENES.night;
  const outgoingScene = outgoingSceneKey ? NANO_BANANA_SCENES[outgoingSceneKey] : null;

  // Luminescent firefly color gradient mapping
  const emberGradient =
    activeScene.fireflyColor === "emerald"
      ? "radial-gradient(circle, #a7f3d0 0%, #10b981 55%, rgba(16, 185, 129, 0) 100%)"
      : activeScene.fireflyColor === "cyan"
      ? "radial-gradient(circle, #a5f3fc 0%, #06b6d4 55%, rgba(6, 182, 212, 0) 100%)"
      : "radial-gradient(circle, #fef08a 0%, #f59e0b 55%, rgba(245, 158, 11, 0) 100%)";

  const emberBoxShadow =
    activeScene.fireflyColor === "emerald"
      ? "0 0 10px 2px rgba(16, 185, 129, 0.6), 0 0 22px 5px rgba(5, 150, 105, 0.25)"
      : activeScene.fireflyColor === "cyan"
      ? "0 0 10px 2px rgba(6, 182, 212, 0.6), 0 0 22px 5px rgba(8, 145, 178, 0.25)"
      : "0 0 10px 2px rgba(245, 158, 11, 0.55), 0 0 22px 5px rgba(217, 119, 6, 0.25)";

  // Image URL helper prioritizing local file, with graceful remote fallback
  const getImageUrl = (scene: NanoScene) => scene.localImg || scene.fallbackUrl;

  const isNightScene = activeSceneKey === "night" || activeSceneKey === "storm";
  const isSummerScene = activeSceneKey === "summer";

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FULLSCREEN BACKGROUND VISUALS (z-0, Non-blocking, Never Traps UI)       */}
      {/* ========================================================================= */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-colors duration-1000 ${
          isSummerScene ? "bg-[#142c1c]" : "bg-[#050b08]"
        } ${className}`}
      >
        {/* Parallax Container for Interactive Depth */}
        <div ref={parallaxRef} className="absolute -inset-6 pointer-events-none will-change-transform">
          {/* Outgoing Scene (Hardware-accelerated Smooth Blur Out) */}
          {outgoingScene && (
            <div
              key={`prev-${outgoingSceneKey}`}
              className="absolute inset-0 bg-cover bg-center pointer-events-none will-change-transform animate-smooth-blur-out"
              style={{
                backgroundImage: `url('${getImageUrl(outgoingScene)}'), url('${outgoingScene.fallbackUrl}')`,
                backgroundPosition: "center 38%",
                backgroundSize: "cover",
              }}
            />
          )}

          {/* Active Scene (Transitions In with Hardware-accelerated Smooth Blur In) */}
          <div
            key={`active-${activeSceneKey}`}
            className={`absolute inset-0 bg-cover bg-center will-change-transform ${
              isTransitioning ? "animate-smooth-blur-in" : "animate-lodge-breathe"
            }`}
            style={{
              backgroundImage: `url('${getImageUrl(activeScene)}'), url('${activeScene.fallbackUrl}')`,
              backgroundPosition: "center 38%",
              backgroundSize: "cover",
            }}
          />

          {/* Ambient Dream-Blur Pulse Overlay (Seamlessly dissolves transitions) */}
          {isTransitioning && (
            <div
              key={`dream-pulse-${activeSceneKey}`}
              className="absolute inset-0 pointer-events-none z-10 animate-dream-blur"
            />
          )}

          {/* Deep Obsidian-Emerald Undertone for Night; Natural Warm Daylight for Summer/Day with readability scrim */}
          {isNightScene ? (
            <div className="absolute inset-0 bg-[#040807]/50 dark:bg-[#030705]/65 mix-blend-multiply pointer-events-none" />
          ) : isSummerScene ? (
            <div className="absolute inset-0 pointer-events-none">
              {/* Contrast scrim for text readability over bright sunny photos */}
              <div className="absolute inset-0 bg-black/40 dark:bg-black/55 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-sky-400/10 via-amber-100/5 to-emerald-950/30 pointer-events-none" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/40 dark:bg-black/50 pointer-events-none" />
          )}

          {/* Rolling 3D Mountain / Valley Mist Drifts */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-45 dark:opacity-40">
            <div
              className="absolute -inset-x-[35%] top-[38%] h-[48%] animate-mist-slow pointer-events-none will-change-transform"
              style={{
                background:
                  "radial-gradient(ellipse 75% 35% at 50% 50%, rgba(220, 245, 235, 0.22) 0%, rgba(180, 220, 210, 0.09) 50%, transparent 80%)",
                filter: "blur(26px)",
              }}
            />
            <div
              className="absolute -inset-x-[30%] top-[14%] h-[42%] animate-mist-fast pointer-events-none will-change-transform"
              style={{
                background:
                  "radial-gradient(ellipse 65% 30% at 50% 45%, rgba(240, 250, 245, 0.15) 0%, rgba(200, 230, 220, 0.06) 55%, transparent 75%)",
                filter: "blur(32px)",
              }}
            />
          </div>

          {/* Volumetric Sunbeam / Hearth Glow */}
          <div
            className="absolute inset-0 pointer-events-none animate-hearth-pulse"
            style={{
              background:
                activeScene.fireflyColor === "cyan"
                  ? "radial-gradient(ellipse 65% 35% at 50% 88%, rgba(6, 182, 212, 0.12) 0%, rgba(8, 145, 178, 0.05) 45%, transparent 75%)"
                  : activeScene.fireflyColor === "emerald"
                  ? "radial-gradient(ellipse 65% 35% at 50% 88%, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.05) 45%, transparent 75%)"
                  : "radial-gradient(ellipse 65% 35% at 50% 88%, rgba(245, 158, 11, 0.14) 0%, rgba(217, 119, 6, 0.06) 45%, transparent 75%)",
            }}
          />

          {/* Live Monsoon Rain Streaks */}
          {showRain && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {rainStreaks.map((r) => (
                <span
                  key={r.id}
                  className="nano-rain-streak"
                  style={
                    {
                      left: `${r.left}%`,
                      top: `${r.top}%`,
                      height: `${r.height}px`,
                      opacity: r.opacity,
                      "--rain-duration": `${r.duration}s`,
                      "--rain-delay": `${r.delay}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}

          {/* Night Sky Shooting Stars (Meteors) */}
          {showMeteors && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="lodge-meteor" />
              <div className="lodge-meteor lodge-meteor-delayed" />
            </div>
          )}

          {/* Floating Bioluminescent Fireflies / Warm Pollen */}
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
                      background: emberGradient,
                      boxShadow: emberBoxShadow,
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

        {/* Contrast Mask for Text Legibility (Deep for Night, Crisp for Summer) */}
        {isSummerScene ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent dark:from-[#050b08]/90 dark:via-[#050b08]/25 dark:to-transparent pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-black/75 via-black/35 to-transparent pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-background/60 dark:from-[#050b08]/90 dark:via-[#030605]/35 dark:to-[#040807]/75 backdrop-blur-[0.5px]" />
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-background/70 via-background/25 to-transparent dark:from-black/80 dark:via-black/20 dark:to-transparent pointer-events-none" />
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. BOTTOM-LEFT INTERACTIVE THEME CONTROLLER (z-[70] Above All Layers)     */}
      {/* ========================================================================= */}
      {showControls && mounted && (
        <div
          ref={menuContainerRef}
          className="pointer-events-auto fixed bottom-20 md:bottom-5 left-3 sm:left-5 z-[70] select-none flex flex-col items-start font-sans"
        >
          {/* Popover Menu: Opens directly above the bottom-left button */}
          {isThemeMenuOpen && (
            <div className="mb-2 w-[260px] rounded-2xl bg-black/90 dark:bg-[#070d0a]/95 backdrop-blur-2xl border border-white/15 p-3 shadow-2xl text-white space-y-2.5 animate-theme-menu-in">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 px-0.5">
                <span className="text-xs font-semibold text-white/90 tracking-wide">Theme</span>
                <button
                  type="button"
                  onClick={() => setIsThemeMenuOpen(false)}
                  className="h-5 w-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              {/* Auto Weather Row */}
              <button
                type="button"
                onClick={handleToggleAutoWeather}
                className={`w-full px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isWeatherAuto
                    ? "bg-emerald-500/20 border-emerald-400/50 text-white"
                    : "bg-white/[0.04] border-white/10 text-white/70 hover:bg-white/[0.08]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Compass className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-medium">Auto Weather</span>
                </div>
                <div
                  className={`w-7 h-4 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                    isWeatherAuto ? "bg-emerald-500 justify-end" : "bg-white/20 justify-start"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-white shadow-xs block" />
                </div>
              </button>

              {/* Theme Grid */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                {SCENE_KEYS.map((key) => {
                  const sc = NANO_BANANA_SCENES[key];
                  const isActive = activeSceneKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        applyThemeWithBlur(key, true);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`px-2.5 py-2 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95 ${
                        isActive
                          ? "bg-emerald-500/25 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                          : "bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-white/80"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-emerald-400" : "bg-white/40"}`} />
                      <span className="text-xs font-medium truncate">{sc.title.replace(" Theme", "")}</span>
                    </button>
                  );
                })}
              </div>

              {/* Atmosphere Toggles */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs px-0.5">
                <button
                  type="button"
                  onClick={handleToggleRain}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
                    showRain
                      ? "bg-sky-500/25 text-sky-300 border-sky-400/40"
                      : "bg-white/5 text-white/40 border-white/10 hover:text-white"
                  }`}
                >
                  <CloudRain className="w-3 h-3 text-sky-400" />
                  <span>Rain</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleEmbers}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
                    showEmbers
                      ? "bg-amber-500/25 text-amber-300 border-amber-400/40"
                      : "bg-white/5 text-white/40 border-white/10 hover:text-white"
                  }`}
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Fireflies</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* PRIMARY BOTTOM-LEFT BUTTON PILL (Matches User Screenshot Exactly)      */}
          {/* ======================================================================= */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/85 dark:bg-[#070d0a]/92 backdrop-blur-2xl border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.75)] text-white transition-all hover:bg-black/95 hover:border-emerald-400/50">
            {/* Main Menu Opener Pill */}
            <button
              type="button"
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 transition-all font-semibold text-white cursor-pointer shadow-xs group"
              title="Theme"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-sans text-xs font-semibold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                {activeScene.title.replace(" Theme", "")}
              </span>
              <ChevronUp
                className={`w-3.5 h-3.5 text-emerald-400 transition-transform duration-200 ${
                  isThemeMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Quick 1-Click Cycle Button */}
            <button
              type="button"
              onClick={handleCycleNextScene}
              className="p-1.5 rounded-full bg-white/5 hover:bg-emerald-500/25 text-white/80 hover:text-emerald-300 transition-all cursor-pointer border border-transparent hover:border-emerald-400/30 active:scale-90"
              aria-label="Cycle theme"
              title="Next Theme"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-smooth-spin" : "transition-transform duration-300"}`} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default DynamicFarmWeatherBackground;
