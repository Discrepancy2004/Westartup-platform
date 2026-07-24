"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  as?: "div" | "section" | "li" | "article";
};

/**
 * Visible by default (SSR / no-JS).
 * Client: if below fold, add reveal-ready (hide), then is-visible on intersect.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.classList.add("is-visible");
      return;
    }

    const rect = el.getBoundingClientRect();
    const belowFold = rect.top > window.innerHeight * 0.88;

    if (belowFold) {
      el.classList.add("reveal-ready");
    } else {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        const show = () => el.classList.add("is-visible");
        if (delayMs > 0) window.setTimeout(show, delayMs);
        else show();
        observer.unobserve(el);
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delayMs]);

  return (
    <Tag ref={ref as never} className={cn("reveal", className)}>
      {children}
    </Tag>
  );
}
