import { embedQueryText } from "@/lib/rag/embed";
import { getVectorStore } from "@/lib/rag/vector";
import {
  RAG_MAX_CONTEXT_CHARS,
  RAG_TOP_K,
  type RagChunkRecord,
  type RetrieveOptions,
} from "@/lib/rag/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function retrieveRagChunks(
  client: SupabaseClient,
  query: string,
  options?: RetrieveOptions,
): Promise<RagChunkRecord[]> {
  const embedding = await embedQueryText(query);
  const store = getVectorStore(client);
  return store.match(embedding, {
    topK: options?.topK ?? RAG_TOP_K,
    ...options,
  });
}

/** Compact context block for future chat / RAG tab injection. */
export function formatRagContext(chunks: RagChunkRecord[]): string {
  const parts: string[] = [];
  let used = 0;
  for (const chunk of chunks) {
    const header = `[${chunk.sourceType}]`;
    const block = `${header}\n${chunk.content.trim()}`;
    if (used + block.length > RAG_MAX_CONTEXT_CHARS) break;
    parts.push(block);
    used += block.length + 2;
  }
  return parts.join("\n\n");
}

/**
 * Call only when chunks are actually injected into founder context.
 * Increments DNA capsule usage_count for selected expert_dna hits.
 */
export async function recordDnaInjectionUsage(
  client: SupabaseClient,
  chunks: RagChunkRecord[],
): Promise<void> {
  const ids = [
    ...new Set(
      chunks
        .filter((c) => c.sourceType === "expert_dna" && c.capsuleId)
        .map((c) => c.capsuleId as string),
    ),
  ];
  if (ids.length === 0) return;
  const { error } = await client.rpc("increment_dna_usage", {
    p_capsule_ids: ids,
  });
  if (error) throw new Error(error.message);
}
