"use client";

import { useEffect, useRef, useState, useMemo, type ElementType } from "react";

export interface SpringOptions {
  bounce?: number;
  duration?: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
}

export interface AnimatedNumberProps {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: ElementType;
  format?: (value: number) => string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedNumber({
  value,
  className = "",
  springOptions,
  as: Component = "span",
  format,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const startValueRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const duration = springOptions?.duration ?? 1800;
  const bounce = springOptions?.bounce ?? 0;

  useEffect(() => {
    const startVal = displayValue;
    const targetVal = value;
    startValueRef.current = startVal;
    startTimeRef.current = null;

    if (startVal === targetVal) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      let easedProgress = progress;

      if (bounce > 0) {
        const freq = 6 * (1 + bounce);
        const decay = 4 * (1 - bounce * 0.5);
        easedProgress = 1 - Math.exp(-decay * progress) * Math.cos(freq * progress);
      } else {
        // Smooth out-expo easing
        easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      }

      const current = startVal + (targetVal - startVal) * Math.min(Math.max(easedProgress, 0), 1.05);
      setDisplayValue(current);

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetVal);
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [value, duration, bounce]);

  const formattedOutput = useMemo(() => {
    if (format) {
      return format(displayValue);
    }
    if (decimals > 0) {
      return displayValue.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    return Math.round(displayValue).toLocaleString("en-IN");
  }, [displayValue, format, decimals]);

  return (
    <Component className={className}>
      {prefix}
      {formattedOutput}
      {suffix}
    </Component>
  );
}

export function AnimatedNumberBasic() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(2082);
  }, []);

  return (
    <div className="flex w-full items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        width="16"
        height="16"
        className="mr-3 h-3 w-3 fill-transparent stroke-zinc-800 stroke-[1.3] dark:stroke-zinc-50"
      >
        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
      </svg>
      <AnimatedNumber
        className="inline-flex items-center font-mono text-2xl font-light text-zinc-800 dark:text-zinc-50"
        springOptions={{
          bounce: 0,
          duration: 2000,
        }}
        value={value}
      />
    </div>
  );
}

export default AnimatedNumber;
