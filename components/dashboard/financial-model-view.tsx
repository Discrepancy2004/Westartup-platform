"use client";

import { FadeIn, MotionCard } from "@/components/dashboard/motion-primitives";
import type { ArtifactRecord } from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";

function data(artifacts: ArtifactRecord[], kind: string) {
  const hit = artifacts.find((a) => a.kind === kind);
  return (hit?.chart_data ?? null) as Record<string, unknown> | null;
}

function formatMoney(n: number): string {
  if (n >= 100) return `₹${(n / 100).toFixed(1)}Cr`;
  return `₹${Math.round(n * 10) / 10}L`;
}

export function FinancialModelView({
  artifacts,
  onboarding,
}: {
  artifacts: ArtifactRecord[];
  onboarding?: OnboardingAnswers | null;
}) {
  const finance = data(artifacts, "financial-projections");
  const unit = data(artifacts, "unit-economics");
  const burn = data(artifacts, "burn-runway");
  const team = onboarding?.team?.size ?? "solo";

  const years = Array.isArray(finance?.years)
    ? (finance!.years as { label: string; revenue: number; costs?: number }[])
    : [];
  const tableYears = years.slice(0, 3);

  const capex =
    typeof finance?.capexNotes === "string" && finance.capexNotes.trim()
      ? String(finance.capexNotes)
      : "Minimal — cloud-first architecture; estimated ₹2–4L one-time for tooling, licenses, and initial infra in Year 1.";

  const opex =
    typeof finance?.opexNotes === "string" && finance.opexNotes.trim()
      ? String(finance.opexNotes)
      : typeof burn?.monthlyBurn === "number"
        ? `Year-1 OpEx scales from ~₹${burn.monthlyBurn}L / month burn path; team size ${team}. Includes infra, GTM, and operating overhead — refine with actual payroll.`
        : `Year-1 OpEx placeholder for a ${team} team — salaries, cloud, GTM, legal. Replace with real monthly P&L.`;

  const unitCopy =
    unit && typeof unit.ltv === "number" && typeof unit.cac === "number"
      ? `LTV ~₹${Number(unit.ltv).toLocaleString("en-IN")}; CAC ~₹${Number(unit.cac).toLocaleString("en-IN")}; LTV:CAC ~${unit.ltvCacRatio ?? "—"}×; payback ~${unit.paybackMonths ?? "—"} months; gross margin ~${unit.grossMarginPercent ?? "—"}%. ${typeof unit.notes === "string" ? unit.notes : "Illustrative until channel data lands."}`
      : "Unit economics not generated yet — regenerate documents from the Overview empty state or chat.";

  return (
    <div className="space-y-5">
      <FadeIn>
        <h2 className="font-display text-2xl text-ink">Financial Model</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Projection table, CapEx / OpEx framing, and unit economics for investor
          conversations.
        </p>
      </FadeIn>

      <MotionCard>
      <article className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-sm transition-[border-color,box-shadow] duration-250 ease-out hover:border-accent/35 hover:shadow-[0_14px_32px_-16px_rgba(0,0,0,0.35)]">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-display text-lg text-ink">3-Year Projection</h3>
        </div>
        {tableYears.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-canvas/60 text-xs uppercase tracking-wide text-ink-tertiary">
                <tr>
                  <th className="px-5 py-3 font-medium">Year</th>
                  <th className="px-5 py-3 font-medium">Revenue</th>
                  <th className="px-5 py-3 font-medium">Costs</th>
                  <th className="px-5 py-3 font-medium">Net</th>
                </tr>
              </thead>
              <tbody>
                {tableYears.map((y) => {
                  const costs = y.costs ?? 0;
                  const net = y.revenue - costs;
                  return (
                    <tr key={y.label} className="border-t border-border">
                      <td className="px-5 py-3 font-medium text-ink">
                        {y.label}
                      </td>
                      <td className="px-5 py-3 text-success">
                        {formatMoney(y.revenue)}
                      </td>
                      <td className="px-5 py-3 text-ink-secondary">
                        {formatMoney(costs)}
                      </td>
                      <td
                        className={cn(
                          "px-5 py-3 font-medium",
                          net >= 0 ? "text-success" : "text-danger",
                        )}
                      >
                        {formatMoney(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-tertiary">
            No projection years yet — generate documents to populate this table.
          </p>
        )}
        {typeof finance?.notes === "string" ? (
          <p className="border-t border-border px-5 py-3 text-xs text-ink-tertiary">
            {finance.notes}
          </p>
        ) : null}
      </article>
      </MotionCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <MotionCard>
          <article className="h-full rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-sm transition-[border-color,box-shadow] duration-250 ease-out hover:border-accent/35 hover:shadow-[0_14px_32px_-16px_rgba(0,0,0,0.35)]">
            <h3 className="font-display text-lg text-ink">CapEx</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              {capex}
            </p>
          </article>
        </MotionCard>
        <MotionCard>
          <article className="h-full rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-sm transition-[border-color,box-shadow] duration-250 ease-out hover:border-accent/35 hover:shadow-[0_14px_32px_-16px_rgba(0,0,0,0.35)]">
            <h3 className="font-display text-lg text-ink">OpEx</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              {opex}
            </p>
          </article>
        </MotionCard>
      </div>

      <MotionCard>
        <article className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-sm transition-[border-color,box-shadow] duration-250 ease-out hover:border-accent/35 hover:shadow-[0_14px_32px_-16px_rgba(0,0,0,0.35)]">
          <h3 className="font-display text-lg text-ink">Unit Economics</h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
            {unitCopy}
          </p>
        </article>
      </MotionCard>
    </div>
  );
}
