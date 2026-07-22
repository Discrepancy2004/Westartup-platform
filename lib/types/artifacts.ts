import { z } from "zod";

export const artifactKindSchema = z.enum([
  "idea-brief",
  "financial-projections",
  "revenue-model",
  "market-sizing",
  "team-overview",
  "deal-structure",
]);

export type ArtifactKind = z.infer<typeof artifactKindSchema>;

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

export type ArtifactRecord = {
  id: string;
  kind: ArtifactKind;
  title: string;
  summary: string | null;
  chart_data: unknown;
  updated_at: string;
};
