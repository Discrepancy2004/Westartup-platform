import { PDFParse } from "pdf-parse";
import type { ExtractedDocument } from "@/lib/rag/types";
import { sanitizeRagText } from "@/lib/rag/sanitize";

async function extractWithPdfParse(buffer: Buffer): Promise<ExtractedDocument> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const pages = (result.pages ?? [])
      .map((p, i) => ({
        unitIndex: p.num ?? i + 1,
        text: sanitizeRagText(p.text ?? ""),
      }))
      .filter((p) => p.text.length > 0);

    const fullText =
      pages.length > 0
        ? pages.map((p) => p.text).join("\n\n")
        : sanitizeRagText(result.text ?? "");

    return {
      units:
        pages.length > 0
          ? pages
          : fullText
            ? [{ unitIndex: 1, text: fullText }]
            : [],
      fullText,
    };
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

/** Last-resort: pull printable Latin/UTF-8-ish runs from raw PDF bytes. */
function extractRawFallback(buffer: Buffer): ExtractedDocument {
  const raw = buffer.toString("latin1");
  const chunks: string[] = [];
  const re = /\((?:\\.|[^\\)]){4,}\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    const inner = m[0]
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\\t/g, "\t")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\");
    const cleaned = sanitizeRagText(inner);
    if (cleaned.length >= 4 && /[A-Za-z]/.test(cleaned)) {
      chunks.push(cleaned);
    }
  }
  const fullText = sanitizeRagText(chunks.join("\n"));
  return {
    units: fullText ? [{ unitIndex: 1, text: fullText }] : [],
    fullText,
  };
}

export async function extractPdf(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const doc = await extractWithPdfParse(buffer);
    if (doc.fullText.trim().length > 0) return doc;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // pdf.js / pdf-parse sometimes throws on malformed escape sequences
    if (
      !/unicode escape|InvalidPDF|FormatError|getText/i.test(message) &&
      !/unsupported/i.test(message)
    ) {
      // Still fall through to raw extractor for any parse failure
    }
    console.warn("[rag/pdf] primary extract failed, using fallback:", message);
  }

  const fallback = extractRawFallback(buffer);
  if (!fallback.fullText) {
    throw new Error(
      "PDF extract failed (primary + fallback produced no text)",
    );
  }
  return fallback;
}
