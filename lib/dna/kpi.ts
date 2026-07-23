import type { ArtifactKind, ArtifactRecord } from "@/lib/types/artifacts";
import type { KpiSlot } from "@/lib/dna/types";

function dataOf(artifacts: ArtifactRecord[], kind: ArtifactKind) {
  const hit = artifacts.find((a) => a.kind === kind);
  return (hit?.chart_data ?? null) as Record<string, unknown> | null;
}

function formatInr(n: number, suffix = ""): string {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 10) / 10;
  return `${rounded}${suffix}`;
}

/** Pull KPI display values from generated artifacts for the DNA widget strip. */
export function resolveKpiValues(
  artifacts: ArtifactRecord[],
): Record<KpiSlot, string> {
  const market = dataOf(artifacts, "market-sizing");
  const finance = dataOf(artifacts, "financial-projections");
  const unit = dataOf(artifacts, "unit-economics");
  const burn = dataOf(artifacts, "burn-runway");

  const som = market?.som;
  const unitLabel = String(market?.unit ?? "₹ Cr");
  const years = Array.isArray(finance?.years)
    ? (finance!.years as { label: string; revenue: number }[])
    : [];
  const y1 = years[0]?.revenue;
  const ltvCac = unit?.ltvCacRatio;
  const runway = burn?.runwayMonths;

  return {
    som:
      typeof som === "number" ? `${formatInr(som)} ${unitLabel}` : "—",
    y1Revenue:
      typeof y1 === "number" ? `₹${formatInr(y1)} L` : "—",
    ltvCac: typeof ltvCac === "number" ? `${formatInr(ltvCac)}×` : "—",
    runway: typeof runway === "number" ? `${Math.round(runway)} mo` : "—",
  };
}
