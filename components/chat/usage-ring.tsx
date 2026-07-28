"use client";

import type { ChatUsageSummary } from "@/lib/billing/usage";

export function UsageRing({
  usage,
  label,
}: {
  usage: ChatUsageSummary;
  label?: string;
}) {
  if (usage.limit === null) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs text-ink-secondary">
        <span className="h-2.5 w-2.5 rounded-full bg-success" />
        <span>{label ?? "Unlimited chats today"}</span>
      </div>
    );
  }

  const progress = Math.max(0, Math.min(usage.percentageUsed, 100));
  const degrees = `${(progress / 100) * 360}deg`;

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface px-3 py-2 text-xs text-ink-secondary">
      <span
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(var(--accent) ${degrees}, color-mix(in srgb, var(--border-light) 75%, transparent) ${degrees})`,
        }}
      >
        <span className="absolute inset-[4px] rounded-full bg-surface" />
        <span className="relative z-10 font-medium text-ink">
          {usage.remaining ?? 0}
        </span>
      </span>
      <div>
        <p className="font-medium text-ink">
          {label ?? `${usage.remaining ?? 0} chats left`}
        </p>
        <p className="text-[11px] text-ink-tertiary">
          {usage.used} of {usage.limit} used today
        </p>
      </div>
    </div>
  );
}
