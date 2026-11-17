"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Cpu, Radio, Zap, ShieldCheck } from "lucide-react";

interface KrishiTerraCanvasScrollerProps {
  totalFrames?: number;
  framePrefix?: string;
  frameExtension?: string;
  zeroPad?: number;
  backgroundColor?: string;
}

export default function KrishiTerraCanvasScroller({
  totalFrames = 120,
  framePrefix = "/frames/terranode_",
  frameExtension = "webp",
  zeroPad = 3,
  backgroundColor = "#060e0a",
}: KrishiTerraCanvasScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useProceduralFallback, setUseProceduralFallback] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  // 1. Framer Motion Scroll Progress for h-[400vh] container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map 0 -> 1 progress to 0 -> totalFrames - 1
  const frameIndexMotion = useTransform(scrollYProgress, [0, 1], [0, totalFrames - 1]);

  // Storytelling Opacity & Position Transforms
  // Phase 1: 0% - 15% (Hero Assembled)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12, 0.18], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, -35]);

  // Phase 2: 25% - 45% (Subterranean Deconstruction - Left Aligned)
  const p1Opacity = useTransform(scrollYProgress, [0.22, 0.3, 0.38, 0.45], [0, 1, 1, 0]);
  const p1X = useTransform(scrollYProgress, [0.22, 0.3, 0.45], [-35, 0, -20]);

  // Phase 3: 52% - 75% (Edge Silicon & NavIC Satellite - Right Aligned)
  const p2Opacity = useTransform(scrollYProgress, [0.52, 0.6, 0.68, 0.75], [0, 1, 1, 0]);
  const p2X = useTransform(scrollYProgress, [0.52, 0.6, 0.75], [35, 0, 20]);

  // Phase 4: 85% - 100% (Reassembly & Farm-Gate Integration CTA - Centered)
  const ctaOpacity = useTransform(scrollYProgress, [0.84, 0.92, 1], [0, 1, 1]);
  const ctaScale = useTransform(scrollYProgress, [0.84, 0.94], [0.95, 1]);

  // Live Telemetry readouts
  const explodedPercent = useTransform(scrollYProgress, [0, 0.6, 1], [0, 100, 0]);
  const [metricValue, setMetricValue] = useState(0);

  useEffect(() => {
    return explodedPercent.on("change", (val) => setMetricValue(Math.round(val)));
  }, [explodedPercent]);

  // 2. Format frame path
  const formatFramePath = useCallback(
    (index: number) => {
      const paddedNumber = String(index).padStart(zeroPad, "0");
      return `${framePrefix}${paddedNumber}.${frameExtension}`;
    },
    [framePrefix, zeroPad, frameExtension]
  );

  // 3. Preload Image Sequence
  useEffect(() => {
    let isCancelled = false;
    const loadedImgs: HTMLImageElement[] = [];
    let loadedCount = 0;
    let failedCount = 0;

    const checkAllSettled = () => {
      if (loadedCount + failedCount === totalFrames) {
        if (!isCancelled) {
          // If images are not yet provided in public directory, automatically activate procedural render
          if (failedCount > totalFrames * 0.5) {
            setUseProceduralFallback(true);
          } else {
            setImages(loadedImgs);
          }
          setIsLoaded(true);
        }
      }
    };

    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = formatFramePath(i);

      img.onload = () => {
        if (isCancelled) return;
        loadedImgs[i] = img;
        loadedCount++;
        setLoadProgress(Math.round(((loadedCount + failedCount) / totalFrames) * 100));
        checkAllSettled();
      };

      img.onerror = () => {
        if (isCancelled) return;
        failedCount++;
        setLoadProgress(Math.round(((loadedCount + failedCount) / totalFrames) * 100));
        checkAllSettled();
      };
    }

    return () => {
      isCancelled = true;
    };
  }, [totalFrames, formatFramePath]);

  // 4. Procedural KrishiConnect TerraNode Schematic Generator
  const drawKrishiSchematic = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
      // Clear background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const separation = progress * (height * 0.32);

      // Bioluminescent Emerald Radial Ambient Glow
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.42);
      grad.addColorStop(0, "rgba(16, 185, 129, 0.12)");
      grad.addColorStop(0.35, "rgba(5, 46, 22, 0.08)");
      grad.addColorStop(1, "rgba(6, 14, 10, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Soil Stratum line if assembled
      if (progress < 0.25) {
        ctx.strokeStyle = "rgba(16, 185, 129, 0.15)";
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(cx - 300, cy + 110);
        ctx.lineTo(cx + 300, cy + 110);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
        ctx.font = "10px monospace";
        ctx.fillText("ROOT-ZONE SOIL HORIZON (RHIZOSPHERE)", cx - 290, cy + 125);
      }

      // Exploded Hardware Stack of KrishiConnect TerraNode
      const components = [
        { name: "Solar Sapphire Dome", sub: "Photovoltaic Harvester", offset: -separation * 1.45, color: "#34d399", rx: 90, ry: 30, stroke: "#10b981" },
        { name: "Bioluminescent Status Ring", sub: "360° Optical Alert", offset: -separation * 1.05, color: "#10b981", rx: 110, ry: 38, stroke: "#34d399" },
        { name: "NavIC & LoRaWAN Gateway", sub: "Dual Satellite RF Link", offset: -separation * 0.65, color: "#60a5fa", rx: 125, ry: 44, stroke: "#38bdf8" },
        { name: "3nm KrishiEdge Neural Silicon", sub: "NPK Spectro-Inference", offset: -separation * 0.2, color: "#10b981", rx: 75, ry: 75, isChip: true, stroke: "#10b981" },
        { name: "Solid-State LiFePO4 Energy Cell", sub: "10-Year Autonomous Run", offset: separation * 0.35, color: "#f59e0b", rx: 115, ry: 40, stroke: "#fbbf24" },
        { name: "Electrochemical NPK Matrix", sub: "Quad Gold-Flashed Blades", offset: separation * 0.85, color: "#e2e8f0", rx: 130, ry: 48, stroke: "#f1f5f9" },
        { name: "Grade-5 Titanium Anchor Spike", sub: "Perforated Aeration Shaft", offset: separation * 1.35, color: "#94a3b8", rx: 40, ry: 100, isSpike: true, stroke: "#cbd5e1" },
      ];

      components.forEach((c) => {
        const yPos = cy + c.offset;

        if (c.isChip) {
          // Microchip square
          ctx.strokeStyle = c.stroke;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx - c.rx / 2, yPos - c.ry / 2, c.rx, c.ry);

          // Glow core
          ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
          ctx.fillRect(cx - c.rx / 2, yPos - c.ry / 2, c.rx, c.ry);

          // Pins
          ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
          for (let p = -25; p <= 25; p += 10) {
            ctx.beginPath();
            ctx.moveTo(cx + p, yPos - c.ry / 2);
            ctx.lineTo(cx + p, yPos - c.ry / 2 - 8);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cx + p, yPos + c.ry / 2);
            ctx.lineTo(cx + p, yPos + c.ry / 2 + 8);
            ctx.stroke();
          }
        } else if (c.isSpike) {
          // Triangular subterranean probe spike
          ctx.beginPath();
          ctx.moveTo(cx - 30, yPos - 30);
          ctx.lineTo(cx + 30, yPos - 30);
          ctx.lineTo(cx, yPos + 70);
          ctx.closePath();
          ctx.strokeStyle = c.stroke;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
          ctx.fill();
        } else {
          // Precision Ellipse
          ctx.beginPath();
          ctx.ellipse(cx, yPos, c.rx, c.ry, 0, 0, Math.PI * 2);
          ctx.strokeStyle = c.stroke;
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.fillStyle = "rgba(16, 185, 129, 0.03)";
          ctx.fill();
        }

        // Exploded Component HUD Callouts
        if (progress > 0.15) {
          const isRight = c.offset >= 0;
          const leadX = isRight ? cx + c.rx + 15 : cx - c.rx - 15;
          const targetX = isRight ? cx + 180 : cx - 180;

          ctx.beginPath();
          ctx.moveTo(cx, yPos);
          ctx.lineTo(leadX, yPos);
          ctx.lineTo(targetX, yPos);
          ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
          ctx.setLineDash([2, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = "#34d399";
          ctx.font = "bold 10px monospace";
          ctx.fillText(c.name.toUpperCase(), isRight ? targetX + 8 : targetX - 170, yPos - 2);

          ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
          ctx.font = "9px monospace";
          ctx.fillText(c.sub, isRight ? targetX + 8 : targetX - 170, yPos + 11);
        }
      });
    },
    [backgroundColor]
  );

  // 5. Canvas Drawing Engine
  const renderFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Mode A: Procedural Fallback
      if (useProceduralFallback || images.length === 0) {
        const normalizedProg = index / (totalFrames - 1);
        drawKrishiSchematic(ctx, width, height, normalizedProg);
        ctx.restore();
        return;
      }

      // Mode B: Image Sequence Drawing with Aspect Ratio Containment
      const img = images[index];
      if (img && img.complete) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = width / height;

        let drawWidth: number;
        let drawHeight: number;
        let offsetX: number;
        let offsetY: number;

        if (canvasRatio > imgRatio) {
          drawHeight = height;
          drawWidth = height * imgRatio;
          offsetX = (width - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = width;
          drawHeight = width / imgRatio;
          offsetX = 0;
          offsetY = (height - drawHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
      ctx.restore();
    },
    [images, useProceduralFallback, totalFrames, backgroundColor, drawKrishiSchematic]
  );

  // 6. Sync Scroll to Frame Index
  useEffect(() => {
    return frameIndexMotion.on("change", (latest) => {
      const frameIdx = Math.min(Math.max(Math.round(latest), 0), totalFrames - 1);
      setCurrentFrameIndex(frameIdx);
      renderFrame(frameIdx);
    });
  }, [frameIndexMotion, totalFrames, renderFrame]);

  // Window Resize & Init
  useEffect(() => {
    const handleResize = () => renderFrame(currentFrameIndex);
    window.addEventListener("resize", handleResize);
    renderFrame(0);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderFrame, currentFrameIndex]);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-[#060e0a] text-white">
      {/* Preloader Overlay */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060e0a]"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="h-10 w-10 animate-spin rounded-full border border-emerald-500/20 border-t-emerald-400" />
              <div className="flex flex-col items-center gap-1 font-mono">
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-400/70">
                  Initializing KrishiConnect Hardware Telemetry
                </span>
                <span className="text-sm font-semibold text-white/90">{loadProgress}%</span>
              </div>
              <div className="h-[2px] w-52 overflow-hidden rounded-full bg-emerald-950">
                <div
                  className="h-full bg-emerald-400 transition-all duration-150"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Fullscreen Canvas Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-contain pointer-events-none"
        />

        {/* Seamless Edge Blending Vignettes */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#060e0a] via-[#060e0a]/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#060e0a] via-[#060e0a]/50 to-transparent" />

        {/* Top-Right Technical HUD */}
        <div className="pointer-events-none absolute top-6 right-6 flex items-center gap-3 font-mono text-[11px] text-emerald-400/80">
          <div className="scrolly-glass-pill px-3 py-1.5 rounded-full flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>FRAME {String(currentFrameIndex + 1).padStart(3, "0")} / {totalFrames}</span>
          </div>
          <div className="hidden sm:block scrolly-glass-pill px-3 py-1.5 rounded-full">
            EXPLODED: {metricValue}%
          </div>
        </div>

        {/* Bottom-Left Live Telemetry Ribbon */}
        <div className="pointer-events-none absolute bottom-6 left-6 hidden md:flex items-center gap-4 font-mono text-[11px] text-emerald-400/60">
          <div className="scrolly-glass-pill px-3 py-1 rounded-full flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>NAVIC SATLINK: LOCKED</span>
          </div>
          <div className="scrolly-glass-pill px-3 py-1 rounded-full flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>SOLID-STATE: 100%</span>
          </div>
        </div>

        {/* ----------------- STORYTELLING OVERLAYS ----------------- */}

        {/* SECTION 0%: Hero Assembled */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <div className="inline-flex items-center gap-2 scrolly-glass-pill px-4 py-1.5 rounded-full text-xs font-mono tracking-widest text-emerald-300 uppercase mb-6">
            <span>KRISHICONNECT HARDWARE</span>
            <span className="text-emerald-500/50">•</span>
            <span>TERRANODE PRO</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white/95 max-w-4xl font-plus-jakarta leading-[1.1]">
            Sovereign Agriculture. <br />
            <span className="text-emerald-400">Deconstructed.</span>
          </h1>
          <p className="mt-5 text-sm sm:text-base text-white/65 max-w-xl font-normal leading-relaxed text-balance">
            Forged from Grade-5 titanium and sapphire photovoltaic glass. Autonomous subterranean soil telemetry synced directly to Odisha mandis.
          </p>
          <div className="mt-10 flex flex-col items-center gap-2 text-emerald-400/50">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase">Scroll to deconstruct probe</span>
            <div className="h-8 w-[1px] bg-gradient-to-b from-emerald-400 to-transparent animate-pulse" />
          </div>
        </motion.div>

        {/* SECTION 30%: Subterranean Matrix (Left Aligned) */}
        <motion.div
          style={{ opacity: p1Opacity, x: p1X }}
          className="pointer-events-none absolute inset-y-0 left-6 sm:left-14 md:left-20 flex flex-col justify-center max-w-md"
        >
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400 mb-2.5">
            01 / SUBTERRANEAN SENSING MATRIX
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white/95 leading-tight font-plus-jakarta">
            Decoupled Molecular Sensing.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/65 leading-relaxed font-light">
            Quad gold-flashed electrochemical blades separate to measure real-time Nitrogen, Phosphorus, Potassium (NPK), pH, and rhizosphere moisture at 4 distinct root depths.
          </p>
          <div className="mt-6 flex flex-col gap-2 font-mono text-xs text-white/50 border-l-2 border-emerald-500/40 pl-4">
            <div>ACCURACY: ±0.01 pH • NPK Micro-molar</div>
            <div>DEPTH ARRAY: 15cm, 30cm, 60cm, 90cm</div>
            <div>TRANSDUCER: Ultrasonic Osmotic Tension</div>
          </div>
        </motion.div>

        {/* SECTION 60%: Edge Neural Silicon & NavIC Satellite (Right Aligned) */}
        <motion.div
          style={{ opacity: p2Opacity, x: p2X }}
          className="pointer-events-none absolute inset-y-0 right-6 sm:right-14 md:right-20 flex flex-col justify-center items-end text-right max-w-md ml-auto"
        >
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400 mb-2.5">
            02 / EDGE AI & SATELLITE TELEMETRY
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white/95 leading-tight font-plus-jakarta">
            3nm KrishiEdge & NavIC Uplink.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/65 leading-relaxed font-light">
            On-device neural inference classifies soil micro-biome degradation and forecasts optimal harvest windows before broadcasting telemetry via encrypted LoRaWAN and NavIC satellite transceivers.
          </p>
          <div className="mt-6 flex flex-col items-end gap-2 font-mono text-xs text-white/50 border-r-2 border-emerald-500/40 pr-4">
            <div>CORE: 3nm RISC-V Neural Engine</div>
            <div>CONNECTIVITY: NavIC + Sub-GHz LoRaWAN</div>
            <div>ENDURANCE: 10-Year Solid-State LiFePO4</div>
          </div>
        </motion.div>

        {/* SECTION 90%: Reassembled & Farm-Gate Integration CTA (Centered) */}
        <motion.div
          style={{ opacity: ctaOpacity, scale: ctaScale }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-emerald-400 mb-2.5">
            03 / AGRARIAN SOVEREIGNTY
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white/95 font-plus-jakarta max-w-3xl">
            Autonomous Farm Gate Intelligence.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/65 max-w-lg font-light leading-relaxed">
            Reintegrated into an IP68 hermetic monobloc. Syncs telemetry automatically with KrishiConnect Mandi Modal Rates, GST Invoices, and Buyer Logistics.
          </p>
          <div className="pointer-events-auto mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/soil-health"
              className="px-7 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all duration-200 shadow-[0_0_30px_rgba(16,185,129,0.3)] inline-flex items-center gap-2"
            >
              <span>Explore Soil AI Suite</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="px-7 py-3.5 rounded-full scrolly-glass-pill text-white/90 hover:text-white hover:bg-emerald-950/40 font-medium text-sm transition-all duration-200"
            >
              Launch KrishiConnect Platform
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
