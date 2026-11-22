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
  subtitle: string;
  localImg: string;
  fallbackUrl: string;
  fireflyColor: "amber" | "emerald" | "cyan";
  hasRain: boolean;
  hasMeteors: boolean;
}

const NANO_BANANA_SCENES: Record<string, NanoScene> = {
  golden: {
    id: "golden",
    title: "Golden Harvest",
    subtitle: "Nano Banana AI • Sunlit Wheat Horizon",
    localImg: "/farm-day.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "amber",
    hasRain: false,
    hasMeteors: false,
  },
  monsoon: {
    id: "monsoon",
    title: "Monsoon Paddy",
    subtitle: "Nano Banana AI • Emerald Terraces & Rain",
    localImg: "/farm-background.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "emerald",
    hasRain: true,
    hasMeteors: false,
  },
  night: {
    id: "night",
    title: "Starfall Fireflies",
    subtitle: "Nano Banana AI • Bioluminescent Midnight",
    localImg: "/farm-night.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "cyan",
    hasRain: false,
    hasMeteors: true,
  },
  alpine: {
    id: "alpine",
    title: "Misty Valley Ridge",
    subtitle: "Nano Banana AI • Alpine Tea Terraces",
    localImg: "/lodge-luxury-background.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2560&auto=format&fit=crop",
    fireflyColor: "amber",
    hasRain: false,
    hasMeteors: false,
  },
};

export function DynamicFarmWeatherBackground({
  className = "",
  showControls = false,
}: DynamicFarmWeatherBackgroundProps) {
  const [currentSceneKey, setCurrentSceneKey] = useState<string>("golden");
  const [customScene, setCustomScene] = useState<NanoScene | null>(null);
  const [showEmbers, setShowEmbers] = useState(true);
  const [showRain, setShowRain] = useState(false);
  const [showMeteors, setShowMeteors] = useState(true);
  const [mounted, setMounted] = useState(false);

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

  // Update rain default whenever active scene changes (unless manually toggled)
  useEffect(() => {
    const sc = currentSceneKey === "custom" && customScene ? customScene : NANO_BANANA_SCENES[currentSceneKey];
    if (sc && sc.hasRain !== undefined) {
      setShowRain(sc.hasRain);
    }
    if (sc && sc.hasMeteors !== undefined) {
      setShowMeteors(sc.hasMeteors);
    }
  }, [currentSceneKey, customScene]);

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
        const theme = data.params?.theme || "golden";
        const basePreset = NANO_BANANA_SCENES[theme] || NANO_BANANA_SCENES.golden;

        const newCustom: NanoScene = {
          id: "custom",
          title: data.params?.title || promptInput.slice(0, 24),
          subtitle: `Nano Banana AI • ${data.params?.subtitle || "Generative Agro Atmosphere"}`,
          localImg: data.imageUrl || basePreset.localImg,
          fallbackUrl: data.imageUrl || basePreset.fallbackUrl,
          fireflyColor: data.params?.fireflyColor || "amber",
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
      : NANO_BANANA_SCENES[currentSceneKey] || NANO_BANANA_SCENES.golden;

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

      {/* 9. Interactive Nano Banana AI Scene Controller (Bottom Right) */}
      {showControls && mounted && (
        <div className="pointer-events-auto fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 flex items-center gap-1.5 p-1 rounded-full bg-black/70 dark:bg-black/85 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-[11px] text-white/90 transition-all hover:bg-black/90">
          {/* Active Scene Badge & Quick Cycle */}
          <div className="flex items-center gap-1 pr-1">
            <button
              type="button"
              onClick={() => {
                const keys = ["golden", "monsoon", "night", "alpine"];
                const nextIdx = (keys.indexOf(currentSceneKey) + 1) % keys.length;
                handleSceneChange(keys[nextIdx]);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-amber-500/20 hover:from-emerald-500/30 hover:to-amber-500/30 border border-emerald-400/30 transition-all font-semibold text-white cursor-pointer shadow-xs"
              title="Click to cycle Nano Banana AI background scenes"
            >
              <span className="text-sm">🍌</span>
              <span className="font-mono text-[10.5px] tracking-wide text-emerald-300">
                {activeScene.title}
              </span>
            </button>
          </div>

          {/* Rain / Monsoon Streaks Toggle */}
          <button
            type="button"
            onClick={handleToggleRain}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              showRain
                ? "bg-sky-500/30 text-sky-300 hover:bg-sky-500/40 border border-sky-400/40"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
            }`}
            title={showRain ? "Disable Monsoon Rain Streaks" : "Enable Monsoon Rain Streaks"}
            aria-label="Toggle rain streaks"
          >
            <CloudRain className="w-3.5 h-3.5" />
          </button>

          {/* Fireflies / Embers Toggle */}
          <button
            type="button"
            onClick={handleToggleEmbers}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              showEmbers
                ? "bg-amber-500/30 text-amber-300 hover:bg-amber-500/40 border border-amber-400/40"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
            }`}
            title={showEmbers ? "Disable Fireflies & Embers" : "Enable Fireflies & Embers"}
            aria-label="Toggle embers"
          >
            {showEmbers ? <Flame className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* AI Generator Modal Opener */}
          <button
            type="button"
            onClick={() => setIsGeneratorOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-semibold transition-all cursor-pointer shadow-xs"
            title="Generate Custom Background with Nano Banana AI"
          >
            <Wand2 className="w-3 h-3 text-emerald-400" />
            <span className="hidden md:inline font-mono text-[10px]">AI Prompt</span>
          </button>
        </div>
      )}

      {/* 10. Nano Banana AI Background Prompt Modal */}
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
                    <span>Nano Banana AI Background</span>
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

            {/* Presets Quick Pick */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Quick AI Themes:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    handleSceneChange("golden");
                    setIsGeneratorOpen(false);
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    currentSceneKey === "golden"
                      ? "bg-amber-500/20 border-amber-400/50 text-amber-200"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
                  }`}
                >
                  <Wheat className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold">Golden Harvest</div>
                    <div className="text-[10px] text-muted-foreground">Wheat fields & sun</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSceneChange("monsoon");
                    setIsGeneratorOpen(false);
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    currentSceneKey === "monsoon"
                      ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
                  }`}
                >
                  <CloudRain className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold">Monsoon Paddy</div>
                    <div className="text-[10px] text-muted-foreground">Emerald rain mist</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSceneChange("night");
                    setIsGeneratorOpen(false);
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    currentSceneKey === "night"
                      ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
                  }`}
                >
                  <Moon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-bold">Starfall Farm</div>
                    <div className="text-[10px] text-muted-foreground">Night & fireflies</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSceneChange("alpine");
                    setIsGeneratorOpen(false);
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    currentSceneKey === "alpine"
                      ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
                  }`}
                >
                  <Mountain className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold">Alpine Valley</div>
                    <div className="text-[10px] text-muted-foreground">Tea terraces & fog</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Prompt Input */}
            <form onSubmit={handleGenerateAIScene} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-white/80 block mb-1.5">
                  Generate with Custom AI Prompt:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="e.g. Punjab mustard fields during sunset with fireflies..."
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
                      <span>Generate Scene</span>
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
