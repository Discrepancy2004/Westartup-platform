import { z } from "zod";

export const artifactKindSchema = z.enum([
  "idea-brief",
  "financial-projections",
  "revenue-model",
  "market-sizing",
  "team-overview",
  "deal-structure",
  "unit-economics",
  "traction-kpis",
  "competitive-landscape",
  "gtm-plan",
  "burn-runway",
  "milestones",
]);

export type ArtifactKind = z.infer<typeof artifactKindSchema>;

export const ARTIFACT_KINDS = artifactKindSchema.options;

export const ideaBriefDataSchema = z.object({
  oneLiner: z.string(),
  problem: z.string(),
  solution: z.string(),
  audience: z.string(),
  challenges: z.array(z.string()).default([]),
});

export const financialProjectionsDataSchema = z.object({
  currency: z.literal("INR").default("INR"),
  years: z.array(
    z.object({
      label: z.string(),
      revenue: z.number(),
      costs: z.number().optional(),
    }),
  ),
  notes: z.string().optional(),
  capexNotes: z.string().optional(),
  opexNotes: z.string().optional(),
});

export const revenueModelDataSchema = z.object({
  streams: z.array(
    z.object({
      name: z.string(),
      sharePercent: z.number(),
      notes: z.string().optional(),
    }),
  ),
  unitEconomics: z
    .object({
      arpu: z.number().optional(),
      cac: z.number().optional(),
      ltv: z.number().optional(),
    })
    .optional(),
});

export const marketSizingDataSchema = z.object({
  currency: z.literal("INR").default("INR"),
  tam: z.number(),
  sam: z.number(),
  som: z.number(),
  unit: z.string().default("₹ Cr"),
  rationale: z.string().optional(),
});

export const teamOverviewDataSchema = z.object({
  sizeLabel: z.string(),
  roles: z.array(
    z.object({
      title: z.string(),
      focus: z.string().optional(),
    }),
  ),
  gaps: z.array(z.string()).default([]),
});

export const dealStructureDataSchema = z.object({
  currentlyRaising: z.boolean(),
  amountInr: z.number().optional(),
  stage: z.string().optional(),
  useOfFunds: z.array(z.string()).default([]),
});

export const unitEconomicsDataSchema = z.object({
  currency: z.literal("INR").default("INR"),
  cac: z.number(),
  ltv: z.number(),
  ltvCacRatio: z.number(),
  paybackMonths: z.number(),
  grossMarginPercent: z.number(),
  arpu: z.number().optional(),
  notes: z.string().optional(),
});

export const tractionKpisDataSchema = z.object({
  series: z.array(
    z.object({
      label: z.string(),
      users: z.number().optional(),
      revenue: z.number().optional(),
    }),
  ),
  retentionPercent: z.number().optional(),
  growthMoMPercent: z.number().optional(),
  notes: z.string().optional(),
});

export const competitiveLandscapeDataSchema = z.object({
  competitors: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
      note: z.string().optional(),
    }),
  ),
  axisLabel: z.string().default("Relative strength"),
  notes: z.string().optional(),
});

export const gtmPlanDataSchema = z.object({
  channels: z.array(
    z.object({
      name: z.string(),
      sharePercent: z.number(),
    }),
  ),
  funnel: z.array(
    z.object({
      stage: z.string(),
      value: z.number(),
    }),
  ),
  notes: z.string().optional(),
});

export const burnRunwayDataSchema = z.object({
  currency: z.literal("INR").default("INR"),
  months: z.array(
    z.object({
      label: z.string(),
      burn: z.number(),
    }),
  ),
  runwayMonths: z.number(),
  monthlyBurn: z.number().optional(),
  notes: z.string().optional(),
});

export const milestonesDataSchema = z.object({
  items: z.array(
    z.object({
      label: z.string(),
      timing: z.string(),
      status: z.enum(["done", "next", "later"]),
    }),
  ),
  notes: z.string().optional(),
});

/** Dashboard section grouping for the investor workspace layout. */
export const DASHBOARD_SECTIONS: {
  id: string;
  kinds: ArtifactKind[];
  heroKinds?: ArtifactKind[];
}[] = [
  { id: "story", kinds: ["idea-brief"] },
  { id: "market", kinds: ["market-sizing", "competitive-landscape"] },
  { id: "economics", kinds: ["revenue-model", "unit-economics"] },
  {
    id: "financials",
    kinds: ["financial-projections", "burn-runway"],
    heroKinds: ["financial-projections"],
  },
  {
    id: "traction",
    kinds: ["traction-kpis", "gtm-plan"],
    heroKinds: ["traction-kpis"],
  },
  { id: "team", kinds: ["team-overview", "deal-structure", "milestones"] },
];

export type ArtifactRecord = {
  id: string;
  kind: ArtifactKind;
  title: string;
  summary: string | null;
  chart_data: unknown;
  updated_at: string;
  /** bootstrap = onboarding draft; chat = advisor refined */
  source?: "bootstrap" | "chat" | null;
};
