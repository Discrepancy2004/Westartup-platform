import type { SupabaseClient } from "@supabase/supabase-js";
import { chunkExtractedDocument } from "@/lib/rag/chunk";
import { embedDocumentTexts, hashContent } from "@/lib/rag/embed";
import {
  extractDocument,
  inferSourceType,
  shouldSkipFile,
} from "@/lib/rag/extract";
import type { RagSourceType } from "@/lib/rag/types";
import { getVectorStore } from "@/lib/rag/vector";

export type IngestSource = {
  fileName: string;
  buffer: Buffer;
  startupName?: string | null;
  sourceType?: RagSourceType;
  storagePath?: string | null;
  metadata?: Record<string, unknown>;
};

export type IngestResult =
  | {
      ok: true;
      documentId: string;
      chunkCount: number;
      skipped?: false;
      duplicate?: boolean;
    }
  | {
      ok: true;
      skipped: true;
      reason: string;
      documentId?: string;
    }
  | { ok: false; error: string; documentId?: string };

/**
 * Shared pipeline: extract → chunk → embed → store.
 * Used by one-shot corpus script and admin upload UI.
 */
export async function ingestDocument(
  client: SupabaseClient,
  source: IngestSource,
): Promise<IngestResult> {
  const skip = shouldSkipFile(source.fileName);
  if (skip.skip) {
    return { ok: true, skipped: true, reason: skip.reason ?? "Skipped" };
  }

  const contentHash = hashContent(source.buffer.toString("binary"));
  const sourceType =
    source.sourceType ?? inferSourceType(source.fileName);
  const title = source.fileName.replace(/\.[^.]+$/, "");

  const { data: existing } = await client
    .from("knowledge_documents")
    .select("id, status, ignored")
    .eq("content_hash", contentHash)
    .maybeSingle();

  if (existing?.id) {
    if (existing.status === "indexed" && !existing.ignored) {
      return {
        ok: true,
        documentId: existing.id,
        chunkCount: 0,
        duplicate: true,
      };
    }
  }

  let documentId: string;

  if (existing?.id) {
    documentId = existing.id;
    await client
      .from("knowledge_documents")
      .update({
        status: "processing",
        error_message: null,
        source_type: sourceType,
        startup_name: source.startupName ?? null,
        file_name: source.fileName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);
  } else {
    const { data: inserted, error: insertError } = await client
      .from("knowledge_documents")
      .insert({
        title,
        source_type: sourceType,
        status: "processing",
        startup_name: source.startupName ?? null,
        file_name: source.fileName,
        content_hash: contentHash,
        storage_path: source.storagePath ?? null,
        bytes: source.buffer.byteLength,
        chunk_count: 0,
        ignored: false,
        metadata: {
          ...(source.metadata ?? {}),
          startup_name: source.startupName ?? null,
        },
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      return {
        ok: false,
        error: insertError?.message ?? "Failed to create document row",
      };
    }
    documentId = inserted.id;
  }

  try {
    const extracted = await extractDocument(source.buffer, source.fileName);
    const chunks = chunkExtractedDocument(extracted);

    if (chunks.length === 0) {
      await client
        .from("knowledge_documents")
        .update({
          status: "failed",
          error_message: "No extractable text",
          chunk_count: 0,
        })
        .eq("id", documentId);
      return {
        ok: false,
        error: "No extractable text",
        documentId,
      };
    }

    const embeddings = await embedDocumentTexts(
      chunks.map((c) => c.content),
    );
    const store = getVectorStore(client);
    await store.deleteByDocumentId(documentId);

    await store.upsertChunks(
      chunks.map((chunk, i) => ({
        sourceType,
        documentId,
        chunkIndex: chunk.index,
        content: chunk.content,
        embedding: embeddings[i],
        retrievable: true,
        contentHash: hashContent(chunk.content),
        metadata: {
          startup_name: source.startupName ?? null,
          file_name: source.fileName,
          unit_index: chunk.unitIndex ?? null,
          ...(source.metadata ?? {}),
        },
      })),
    );

    await client
      .from("knowledge_documents")
      .update({
        status: "indexed",
        chunk_count: chunks.length,
        error_message: null,
        ignored: false,
      })
      .eq("id", documentId);

    return { ok: true, documentId, chunkCount: chunks.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingest failed";
    await client
      .from("knowledge_documents")
      .update({
        status: "failed",
        error_message: message,
      })
      .eq("id", documentId);
    return { ok: false, error: message, documentId };
  }
}
