"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils";

type SquiggleVariant = "arc" | "s" | "loop";

const PATHS: Record<SquiggleVariant, string> = {
  arc: "M4 40 C40 8, 90 8, 126 36",
  s: "M6 50 C30 10, 70 70, 110 28 C130 10, 150 18, 168 34",
  loop: "M10 36 C28 8, 70 8, 78 32 C86 56, 50 62, 42 40 C36 24, 70 18, 110 40",
};

/**
 * Decorative gradient-stroke squiggle. Absolute overlay, no layout impact.
 * Stroke uses DNA accent tokens when available.
 */
export function SquiggleDecor({
  variant = "s",
  className,
  width = 168,
  height = 64,
}: {
  variant?: SquiggleVariant;
  className?: string;
  width?: number;
  height?: number;
}) {
  const reduce = useReducedMotion();
  const reactId = useId().replace(/:/g, "");
  const gradId = `sq-${variant}-${reactId}`;

  return (
    <motion.svg
      aria-hidden
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={cn("pointer-events-none absolute", className)}
      initial={false}
      animate={
        reduce ? undefined : { y: [0, -4, 0], rotate: [0, 1.2, 0] }
      }
      transition={{
        duration: 7.5,
        repeat: Infinity,
        ease: [0.77, 0, 0.175, 1],
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
          <stop offset="45%" stopColor="var(--accent)" stopOpacity="0.85" />
          <stop
            offset="100%"
            stopColor="var(--accent-hover)"
            stopOpacity="0.35"
          />
        </linearGradient>
      </defs>
      <path
        d={PATHS[variant]}
        stroke={`url(#${gradId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}
