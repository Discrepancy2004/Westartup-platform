import JSZip from "jszip";
import { sanitizeRagText } from "@/lib/rag/sanitize";
import type { ExtractedDocument } from "@/lib/rag/types";

function stripXml(xml: string): string {
  return xml
    .replace(/<a:t[^>]*>/g, "")
    .replace(/<\/a:t>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractPptx(buffer: Buffer): Promise<ExtractedDocument> {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/i.test(n))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)/i)?.[1] ?? 0);
      const nb = Number(b.match(/slide(\d+)/i)?.[1] ?? 0);
      return na - nb;
    });

  const units: ExtractedDocument["units"] = [];
  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.files[slideFiles[i]].async("string");
    const text = sanitizeRagText(stripXml(xml));
    if (text) {
      units.push({ unitIndex: i + 1, text });
    }
  }

  return {
    units,
    fullText: units.map((u) => u.text).join("\n\n"),
  };
}
