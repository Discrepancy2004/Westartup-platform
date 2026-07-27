import type { SupabaseClient } from "@supabase/supabase-js";
import { createPgVectorStore } from "@/lib/rag/vector/pgvector";
import type { VectorStore } from "@/lib/rag/types";

/**
 * Vector store factory — swap implementation here for Pinecone later
 * without touching ingest / retrieve call sites.
 */
export function getVectorStore(client: SupabaseClient): VectorStore {
  const backend = (process.env.RAG_VECTOR_BACKEND ?? "pgvector").toLowerCase();
  if (backend === "pgvector") {
    return createPgVectorStore(client);
  }
  // Future: pinecone
  throw new Error(
    `Unsupported RAG_VECTOR_BACKEND "${backend}". Use "pgvector".`,
  );
}
