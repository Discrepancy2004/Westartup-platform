"use client";

import { cn } from "@/lib/utils";

/**
 * Sparse callout: thin curved arrow + short italic label (same type family).
 */
export function HandAnnotation({
  label,
  className,
  arrow = "left",
}: {
  label: string;
  className?: string;
  arrow?: "left" | "right" | "down";
}) {
  const path =
    arrow === "right"
      ? "M8 28 C40 8, 70 10, 96 22"
      : arrow === "down"
        ? "M48 6 C52 28, 58 48, 62 72"
        : "M100 28 C70 8, 40 10, 12 22";

  const tip =
    arrow === "right"
      ? "M88 16 L98 22 L90 30"
      : arrow === "down"
        ? "M54 64 L62 74 L70 64"
        : "M20 16 L10 22 L18 30";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-20 flex flex-col items-center",
        className,
      )}
    >
      <p className="mb-0.5 max-w-[9rem] text-center text-[11px] font-medium italic leading-snug tracking-wide text-accent">
        {label}
      </p>
      <svg width="112" height="80" viewBox="0 0 112 80" fill="none">
        <path
          d={path}
          stroke="var(--accent)"
          strokeWidth="1.35"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d={tip}
          stroke="var(--accent)"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />
      </svg>
    </div>
  );
}
