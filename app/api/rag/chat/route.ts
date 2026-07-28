import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import {
  getChatUsageSummary,
  hasRagAccess,
  RAG_WORKSPACE_TITLE,
} from "@/lib/billing/usage";
import { buildAdvisorSystemPrompt } from "@/lib/ai/prompts";
import { getLanguageModelResilient } from "@/lib/ai/provider";
import { buildHiddenDnaContext, resolveDna } from "@/lib/dna/resolve";
import { formatRagContext, recordDnaInjectionUsage, retrieveRagChunks } from "@/lib/rag/retrieve";
import type { PlanId } from "@/lib/razorpay/plans";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import { isAiConfigured } from "@/lib/utils";

export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isAiConfigured()) {
    return Response.json(
      {
        error:
          "AI is not configured. Set GROQ_API_KEY or GEMINI_API_KEY in .env.local and restart the server.",
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      messages: UIMessage[];
    };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding, startup_dna, plan_id")
      .eq("id", user.id)
      .maybeSingle();

    const planId = (profile?.plan_id as PlanId | null) ?? "starter";
    if (!hasRagAccess(planId)) {
      return Response.json(
        { error: "RAG workspace is available on Growth and Scale." },
        { status: 403 },
      );
    }

    const usage = await getChatUsageSummary(supabase, user.id, planId);
    if (usage.limit !== null && usage.used >= usage.limit) {
      return Response.json(
        {
          error: `You have reached the ${usage.limit} chat limit for today on ${planId}.`,
        },
        { status: 429 },
      );
    }

    const onboarding = profile?.onboarding as OnboardingAnswers | null;
    const { dna } = resolveDna({
      stored: profile?.startup_dna,
      onboarding,
    });

    let conversationId: string;
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("title", RAG_WORKSPACE_TITLE)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      conversationId = existing.id;
    } else {
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: RAG_WORKSPACE_TITLE,
        })
        .select("id")
        .single();
      if (error || !created) {
        return Response.json(
          { error: error?.message ?? "Could not create RAG conversation" },
          { status: 500 },
        );
      }
      conversationId = created.id;
    }

    const messages = body.messages ?? [];
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    const lastUserText = lastUser?.parts
      ?.filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();

    if (lastUserText) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: lastUserText,
      });
    }

    const ragChunks = lastUserText
      ? await retrieveRagChunks(supabase, lastUserText)
      : [];
    const ragContext = formatRagContext(ragChunks);

    if (ragChunks.length > 0) {
      await recordDnaInjectionUsage(supabase, ragChunks);
    }

    const onboardingJson = onboarding
      ? JSON.stringify(onboarding, null, 2)
      : undefined;

    const system = `${buildAdvisorSystemPrompt({
      onboardingJson,
      dnaContext: buildHiddenDnaContext(dna, onboarding),
    })}

## RAG workspace
You are in the grounded RAG workspace. Answer using the retrieved context first.
If the retrieved context is weak or missing, say what is missing instead of inventing support.

## Retrieved context
${ragContext || "No retrieved context was available for this question."}`;

    const { model, provider, modelId } = getLanguageModelResilient();

    const result = streamText({
      model,
      system,
      messages: await convertToModelMessages(messages),
      onError: ({ error }) => {
        console.error(`[rag] stream error (${provider}/${modelId})`, error);
      },
      onFinish: async ({ text }) => {
        if (!text) return;
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          role: "assistant",
          content: text,
        });
      },
    });

    return result.toUIMessageStreamResponse({
      headers: {
        "X-WeStartup-AI-Provider": provider,
        "X-WeStartup-AI-Model": modelId,
      },
    });
  } catch (err) {
    console.error("[rag] failed", err);
    const message = err instanceof Error ? err.message : "RAG chat failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
