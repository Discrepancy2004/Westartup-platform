"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useCompanionOptional } from "@/components/companion/companion-provider";
import {
  AnimatedProgressBar,
  CircularReadiness,
  CountUp,
  FadeIn,
} from "@/components/dashboard/motion-primitives";
import {
  evaluateReadiness,
  stepXp,
  STORAGE_KEYS,
  type Achievement,
  type ReadinessStep,
  type StepStatus,
} from "@/lib/dashboard/readiness";
import type { ArtifactRecord } from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";

const MILESTONES = [25, 50, 75, 100] as const;

function readJsonSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeJsonSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

function isDone(status: StepStatus) {
  return status === "completed" || status === "validated";
}

export function InvestorReadinessPanel({
  artifacts,
  onboarding,
}: {
  artifacts: ArtifactRecord[];
  onboarding?: OnboardingAnswers | null;
}) {
  const companion = useCompanionOptional();
  const readiness = useMemo(
    () => evaluateReadiness({ artifacts, onboarding }),
    [artifacts, onboarding],
  );

  const primed = useRef(false);

  const fireReward = useCallback(
    (step: ReadinessStep) => {
      const xp = stepXp(step.weight);
      companion?.celebrate({
        title: step.label,
        xp,
      });
    },
    [companion],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const doneKey = STORAGE_KEYS.completedSteps;
    const mileKey = STORAGE_KEYS.celebratedMilestones;
    const achKey = STORAGE_KEYS.unlockedAchievements;

    const prevDone = readJsonSet(doneKey);
    const prevMiles = readJsonSet(mileKey);
    const prevAch = readJsonSet(achKey);

    if (!primed.current) {
      primed.current = true;
      const seedDone = new Set(prevDone);
      for (const step of readiness.steps) {
        if (isDone(step.status) && step.chatRefined) seedDone.add(step.id);
        else seedDone.delete(step.id);
      }
      writeJsonSet(doneKey, seedDone);

      const seedMiles = new Set(prevMiles);
      for (const m of MILESTONES) {
        if (readiness.percent >= m) seedMiles.add(String(m));
      }
      writeJsonSet(mileKey, seedMiles);

      const seedAch = new Set(prevAch);
      for (const a of readiness.achievements) {
        if (a.unlocked) seedAch.add(a.id);
      }
      writeJsonSet(achKey, seedAch);
      return;
    }

    const nextDone = new Set(prevDone);
    for (const step of readiness.steps) {
      if (isDone(step.status) && step.chatRefined) {
        if (!prevDone.has(step.id)) {
          nextDone.add(step.id);
          fireReward(step);
        }
      } else {
        nextDone.delete(step.id);
      }
    }
    writeJsonSet(doneKey, nextDone);

    const nextMiles = new Set(prevMiles);
    for (const m of MILESTONES) {
      if (readiness.percent >= m && !prevMiles.has(String(m))) {
        nextMiles.add(String(m));
        companion?.celebrate({
          title: m >= 100 ? "Startup Ready!" : `${m}% Investor Readiness`,
          milestone: m,
          line:
            m >= 100
              ? "Startup Ready! Your startup is investor ready."
              : `Nice job! You hit ${m}% Investor Readiness.`,
        });
        break;
      }
    }
    writeJsonSet(mileKey, nextMiles);

    const nextAch = new Set(prevAch);
    for (const a of readiness.achievements) {
      if (a.unlocked && !prevAch.has(a.id)) {
        companion?.celebrate({
          title: a.label,
          line: `Nice job! 🏅 ${a.label}`,
        });
      }
      if (a.unlocked) nextAch.add(a.id);
    }
    writeJsonSet(achKey, nextAch);
  }, [companion, fireReward, readiness]);

  return (
    <FadeIn className="mt-6 space-y-4" delay={0.05}>
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface/90 p-5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
                  Investor Readiness
                </p>
                <p className="mt-1 font-display text-3xl text-ink">
                  <CountUp value={readiness.percent} suffix="%" />
                </p>
              </div>
            </div>
            <AnimatedProgressBar percent={readiness.percent} />
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-tertiary">
              {readiness.steps.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-1">
                  <span
                    className={cn(
                      isDone(s.status)
                        ? "text-emerald-400"
                        : s.status === "in_progress"
                          ? "text-sky-400"
                          : "text-ink-tertiary",
                    )}
                  >
                    {isDone(s.status)
                      ? "✓"
                      : s.status === "in_progress"
                        ? "◐"
                        : "✕"}
                  </span>
                  {s.label}
                  {!s.chatRefined && s.status === "in_progress" ? (
                    <span className="text-[9px] uppercase tracking-wide text-ink-tertiary">
                      draft
                    </span>
                  ) : null}
                </span>
              ))}
            </div>
          </div>
          <CircularReadiness percent={readiness.percent} />
        </div>

        <div className="mt-5 grid gap-4 border-t border-border pt-4 lg:grid-cols-2">
          <AttentionList
            items={readiness.attention}
            hint={readiness.targetHint}
            percent={readiness.percent}
          />
          <AchievementsRow achievements={readiness.achievements} />
        </div>
      </div>
    </FadeIn>
  );
}

