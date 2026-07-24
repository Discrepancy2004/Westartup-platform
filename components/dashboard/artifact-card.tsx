"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MotionCard } from "@/components/dashboard/motion-primitives";
import { useDna } from "@/components/dna/dna-provider";
import type { ArtifactKind, ArtifactRecord } from "@/lib/types/artifacts";
import { cn } from "@/lib/utils";

const CHART_ANIM = { duration: 700, easing: "ease-out" as const };

const MUTED = "#243044";
const AMBER = "#f59e0b";

function useChartAccent() {
  const { experience } = useDna();
  return {
    primary: experience.accent.accentDark,
    secondary: experience.accent.accentHoverDark,
  };
}

export function ArtifactCard({
  artifact,
  className,
  centered = false,
}: {
  artifact: ArtifactRecord;
  className?: string;
  centered?: boolean;
}) {
  const { experience } = useDna();
  const label =
    experience.kindLabels[artifact.kind] ?? kindLabelFallback(artifact.kind);

  return (
    <MotionCard className={className}>
      <article
        className={cn(
          "h-full rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-sm transition-[border-color,box-shadow] duration-250 ease-out",
          "hover:border-accent/40 hover:shadow-[0_14px_32px_-16px_rgba(0,0,0,0.4)]",
          centered && "text-center",
        )}
      >
        <div
          className={cn(
            "flex items-start gap-3",
            centered ? "justify-center" : "justify-between",
          )}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
              {label}
            </p>
            <h2 className="mt-1 font-display text-xl text-ink">
              {artifact.title}
            </h2>
          </div>
        </div>
        {artifact.summary ? (
          <p
            className={cn(
              "mt-3 text-sm leading-relaxed text-ink-secondary",
              centered && "mx-auto max-w-prose",
            )}
          >
            {artifact.summary}
          </p>
        ) : null}
        <div className="mt-5">
          <ArtifactVisual kind={artifact.kind} data={artifact.chart_data} />
        </div>
      </article>
    </MotionCard>
  );
}

function kindLabelFallback(kind: ArtifactKind) {
  return kind.replace(/-/g, " ");
}

