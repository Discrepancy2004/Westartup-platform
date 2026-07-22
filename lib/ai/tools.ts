import { tool } from "ai";
import { z } from "zod";
import { artifactKindSchema } from "@/lib/types/artifacts";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

export function createArtifactTools(options: {
  supabase: SupabaseServer;
  userId: string;
  conversationId: string;
}) {
  const { supabase, userId, conversationId } = options;

  return {
    upsertArtifact: tool({
      description:
        "Create or update an investor-ready dashboard artifact with structured chart JSON.",
      inputSchema: z.object({
        kind: artifactKindSchema,
        title: z.string().min(1),
        summary: z.string().optional(),
        chartData: z
          .record(z.string(), z.unknown())
          .describe("Structured chart payload for the given kind"),
      }),
      execute: async ({ kind, title, summary, chartData }) => {
        const { data, error } = await supabase
          .from("artifacts")
          .upsert(
            {
              user_id: userId,
              conversation_id: conversationId,
              kind,
              title,
              summary: summary ?? null,
              chart_data: chartData,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,kind" },
          )
          .select("id, kind, title")
          .single();

        if (error) {
          return { ok: false as const, error: error.message };
        }

        return { ok: true as const, artifact: data };
      },
    }),
  };
}