function AttentionList({
  items,
  hint,
  percent,
}: {
  items: { label: string; ok: boolean }[];
  hint: string;
  percent: number;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
        Needs attention
      </p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((item) => (
          <li
            key={item.label}
            className={cn(
              "flex items-center gap-2",
              item.ok ? "text-ink-secondary" : "text-amber-300/90",
            )}
          >
            <span className="w-4 text-center text-xs">
              {item.ok ? "✓" : "⚠"}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
      {percent < 80 ? (
        <p className="mt-3 text-xs text-ink-tertiary">{hint}</p>
      ) : (
        <p className="mt-3 text-xs text-emerald-400/90">
          Strong readiness — polish validated sections for diligence.
        </p>
      )}
    </div>
  );
}

function AchievementsRow({ achievements }: { achievements: Achievement[] }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
        Achievements
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {achievements.map((a) => (
          <motion.span
            key={a.id}
            initial={false}
            animate={
              a.unlocked
                ? { scale: 1, opacity: 1 }
                : { scale: 0.96, opacity: 0.45 }
            }
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]",
              a.unlocked
                ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
                : "border-border bg-canvas/40 text-ink-tertiary",
            )}
          >
            <span aria-hidden>🏅</span>
            {a.label}
            {a.unlocked ? <ShineBadge /> : null}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function ShineBadge() {
  return (
    <span className="relative ml-0.5 inline-block size-1.5 overflow-hidden rounded-full bg-emerald-400">
      <motion.span
        className="absolute inset-y-0 w-full bg-white/70"
        initial={{ x: "-100%" }}
        animate={{ x: "120%" }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          repeatDelay: 2.2,
          ease: "easeOut",
        }}
      />
    </span>
  );
}

export function StepStatusStyles(status: StepStatus) {
  switch (status) {
    case "validated":
      return {
        card: "border-emerald-500/45 shadow-[0_0_20px_rgba(16,185,129,0.12)]",
        badge: "Validated" as const,
        number:
          "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40",
      };
    case "completed":
      return {
        card: "border-emerald-500/35 shadow-[0_0_16px_rgba(16,185,129,0.1)]",
        badge: null,
        number: "bg-emerald-500/15 text-emerald-300",
      };
    case "in_progress":
      return {
        card: "border-sky-500/40 shadow-[0_0_14px_rgba(56,189,248,0.1)]",
        badge: null,
        number: "bg-sky-500/20 text-sky-300 animate-pulse",
      };
    default:
      return {
        card: "border-border",
        badge: null,
        number: "bg-canvas text-ink-tertiary",
      };
  }
}
