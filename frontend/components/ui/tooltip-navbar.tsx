"use client";

import React, { useRef, useState, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  tooltipDelay = 100,
  className = "",
  tooltipPosition = "bottom",
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tooltipCoords, setTooltipCoords] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = (index: number) => {
    const activeIcon = buttonRefs.current[index];
    if (!activeIcon) return;
    const rect = activeIcon.getBoundingClientRect();
    const top = tooltipPosition === "top" ? rect.top - 42 : rect.bottom + 8;
    const left = rect.left + rect.width / 2;
    setTooltipCoords({ top, left });
    setActiveIndex(index);
  };

  const handleMouseEnter = (index: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (activeIndex === null) {
      timeoutRef.current = setTimeout(() => {
        updateCoords(index);
      }, tooltipDelay);
    } else {
      updateCoords(index);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveIndex(null);
    setTooltipCoords(null);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const key = e.key.toUpperCase();
        const matchedItem = items.find(
          (item) =>
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

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  return (
    <div className={`relative inline-block ${className}`} onMouseLeave={handleMouseLeave}>
      <div className="flex items-center justify-center">
        <div className="relative">
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

      {/* Portal Tooltip: renders outside all parent overflow/clipping boundaries */}
      {mounted &&
        activeItem &&
        tooltipCoords &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[99999] transition-all duration-150 ease-out"
            style={{
              top: `${tooltipCoords.top}px`,
              left: `${tooltipCoords.left}px`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg bg-black/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/20 dark:border-neutral-700/80 text-white whitespace-nowrap text-xs font-semibold animate-in fade-in-0 zoom-in-95 duration-150">
              <span className="text-white">{activeItem.label}</span>
              {activeItem.hasBadge && (
                <div className="flex items-center gap-0.5 text-white/50">
                  <span className="flex items-center justify-center rounded-xs border border-white/20 p-0.5">
                    <CommandIcon className="w-2.5 h-2.5 text-neutral-400" />
                  </span>
                </div>
              )}
              {activeItem.labelHasKeyword && (
                <div className="flex items-center gap-0.5 text-white/50">
                  {activeItem.labelHasKeyword.map((key, i) => (
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
          </div>,
          document.body
        )}
    </div>
  );
};
