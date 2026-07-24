"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Organic section seam. Fill = solid color of the band BELOW the crest.
 * Place between two opaque bands with different tones so the join reads
 * as a real transition (not a line drawn on one flat field).
 */
export function WaveDivider({
  fill = "var(--surface)",
  className,
  flip = false,
  height = 64,
}: {
  fill?: string;
  className?: string;
  flip?: boolean;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [4, -4]);

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none relative z-[1] -my-px w-full overflow-hidden leading-[0]",
        flip && "rotate-180",
        className,
      )}
      style={{ height, y }}
    >
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="block h-full w-full"
      >
        {/* Soft leading edge (same fill, lower opacity) */}
        <path
          d="M0 42C220 8 380 92 560 58C740 22 900 6 1100 48C1240 78 1340 52 1440 44V100H0Z"
          style={{ fill }}
          opacity="0.35"
        />
        {/* Solid crest = next band color */}
        <path
          d="M0 50C200 14 360 88 540 62C720 34 880 2 1080 44C1220 74 1330 48 1440 52V100H0Z"
          style={{ fill }}
        />
      </svg>
    </motion.div>
  );
}

/** Isolated shape review - not for production page chrome. */
export function WaveDividerPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-border",
        className,
      )}
    >
      <div
        className="px-4 pt-5 pb-2 text-center"
        style={{
          background: "color-mix(in srgb, #05080f 45%, var(--canvas))",
        }}
      >
        <p className="text-xs text-ink-secondary">Wave shape preview</p>
      </div>
      <WaveDivider
        fill="color-mix(in srgb, var(--surface) 48%, var(--canvas))"
        height={80}
      />
      <div
        className="px-4 py-4 text-center text-xs text-ink-tertiary"
        style={{
          background: "color-mix(in srgb, var(--surface) 48%, var(--canvas))",
        }}
      >
        Next band
      </div>
    </div>
  );
}
