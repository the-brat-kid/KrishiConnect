"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  Flame,
  EyeOff,
  CloudRain,
  Wand2,
  X,
  Loader2,
  Wheat,
  Trees,
  Moon,
  Mountain,
  Palette,
  Check,
  ChevronUp,
  RefreshCw,
  Flower2,
} from "lucide-react";

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
  hindiTitle: string;
  subtitle: string;
  emoji: string;
  localImg: string;
  fallbackUrl: string;
  fireflyColor: "amber" | "emerald" | "cyan";
  hasRain: boolean;
  hasMeteors: boolean;
}

export const NANO_BANANA_SCENES: Record<string, NanoScene> = {
  night: {
    id: "night",
    title: "Night Theme",
    hindiTitle: "तारों भरी रात (नाइट)",
    subtitle: "Starfall Midnight • Glowing Fireflies & Meteors",
    emoji: "🌙",
    localImg: "/farm-night.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "cyan",
    hasRain: false,
    hasMeteors: true,
  },
  garden: {
    id: "garden",
    title: "Garden Theme",
    hindiTitle: "हरा-भरा बगीचा (गार्डन)",
    subtitle: "Botanical Garden • Lush Foliage & Soft Sunlight",
    emoji: "🌿",
    localImg: "/farm-background.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "emerald",
    hasRain: false,
    hasMeteors: false,
  },
  golden: {
    id: "golden",
    title: "Golden Farm",
    hindiTitle: "स्वर्ण फसल (गोल्डन फार्म)",
    subtitle: "Sunlit Wheat Horizon • Golden Hour Pollen",
    emoji: "🌾",
    localImg: "/farm-day.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "amber",
    hasRain: false,
    hasMeteors: false,
  },
  monsoon: {
    id: "monsoon",
    title: "Monsoon Rain",
    hindiTitle: "मॉनसून वर्षा व धान",
    subtitle: "Emerald Rice Terraces • Live Rain Streaks & Mist",
    emoji: "🌧️",
    localImg: "/farm-background.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "emerald",
    hasRain: true,
    hasMeteors: false,
  },
  blossom: {
    id: "blossom",
    title: "Blossom Orchard",
    hindiTitle: "फूलों का बाग (ब्लॉसम)",
    subtitle: "Spring Orchard Garden • Floral Breezes",
    emoji: "🌸",
    localImg: "/farm-day.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "amber",
    hasRain: false,
    hasMeteors: false,
  },
  alpine: {
    id: "alpine",
    title: "Misty Mountain",
    hindiTitle: "पर्वतीय वादियां (माउंटेन)",
    subtitle: "Alpine Forest Valley • Rolling Mountain Mist",
    emoji: "🌄",
    localImg: "/lodge-luxury-background.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "amber",
    hasRain: false,
    hasMeteors: false,
  },
};

const SCENE_KEYS = Object.keys(NANO_BANANA_SCENES);

