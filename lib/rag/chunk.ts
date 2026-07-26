import {
  RAG_CHUNK_MAX_TOKENS,
  RAG_CHUNK_OVERLAP_TOKENS,
  RAG_CHUNK_TARGET_TOKENS,
  RAG_MAX_CHUNKS_PER_DOCUMENT,
  type ExtractedDocument,
  type TextChunk,
} from "@/lib/rag/types";
import { sanitizeRagText } from "@/lib/rag/sanitize";

/** Rough token estimate (~4 chars/token) — good enough for chunk budgets. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.trim().length / 4);
}

function splitOversized(text: string, maxTokens: number): string[] {
  const maxChars = maxTokens * 4;
  const overlapChars = RAG_CHUNK_OVERLAP_TOKENS * 4;
  const parts: string[] = [];
  let start = 0;
  const cleaned = text.trim();
  if (!cleaned) return [];

  while (start < cleaned.length) {
    let end = Math.min(start + maxChars, cleaned.length);
    if (end < cleaned.length) {
      const slice = cleaned.slice(start, end);
      const breakAt = Math.max(
        slice.lastIndexOf("\n\n"),
        slice.lastIndexOf(". "),
        slice.lastIndexOf(" "),
      );
      if (breakAt > maxChars * 0.4) {
        end = start + breakAt + 1;
      }
    }
    const piece = cleaned.slice(start, end).trim();
    if (piece) parts.push(piece);
    if (end >= cleaned.length) break;
    start = Math.max(0, end - overlapChars);
  }
  return parts;
}

/**
 * Prefer page/slide boundaries. Only split a unit if it exceeds the max.
 * Do not merge unrelated units solely to hit a target size.
 */
export function chunkExtractedDocument(doc: ExtractedDocument): TextChunk[] {
  const chunks: TextChunk[] = [];
  let index = 0;

  const units =
    doc.units.length > 0
      ? doc.units
      : doc.fullText.trim()
        ? [{ text: doc.fullText }]
        : [];

  for (const unit of units) {
    const text = sanitizeRagText(unit.text);
    if (!text) continue;

    const tokens = estimateTokens(text);
    if (tokens <= RAG_CHUNK_MAX_TOKENS) {
      // Soft preference: if well under target, keep alone (no merge).
      chunks.push({
        index: index++,
        content: text,
        unitIndex: unit.unitIndex,
      });
      continue;
    }

    for (const part of splitOversized(text, RAG_CHUNK_TARGET_TOKENS)) {
      chunks.push({
        index: index++,
        content: part,
        unitIndex: unit.unitIndex,
      });
    }
  }

  return chunks.slice(0, RAG_MAX_CHUNKS_PER_DOCUMENT).map((c, i) => ({
    ...c,
    index: i,
  }));
}
