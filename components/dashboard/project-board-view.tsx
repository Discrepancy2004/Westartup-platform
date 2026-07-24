"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArtifactCard } from "@/components/dashboard/artifact-card";
import { DASH_BAND } from "@/components/dashboard/board-chrome/bands";
import { SquiggleDecor } from "@/components/dashboard/board-chrome/squiggle-decor";
import { WaveDivider } from "@/components/dashboard/board-chrome/wave-divider";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import {
  AnimatedProgressBar,
  CircularReadiness,
  CountUp,
  FadeIn,
  MotionCard,
} from "@/components/dashboard/motion-primitives";
import { useDna } from "@/components/dna/dna-provider";
import { evaluateReadiness } from "@/lib/dashboard/readiness";
import type { DashboardSectionId } from "@/lib/dna/types";
import {
  DASHBOARD_SECTIONS,
  type ArtifactKind,
  type ArtifactRecord,
} from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";

function chartData(artifacts: ArtifactRecord[], kind: ArtifactKind) {
  const hit = artifacts.find((a) => a.kind === kind);
  return (hit?.chart_data ?? null) as Record<string, unknown> | null;
}

function isDone(status: string) {
  return status === "completed" || status === "validated";
}

function statusPct(status: string) {
  if (status === "validated") return 100;
  if (status === "completed") return 100;
  if (status === "in_progress") return 55;
  return 0;
}

/** Map 7 readiness steps into 4 board phases like the Figma template. */
function buildPhases(
  steps: ReturnType<typeof evaluateReadiness>["steps"],
) {
  const byId = Object.fromEntries(steps.map((s) => [s.id, s]));
  const groups = [
    {
      label: "Idea",
      ids: ["cover", "problem"] as const,
    },
    {
      label: "Market",
      ids: ["solution", "market"] as const,
    },
    {
      label: "Model",
      ids: ["business", "financial"] as const,
    },
    {
      label: "Pitch",
      ids: ["pitch_pack"] as const,
    },
  ];

  return groups.map((g) => {
    const members = g.ids.map((id) => byId[id]).filter(Boolean);
    const avg =
      members.reduce((sum, s) => sum + statusPct(s.status), 0) /
      Math.max(members.length, 1);
    const allDone = members.every((s) => isDone(s.status));
    const anyStarted = members.some((s) => s.status !== "not_started");
    return {
      label: g.label,
      percent: Math.round(avg),
      state: allDone
        ? ("completed" as const)
        : anyStarted
          ? ("active" as const)
          : ("waiting" as const),
    };
  });
}

function parseTimingDays(timing: string): number | null {
  const lower = timing.toLowerCase();
  const week = lower.match(/(\d+)\s*w/);
  if (week) return Number(week[1]) * 7;
  const month = lower.match(/(\d+)\s*m/);
  if (month) return Number(month[1]) * 30;
  const day = lower.match(/(\d+)\s*d/);
  if (day) return Number(day[1]);
  if (lower.includes("q1") || lower.includes("quarter")) return 90;
  return null;
}

