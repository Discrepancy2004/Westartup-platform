import { NextResponse } from "next/server";
import { RAG_WORKSPACE_TITLE } from "@/lib/billing/usage";
import { generateBootstrapArtifacts } from "@/lib/ai/bootstrap";
import { getLanguageModelResilient } from "@/lib/ai/provider";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import { isAiConfigured } from "@/lib/utils";

export const maxDuration = 60;

/**
 * Fast post-onboarding path: one structured model call → all dashboard artifacts.
 */
export async function POST(request: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error:
          "AI is not configured. Set GEMINI_API_KEY (or GROQ_API_KEY) in .env.local.",
      },
      { status: 503 },
    );
  }

  const force =
    new URL(request.url).searchParams.get("force") === "1";

  try {
    getLanguageModelResilient();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("onboarding")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (!profile?.onboarding) {
      return NextResponse.json(
        { error: "Onboarding data missing. Finish onboarding first." },
        { status: 400 },
      );
    }

    let conversationId: string;
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .neq("title", RAG_WORKSPACE_TITLE)
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
        return NextResponse.json(
          { error: error?.message ?? "Could not create conversation" },
          { status: 500 },
        );
      }
      conversationId = created.id;
    }

    const { count } = await supabase
      .from("artifacts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!force && (count ?? 0) > 0) {
      const { data: messages } = await supabase
        .from("messages")
        .select("content")
        .eq("conversation_id", conversationId)
        .eq("role", "assistant")
        .order("created_at", { ascending: false })
        .limit(1);

      return NextResponse.json({
        ok: true,
        skipped: true,
        artifactCount: count,
        advisorOpening: messages?.[0]?.content ?? null,
      });
    }

    if (force && (count ?? 0) > 0) {
      try {
        const { createServiceClient } = await import("@/lib/supabase/admin");
        const admin = createServiceClient();
        await admin.from("artifacts").delete().eq("user_id", user.id);
      } catch {
        await supabase.from("artifacts").delete().eq("user_id", user.id);
      }
    }

    const result = await generateBootstrapArtifacts({
      supabase,
      userId: user.id,
      conversationId,
      onboarding: profile.onboarding as OnboardingAnswers,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("bootstrap failed", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Bootstrap failed",
        hint: "Try setting AI_PROVIDER=groq in .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }
}
