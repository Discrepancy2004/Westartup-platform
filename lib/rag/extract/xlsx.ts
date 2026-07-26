import * as XLSX from "xlsx";
import { sanitizeRagText } from "@/lib/rag/sanitize";
import type { ExtractedDocument } from "@/lib/rag/types";

/** Financial models can be huge — keep a RAG-usable slice per sheet. */
const MAX_CHARS_PER_SHEET = 8_000;
const MAX_SHEETS = 12;

export async function extractXlsx(buffer: Buffer): Promise<ExtractedDocument> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const units: ExtractedDocument["units"] = [];
  const names = workbook.SheetNames.slice(0, MAX_SHEETS);

  names.forEach((name, i) => {
    const sheet = workbook.Sheets[name];
    let csv = sanitizeRagText(XLSX.utils.sheet_to_csv(sheet));
    if (!csv) return;
    if (csv.length > MAX_CHARS_PER_SHEET) {
      csv =
        csv.slice(0, MAX_CHARS_PER_SHEET) +
        "\n…[truncated for RAG — sheet exceeded size cap]";
    }
    units.push({
      unitIndex: i + 1,
      text: `Sheet: ${name}\n${csv}`,
    });
  });

  return {
    units,
    fullText: units.map((u) => u.text).join("\n\n"),
  };
}
