import { generateObject } from "ai";
import { z } from "zod";
import { buildFallbackArtifacts } from "@/lib/ai/fallback-artifacts";
import { getLanguageModelResilient } from "@/lib/ai/provider";
import { detectStartupDna } from "@/lib/dna/detect";
import { buildHiddenDnaContext } from "@/lib/dna/resolve";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

const titled = {
  title: z.string(),
  summary: z.string(),
};

const bootstrapSchema = z.object({
  advisorOpening: z
    .string()
    .describe(
      "2-4 sentences: sharp challenge + one probing question. No welcome fluff.",
    ),
  ideaBrief: z.object({
    ...titled,
    oneLiner: z.string(),
    problem: z.string(),
    solution: z.string(),
    audience: z.string(),
    challenges: z.array(z.string()).min(1).max(4),
  }),
  financialProjections: z.object({
    ...titled,
    years: z
      .array(
        z.object({
          label: z.string(),
          revenue: z.number(),
          costs: z.number().optional(),
        }),
      )
      .min(3)
      .max(6),
    notes: z.string().optional(),
    capexNotes: z
      .string()
      .optional()
      .describe("Short CapEx note for Year 1 infra/tooling"),
    opexNotes: z
      .string()
      .optional()
      .describe("Short OpEx note covering salaries, GTM, infra"),
  }),
  revenueModel: z.object({
    ...titled,
    streams: z
      .array(
        z.object({
          name: z.string(),
          sharePercent: z.number(),
        }),
      )
      .min(1)
      .max(5),
  }),
  marketSizing: z.object({
    ...titled,
    tam: z.number(),
    sam: z.number(),
    som: z.number(),
    unit: z.string().default("₹ Cr"),
    rationale: z.string(),
  }),
  teamOverview: z.object({
    ...titled,
    sizeLabel: z.string(),
    roles: z.array(
      z.object({ title: z.string(), focus: z.string().optional() }),
    ),
    gaps: z.array(z.string()),
  }),
  unitEconomics: z.object({
    ...titled,
    cac: z.number(),
    ltv: z.number(),
    ltvCacRatio: z.number(),
    paybackMonths: z.number(),
    grossMarginPercent: z.number(),
    arpu: z.number().optional(),
    notes: z.string().optional(),
  }),
  tractionKpis: z.object({
    ...titled,
    series: z
      .array(
        z.object({
          label: z.string(),
          users: z.number().optional(),
          revenue: z.number().optional(),
        }),
      )
      .min(4)
      .max(8),
    retentionPercent: z.number().optional(),
    growthMoMPercent: z.number().optional(),
    notes: z.string().optional(),
  }),
  competitiveLandscape: z.object({
    ...titled,
    competitors: z
      .array(
        z.object({
          name: z.string(),
          score: z.number(),
          note: z.string().optional(),
        }),
      )
      .min(3)
      .max(6),
    axisLabel: z.string().default("Relative strength"),
    notes: z.string().optional(),
  }),
  gtmPlan: z.object({
    ...titled,
    channels: z
      .array(
        z.object({
          name: z.string(),
          sharePercent: z.number(),
        }),
      )
      .min(2)
      .max(5),
    funnel: z
      .array(
        z.object({
          stage: z.string(),
          value: z.number(),
        }),
      )
      .min(3)
      .max(5),
    notes: z.string().optional(),
  }),
  burnRunway: z.object({
    ...titled,
    months: z
      .array(
        z.object({
          label: z.string(),
          burn: z.number(),
        }),
      )
      .min(4)
      .max(8),
    runwayMonths: z.number(),
    monthlyBurn: z.number().optional(),
    notes: z.string().optional(),
  }),
  milestones: z.object({
    ...titled,
    items: z
      .array(
        z.object({
          label: z.string(),
          timing: z.string(),
          status: z.enum(["done", "next", "later"]),
        }),
      )
      .min(3)
      .max(6),
    notes: z.string().optional(),
  }),
  dealStructure: z
    .object({
      ...titled,
      currentlyRaising: z.boolean(),
      amountInr: z.number().optional(),
      stage: z.string().optional(),
      useOfFunds: z.array(z.string()),
    })
    .optional(),
});

