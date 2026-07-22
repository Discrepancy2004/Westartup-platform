"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

/** Compact icon toggle — taste skill: quiet chrome, no pill clutter. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-[var(--radius-md)] text-ink-tertiary transition-colors hover:bg-surface hover:text-ink",
        className,
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        <Sun className="size-4" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="size-4" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