function ArtifactVisual({ kind, data }: { kind: ArtifactKind; data: unknown }) {
  const { primary: TEAL, secondary: TEAL_DIM } = useChartAccent();
  const d = (data ?? {}) as Record<string, unknown>;

  if (kind === "idea-brief") {
    const challenges = Array.isArray(d.challenges)
      ? (d.challenges as string[])
      : [];
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["One-liner", d.oneLiner],
            ["Problem", d.problem],
            ["Solution", d.solution],
            ["Audience", d.audience],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="space-y-1 border-t border-border pt-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
              {label}
            </p>
            <p className="text-sm text-ink">{String(value ?? "—")}</p>
          </div>
        ))}
        {challenges.length ? (
          <div className="space-y-2 border-t border-border pt-3 sm:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-challenge">
              Challenges
            </p>
            <ul className="space-y-1 text-sm text-ink-secondary">
              {challenges.map((c) => (
                <li key={c}>· {c}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  if (kind === "financial-projections") {
    const years = Array.isArray(d.years)
      ? (d.years as { label: string; revenue: number; costs?: number }[])
      : [];
    if (!years.length) return <EmptyChart />;
    return (
      <div className="space-y-3">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={years}>
              <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
              <XAxis dataKey="label" stroke="#8b95a8" fontSize={11} />
              <YAxis stroke="#8b95a8" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="revenue"
                fill={TEAL}
                radius={[4, 4, 0, 0]}
                isAnimationActive
                animationDuration={CHART_ANIM.duration}
                animationEasing={CHART_ANIM.easing}
              />
              {years.some((y) => y.costs != null) ? (
                <Bar
                  dataKey="costs"
                  fill={AMBER}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive
                  animationDuration={CHART_ANIM.duration}
                  animationEasing={CHART_ANIM.easing}
                />
              ) : null}
            </BarChart>
          </ResponsiveContainer>
        </div>
        {d.notes ? (
          <p className="text-xs text-ink-tertiary">{String(d.notes)}</p>
        ) : null}
      </div>
    );
  }

  if (kind === "revenue-model") {
    const streams = Array.isArray(d.streams)
      ? (d.streams as { name: string; sharePercent: number }[])
      : [];
    if (!streams.length) return <EmptyChart />;
    const colors = [TEAL, TEAL_DIM, MUTED, AMBER, "#5eead4"];
    return (
      <div className="flex h-56 flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-44 w-full sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={streams}
                dataKey="sharePercent"
                nameKey="name"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={2}
                isAnimationActive
                animationDuration={CHART_ANIM.duration}
                animationEasing={CHART_ANIM.easing}
              >
                {streams.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2 text-sm text-ink-secondary">
          {streams.map((s, i) => (
            <li key={`${s.name}-${i}`} className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ background: colors[i % colors.length] }}
              />
              {s.name} · {s.sharePercent}%
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (kind === "market-sizing") {
    const tam = Number(d.tam ?? 0);
    const sam = Number(d.sam ?? 0);
    const som = Number(d.som ?? 0);
    const unit = String(d.unit ?? "₹ Cr");
    const max = Math.max(tam, 1);
    const rows = [
      { label: "TAM", value: tam, pct: 100 },
      { label: "SAM", value: sam, pct: (sam / max) * 100 },
      { label: "SOM", value: som, pct: (som / max) * 100 },
    ];
    return (
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex justify-between text-xs text-ink-tertiary">
              <span>{row.label}</span>
              <span>
                {row.value} {unit}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-canvas">
              <motion.div
                className="h-full rounded-full bg-accent"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.max(4, Math.min(100, row.pct))}%`,
                  opacity: row.label === "SOM" ? 1 : 0.55,
                }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
        {d.rationale ? (
          <p className="pt-2 text-xs text-ink-secondary">{String(d.rationale)}</p>
        ) : null}
      </div>
    );
  }

  if (kind === "team-overview") {
    const roles = Array.isArray(d.roles)
      ? (d.roles as { title: string; focus?: string }[])
      : [];
    const gaps = Array.isArray(d.gaps) ? (d.gaps as string[]) : [];
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink">Size · {String(d.sizeLabel ?? "—")}</p>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <div
              key={r.title}
              className="rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm"
            >
              <p className="font-medium text-ink">{r.title}</p>
              {r.focus ? (
                <p className="text-xs text-ink-tertiary">{r.focus}</p>
              ) : null}
            </div>
          ))}
        </div>
        {gaps.length ? (
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-challenge">
              Gaps
            </p>
            <ul className="mt-2 space-y-1 text-sm text-ink-secondary">
              {gaps.map((g) => (
                <li key={g}>· {g}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  if (kind === "deal-structure") {
    const raising = Boolean(d.currentlyRaising);
    const funds = Array.isArray(d.useOfFunds)
      ? (d.useOfFunds as string[])
      : [];
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink">
          {raising
            ? `Raising${d.amountInr ? ` · ₹${Number(d.amountInr).toLocaleString("en-IN")}` : ""}${d.stage ? ` · ${String(d.stage)}` : ""}`
            : "Not currently raising"}
        </p>
        {funds.length ? (
          <ul className="space-y-1 text-sm text-ink-secondary">
            {funds.map((f) => (
              <li key={f}>· {f}</li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  if (kind === "unit-economics") {
    const metrics = [
      { label: "CAC", value: d.cac, format: (n: number) => `₹${n.toLocaleString("en-IN")}` },
      { label: "LTV", value: d.ltv, format: (n: number) => `₹${n.toLocaleString("en-IN")}` },
      { label: "LTV:CAC", value: d.ltvCacRatio, format: (n: number) => `${n}×` },
      { label: "Payback", value: d.paybackMonths, format: (n: number) => `${n} mo` },
      {
        label: "Gross margin",
        value: d.grossMarginPercent,
        format: (n: number) => `${n}%`,
      },
      {
        label: "ARPU",
        value: d.arpu,
        format: (n: number) => `₹${n.toLocaleString("en-IN")}`,
      },
    ].filter((m) => typeof m.value === "number");

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-[var(--radius-md)] border border-border bg-canvas/60 px-3 py-3"
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
                {m.label}
              </p>
              <p className="mt-1 font-display text-xl text-ink">
                {m.format(Number(m.value))}
              </p>
            </div>
          ))}
        </div>
        {d.notes ? (
          <p className="text-xs text-ink-tertiary">{String(d.notes)}</p>
        ) : null}
      </div>
    );
  }

  if (kind === "traction-kpis") {
    const series = Array.isArray(d.series)
      ? (d.series as { label: string; users?: number; revenue?: number }[])
      : [];
    if (!series.length) return <EmptyChart />;
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          {typeof d.retentionPercent === "number" ? (
            <p className="text-ink-secondary">
              Retention ·{" "}
              <span className="font-medium text-ink">{d.retentionPercent}%</span>
            </p>
          ) : null}
          {typeof d.growthMoMPercent === "number" ? (
            <p className="text-ink-secondary">
              MoM growth ·{" "}
              <span className="font-medium text-ink">{d.growthMoMPercent}%</span>
            </p>
          ) : null}
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
              <XAxis dataKey="label" stroke="#8b95a8" fontSize={11} />
              <YAxis stroke="#8b95a8" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              {series.some((s) => s.users != null) ? (
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke={TEAL}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                  animationDuration={CHART_ANIM.duration}
                  animationEasing={CHART_ANIM.easing}
                />
              ) : null}
              {series.some((s) => s.revenue != null) ? (
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={AMBER}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                  animationDuration={CHART_ANIM.duration}
                  animationEasing={CHART_ANIM.easing}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {d.notes ? (
          <p className="text-xs text-ink-tertiary">{String(d.notes)}</p>
        ) : null}
      </div>
    );
  }

  if (kind === "competitive-landscape") {
    const competitors = Array.isArray(d.competitors)
      ? (d.competitors as { name: string; score: number; note?: string }[])
      : [];
    if (!competitors.length) return <EmptyChart />;
    const sorted = [...competitors].sort((a, b) => b.score - a.score);
    return (
      <div className="space-y-4">
        <p className="text-xs text-ink-tertiary">
          {String(d.axisLabel ?? "Relative strength")}
        </p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sorted} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
              <XAxis type="number" domain={[0, 100]} stroke="#8b95a8" fontSize={11} />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                stroke="#8b95a8"
                fontSize={11}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="score"
                fill={TEAL}
                radius={[0, 4, 4, 0]}
                isAnimationActive
                animationDuration={CHART_ANIM.duration}
                animationEasing={CHART_ANIM.easing}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-1 text-xs text-ink-secondary">
          {sorted.map((c) =>
            c.note ? (
              <li key={`${c.name}-${c.note}`}>
                <span className="text-ink">{c.name}</span> — {c.note}
              </li>
            ) : null,
          )}
        </ul>
        {d.notes ? (
          <p className="text-xs text-ink-tertiary">{String(d.notes)}</p>
        ) : null}
      </div>
    );
  }

  if (kind === "gtm-plan") {
    const channels = Array.isArray(d.channels)
      ? (d.channels as { name: string; sharePercent: number }[])
      : [];
    const funnel = Array.isArray(d.funnel)
      ? (d.funnel as { stage: string; value: number }[])
      : [];
    const maxFunnel = Math.max(...funnel.map((f) => f.value), 1);
    const colors = [TEAL, TEAL_DIM, MUTED, AMBER, "#5eead4"];

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {channels.length ? (
          <div className="h-48">
            <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
              Channel mix
            </p>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={channels}
                  dataKey="sharePercent"
                  nameKey="name"
                  innerRadius={36}
                  outerRadius={58}
                  isAnimationActive
                  animationDuration={CHART_ANIM.duration}
                  animationEasing={CHART_ANIM.easing}
                >
                  {channels.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : null}
        {funnel.length ? (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
              Funnel
            </p>
            {funnel.map((f) => (
              <div key={f.stage} className="space-y-1">
                <div className="flex justify-between text-xs text-ink-secondary">
                  <span>{f.stage}</span>
                  <span>{f.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-canvas">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.max(8, (f.value / maxFunnel) * 100)}%`,
                    }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {d.notes ? (
          <p className="text-xs text-ink-tertiary lg:col-span-2">
            {String(d.notes)}
          </p>
        ) : null}
      </div>
    );
  }

  if (kind === "burn-runway") {
    const months = Array.isArray(d.months)
      ? (d.months as { label: string; burn: number }[])
      : [];
    if (!months.length) return <EmptyChart />;
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm text-ink-secondary">
          {typeof d.runwayMonths === "number" ? (
            <p>
              Runway ·{" "}
              <span className="font-medium text-ink">{d.runwayMonths} mo</span>
            </p>
          ) : null}
          {typeof d.monthlyBurn === "number" ? (
            <p>
              Avg burn ·{" "}
              <span className="font-medium text-ink">
                ₹{d.monthlyBurn} L / mo
              </span>
            </p>
          ) : null}
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={months}>
              <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
              <XAxis dataKey="label" stroke="#8b95a8" fontSize={11} />
              <YAxis stroke="#8b95a8" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="burn"
                stroke={AMBER}
                strokeWidth={2}
                dot={{ r: 3, fill: AMBER }}
                isAnimationActive
                animationDuration={CHART_ANIM.duration}
                animationEasing={CHART_ANIM.easing}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {d.notes ? (
          <p className="text-xs text-ink-tertiary">{String(d.notes)}</p>
        ) : null}
      </div>
    );
  }

  if (kind === "milestones") {
    const items = Array.isArray(d.items)
      ? (d.items as {
          label: string;
          timing: string;
          status: "done" | "next" | "later";
        }[])
      : [];
    if (!items.length) return <EmptyChart />;
    const tone = {
      done: "border-success/40 text-success",
      next: "border-accent/50 text-accent",
      later: "border-border text-ink-tertiary",
    } as const;
    return (
      <div className="space-y-3">
        <ol className="relative space-y-4 border-l border-border pl-5">
          {items.map((item) => (
            <li key={`${item.label}-${item.timing}`} className="relative">
              <span className="absolute -left-[1.4rem] top-1 size-2.5 rounded-full bg-accent" />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-ink">{item.label}</p>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
                    tone[item.status],
                  )}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-ink-tertiary">{item.timing}</p>
            </li>
          ))}
        </ol>
        {d.notes ? (
          <p className="text-xs text-ink-tertiary">{String(d.notes)}</p>
        ) : null}
      </div>
    );
  }

  return <EmptyChart />;
}

const tooltipStyle = {
  background: "#141c2b",
  border: `1px solid ${MUTED}`,
  borderRadius: 8,
};

function EmptyChart() {
  return (
    <p className="text-sm text-ink-tertiary">
      Chart data will appear when the advisor updates this artifact.
    </p>
  );
}