type ArtifactRow = {
  user_id: string;
  conversation_id: string;
  kind: string;
  title: string;
  summary: string;
  chart_data: Record<string, unknown>;
  updated_at: string;
  source: "bootstrap" | "chat";
};

async function persistArtifacts(
  supabase: SupabaseServer,
  rows: ArtifactRow[],
  conversationId: string,
  advisorOpening: string,
) {
  let errorMessage: string | null = null;
  const { error } = await supabase.from("artifacts").upsert(rows, {
    onConflict: "user_id,kind",
  });
  if (error) {
    errorMessage = error.message;
    try {
      const { createServiceClient } = await import("@/lib/supabase/admin");
      const admin = createServiceClient();
      const { error: adminError } = await admin.from("artifacts").upsert(rows, {
        onConflict: "user_id,kind",
      });
      if (adminError) {
        throw new Error(
          `Could not save artifacts: ${adminError.message} (also failed as user: ${errorMessage})`,
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Could not save")) {
        throw err;
      }
      throw new Error(`Could not save artifacts: ${errorMessage}`);
    }
  }

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "assistant",
    content: advisorOpening,
  });
}

function stamp(
  userId: string,
  conversationId: string,
  kind: string,
  title: string,
  summary: string,
  chart_data: Record<string, unknown>,
): ArtifactRow {
  return {
    user_id: userId,
    conversation_id: conversationId,
    kind,
    title,
    summary,
    chart_data,
    updated_at: new Date().toISOString(),
    source: "bootstrap",
  };
}

