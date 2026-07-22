import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { buildAdvisorSystemPrompt } from "@/lib/ai/prompts";
import { getLanguageModelResilient } from "@/lib/ai/provider";
import { createClient } from "@/lib/supabase/server";
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
      .select("onboarding")
      .eq("id", user.id)
      .maybeSingle();

    let conversationId: string;
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      conversationId = existing.id;
    } else {
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title: "Advisor session" })
        .select("id")
        .single();
      if (error || !created) {
        return Response.json(
          { error: error?.message ?? "Could not create conversation" },
          { status: 500 },
        );
      }
      conversationId = created.id;
    }

    const onboardingJson = profile?.onboarding
      ? JSON.stringify(profile.onboarding, null, 2)
      : undefined;

    const system = `${buildAdvisorSystemPrompt({ onboardingJson })}

## Dashboard note
Artifacts live on /dashboard. Propose updates only when confident, using the WESTARTUP_UPDATE block so the founder can Accept / Not now.`;

    const messages = body.messages ?? [];

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      const text = lastUser.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("\n");
      if (text) {
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          role: "user",
          content: text,
        });
      }
    }

    // Tools disabled here — Groq/tool-calling was failing chat.
    // Artifacts are created via /api/onboarding/bootstrap instead.
    const { model, provider, modelId } = getLanguageModelResilient();

    const result = streamText({
      model,
      system,
      messages: await convertToModelMessages(messages),
      onError: ({ error }) => {
        console.error(`[chat] stream error (${provider}/${modelId})`, error);
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
    console.error("[chat] failed", err);
    const message = err instanceof Error ? err.message : "Chat failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
