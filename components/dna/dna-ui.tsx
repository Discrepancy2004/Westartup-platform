"use client";

import { useDna } from "@/components/dna/dna-provider";
import { cn } from "@/lib/utils";

/** Personalized quick-action chips for chat / empty states. */
export function DnaSuggestions({
  onPick,
  className,
}: {
  onPick?: (text: string) => void;
  className?: string;
}) {
  const { experience } = useDna();

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {experience.suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick?.(s)}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-left text-xs text-ink-secondary transition-colors hover:border-accent hover:text-accent"
        >
          {experience.icons.spark} {s}
        </button>
      ))}
    </div>
  );
}

export function DnaWelcome({ className }: { className?: string }) {
  const { experience } = useDna();
  return (
    <div className={cn("space-y-1", className)}>
      <p className="font-display text-xl text-ink md:text-2xl">Welcome back</p>
      <p className="text-sm text-ink-secondary">{experience.welcomeLine}</p>
    </div>
  );
}
