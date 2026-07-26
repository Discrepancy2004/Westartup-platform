import type { ExtractedDocument, RagSourceType } from "@/lib/rag/types";

const SKIP_NAME_PATTERNS = [
  /please\s*delete/i,
  /\bbackup\b/i,
  /\bold\s+one\b/i,
  /\bcopy\b/i,
  /~\$.*/,
];

const SKIP_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".avi",
  ".webm",
  ".mkv",
  ".zip",
  ".dmg",
]);

const SUPPORTED_EXTENSIONS = new Set([
  ".pdf",
  ".pptx",
  ".docx",
  ".xlsx",
  ".xls",
]);

export function getExtension(fileName: string): string {
  const i = fileName.lastIndexOf(".");
  return i >= 0 ? fileName.slice(i).toLowerCase() : "";
}

export function shouldSkipFile(fileName: string): {
  skip: boolean;
  reason?: string;
} {
  const ext = getExtension(fileName);
  if (SKIP_EXTENSIONS.has(ext)) {
    return { skip: true, reason: `Unsupported media type ${ext}` };
  }
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return { skip: true, reason: `Unsupported extension ${ext || "(none)"}` };
  }
  for (const re of SKIP_NAME_PATTERNS) {
    if (re.test(fileName)) {
      return { skip: true, reason: "Temporary or deleted filename pattern" };
    }
  }
  return { skip: false };
}

export function inferSourceType(fileName: string): RagSourceType {
  const lower = fileName.toLowerCase();
  if (lower.includes("executive") || lower.includes("exec summary")) {
    return "executive_summary";
  }
  if (
    lower.includes("deck") ||
    lower.includes("pitch") ||
    lower.endsWith(".pptx")
  ) {
    return "pitch_deck";
  }
  if (lower.includes("investor") || lower.includes("note")) {
    return "investor_note";
  }
  if (lower.includes("review") || lower.includes("evaluation")) {
    return "startup_review";
  }
  return "other";
}

export async function extractDocument(
  buffer: Buffer,
  fileName: string,
): Promise<ExtractedDocument> {
  const ext = getExtension(fileName);

  if (ext === ".pdf") {
    const { extractPdf } = await import("@/lib/rag/extract/pdf");
    return extractPdf(buffer);
  }
  if (ext === ".pptx") {
    const { extractPptx } = await import("@/lib/rag/extract/pptx");
    return extractPptx(buffer);
  }
  if (ext === ".docx") {
    const { extractDocx } = await import("@/lib/rag/extract/docx");
    return extractDocx(buffer);
  }
  if (ext === ".xlsx" || ext === ".xls") {
    const { extractXlsx } = await import("@/lib/rag/extract/xlsx");
    return extractXlsx(buffer);
  }

  throw new Error(`No extractor for ${ext}`);
}
