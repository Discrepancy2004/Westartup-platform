import type { ArtifactRecord } from "@/lib/types/artifacts";
import type { OnboardingAnswers, TractionStage } from "@/lib/types/onboarding";

export type ValuationEstimate = {
  lowLabel: string;
  highLabel: string;
  lowCr: number;
  highCr: number;
  methodology: string;
};

function chart(artifacts: ArtifactRecord[], kind: string) {
  const hit = artifacts.find((a) => a.kind === kind);
  return (hit?.chart_data ?? null) as Record<string, unknown> | null;
}

function formatCr(n: number): string {
  if (n >= 1) return `₹${Math.round(n * 10) / 10}Cr`;
  const lakhs = Math.round(n * 100);
  return `₹${lakhs}L`;
}

/**
 * Deterministic illustrative pre-seed valuation range for the dashboard.
 * Not a formal 409A or comps analysis.
 */
export function estimateValuation(options: {
  artifacts: ArtifactRecord[];
  onboarding?: OnboardingAnswers | null;
}): ValuationEstimate {
  const { artifacts, onboarding } = options;
  const stage = (onboarding?.traction?.stage ?? "idea") as TractionStage;
  const market = chart(artifacts, "market-sizing");
  const finance = chart(artifacts, "financial-projections");
  const deal = chart(artifacts, "deal-structure");
  const unit = chart(artifacts, "unit-economics");

  const som = typeof market?.som === "number" ? market.som : 0;
  const years = Array.isArray(finance?.years)
    ? (finance!.years as { revenue: number }[])
    : [];
  const y1 = years[0]?.revenue ?? 0;
  const raisingAmount =
    typeof deal?.amountInr === "number" ? deal.amountInr / 1e7 : 0;
  const ltvCac =
    typeof unit?.ltvCacRatio === "number" ? unit.ltvCacRatio : 3;

  const stageBase: Record<TractionStage, [number, number]> = {
    idea: [0.8, 1.8],
    building: [1.2, 2.5],
    testing: [1.5, 3.0],
    growing: [2.5, 5.0],
    revenue: [4.0, 8.0],
  };

  let [low, high] = stageBase[stage] ?? stageBase.idea;

  if (som > 0) {
    low += Math.min(som * 0.02, 1.5);
    high += Math.min(som * 0.04, 3);
  }
  if (y1 > 0) {
    // y1 stored as illustrative ₹ lakhs in many packs
    const y1Cr = y1 / 100;
    low += y1Cr * 2;
    high += y1Cr * 4;
  }
  if (raisingAmount > 0) {
    low = Math.max(low, raisingAmount * 3);
    high = Math.max(high, raisingAmount * 6);
  }
  if (ltvCac >= 4) {
    high *= 1.15;
  }

  low = Math.max(0.5, Math.round(low * 10) / 10);
  high = Math.max(low + 0.5, Math.round(high * 10) / 10);

  const methodology = [
    `Illustrative pre-money range using a Cost-to-Duplicate / Indian pre-seed norm blend for a ${stage}-stage venture.`,
    som
      ? `SOM context (~${som} ${String(market?.unit ?? "₹ Cr")}) informs upside, not a revenue multiple.`
      : "No strong SOM signal — range leans on stage norms.",
    raisingAmount
      ? `Current raise framing (~₹${raisingAmount}Cr) implies typical seed dilution bands.`
      : "No active raise amount provided — range reflects early-stage comps, not a priced round.",
    "This is not a formal valuation. Replace with comps, traction evidence, and investor feedback before fundraising.",
  ].join(" ");

  return {
    lowCr: low,
    highCr: high,
    lowLabel: formatCr(low),
    highLabel: formatCr(high),
    methodology,
  };
}
