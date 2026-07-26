"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { DNA_STARTER_QUESTIONS } from "@/lib/expert/dna-questions";
import {
  indexDnaCapsule,
  type DnaCapsuleForIndex,
} from "@/lib/rag/dna-index";

export async function markDnaWelcomeSeen() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in" };

  const { error } = await supabase
    .from("profiles")
    .update({ dna_welcome_seen_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/expert/dna");
  redirect("/expert/dna/capsule");
}

async function reindexCapsuleBackground(capsuleId: string) {
  try {
    const service = createServiceClient();
    const { data } = await service
      .from("expert_dna_capsules")
      .select(
        "id, question_id, question_text, answer, why, industry, stage, category, functional_area, confidence, status, expert_id",
      )
      .eq("id", capsuleId)
      .single();
    if (!data) return;
    await indexDnaCapsule(service, data as DnaCapsuleForIndex);
  } catch (err) {
    console.error("[dna] reindex failed", err);
  }
}

export async function saveDnaCapsule(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in" };

  const questionId = String(formData.get("question_id") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const why = String(formData.get("why") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const stage = String(formData.get("stage") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const functionalArea =
    String(formData.get("functional_area") ?? "").trim() || null;
  const confidenceRaw = String(formData.get("confidence") ?? "").trim();
  const confidence = confidenceRaw ? Number(confidenceRaw) : null;

  const question = DNA_STARTER_QUESTIONS.find((q) => q.id === questionId);
  if (!question) {
    return { ok: false as const, error: "Unknown question" };
  }
  if (answer.length < 20) {
    return {
      ok: false as const,
      error: "Share a bit more — at least a short paragraph of judgment.",
    };
  }
  if (why.length < 10) {
    return {
      ok: false as const,
      error: "Add a short Why — this strengthens RAG retrieval.",
    };
  }
  if (
    confidence != null &&
    (Number.isNaN(confidence) || confidence < 1 || confidence > 5)
  ) {
    return { ok: false as const, error: "Confidence must be 1–5" };
  }

  const { data: existing } = await supabase
    .from("expert_dna_capsules")
    .select("id, status")
    .eq("expert_id", user.id)
    .eq("question_id", question.id)
    .maybeSingle();

  const keepPublished = existing?.status === "published";
  const status = keepPublished ? "published" : "draft";

  const row = {
    expert_id: user.id,
    question_id: question.id,
    question_text: question.prompt,
    answer,
    why,
    industry,
    stage,
    category: category || question.category,
    functional_area: functionalArea,
    confidence,
    status,
    updated_at: new Date().toISOString(),
    ...(keepPublished
      ? {}
      : { published_at: null as string | null }),
  };

  const { data: saved, error } = await supabase
    .from("expert_dna_capsules")
    .upsert(row, { onConflict: "expert_id,question_id" })
    .select("id, status")
    .single();

  if (error) return { ok: false as const, error: error.message };

  await supabase
    .from("profiles")
    .update({ dna_welcome_seen_at: new Date().toISOString() })
    .eq("id", user.id)
    .is("dna_welcome_seen_at", null);

  if (saved?.status === "published" && saved.id) {
    // Fire-and-forget re-embed for published edits
    void reindexCapsuleBackground(saved.id);
  }

  revalidatePath("/expert/dna");
  revalidatePath("/expert/dna/capsule");
  revalidatePath("/admin/knowledge");
  return {
    ok: true as const,
    questionId: question.id,
    status: saved.status as string,
  };
}

/** Publish entire bank once all 20 questions are answered. */
export async function submitDnaBank() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in" };

  const { data: capsules, error } = await supabase
    .from("expert_dna_capsules")
    .select(
      "id, question_id, question_text, answer, why, industry, stage, category, functional_area, confidence, status, expert_id",
    )
    .eq("expert_id", user.id);

  if (error) return { ok: false as const, error: error.message };

  const byQuestion = new Map(
    (capsules ?? []).map((c) => [c.question_id, c]),
  );
  const missing = DNA_STARTER_QUESTIONS.filter((q) => {
    const c = byQuestion.get(q.id);
    return !c || !c.answer?.trim() || !c.why?.trim();
  });

  if (missing.length > 0) {
    return {
      ok: false as const,
      error: `Answer all ${DNA_STARTER_QUESTIONS.length} questions before submitting (${missing.length} remaining).`,
    };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("expert_dna_capsules")
    .update({ status: "published", published_at: now })
    .eq("expert_id", user.id)
    .neq("status", "archived");

  if (updateError) {
    return { ok: false as const, error: updateError.message };
  }

  try {
    const service = createServiceClient();
    const { data: published } = await service
      .from("expert_dna_capsules")
      .select(
        "id, question_id, question_text, answer, why, industry, stage, category, functional_area, confidence, status, expert_id",
      )
      .eq("expert_id", user.id)
      .eq("status", "published");

    for (const capsule of published ?? []) {
      await indexDnaCapsule(service, capsule as DnaCapsuleForIndex);
    }
  } catch (err) {
    console.error("[dna] publish index failed", err);
    return {
      ok: false as const,
      error:
        err instanceof Error
          ? err.message
          : "Published but embedding failed — contact admin.",
    };
  }

  revalidatePath("/expert/dna");
  revalidatePath("/expert/dna/capsule");
  revalidatePath("/admin/knowledge");
  return { ok: true as const };
}
