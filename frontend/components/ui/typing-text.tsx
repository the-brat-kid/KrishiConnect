"use client";

import React, { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";
import { motion, useInView, type HTMLMotionProps } from "framer-motion";

interface TypingContextType {
  isTyping: boolean;
  canBlink: boolean;
}

const TypingContext = createContext<TypingContextType>({
  isTyping: false,
  canBlink: true,
});

export interface TypingTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string | string[];
  delay?: number;
  holdDelay?: number;
  duration?: number;
  loop?: boolean;
  cursor?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function TypingText({
  text,
  delay = 0,
  holdDelay = 1200,
  duration = 55,
  loop = false,
  cursor = false,
  className = "",
  children,
  ...props
}: TypingTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: false });

  const textList = useMemo(() => {
    return Array.isArray(text) ? text : [text];
  }, [text]);

  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(false);

  // Initial delay trigger
  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [isInView, delay]);

  useEffect(() => {
    if (!started || textList.length === 0) return;

    const currentFullText = textList[textIndex] || "";
    let timeoutId: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing phase
      if (displayedText.length < currentFullText.length) {
        setIsTyping(true);
        timeoutId = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        }, duration);
      } else {
        // Finished typing current string
        setIsTyping(false);
        if (loop || textIndex < textList.length - 1) {
          timeoutId = setTimeout(() => {
            setIsDeleting(true);
          }, holdDelay);
        }
      }
    } else {
      // Erasing phase
      if (displayedText.length > 0) {
        setIsTyping(true);
        timeoutId = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length - 1));
        }, Math.max(25, duration / 2));
      } else {
        // Finished erasing
        setIsTyping(false);
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % textList.length);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [started, displayedText, isDeleting, textIndex, textList, duration, holdDelay, loop]);

  return (
    <TypingContext.Provider value={{ isTyping, canBlink: !isTyping }}>
      <span
        ref={containerRef}
        data-slot="typing-text"
        className={`inline-flex items-center ${className}`}
        {...props}
      >
        <span>{displayedText}</span>
        {children}
        {cursor && !children && <TypingTextCursor />}
      </span>
    </TypingContext.Provider>
  );
}

export type TypingTextCursorProps = Omit<HTMLMotionProps<"span">, "children">;

export function TypingTextCursor({
  className = "",
  style,
  ...props
}: TypingTextCursorProps) {
  const { isTyping } = useContext(TypingContext);

  return (
    <motion.span
      data-slot="typing-text-cursor"
      aria-hidden="true"
      animate={{
        opacity: isTyping ? [1, 1] : [0, 0, 1, 1],
      }}
      transition={{
        duration: isTyping ? 0.2 : 0.9,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.5, 0.5, 1],
      }}
      className={`inline-block ml-1 w-[2.5px] h-[1.1em] rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] align-middle ${className}`}
      style={{
        transform: "translateY(-1px)",
        ...style,
      }}
      {...props}
    />
  );
}

export default TypingText;
