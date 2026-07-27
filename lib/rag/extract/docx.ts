import mammoth from "mammoth";
import { sanitizeRagText } from "@/lib/rag/sanitize";
import type { ExtractedDocument } from "@/lib/rag/types";

export async function extractDocx(buffer: Buffer): Promise<ExtractedDocument> {
  const result = await mammoth.extractRawText({ buffer });
  const text = sanitizeRagText(result.value ?? "");
  return {
    units: text ? [{ unitIndex: 1, text }] : [],
    fullText: text,
  };
}
