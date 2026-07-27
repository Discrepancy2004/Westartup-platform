import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  RagChunkRecord,
  RetrieveOptions,
  UpsertChunkInput,
  VectorStore,
} from "@/lib/rag/types";
import { RAG_TOP_K } from "@/lib/rag/types";

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

function applyBoosts(
  rows: RagChunkRecord[],
  boosts?: RetrieveOptions["boosts"],
): RagChunkRecord[] {
  if (!boosts) return rows;
  const scored = rows.map((row) => {
    let score = row.similarity;
    const meta = row.metadata ?? {};
    if (
      boosts.industry &&
      String(meta.industry ?? "").toLowerCase() ===
        boosts.industry.toLowerCase()
    ) {
      score += 0.04;
    }
    if (
      boosts.stage &&
      String(meta.stage ?? "").toLowerCase() === boosts.stage.toLowerCase()
    ) {
      score += 0.04;
    }
    if (
      boosts.functionalArea &&
      String(meta.functional_area ?? "").toLowerCase() ===
        boosts.functionalArea.toLowerCase()
    ) {
      score += 0.05;
    }
    if (
      boosts.category &&
      String(meta.category ?? "").toLowerCase() ===
        boosts.category.toLowerCase()
    ) {
      score += 0.03;
    }
    return { ...row, similarity: score };
  });
  return scored.sort((a, b) => b.similarity - a.similarity);
}

export function createPgVectorStore(client: SupabaseClient): VectorStore {
  return {
    async upsertChunks(chunks: UpsertChunkInput[]) {
      for (const chunk of chunks) {
        const row = {
          source_type: chunk.sourceType,
          document_id: chunk.documentId ?? null,
          capsule_id: chunk.capsuleId ?? null,
          chunk_index: chunk.chunkIndex,
          content: chunk.content,
          embedding: toVectorLiteral(chunk.embedding),
          retrievable: chunk.retrievable,
          content_hash: chunk.contentHash ?? null,
          metadata: chunk.metadata ?? {},
          updated_at: new Date().toISOString(),
        };

        if (chunk.capsuleId) {
          const { data: existing } = await client
            .from("rag_chunks")
            .select("id")
            .eq("capsule_id", chunk.capsuleId)
            .maybeSingle();

          if (existing?.id) {
            const { error } = await client
              .from("rag_chunks")
              .update(row)
              .eq("id", existing.id);
            if (error) throw new Error(error.message);
          } else {
            const { error } = await client.from("rag_chunks").insert(row);
            if (error) throw new Error(error.message);
          }
        } else if (chunk.documentId != null) {
          const { data: existing } = await client
            .from("rag_chunks")
            .select("id")
            .eq("document_id", chunk.documentId)
            .eq("chunk_index", chunk.chunkIndex)
            .maybeSingle();

          if (existing?.id) {
            const { error } = await client
              .from("rag_chunks")
              .update(row)
              .eq("id", existing.id);
            if (error) throw new Error(error.message);
          } else {
            const { error } = await client.from("rag_chunks").insert(row);
            if (error) throw new Error(error.message);
          }
        } else {
          throw new Error("Chunk requires documentId or capsuleId");
        }
      }
    },

    async deleteByDocumentId(documentId: string) {
      const { error } = await client
        .from("rag_chunks")
        .delete()
        .eq("document_id", documentId);
      if (error) throw new Error(error.message);
    },

    async deleteByCapsuleId(capsuleId: string) {
      const { error } = await client
        .from("rag_chunks")
        .delete()
        .eq("capsule_id", capsuleId);
      if (error) throw new Error(error.message);
    },

    async setCapsuleRetrievable(capsuleId: string, retrievable: boolean) {
      const { error } = await client
        .from("rag_chunks")
        .update({ retrievable, updated_at: new Date().toISOString() })
        .eq("capsule_id", capsuleId);
      if (error) throw new Error(error.message);
    },

    async match(embedding: number[], options?: RetrieveOptions) {
      const topK = options?.topK ?? RAG_TOP_K;
      const { data, error } = await client.rpc("match_rag_chunks", {
        query_embedding: toVectorLiteral(embedding),
        match_count: Math.max(topK * 3, topK),
        filter_source_types: options?.sourceTypes ?? null,
        filter_startup_name: options?.startupName ?? null,
      });

      if (error) throw new Error(error.message);

      const rows: RagChunkRecord[] = (data ?? []).map(
        (r: {
          id: string;
          source_type: RagChunkRecord["sourceType"];
          document_id: string | null;
          capsule_id: string | null;
          chunk_index: number;
          content: string;
          metadata: Record<string, unknown> | null;
          similarity: number;
        }) => ({
          id: r.id,
          sourceType: r.source_type,
          documentId: r.document_id,
          capsuleId: r.capsule_id,
          chunkIndex: r.chunk_index,
          content: r.content,
          metadata: r.metadata ?? {},
          similarity: r.similarity,
        }),
      );

      return applyBoosts(rows, options?.boosts).slice(0, topK);
    },
  };
}
