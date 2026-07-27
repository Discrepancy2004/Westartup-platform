import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { embedDocumentText, hashContent } from "@/lib/rag/embed";
import { getVectorStore } from "@/lib/rag/vector";

export type DnaCapsuleForIndex = {
  id: string;
  question_id: string;
  question_text: string;
  answer: string;
  why: string | null;
  industry: string | null;
  stage: string | null;
  category: string | null;
  functional_area: string | null;
  confidence: number | null;
  status: string;
  expert_id: string;
};

export function buildDnaCapsuleText(capsule: DnaCapsuleForIndex): string {
  const parts = [
    `Question: ${capsule.question_text}`,
    `Answer: ${capsule.answer}`,
  ];
  if (capsule.why?.trim()) {
    parts.push(`Why it matters: ${capsule.why.trim()}`);
  }
  return parts.join("\n\n");
}

export function dnaContentHash(capsule: DnaCapsuleForIndex): string {
  return hashContent(buildDnaCapsuleText(capsule));
}

/** Embed or refresh a single capsule. Retrievable only when published. */
export async function indexDnaCapsule(
  client: SupabaseClient,
  capsule: DnaCapsuleForIndex,
): Promise<void> {
  const store = getVectorStore(client);
  const content = buildDnaCapsuleText(capsule);
  const contentHash = createHash("sha256").update(content).digest("hex");
  const retrievable = capsule.status === "published";

  if (!retrievable) {
    await store.setCapsuleRetrievable(capsule.id, false);
    await client
      .from("expert_dna_capsules")
      .update({ content_hash: contentHash })
      .eq("id", capsule.id);
    return;
  }

  const embedding = await embedDocumentText(content);
  await store.upsertChunks([
    {
      sourceType: "expert_dna",
      capsuleId: capsule.id,
      chunkIndex: 0,
      content,
      embedding,
      retrievable: true,
      contentHash,
      metadata: {
        question_id: capsule.question_id,
        category: capsule.category,
        industry: capsule.industry,
        stage: capsule.stage,
        functional_area: capsule.functional_area,
        confidence: capsule.confidence,
        expert_id: capsule.expert_id,
        status: capsule.status,
      },
    },
  ]);

  await client
    .from("expert_dna_capsules")
    .update({ content_hash: contentHash })
    .eq("id", capsule.id);
}

export async function archiveDnaCapsuleInIndex(
  client: SupabaseClient,
  capsuleId: string,
): Promise<void> {
  const store = getVectorStore(client);
  await store.setCapsuleRetrievable(capsuleId, false);
}
