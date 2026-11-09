"use client";

import React, { useRef, useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { CommandIcon } from "lucide-react";

export type TooltipItem = {
  icon: ReactNode;
  label: string;
  labelHasKeyword?: (string | ReactNode)[] | false;
  hasBadge?: boolean;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  variant?: "primary" | "default";
  buttonClassName?: string;
};

interface TooltipNavbarProps {
  items: TooltipItem[];
  tooltipDelay?: number; // in ms
  className?: string;
  tooltipPosition?: "top" | "bottom";
}

export const TooltipNavbar: React.FC<TooltipNavbarProps> = ({
  items,
  tooltipDelay = 120,
  className = "",
  tooltipPosition = "top",
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [coords, setCoords] = useState<{ clipPath: string; translateX: number }>({
    clipPath: "",
    translateX: 0,
  });

  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const buttonRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);
  const [isEntering, setIsEntering] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dynamic position calculation based on pre-measured label sizes and button centers
  const calculatePosition = (index: number) => {
    const activeLabel = measureRefs.current[index];
    const activeIcon = buttonRefs.current[index];

    if (!activeLabel || !activeIcon) return null;

    const labelLeft = activeLabel.offsetLeft;
    const labelWidth = activeLabel.offsetWidth;
    const labelCenter = labelLeft + labelWidth / 2;

    const iconLeft = activeIcon.offsetLeft;
    const iconWidth = activeIcon.offsetWidth;
    const iconCenter = iconLeft + iconWidth / 2;

    const totalWidth = measureRefs.current.reduce(
      (acc, el) => acc + (el?.offsetWidth || 0),
      0
    );

    if (totalWidth === 0) return null;

    const cLeft = (labelLeft / totalWidth) * 100;
    const cRight = 100 - ((labelLeft + labelWidth) / totalWidth) * 100;

    return {
      clipPath: `inset(0 ${cRight}% 0 ${cLeft}% round 8px)`,
      translateX: iconCenter - labelCenter,
    };
  };

  const handleMouseEnter = (index: number) => {
    const newCoords = calculatePosition(index);
    if (!newCoords) return;

    if (activeIndex === null) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsEntering(true);

      timeoutRef.current = setTimeout(() => {
        setCoords(newCoords);
        setActiveIndex(index);
      }, tooltipDelay);
    } else {
      setCoords(newCoords);
      setActiveIndex(index);
      setIsEntering(false);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveIndex(null);
    setCoords({ clipPath: "", translateX: 0 });
    setIsEntering(true);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const key = e.key.toUpperCase();
        const matchedItem = items.find((item) =>
          item.labelHasKeyword &&
          item.labelHasKeyword.some(
            (k) => typeof k === "string" && k.toUpperCase() === key
          )
        );

        if (matchedItem) {
          if (matchedItem.onClick) {
            e.preventDefault();
            matchedItem.onClick();
          } else if (matchedItem.href) {
            e.preventDefault();
            window.location.href = matchedItem.href;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items]);

  return (
    <div className={`relative inline-block ${className}`} onMouseLeave={handleMouseLeave}>
      <div className="flex items-center justify-center">
        <div className="relative">
          {/* Animated Sliding Tooltip Pill */}
          <div
            className={`pointer-events-none absolute left-0 z-50 transition-opacity duration-200 ${
              tooltipPosition === "top" ? "bottom-14" : "top-14"
            } ${activeIndex !== null && coords.clipPath !== "" ? "opacity-100" : "opacity-0"}`}
          >
            <div
              className="flex rounded-lg bg-black/95 dark:bg-neutral-800/95 backdrop-blur-md shadow-2xl border border-white/20 dark:border-neutral-700/80 text-white"
              style={{
                clipPath: coords.clipPath || "inset(0 0 0 0 round 8px)",
                transform: `translateX(${coords.translateX}px)`,
                transition: isEntering
                  ? "opacity 0.2s ease"
                  : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), clip-path 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="inline-flex h-8 items-center justify-center">
                {items.map((item, index) => (
                  <div
                    key={`real-${index}`}
                    className="flex items-center justify-center gap-1.5 px-3 text-xs font-semibold whitespace-nowrap"
                  >
                    <span className="text-white">{item.label}</span>
                    {item.hasBadge && (
                      <div className="flex items-center gap-0.5 text-white/50">
                        <span className="flex items-center justify-center rounded-xs border border-white/20 p-0.5">
                          <CommandIcon className="w-2.5 h-2.5 text-neutral-400" />
                        </span>
                      </div>
                    )}
                    {item.labelHasKeyword && (
                      <div className="flex items-center gap-0.5 text-white/50">
                        {item.labelHasKeyword.map((key, i) => (
                          <span
                            key={i}
                            className="flex items-center justify-center rounded-xs border border-white/20 px-1 py-0.2 text-[10px] font-mono tabular-nums"
                          >
                            {typeof key === "string" ? key : "⌘"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dock / Navbar Button Bar with Liquid Glass */}
          <div className="z-10 inline-flex items-center justify-center gap-2 rounded-full p-1.5 sm:p-2 backdrop-blur-2xl bg-white/[0.05] dark:bg-black/40 border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_8px_32px_rgba(0,0,0,0.4)]">
            {items.map((item, index) => {
              const isPrimary = item.variant === "primary";
              const content = (
                <div className="flex size-9 sm:size-10 items-center justify-center p-2">
                  {item.icon}
                </div>
              );

              const btnClass = `flex cursor-pointer items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
                isPrimary
                  ? "btn-liquid-glass-primary shadow-[0_0_15px_rgba(20,122,77,0.5)] text-white"
                  : "text-foreground/90 hover:text-white bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 hover:border-white/30 backdrop-blur-xl shadow-xs"
              } ${item.buttonClassName || ""}`;

              if (item.href) {
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onMouseEnter={() => handleMouseEnter(index)}
                    ref={(el) => {
                      buttonRefs.current[index] = el;
                    }}
                    className={btnClass}
                  >
                    {content}
                    <span className="sr-only">{item.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={item.onClick}
                  onMouseEnter={() => handleMouseEnter(index)}
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  className={btnClass}
                >
                  {content}
                  <span className="sr-only">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hidden Measure Container for exact label geometry */}
      <div className="pointer-events-none absolute bottom-0 left-0 flex h-0 overflow-hidden whitespace-nowrap opacity-0">
        {items.map((item, index) => (
          <div
            key={`measure-${index}`}
            ref={(el) => {
              measureRefs.current[index] = el;
            }}
            className="flex items-center justify-center gap-1.5 px-3 text-xs font-semibold whitespace-nowrap"
          >
            <span>{item.label}</span>
            {item.hasBadge && (
              <div className="flex items-center gap-0.5 text-white/40">
                <span className="flex items-center justify-center rounded-xs border border-white/20 p-0.5">
                  <CommandIcon className="w-2.5 h-2.5 text-neutral-500" />
                </span>
              </div>
            )}
            {item.labelHasKeyword && (
              <div className="flex items-center gap-0.5 text-white/40">
                {item.labelHasKeyword.map((key, i) => (
                  <span
                    key={i}
                    className="flex items-center justify-center rounded-xs border border-white/20 px-1 py-0.2 text-[10px] font-mono tabular-nums"
                  >
                    {typeof key === "string" ? key : "⌘"}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
