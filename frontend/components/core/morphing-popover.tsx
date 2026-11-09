"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MorphingPopoverContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement>;
  duration: number;
}

const MorphingPopoverContext = createContext<MorphingPopoverContextType | null>(null);

export interface MorphingPopoverProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variants?: {
    initial?: { opacity?: number; filter?: string; scale?: number };
    animate?: { opacity?: number; filter?: string; scale?: number };
    exit?: { opacity?: number; filter?: string; scale?: number };
  };
  transition?: {
    duration?: number;
    ease?: string;
  };
  className?: string;
}

export function MorphingPopover({
  children,
  open: controlledOpen,
  onOpenChange,
  transition,
  className = "",
}: MorphingPopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const duration = transition?.duration ?? 0.25;

  const handleSetIsOpen = (val: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(val);
    }
    onOpenChange?.(val);
  };

  return (
    <MorphingPopoverContext.Provider
      value={{
        isOpen,
        setIsOpen: handleSetIsOpen,
        triggerRef,
        duration,
      }}
    >
      <div className={`relative inline-block ${className}`}>{children}</div>
    </MorphingPopoverContext.Provider>
  );
}

export interface MorphingPopoverTriggerProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

export function MorphingPopoverTrigger({
  children,
  asChild = false,
  className = "",
}: MorphingPopoverTriggerProps) {
  const context = useContext(MorphingPopoverContext);
  if (!context) throw new Error("MorphingPopoverTrigger must be inside MorphingPopover");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    context.setIsOpen(!context.isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return (
      <div ref={context.triggerRef} className="inline-block" onClick={handleClick}>
        {React.cloneElement(children as React.ReactElement<any>, {
          className: `${(children as any).props.className || ""} ${className}`.trim(),
        })}
      </div>
    );
  }

  return (
    <div
      ref={context.triggerRef}
      onClick={handleClick}
      className={`inline-block cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
}

export interface MorphingPopoverContentProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function MorphingPopoverContent({
  children,
  className = "",
  style = {},
}: MorphingPopoverContentProps) {
  const context = useContext(MorphingPopoverContext);
  if (!context) throw new Error("MorphingPopoverContent must be inside MorphingPopover");

  const contentRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!context.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") context.setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        context.triggerRef.current &&
        !context.triggerRef.current.contains(e.target as Node)
      ) {
        context.setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [context]);

  if (!context.isOpen) return null;

  return (
    <>
      <style jsx>{`
        @keyframes morphPopoverIn {
          0% {
            opacity: 0;
            filter: blur(10px);
            transform: scale(0.96) translateY(-4px);
          }
          100% {
            opacity: 1;
            filter: blur(0px);
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
      <div
        ref={contentRef}
        style={{
          animation: `morphPopoverIn ${context.duration}s ease-out forwards`,
          ...style,
        }}
        className={`absolute z-50 mt-2 rounded-lg border bg-popover text-popover-foreground shadow-lg outline-none ${className}`}
      >
        {children}
      </div>
    </>
  );
}

export function MorphingPopoverCustomTransitionVariants() {
  return (
    <MorphingPopover
      variants={{
        initial: { opacity: 0, filter: "blur(10px)" },
        animate: { opacity: 1, filter: "blur(0px)" },
        exit: { opacity: 0, filter: "blur(10px)" },
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
    >
      <MorphingPopoverTrigger asChild>
        <Button variant="outline">
          <span className="inline-block">Open popover</span>
        </Button>
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="w-80 p-4 shadow-sm">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Dimensions</h4>
            <p className="text-muted-foreground text-sm">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}

export default MorphingPopover;
