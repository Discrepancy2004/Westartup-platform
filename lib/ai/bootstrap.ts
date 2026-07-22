import { generateObject } from "ai";
import { z } from "zod";
import { buildFallbackArtifacts } from "@/lib/ai/fallback-artifacts";
import { getLanguageModelResilient } from "@/lib/ai/provider";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

const bootstrapSchema = z.object({
  advisorOpening: z
    .string()
    .describe(
      "2-4 sentences: sharp challenge + one probing question. No welcome fluff.",
    ),
  ideaBrief: z.object({
    title: z.string(),
    summary: z.string(),
    oneLiner: z.string(),
    problem: z.string(),
    solution: z.string(),
    audience: z.string(),
    challenges: z.array(z.string()).min(1).max(4),
  }),
  financialProjections: z.object({
    title: z.string(),
    summary: z.string(),
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
  }),
  revenueModel: z.object({
    title: z.string(),
    summary: z.string(),
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
    title: z.string(),
    summary: z.string(),
    tam: z.number(),
    sam: z.number(),
    som: z.number(),
    unit: z.string().default("₹ Cr"),
    rationale: z.string(),
  }),
  teamOverview: z.object({
    title: z.string(),
    summary: z.string(),
    sizeLabel: z.string(),
    roles: z.array(
      z.object({ title: z.string(), focus: z.string().optional() }),
    ),
    gaps: z.array(z.string()),
  }),
  dealStructure: z
    .object({
      title: z.string(),
      summary: z.string(),
      currentlyRaising: z.boolean(),
      amountInr: z.number().optional(),
      stage: z.string().optional(),
      useOfFunds: z.array(z.string()),
    })
    .optional(),
});

async function persistArtifacts(
  supabase: SupabaseServer,
  rows: ReturnType<typeof buildFallbackArtifacts>["rows"],
  conversationId: string,
  advisorOpening: string,
) {
  // Prefer user client; if RLS blocks, fall back to service role
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

export async function generateBootstrapArtifacts(options: {
  supabase: SupabaseServer;
  userId: string;
  conversationId: string;
  onboarding: OnboardingAnswers;
}) {
  const { supabase, userId, conversationId, onboarding } = options;
  const raising = onboarding["deal-structure"]?.currentlyRaising ?? false;

  // 1) Try AI structured generation
  try {
    const { model, provider, modelId } = getLanguageModelResilient();
    const { object } = await generateObject({
      model,
      schema: bootstrapSchema,
      prompt: `You are the WeStartup advisor. From this onboarding JSON, produce investor-ready structured artifacts (INR). Be skeptical and concrete — invent plausible illustrative numbers when needed, labeled as projections not facts.

Onboarding:
${JSON.stringify(onboarding, null, 2)}

Rules:
- Include dealStructure only if currentlyRaising is true (it is ${raising}).
- Market figures in ₹ Cr unless you set unit otherwise.
- Revenue stream percents should sum to ~100.
- advisorOpening: challenge weak spots; end with one probing question.
- Keep JSON compact.`,
    });

    const rows: {
      user_id: string;
      conversation_id: string;
      kind: string;
      title: string;
      summary: string;
      chart_data: Record<string, unknown>;
      updated_at: string;
    }[] = [
      {
        user_id: userId,
        conversation_id: conversationId,
        kind: "idea-brief",
        title: object.ideaBrief.title,
        summary: object.ideaBrief.summary,
        chart_data: {
          oneLiner: object.ideaBrief.oneLiner,
          problem: object.ideaBrief.problem,
          solution: object.ideaBrief.solution,
          audience: object.ideaBrief.audience,
          challenges: object.ideaBrief.challenges,
        },
        updated_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        conversation_id: conversationId,
        kind: "financial-projections",
        title: object.financialProjections.title,
        summary: object.financialProjections.summary,
        chart_data: {
          currency: "INR",
          years: object.financialProjections.years,
        },
        updated_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        conversation_id: conversationId,
        kind: "revenue-model",
        title: object.revenueModel.title,
        summary: object.revenueModel.summary,
        chart_data: { streams: object.revenueModel.streams },
        updated_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        conversation_id: conversationId,
        kind: "market-sizing",
        title: object.marketSizing.title,
        summary: object.marketSizing.summary,
        chart_data: {
          currency: "INR",
          tam: object.marketSizing.tam,
          sam: object.marketSizing.sam,
          som: object.marketSizing.som,
          unit: object.marketSizing.unit,
          rationale: object.marketSizing.rationale,
        },
        updated_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        conversation_id: conversationId,
        kind: "team-overview",
        title: object.teamOverview.title,
        summary: object.teamOverview.summary,
        chart_data: {
          sizeLabel: object.teamOverview.sizeLabel,
          roles: object.teamOverview.roles,
          gaps: object.teamOverview.gaps,
        },
        updated_at: new Date().toISOString(),
      },
    ];

    if (raising && object.dealStructure) {
      rows.push({
        user_id: userId,
        conversation_id: conversationId,
        kind: "deal-structure",
        title: object.dealStructure.title,
        summary: object.dealStructure.summary,
        chart_data: {
          currentlyRaising: object.dealStructure.currentlyRaising,
          amountInr: object.dealStructure.amountInr,
          stage: object.dealStructure.stage,
          useOfFunds: object.dealStructure.useOfFunds,
        },
        updated_at: new Date().toISOString(),
      });
    }

    await persistArtifacts(
      supabase,
      rows,
      conversationId,
      object.advisorOpening,
    );

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

  // 2) Always-available fallback from onboarding answers
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
