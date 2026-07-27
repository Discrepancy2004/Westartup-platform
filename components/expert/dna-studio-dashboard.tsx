"use client";

import Link from "next/link";
import {
  DNA_CATEGORY_LABELS,
  dnaCoveragePercent,
  dnaEstimatedImpact,
  type DnaCapsuleCategory,
} from "@/lib/expert/dna-questions";

const MODES = [
  {
    href: "/expert/dna/capsule",
    title: "Quick Insight",
    time: "2–3 min",
    purpose: "One question, one answer, one heuristic.",
    ready: true,
  },
  {
    href: "/expert/dna/interview",
    title: "Guided Interview",
    time: "15–20 min",
    purpose: "Structured survey of frameworks and decision criteria.",
    ready: false,
  },
  {
    href: "/expert/dna/library",
    title: "Knowledge Library",
    time: "Variable",
    purpose: "White papers, decks, templates, and supporting material.",
    ready: false,
  },
  {
    href: "/expert/dna/calibrate",
    title: "AI Calibration",
    time: "5–10 min",
    purpose: "Review and refine AI-generated recommendations.",
    ready: false,
  },
] as const;

export function DnaStudioDashboard({
  answeredCount,
  totalQuestions,
  categoryCounts,
}: {
  answeredCount: number;
  totalQuestions: number;
  categoryCounts: Partial<Record<DnaCapsuleCategory, number>>;
}) {
  const coverage = dnaCoveragePercent(answeredCount);
  const impact = dnaEstimatedImpact(answeredCount);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
          Expert DNA Studio
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">
          Teach WeStartup how you think
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          Your experience becomes intelligence for every founder. This isn&apos;t
          a wizard — it&apos;s a dashboard that grows over time.
        </p>
      </div>

      <div className="border border-border bg-surface/60 px-5 py-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-tertiary">
              DNA coverage
            </p>
            <p className="mt-1 font-display text-4xl text-ink">{coverage}%</p>
            <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${coverage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-tertiary">
              {answeredCount} of {totalQuestions} starter capsules
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-tertiary">
              Estimated impact
            </p>
            <p className="mt-1 font-display text-3xl text-accent">
              {impact.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-ink-tertiary">founders over time</p>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
          Continue your legacy
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {MODES.map((mode) => (
            <li key={mode.href}>
              <Link
                href={mode.href}
                className="block h-full border border-border px-4 py-4 transition-colors hover:border-accent/40 hover:bg-surface"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink">{mode.title}</p>
                  <span className="shrink-0 text-[10px] text-ink-tertiary">
                    {mode.time}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-secondary">{mode.purpose}</p>
                {!mode.ready ? (
                  <p className="mt-2 text-xs font-medium text-ink-tertiary">
                    Coming soon
                  </p>
                ) : (
                  <p className="mt-2 text-xs font-medium text-accent">
                    Start a capsule →
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {answeredCount > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
            Coverage by theme
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(DNA_CATEGORY_LABELS) as DnaCapsuleCategory[]).map(
              (cat) => (
                <li
                  key={cat}
                  className="flex items-center justify-between border border-border px-3 py-2 text-sm"
                >
                  <span className="text-ink-secondary">
                    {DNA_CATEGORY_LABELS[cat]}
                  </span>
                  <span className="text-ink">{categoryCounts[cat] ?? 0}</span>
                </li>
              ),
            )}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