export function DynamicFarmWeatherBackground({
  className = "",
  showControls = true,
}: DynamicFarmWeatherBackgroundProps) {
  const [currentSceneKey, setCurrentSceneKey] = useState<string>("night");
  const [customScene, setCustomScene] = useState<NanoScene | null>(null);
  const [showEmbers, setShowEmbers] = useState(true);
  const [showRain, setShowRain] = useState(false);
  const [showMeteors, setShowMeteors] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Bottom-Left Theme Menu Popover State
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // AI Prompt Modal State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorMessage, setGeneratorMessage] = useState("");

  const parallaxRef = useRef<HTMLDivElement>(null);

  // Synchronize initial preferences from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const savedScene = localStorage.getItem("krishi-nano-scene");
      if (savedScene && (NANO_BANANA_SCENES[savedScene] || savedScene === "custom")) {
        setCurrentSceneKey(savedScene);
      }
      const savedCustom = localStorage.getItem("krishi-nano-custom");
      if (savedCustom) {
        setCustomScene(JSON.parse(savedCustom));
      }
      const savedEmbers = localStorage.getItem("krishi-nano-embers");
      if (savedEmbers !== null) setShowEmbers(savedEmbers === "true");

      const savedRain = localStorage.getItem("krishi-nano-rain");
      if (savedRain !== null) setShowRain(savedRain === "true");
    } catch {
      // localStorage fallback
    }
  }, []);

  // Update rain/meteors default whenever active scene changes
  useEffect(() => {
    const sc =
      currentSceneKey === "custom" && customScene
        ? customScene
        : NANO_BANANA_SCENES[currentSceneKey] || NANO_BANANA_SCENES.night;

    if (sc) {
      if (sc.hasRain !== undefined) setShowRain(sc.hasRain);
      if (sc.hasMeteors !== undefined) setShowMeteors(sc.hasMeteors);
    }
  }, [currentSceneKey, customScene]);

  // Click outside listener to close the bottom-left theme menu
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

  // Subtle interactive 3D mouse parallax
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

  const handleSceneChange = (sceneKey: string) => {
    setCurrentSceneKey(sceneKey);
    try {
      localStorage.setItem("krishi-nano-scene", sceneKey);
    } catch {}
  };

  const handleCycleNextScene = () => {
    const keys = SCENE_KEYS;
    const currentIdx = keys.indexOf(currentSceneKey);
    const nextIdx = (currentIdx + 1) % keys.length;
    handleSceneChange(keys[nextIdx]);
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

  // Generate with Nano Banana AI handler
  const handleGenerateAIScene = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim()) return;

    setIsGenerating(true);
    setGeneratorMessage("Prompting Nano Banana & Gemini AI...");

    try {
      const res = await fetch("/api/ai/nano-banana-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptInput }),
      });

      const data = await res.json();
      if (data.success) {
        const theme = data.params?.theme || "garden";
        const basePreset = NANO_BANANA_SCENES[theme] || NANO_BANANA_SCENES.garden;

        const newCustom: NanoScene = {
          id: "custom",
          title: data.params?.title || promptInput.slice(0, 22),
          hindiTitle: "कस्टम AI थीम",
          subtitle: `Nano Banana AI • ${data.params?.subtitle || "Generative Agro Atmosphere"}`,
          emoji: "✨",
          localImg: data.imageUrl || basePreset.localImg,
          fallbackUrl: data.imageUrl || basePreset.fallbackUrl,
          fireflyColor: data.params?.fireflyColor || "emerald",
          hasRain: data.params?.rainEnabled ?? false,
          hasMeteors: theme === "night",
        };

        setCustomScene(newCustom);
        setCurrentSceneKey("custom");
        try {
          localStorage.setItem("krishi-nano-custom", JSON.stringify(newCustom));
          localStorage.setItem("krishi-nano-scene", "custom");
        } catch {}

        setIsGeneratorOpen(false);
        setIsThemeMenuOpen(false);
        setPromptInput("");
      } else {
        setGeneratorMessage("Failed: " + (data.error || "Please try again"));
      }
    } catch (err: any) {
      setGeneratorMessage("Error connecting to Gemini API");
    } finally {
      setIsGenerating(false);
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

  const activeScene =
    currentSceneKey === "custom" && customScene
      ? customScene
      : NANO_BANANA_SCENES[currentSceneKey] || NANO_BANANA_SCENES.night;

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

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#050b08] ${className}`}
    >
      {/* Parallax Container for Interactive Depth */}
      <div ref={parallaxRef} className="absolute -inset-6 pointer-events-none will-change-transform">
        {/* 1. Base Cinematic Nano Banana AI Farm Landscape (Ken-Burns Pan & Breathe) */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out animate-lodge-breathe will-change-transform"
          style={{
            backgroundImage: `url('${activeScene.localImg}'), url('${activeScene.fallbackUrl}')`,
            backgroundPosition: "center 38%",
            backgroundSize: "cover",
          }}
        />

        {/* 2. Deep Obsidian-Emerald Ambient Undertone */}
        <div className="absolute inset-0 bg-[#040807]/35 dark:bg-[#030705]/50 mix-blend-multiply" />

        {/* 3. Layered Rolling Mountain / Valley Mist Drifts */}
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

        {/* 4. Warm Volumetric Golden Hour / Hearth Glow */}
        <div
          className="absolute inset-0 pointer-events-none animate-hearth-pulse"
          style={{
            background:
              activeScene.fireflyColor === "cyan"
                ? "radial-gradient(ellipse 65% 35% at 50% 88%, rgba(6, 182, 212, 0.12) 0%, rgba(8, 145, 178, 0.05) 45%, transparent 75%)"
                : "radial-gradient(ellipse 65% 35% at 50% 88%, rgba(245, 158, 11, 0.14) 0%, rgba(217, 119, 6, 0.06) 45%, transparent 75%)",
          }}
        />

        {/* 5. Live Monsoon Rain Streaks */}
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

        {/* 6. Cinematic Night Sky Shooting Stars (Meteors) */}
        {showMeteors && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="lodge-meteor" />
            <div className="lodge-meteor lodge-meteor-delayed" />
          </div>
        )}

        {/* 7. Floating Bio-Luminescent Fireflies & Pollen Embers */}
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

      {/* 8. Precision Apple-Grade Vignette & Contrast Mask (Dual-Mode Legibility) */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-background/60 dark:from-[#050b08]/90 dark:via-[#030605]/35 dark:to-[#040807]/75 backdrop-blur-[0.5px]" />
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-background/70 via-background/25 to-transparent dark:from-black/80 dark:via-black/20 dark:to-transparent pointer-events-none" />

      {/* ========================================================================= */}
      {/* 9. BOTTOM-LEFT THEME CONTROLLER BUTTON & POPOVER DRAWER (User Requested) */}
      {/* ========================================================================= */}
      {showControls && mounted && (
        <div
          ref={menuContainerRef}
          className="pointer-events-auto fixed bottom-20 md:bottom-5 left-3 sm:left-5 z-40 select-none flex flex-col items-start"
        >
          {/* Popover Menu: Opens directly above the bottom-left button */}
          {isThemeMenuOpen && (
            <div className="mb-2.5 w-[310px] sm:w-[360px] rounded-3xl bg-black/85 dark:bg-[#070d0a]/95 backdrop-blur-2xl border border-white/20 p-3.5 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-white space-y-3 animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Palette className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      Select Theme • बैकग्राउंड चुनें
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      Night, Garden, Farm, Monsoon &amp; More
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsThemeMenuOpen(false)}
                  className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* 6 Theme Grid Cards */}
              <div className="grid grid-cols-2 gap-2 max-h-[290px] overflow-y-auto no-scrollbar pr-0.5">
                {SCENE_KEYS.map((key) => {
                  const sc = NANO_BANANA_SCENES[key];
                  const isActive = currentSceneKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        handleSceneChange(key);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isActive
                          ? "bg-emerald-500/25 border-emerald-400 text-white shadow-[0_0_14px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/50"
                          : "bg-white/[0.04] border-white/10 hover:bg-white/[0.09] hover:border-white/20 text-white/85"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xl">{sc.emoji}</span>
                        {isActive && (
                          <span className="flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500 text-black">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                            <span>ON</span>
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold leading-tight">{sc.title}</div>
                        <div className="text-[9.5px] text-muted-foreground truncate mt-0.5">
                          {sc.hindiTitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer Quick Toggles (Rain, Fireflies, AI Prompt) */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  {/* Rain Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleRain}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-semibold transition-all cursor-pointer ${
                      showRain
                        ? "bg-sky-500/25 text-sky-300 border-sky-400/40"
                        : "bg-white/5 text-white/50 border-white/10 hover:text-white"
                    }`}
                    title="Toggle Live Monsoon Rain Streaks"
                  >
                    <CloudRain className="w-3 h-3 text-sky-400" />
                    <span>Rain</span>
                  </button>

                  {/* Fireflies / Embers Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleEmbers}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-semibold transition-all cursor-pointer ${
                      showEmbers
                        ? "bg-amber-500/25 text-amber-300 border-amber-400/40"
                        : "bg-white/5 text-white/50 border-white/10 hover:text-white"
                    }`}
                    title="Toggle Floating Bioluminescent Fireflies"
                  >
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>Fireflies</span>
                  </button>
                </div>

                {/* AI Generator Prompt Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setIsThemeMenuOpen(false);
                    setIsGeneratorOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold transition-all cursor-pointer"
                  title="Prompt AI for Custom Background"
                >
                  <Wand2 className="w-3 h-3 text-emerald-400" />
                  <span>AI Prompt</span>
                </button>
              </div>
            </div>
          )}

          {/* Primary Bottom-Left Theme Button */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/80 dark:bg-[#070d0a]/90 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.7)] text-[11px] text-white transition-all hover:bg-black/95 hover:border-emerald-400/40">
            {/* Main Menu Opener Pill */}
            <button
              type="button"
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 transition-all font-bold text-white cursor-pointer shadow-xs group"
              title="Click to choose background theme (Night, Garden, Farm, etc.)"
            >
              <span className="text-base leading-none">{activeScene.emoji}</span>
              <span className="font-sans text-xs tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                {activeScene.title}
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
              className="p-1.5 rounded-full bg-white/5 hover:bg-emerald-500/25 text-white/80 hover:text-emerald-300 transition-all cursor-pointer border border-transparent hover:border-emerald-400/30"
              title="Click to immediately switch to next background"
              aria-label="Cycle next theme"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. NANO BANANA AI BACKGROUND CUSTOM PROMPT MODAL                         */}
      {/* ========================================================================= */}
      {isGeneratorOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#090f0c] border border-white/20 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="text-base">🍌</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <span>Nano Banana AI Custom Theme</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Powered by Google Gemini Multimodal Engine
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(false)}
                className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Custom Prompt Input */}
            <form onSubmit={handleGenerateAIScene} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-white/80 block mb-1.5">
                  Enter your scene description:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="e.g. Punjab mustard fields at sunset with fireflies, or Kerala tea garden..."
                    className="w-full rounded-2xl bg-black/60 border border-white/20 px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 pr-9"
                    disabled={isGenerating}
                  />
                  {promptInput && (
                    <button
                      type="button"
                      onClick={() => setPromptInput("")}
                      className="absolute right-2.5 top-2.5 text-white/40 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {generatorMessage && (
                <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                  {generatorMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white/80 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !promptInput.trim()}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-black transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Apply AI Theme</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DynamicFarmWeatherBackground;