export async function generateBootstrapArtifacts(options: {
  supabase: SupabaseServer;
  userId: string;
  conversationId: string;
  onboarding: OnboardingAnswers;
}) {
  const { supabase, userId, conversationId, onboarding } = options;
  const raising = onboarding["deal-structure"]?.currentlyRaising ?? false;
  const dna = detectStartupDna(onboarding);
  const dnaContext = buildHiddenDnaContext(dna, onboarding);

  try {
    const { model, provider, modelId } = getLanguageModelResilient();
    const { object } = await generateObject({
      model,
      schema: bootstrapSchema,
      prompt: `You are the WeStartup advisor. From this onboarding JSON, produce a full investor-ready dashboard pack (INR). Be skeptical and concrete — invent plausible illustrative numbers when needed, labeled as projections not facts.

Onboarding:
${JSON.stringify(onboarding, null, 2)}

${dnaContext}

Rules:
- Title and summarize artifacts in language natural to this vertical (without mentioning theme detection).
- Include dealStructure only if currentlyRaising is true (it is ${raising}).
- Always include unitEconomics, tractionKpis, competitiveLandscape, gtmPlan, burnRunway, milestones.
- Include short capexNotes and opexNotes on financialProjections.
- Market figures in ₹ Cr unless you set unit otherwise.
- Revenue / channel percents should sum to ~100.
- Burn months in ₹ lakhs; traction revenue in ₹ lakhs if present.
- advisorOpening: challenge weak spots for this industry; end with one probing question.
- Keep JSON compact.`,
    });

    const rows: ArtifactRow[] = [
      stamp(userId, conversationId, "idea-brief", object.ideaBrief.title, object.ideaBrief.summary, {
        oneLiner: object.ideaBrief.oneLiner,
        problem: object.ideaBrief.problem,
        solution: object.ideaBrief.solution,
        audience: object.ideaBrief.audience,
        challenges: object.ideaBrief.challenges,
      }),
      stamp(
        userId,
        conversationId,
        "financial-projections",
        object.financialProjections.title,
        object.financialProjections.summary,
        {
          currency: "INR",
          years: object.financialProjections.years,
          notes: object.financialProjections.notes,
          capexNotes: object.financialProjections.capexNotes,
          opexNotes: object.financialProjections.opexNotes,
        },
      ),
      stamp(
        userId,
        conversationId,
        "revenue-model",
        object.revenueModel.title,
        object.revenueModel.summary,
        { streams: object.revenueModel.streams },
      ),
      stamp(
        userId,
        conversationId,
        "market-sizing",
        object.marketSizing.title,
        object.marketSizing.summary,
        {
          currency: "INR",
          tam: object.marketSizing.tam,
          sam: object.marketSizing.sam,
          som: object.marketSizing.som,
          unit: object.marketSizing.unit,
          rationale: object.marketSizing.rationale,
        },
      ),
      stamp(
        userId,
        conversationId,
        "team-overview",
        object.teamOverview.title,
        object.teamOverview.summary,
        {
          sizeLabel: object.teamOverview.sizeLabel,
          roles: object.teamOverview.roles,
          gaps: object.teamOverview.gaps,
        },
      ),
      stamp(
        userId,
        conversationId,
        "unit-economics",
        object.unitEconomics.title,
        object.unitEconomics.summary,
        {
          currency: "INR",
          cac: object.unitEconomics.cac,
          ltv: object.unitEconomics.ltv,
          ltvCacRatio: object.unitEconomics.ltvCacRatio,
          paybackMonths: object.unitEconomics.paybackMonths,
          grossMarginPercent: object.unitEconomics.grossMarginPercent,
          arpu: object.unitEconomics.arpu,
          notes: object.unitEconomics.notes,
        },
      ),
      stamp(
        userId,
        conversationId,
        "traction-kpis",
        object.tractionKpis.title,
        object.tractionKpis.summary,
        {
          series: object.tractionKpis.series,
          retentionPercent: object.tractionKpis.retentionPercent,
          growthMoMPercent: object.tractionKpis.growthMoMPercent,
          notes: object.tractionKpis.notes,
        },
      ),
      stamp(
        userId,
        conversationId,
        "competitive-landscape",
        object.competitiveLandscape.title,
        object.competitiveLandscape.summary,
        {
          competitors: object.competitiveLandscape.competitors,
          axisLabel: object.competitiveLandscape.axisLabel,
          notes: object.competitiveLandscape.notes,
        },
      ),
      stamp(
        userId,
        conversationId,
        "gtm-plan",
        object.gtmPlan.title,
        object.gtmPlan.summary,
        {
          channels: object.gtmPlan.channels,
          funnel: object.gtmPlan.funnel,
          notes: object.gtmPlan.notes,
        },
      ),
      stamp(
        userId,
        conversationId,
        "burn-runway",
        object.burnRunway.title,
        object.burnRunway.summary,
        {
          currency: "INR",
          months: object.burnRunway.months,
          runwayMonths: object.burnRunway.runwayMonths,
          monthlyBurn: object.burnRunway.monthlyBurn,
          notes: object.burnRunway.notes,
        },
      ),
      stamp(
        userId,
        conversationId,
        "milestones",
        object.milestones.title,
        object.milestones.summary,
        {
          items: object.milestones.items,
          notes: object.milestones.notes,
        },
      ),
    ];

    if (raising && object.dealStructure) {
      rows.push(
        stamp(
          userId,
          conversationId,
          "deal-structure",
          object.dealStructure.title,
          object.dealStructure.summary,
          {
            currentlyRaising: object.dealStructure.currentlyRaising,
            amountInr: object.dealStructure.amountInr,
            stage: object.dealStructure.stage,
            useOfFunds: object.dealStructure.useOfFunds,
          },
        ),
      );
    }

    await persistArtifacts(supabase, rows, conversationId, object.advisorOpening);

    console.info(`[bootstrap] AI ok via ${provider}/${modelId}`);
    return {
      advisorOpening: object.advisorOpening,
      artifactCount: rows.length,
      source: "ai" as const,
      provider,
      modelId,
    };
  } catch (err) {
    console.warn("[bootstrap] AI failed, using onboarding fallback", err);
  }

  const fallback = buildFallbackArtifacts({
    userId,
    conversationId,
    onboarding,
  });
  await persistArtifacts(
    supabase,
    fallback.rows,
    conversationId,
    fallback.advisorOpening,
  );

  return {
    advisorOpening: fallback.advisorOpening,
    artifactCount: fallback.rows.length,
    source: "fallback" as const,
  };
}
