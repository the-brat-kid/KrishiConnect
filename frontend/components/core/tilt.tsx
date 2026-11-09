"use client";

import React, {
  useRef,
  useState,
  useCallback,
  type MouseEvent,
  type ReactNode,
  type CSSProperties,
} from "react";

export interface TiltProps {
  children: ReactNode;
  className?: string;
  rotationFactor?: number;
  isRevese?: boolean;
  isReverse?: boolean;
  springOptions?: {
    stiffness?: number;
    damping?: number;
  };
  style?: CSSProperties;
}

export function Tilt({
  children,
  className = "",
  rotationFactor = 15,
  isRevese = false,
  isReverse = false,
  style = {},
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const reverse = isRevese || isReverse;

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;

      const rotX = (reverse ? 1 : -1) * yPct * rotationFactor * 2;
      const rotY = (reverse ? -1 : 1) * xPct * rotationFactor * 2;

      setRotate({ x: rotX, y: rotY });
    },
    [rotationFactor, reverse]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: isHovered
          ? "transform 0.08s ease-out"
          : "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function TiltCard1() {
  return (
    <Tilt rotationFactor={8} isRevese>
      <div
        style={{
          borderRadius: "12px",
        }}
        className="flex max-w-[270px] flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900"
      >
        <img
          src="https://images.beta.cosmos.so/f7fcb95d-981b-4cb3-897f-e35f6c20e830?format=jpeg"
          alt="Ghost in the shell - Kôkaku kidôtai"
          className="h-48 w-full object-cover"
        />
        <div className="p-2">
          <h1 className="font-mono leading-snug text-zinc-950 dark:text-zinc-50">
            Ghost in the Shell
          </h1>
          <p className="text-zinc-700 dark:text-zinc-400">Kôkaku kidôtai</p>
        </div>
      </div>
    </Tilt>
  );
}

export default Tilt;
