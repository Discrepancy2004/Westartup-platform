import { promises as fs } from "fs";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ingestDocument, type IngestResult } from "@/lib/rag/ingest";

const EXCLUDED_STARTUPS = new Set(["westartup"]);

export type CorpusIngestSummary = {
  processed: number;
  indexed: number;
  skipped: number;
  failed: number;
  duplicates: number;
  results: Array<{ file: string; result: IngestResult }>;
};

/**
 * Filesystem source adapter for Build-3-Projects style corpora.
 * Later: swap for Storage listing without changing ingestDocument.
 */
export async function ingestLocalCorpus(
  client: SupabaseClient,
  rootDir: string,
  options?: { excludeStartups?: string[] },
): Promise<CorpusIngestSummary> {
  const exclude = new Set(
    (options?.excludeStartups ?? [...EXCLUDED_STARTUPS]).map((s) =>
      s.toLowerCase(),
    ),
  );

  const summary: CorpusIngestSummary = {
    processed: 0,
    indexed: 0,
    skipped: 0,
    failed: 0,
    duplicates: 0,
    results: [],
  };

  const startups = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of startups) {
    if (!entry.isDirectory()) continue;
    const startupName = entry.name;
    if (exclude.has(startupName.toLowerCase())) {
      summary.results.push({
        file: startupName,
        result: {
          ok: true,
          skipped: true,
          reason: "Excluded startup folder",
        },
      });
      summary.skipped += 1;
      continue;
    }

    const folderPath = path.join(rootDir, startupName);
    const files = await fs.readdir(folderPath, { withFileTypes: true });
    for (const file of files) {
      if (!file.isFile()) continue;
      const filePath = path.join(folderPath, file.name);
      const buffer = await fs.readFile(filePath);
      summary.processed += 1;

      const result = await ingestDocument(client, {
        fileName: file.name,
        buffer,
        startupName,
        metadata: {
          startup_id: startupName,
          startup_name: startupName,
          folder: startupName,
          local_path: filePath,
        },
      });

      summary.results.push({
        file: `${startupName}/${file.name}`,
        result,
      });

      if (!result.ok) {
        summary.failed += 1;
      } else if (result.skipped) {
        summary.skipped += 1;
      } else if (result.duplicate) {
        summary.duplicates += 1;
      } else {
        summary.indexed += 1;
      }
    }
  }

  return summary;
}