export function ProjectBoardView({
  artifacts,
  onboarding = null,
}: {
  artifacts: ArtifactRecord[];
  onboarding?: OnboardingAnswers | null;
}) {
  const { experience } = useDna();
  const byKind = useMemo(
    () => new Map(artifacts.map((a) => [a.kind, a])),
    [artifacts],
  );

  const readiness = useMemo(
    () => evaluateReadiness({ artifacts, onboarding }),
    [artifacts, onboarding],
  );

  const phases = useMemo(
    () => buildPhases(readiness.steps),
    [readiness.steps],
  );

  const brief = chartData(artifacts, "idea-brief");
  const burn = chartData(artifacts, "burn-runway");
  const finance = chartData(artifacts, "financial-projections");
  const team = chartData(artifacts, "team-overview");
  const milestones = chartData(artifacts, "milestones");
  const traction = chartData(artifacts, "traction-kpis");
  const competitive = chartData(artifacts, "competitive-landscape");
  const deal = chartData(artifacts, "deal-structure");

  const challenges = Array.isArray(brief?.challenges)
    ? (brief!.challenges as string[]).slice(0, 4)
    : [];

  const attentionRisks = readiness.attention
    .filter((a) => !a.ok)
    .slice(0, 3)
    .map((a) => a.label);

  const riskLines = [
    ...attentionRisks.map((l) => ({ text: l, tone: "high" as const })),
    ...challenges.slice(0, 2).map((c) => ({
      text: c,
      tone: "medium" as const,
    })),
  ].slice(0, 3);

  const runwayMonths =
    typeof burn?.runwayMonths === "number" ? burn.runwayMonths : null;
  const monthlyBurn =
    typeof burn?.monthlyBurn === "number" ? burn.monthlyBurn : null;
  const years = Array.isArray(finance?.years)
    ? (finance!.years as { label: string; revenue: number; costs?: number }[])
    : [];
  const y1 = years[0];
  const budgetTotal =
    y1 && typeof y1.costs === "number"
      ? y1.costs
      : monthlyBurn && runwayMonths
        ? monthlyBurn * Math.max(runwayMonths, 1)
        : monthlyBurn
          ? monthlyBurn * 12
          : null;
  const budgetUsed =
    monthlyBurn && runwayMonths && budgetTotal
      ? Math.min(budgetTotal, monthlyBurn * 3)
      : budgetTotal
        ? budgetTotal * 0.65
        : null;
  const overTargetPct =
    budgetTotal && budgetUsed && budgetUsed > budgetTotal * 0.9
      ? Math.round(((budgetUsed - budgetTotal * 0.9) / (budgetTotal * 0.9)) * 1000) /
        10
      : null;

  const overdueSteps = readiness.steps
    .filter((s) => s.attention && !isDone(s.status))
    .slice(0, 4)
    .map((s, i) => ({
      overdue: s.status === "not_started" ? `${8 + i * 3}d` : `${3 + i}d`,
      task: s.label,
      deadline: "-",
      owner: "Founder",
      severity: s.status === "not_started" ? "high" : "medium",
    }));

  const milestoneItems = Array.isArray(milestones?.items)
    ? (milestones!.items as {
        label: string;
        timing: string;
        status: "done" | "next" | "later";
      }[])
    : [];

  const nextMilestone =
    milestoneItems.find((m) => m.status === "next") ??
    milestoneItems.find((m) => m.status === "later") ??
    null;

  const countdownDays =
    (nextMilestone && parseTimingDays(nextMilestone.timing)) ??
    Math.max(14, 120 - readiness.percent);

  const launchLabel = nextMilestone?.label ?? readiness.targetHint ?? "Next raise milestone";

  const roles = Array.isArray(team?.roles)
    ? (team!.roles as { title?: string; focus?: string }[])
    : [];

  const handleTimeData =
    Array.isArray(competitive?.competitors) &&
    (competitive!.competitors as { name: string; score: number }[]).length
      ? (competitive!.competitors as { name: string; score: number }[])
          .slice(0, 5)
          .map((c) => ({
            name: c.name.split(" ")[0] ?? c.name,
            value: Math.round((c.score / 10) * 10) / 10,
          }))
      : Array.isArray(traction?.series)
        ? (traction!.series as { label: string; users?: number; revenue?: number }[])
            .slice(0, 5)
            .map((s) => ({
              name: s.label,
              value:
                typeof s.users === "number"
                  ? Math.round(s.users / 100) / 10
                  : typeof s.revenue === "number"
                    ? Math.round(s.revenue / 10) / 10
                    : 3.5,
            }))
        : roles.slice(0, 5).map((r, i) => ({
            name: (r.title ?? `Role ${i + 1}`).split(" ")[0],
            value: 3.5 + i * 0.8,
          }));

  const upcoming = milestoneItems
    .filter((m) => m.status !== "done")
    .slice(0, 5)
    .map((m, i) => ({
      employee:
        roles[i % Math.max(roles.length, 1)]?.title?.split(" ")[0] ?? "Team",
      task: m.label,
      deadline: m.timing,
      workload: 30 + ((i * 17) % 50),
    }));

  const activityLog = [
    ...artifacts
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
      .slice(0, 6)
      .map((a) => ({
        kind: a.source === "chat" ? ("comment" as const) : ("done" as const),
        text:
          a.source === "chat"
            ? `Advisor refined: ${a.title}`
            : `Document ready: ${a.title}`,
        when: relativeTime(a.updated_at),
      })),
    ...overdueSteps.slice(0, 2).map((t) => ({
      kind: "alert" as const,
      text: `Attention: ${t.task}`,
      when: "Open",
    })),
  ].slice(0, 8);

  const leader =
    roles[0]?.title ??
    onboarding?.["about-you"]?.roleAndBackground?.slice(0, 40) ??
    "Founder";

  const overallStatus =
    readiness.percent >= 75
      ? "Investor-ready path"
      : readiness.percent >= 40
        ? "In progress"
        : "Early draft";

  const boardCard =
    "rounded-[var(--radius-md)] border border-border bg-surface/80 p-4 shadow-sm";

  if (!artifacts.length) {
    return (
      <div className="relative isolate overflow-hidden rounded-[var(--radius-lg)]">
        <section
          className="relative space-y-6 px-3 py-6 sm:px-4"
          style={{ background: DASH_BAND.ink }}
        >
          <BoardHeader />
          <DashboardEmptyState />
        </section>
      </div>
    );
  }

  return (
    <div className="relative isolate overflow-hidden rounded-[var(--radius-lg)]">
      {/* Band 1: header + progress / phases / countdown */}
      <section
        className="relative space-y-5 px-3 py-6 sm:px-4"
        style={{ background: DASH_BAND.ink }}
      >
        <SquiggleDecor
          variant="s"
          className="right-[4%] top-[10%] hidden opacity-55 md:block"
        />
        <BoardHeader />

        <div className="relative grid gap-4 lg:grid-cols-12">
          <MotionCard className={cn(boardCard, "lg:col-span-2")}>
            <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
              Overall progress
            </p>
            <div className="mt-3 flex justify-center">
              <CircularReadiness percent={readiness.percent} size={96} />
            </div>
            <p className="mt-2 text-center text-xs text-ink-secondary">
              Investor readiness
            </p>
          </MotionCard>

          <MotionCard className={cn(boardCard, "relative lg:col-span-7")}>
            <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
              Raise prep phases
            </p>
            <div className="mt-3">
              <AnimatedProgressBar percent={readiness.percent} className="h-2.5" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {phases.map((p) => (
                <div key={p.label} className="text-center">
                  <PhaseGlyph state={p.state} percent={p.percent} />
                  <p className="mt-2 text-sm font-medium text-ink">{p.label}</p>
                  <p className="text-[11px] text-ink-tertiary">
                    {p.state === "completed"
                      ? "Completed"
                      : p.state === "active"
                        ? `${p.percent}%`
                        : "Waiting"}
                  </p>
                </div>
              ))}
            </div>
          </MotionCard>

          <MotionCard className="lg:col-span-3">
            <div
              className={cn(
                boardCard,
                "flex h-full flex-col justify-between",
              )}
              style={{
                backgroundImage: `linear-gradient(145deg, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)`,
              }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
                  Next milestone
                </p>
                <p className="mt-2 text-sm font-medium text-ink line-clamp-2">
                  {launchLabel}
                </p>
              </div>
              <div className="mt-4">
                <p className="font-display text-4xl text-accent">
                  <CountUp value={countdownDays} />
                  <span className="ml-1 text-lg text-ink-secondary">Days</span>
                </p>
                <p className="mt-1 text-xs text-ink-tertiary">
                  Target window (illustrative)
                </p>
              </div>
            </div>
          </MotionCard>
        </div>
      </section>

      <WaveDivider fill={DASH_BAND.slate} height={72} />

      {/* Band 2: risks / runway / ops grid + venture log */}
      <section
        className="relative space-y-4 px-3 py-8 sm:px-4"
        style={{ background: DASH_BAND.slate }}
      >
        <SquiggleDecor
          variant="arc"
          className="left-[3%] bottom-[8%] hidden opacity-45 lg:block"
          width={130}
          height={52}
        />
        <div className="relative grid gap-4 lg:grid-cols-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-2">
            <MotionCard className={boardCard}>
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
                Risks
              </p>
              <ul className="mt-3 space-y-2.5">
                {(riskLines.length
                  ? riskLines
                  : [
                      {
                        text: "No critical risks flagged. Keep pressure-testing assumptions.",
                        tone: "medium" as const,
                      },
                    ]
                ).map((r) => (
                  <li
                    key={r.text}
                    className={cn(
                      "text-sm font-medium leading-snug",
                      r.tone === "high" ? "text-red-400" : "text-amber-400",
                    )}
                  >
                    {r.text}
                  </li>
                ))}
              </ul>
            </MotionCard>

            <MotionCard className={boardCard}>
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
                Runway & burn
              </p>
              <div className="mt-3 flex h-24 items-end gap-2">
                {[
                  { label: "Plan", h: 100, fill: "var(--border)" },
                  {
                    label: "Used",
                    h:
                      budgetTotal && budgetUsed
                        ? Math.min(100, (budgetUsed / budgetTotal) * 100)
                        : 62,
                    fill: "var(--accent)",
                  },
                  {
                    label: "Target",
                    h: 88,
                    fill: "color-mix(in srgb, var(--accent) 35%, var(--border))",
                  },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <div
                      className="w-full rounded-t-md"
                      style={{
                        height: `${b.h}%`,
                        background: b.fill,
                        minHeight: 8,
                      }}
                    />
                    <span className="text-[10px] text-ink-tertiary">
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1 text-xs text-ink-secondary">
                <p>
                  Runway:{" "}
                  <span className="font-medium text-ink">
                    {runwayMonths != null
                      ? `${Math.round(runwayMonths)} mo`
                      : "-"}
                  </span>
                </p>
                <p>
                  Monthly burn:{" "}
                  <span className="font-medium text-ink">
                    {monthlyBurn != null
                      ? `₹${Math.round(monthlyBurn)} L`
                      : "-"}
                  </span>
                </p>
                {overTargetPct != null ? (
                  <p className="font-medium text-red-400">
                    Currently {overTargetPct}% over soft target
                  </p>
                ) : (
                  <p className="text-accent">Within planning band</p>
                )}
              </div>
            </MotionCard>

            <MotionCard className={cn(boardCard, "sm:col-span-2")}>
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
                Attention queue
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.12em] text-ink-tertiary">
                      <th className="pb-2 font-medium">Overdue</th>
                      <th className="pb-2 font-medium">Task</th>
                      <th className="pb-2 font-medium">Owner</th>
                      <th className="pb-2 font-medium">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(overdueSteps.length
                      ? overdueSteps
                      : [
                          {
                            overdue: "-",
                            task: "No blocking diligence items",
                            owner: "-",
                            severity: "medium",
                          },
                        ]
                    ).map((row) => (
                      <tr key={row.task} className="border-t border-border/80">
                        <td className="py-2.5">
                          <span
                            className={cn(
                              "inline-flex size-9 items-center justify-center rounded-full text-xs font-semibold",
                              row.severity === "high"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-accent-subtle text-accent",
                            )}
                          >
                            {row.overdue}
                          </span>
                        </td>
                        <td className="py-2.5 text-ink">{row.task}</td>
                        <td className="py-2.5 text-ink-secondary">
                          {row.owner}
                        </td>
                        <td className="py-2.5 capitalize text-ink-tertiary">
                          {row.severity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </MotionCard>

            <MotionCard className={boardCard}>
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
                Venture summary
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-tertiary">One-liner</dt>
                  <dd className="max-w-[60%] text-right text-ink line-clamp-2">
                    {String(
                      brief?.oneLiner ??
                        onboarding?.idea?.description ??
                        "-",
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-tertiary">Leader</dt>
                  <dd className="text-accent">{leader}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-tertiary">Stage</dt>
                  <dd className="text-accent">
                    {onboarding?.traction?.stage ??
                      onboarding?.["deal-structure"]?.stage ??
                      "-"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-tertiary">Ask</dt>
                  <dd className="text-accent">
                    {typeof deal?.amountInr === "number"
                      ? `₹${Math.round(deal.amountInr)} L`
                      : (onboarding?.["deal-structure"]?.amount ?? "-")}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-tertiary">Status</dt>
                  <dd className="text-accent">{overallStatus}</dd>
                </div>
              </dl>
            </MotionCard>

            <MotionCard className={boardCard}>
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
                {competitive ? "Competitive strength" : "Traction pulse"}
              </p>
              <div className="mt-2 h-40">
                {handleTimeData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={handleTimeData}>
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "var(--ink-tertiary)", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {handleTimeData.map((_, i) => (
                          <Cell
                            key={i}
                            fill="var(--accent)"
                            fillOpacity={0.55 + i * 0.08}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="pt-8 text-center text-sm text-ink-tertiary">
                    Generate competitive or traction docs to populate.
                  </p>
                )}
              </div>
            </MotionCard>

            <MotionCard className={cn(boardCard, "sm:col-span-2")}>
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
                Upcoming milestones
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.12em] text-ink-tertiary">
                      <th className="pb-2 font-medium">Owner</th>
                      <th className="pb-2 font-medium">Milestone</th>
                      <th className="pb-2 font-medium">Timing</th>
                      <th className="pb-2 font-medium">Load</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(upcoming.length
                      ? upcoming
                      : [
                          {
                            employee: "You",
                            task: "Pressure-test assumptions in chat",
                            deadline: "This week",
                            workload: 40,
                          },
                        ]
                    ).map((row) => (
                      <tr key={row.task} className="border-t border-border/80">
                        <td className="py-2.5 text-ink-secondary">
                          {row.employee}
                        </td>
                        <td className="py-2.5 text-ink">{row.task}</td>
                        <td className="py-2.5 text-ink-tertiary">
                          {row.deadline}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-border">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${row.workload}%` }}
                              />
                            </div>
                            <span className="text-xs text-ink-tertiary">
                              {row.workload}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </MotionCard>
          </div>

          <MotionCard className={cn(boardCard, "lg:col-span-3")}>
            <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
              Venture log
            </p>
            <ul className="mt-4 space-y-4">
              {activityLog.map((item, i) => (
                <li key={`${item.text}-${i}`} className="flex gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px]",
                      item.kind === "done" && "bg-accent-subtle text-accent",
                      item.kind === "comment" && "bg-accent/20 text-accent",
                      item.kind === "alert" && "bg-red-500/20 text-red-300",
                    )}
                  >
                    {item.kind === "done"
                      ? "✓"
                      : item.kind === "comment"
                        ? "◉"
                        : "!"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-ink">{item.text}</p>
                    <p className="mt-0.5 text-[11px] text-ink-tertiary">
                      {item.when}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/chat"
              className="mt-5 inline-block text-xs font-medium text-accent underline-offset-2 hover:underline"
            >
              View all in chat →
            </Link>
          </MotionCard>
        </div>
      </section>

      <WaveDivider fill={DASH_BAND.mist} height={72} />

      {/* Band 3: full document pack */}
      <section
        className="relative space-y-10 px-3 py-10 sm:px-4"
        style={{ background: DASH_BAND.mist }}
      >
        <FadeIn>
          <div>
            <h2 className="font-display text-2xl text-ink">
              Investor documents
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Full artifact pack from Overview - charts and narratives not
              summarized in the board above.
            </p>
          </div>
        </FadeIn>

        {DASHBOARD_SECTIONS.map((section, sectionIndex) => {
          const cards = section.kinds
            .map((kind) => byKind.get(kind))
            .filter((a): a is ArtifactRecord => Boolean(a));
          const sectionId = section.id as DashboardSectionId;
          const title =
            experience.sectionTitles[sectionId] ?? section.id;
          const heroKinds = new Set<ArtifactKind>(section.heroKinds ?? []);

          return (
            <FadeIn key={section.id} delay={0.04 + sectionIndex * 0.03}>
              <section
                id={`board-section-${section.id}`}
                className="scroll-mt-8 space-y-4"
              >
                <div className="flex items-end justify-between gap-3 border-b border-border pb-3">
                  <h3 className="font-display text-xl text-ink">{title}</h3>
                  <p className="text-xs text-ink-tertiary">
                    {cards.length} document{cards.length === 1 ? "" : "s"}
                  </p>
                </div>

                {!cards.length ? (
                  <div className="rounded-[var(--radius-md)] border border-dashed border-border px-4 py-8 text-center text-sm text-ink-tertiary">
                    Documents for this section are missing.{" "}
                    <Link href="/chat" className="text-accent underline">
                      Regenerate from chat
                    </Link>
                    .
                  </div>
                ) : (
                  <div className="grid gap-5 lg:grid-cols-2">
                    {cards.map((artifact) => {
                      const fullWidth =
                        heroKinds.has(artifact.kind) || cards.length === 1;
                      return (
                        <ArtifactCard
                          key={artifact.id}
                          artifact={artifact}
                          className={fullWidth ? "lg:col-span-2" : undefined}
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            </FadeIn>
          );
        })}
      </section>
    </div>
  );
}

function BoardHeader() {
  const { experience } = useDna();
  return (
    <FadeIn className="max-w-2xl space-y-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
        Alternate view · {experience.label}
      </p>
      <h1 className="font-display text-3xl text-ink">Project Board</h1>
      <p className="text-sm text-ink-secondary">
        Ops-style board for raise prep. Accent colors follow your onboarding
        DNA ({experience.industryPhrase}).
      </p>
    </FadeIn>
  );
}

function PhaseGlyph({
  state,
  percent,
}: {
  state: "completed" | "active" | "waiting";
  percent: number;
}) {
  if (state === "completed") {
    return (
      <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-accent text-sm font-bold text-[var(--canvas)]">
        ✓
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="relative mx-auto flex size-11 items-center justify-center">
        <svg width="44" height="44" className="-rotate-90">
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="var(--border)"
            strokeWidth="4"
          />
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 18}
            strokeDashoffset={
              2 * Math.PI * 18 * (1 - Math.min(100, percent) / 100)
            }
          />
        </svg>
        <span className="absolute text-[10px] font-semibold text-accent">
          {percent}%
        </span>
      </span>
    );
  }
  return (
    <span className="mx-auto flex size-11 items-center justify-center rounded-full border-2 border-accent/50 text-accent">
      ◷
    </span>
  );
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "Recently";
  const days = Math.max(0, Math.round((Date.now() - t) / 86_400_000));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}
