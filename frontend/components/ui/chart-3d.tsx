"use client";

import React, { useState, useRef, useCallback, ReactNode, CSSProperties } from "react";
import { Box } from "lucide-react";

interface Chart3DContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  icon?: ReactNode;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
  rotationIntensity?: number;
  show3DBadge?: boolean;
}

/**
 * Chart3DContainer: Wraps charts in a realistic 3D perspective stage with
 * interactive mouse tilt, depth shadow, specular ambient lighting, and floor grid.
 */
export function Chart3DContainer({
  children,
  title,
  subtitle,
  badge = "3D Depth",
  icon,
  height = "auto",
  className = "",
  style = {},
  rotationIntensity = 7,
  show3DBadge = false,
}: Chart3DContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Default resting 3D angle so depth is ALWAYS visibly apparent
  const [rotation, setRotation] = useState({ x: 3.5, y: -2.5 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const xPct = mouseX / rect.width - 0.5; // -0.5 to 0.5
      const yPct = mouseY / rect.height - 0.5;

      const rotX = -yPct * rotationIntensity * 2;
      const rotY = xPct * rotationIntensity * 2;

      setRotation({ x: rotX, y: rotY });
    },
    [rotationIntensity]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    // Smoothly restore gentle resting 3D tilt
    setRotation({ x: 3.5, y: -2.5 });
  }, []);

  return (
    <div
      style={{ perspective: "1200px" }}
      className={`relative w-full ${className}`}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(${isHovered ? 12 : 4}px)`,
          transformStyle: "preserve-3d",
          transition: isHovered
            ? "transform 0.12s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.25s ease"
            : "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.6s ease",
          ...style,
        }}
        className="group relative rounded-3xl border border-white/20 dark:border-white/12 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-black/40 backdrop-blur-2xl p-5 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.6),inset_0_1px_1.5px_rgba(255,255,255,0.4),0_0_30px_rgba(16,185,129,0.06)] overflow-hidden transition-all"
      >
        {/* Specular Ambient Edge Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />

        {/* 3D Floor Shadow Plane at the bottom */}
        <div
          style={{
            transform: "rotateX(65deg) translateZ(-15px)",
            transformOrigin: "bottom center",
          }}
          className="pointer-events-none absolute inset-x-8 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent blur-md opacity-70"
        />

        {/* Header with Title and 3D Badge */}
        {(title || show3DBadge) && (
          <div
            style={{ transform: "translateZ(18px)" }}
            className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 relative z-10"
          >
            <div className="flex items-center gap-2">
              {icon}
              <div>
                {title && (
                  <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    {title}
                  </h4>
                )}
                {subtitle && (
                  <p className="text-[11px] text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>

            {show3DBadge && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                <Box className="h-3 w-3 animate-pulse" />
                <span>{badge}</span>
              </div>
            )}
          </div>
        )}

        {/* Chart Content Area with subtle 3D lift */}
        <div
          style={{
            transform: "translateZ(14px)",
            height: height === "auto" ? undefined : height,
          }}
          className="relative z-10 w-full"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * ThreeDBar: Custom SVG shape renderer for Recharts <Bar shape={<ThreeDBar />} />
 * Produces an authentic 3D extruded isometric column with:
 * - Front face with gradient
 * - Top cap with specular white highlight
 * - Side extrusion with shadow depth
 * - Ground shadow
 */
export function ThreeDBar(props: any) {
  const { fill, x, y, width, height, onClick } = props;
  if (!height || height <= 0 || width <= 0) return null;

  // Compute realistic isometric depth based on bar thickness
  const depthX = Math.min(Math.max(Math.round(width * 0.35), 4), 10);
  const depthY = Math.min(Math.max(Math.round(depthX * 0.65), 3), 7);

  // Colors: lighter top, darker side
  const topHighlight = "#ffffff";
  const sideShadow = "#000000";

  return (
    <g
      onClick={onClick}
      className="transition-all duration-300 hover:brightness-125 cursor-pointer"
    >
      {/* 3D Floor Ground Shadow */}
      <ellipse
        cx={x + width / 2 + depthX / 2}
        cy={y + height + 2}
        rx={Math.max(width / 2 + 1, 2)}
        ry={Math.max(depthY / 2, 1.5)}
        fill="rgba(0,0,0,0.4)"
        filter="blur(1.5px)"
      />

      {/* Front Face (Primary Colored Wall) */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={1.5}
        style={{
          filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.35))",
        }}
      />

      {/* Top Cap (Isometric Roof with Specular Glint) */}
      <polygon
        points={`${x},${y} ${x + depthX},${y - depthY} ${x + width + depthX},${y - depthY} ${x + width},${y}`}
        fill={topHighlight}
        fillOpacity={0.42}
        stroke={fill}
        strokeWidth={0.5}
        strokeOpacity={0.6}
      />

      {/* Right Extrusion Wall (Shadowed 3D Depth) */}
      <polygon
        points={`${x + width},${y} ${x + width + depthX},${y - depthY} ${x + width + depthX},${y + height - depthY} ${x + width},${y + height}`}
        fill={sideShadow}
        fillOpacity={0.35}
        stroke={fill}
        strokeWidth={0.5}
        strokeOpacity={0.4}
      />

      {/* Front Specular Bevel Line (Left Edge Light) */}
      <line
        x1={x + 0.5}
        y1={y}
        x2={x + 0.5}
        y2={y + height}
        stroke="#ffffff"
        strokeWidth={1}
        strokeOpacity={0.35}
      />
    </g>
  );
}

/**
 * ThreeDDot: Custom 3D glowing sphere marker for LineCharts
 */
export function ThreeDDot(props: any) {
  const { cx, cy, stroke = "#10b981", fill = "#10b981", r = 4.5 } = props;
  if (cx == null || cy == null) return null;

  return (
    <g className="transition-all duration-200">
      {/* Outer 3D Ambient Glow Ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r + 3}
        fill={stroke}
        fillOpacity={0.25}
        filter="blur(2px)"
      />
      {/* 3D Sphere Base */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke="#ffffff"
        strokeWidth={1.5}
        strokeOpacity={0.8}
        style={{
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.5))",
        }}
      />
      {/* Specular 3D Highlight Glint */}
      <circle
        cx={cx - r * 0.3}
        cy={cy - r * 0.3}
        r={r * 0.35}
        fill="#ffffff"
        fillOpacity={0.9}
      />
    </g>
  );
}

/**
 * ThreeDChartDefs: Injects reusable SVG filters and gradients into charts
 */
export function ThreeDChartDefs() {
  return (
    <defs>
      {/* 3D Volumetric Area Glow Filter */}
      <filter id="threed-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#10b981" floodOpacity="0.5" />
        <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#000000" floodOpacity="0.6" />
      </filter>

      {/* 3D Metallic Cylindrical Gradients */}
      <linearGradient id="threed-emerald" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#047857" />
        <stop offset="35%" stopColor="#34d399" />
        <stop offset="70%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#065f46" />
      </linearGradient>

      <linearGradient id="threed-amber" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#b45309" />
        <stop offset="35%" stopColor="#fbbf24" />
        <stop offset="70%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>

      <linearGradient id="threed-rose" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#be123c" />
        <stop offset="35%" stopColor="#fb7185" />
        <stop offset="70%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#881337" />
      </linearGradient>

      <linearGradient id="threed-sky" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0369a1" />
        <stop offset="35%" stopColor="#38bdf8" />
        <stop offset="70%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#0c4a6e" />
      </linearGradient>
    </defs>
  );
}
