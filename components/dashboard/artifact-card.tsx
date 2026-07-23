"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDna } from "@/components/dna/dna-provider";
import type { ArtifactKind, ArtifactRecord } from "@/lib/types/artifacts";

const MUTED = "#243044";
const AMBER = "#f59e0b";

function useChartAccent() {
  const { experience } = useDna();
  return {
    primary: experience.accent.accentDark,
    secondary: experience.accent.accentHoverDark,
  };
}

export function ArtifactCard({ artifact }: { artifact: ArtifactRecord }) {
  const { experience } = useDna();
  const label =
    experience.kindLabels[artifact.kind] ?? kindLabelFallback(artifact.kind);

  return (
    <article className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
            {label}
          </p>
          <h2 className="mt-1 font-display text-xl text-ink">{artifact.title}</h2>
        </div>
      </div>
      {artifact.summary ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          {artifact.summary}
        </p>
      ) : null}
      <div className="mt-5">
        <ArtifactVisual kind={artifact.kind} data={artifact.chart_data} />
      </div>
    </article>
  );
}

function kindLabelFallback(kind: ArtifactKind) {
  switch (kind) {
    case "idea-brief":
      return "Idea brief";
    case "financial-projections":
      return "Financial projections";
    case "revenue-model":
      return "Revenue model";
    case "market-sizing":
      return "Market sizing";
    case "team-overview":
      return "Team overview";
    case "deal-structure":
      return "Deal structure";
    default:
      return kind;
  }
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
          <div className="sm:col-span-2 space-y-2 border-t border-border pt-3">
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
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={years}>
            <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
            <XAxis dataKey="label" stroke="#8b95a8" fontSize={11} />
            <YAxis stroke="#8b95a8" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: "#141c2b",
                border: `1px solid ${MUTED}`,
                borderRadius: 8,
              }}
            />
            <Bar dataKey="revenue" fill={TEAL} radius={[4, 4, 0, 0]} />
            {years.some((y) => y.costs != null) ? (
              <Bar dataKey="costs" fill={AMBER} radius={[4, 4, 0, 0]} />
            ) : null}
          </BarChart>
        </ResponsiveContainer>
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
              >
                {streams.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#141c2b",
                  border: `1px solid ${MUTED}`,
                  borderRadius: 8,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2 text-sm text-ink-secondary">
          {streams.map((s, i) => (
            <li key={s.name} className="flex items-center gap-2">
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
              <div
                className="h-full rounded-full bg-accent"
                style={{
                  width: `${Math.max(4, Math.min(100, row.pct))}%`,
                  opacity: row.label === "SOM" ? 1 : 0.55,
                }}
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
        <p className="text-sm text-ink">
          Size · {String(d.sizeLabel ?? "—")}
        </p>
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

  return <EmptyChart />;
}

function EmptyChart() {
  return (
    <p className="text-sm text-ink-tertiary">
      Chart data will appear when the advisor updates this artifact.
    </p>
  );
}
