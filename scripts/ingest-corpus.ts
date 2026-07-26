/**
 * One-shot corpus ingest for dataset/Build-3-Projects (or RAG_CORPUS_PATH).
 *
 * Usage:
 *   npm run rag:ingest-corpus
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY
 */
import { readFileSync, existsSync } from "fs";
import path from "path";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

async function main() {
  const { createServiceClient } = await import("../lib/supabase/admin");
  const { ingestLocalCorpus } = await import(
    "../lib/rag/source/local-corpus"
  );

  const root =
    process.env.RAG_CORPUS_PATH ??
    path.join(process.cwd(), "dataset", "Build-3-Projects");

  console.log(`Ingesting corpus from: ${root}`);
  const client = createServiceClient();
  const summary = await ingestLocalCorpus(client, root);

  console.log(
    JSON.stringify(
      {
        processed: summary.processed,
        indexed: summary.indexed,
        skipped: summary.skipped,
        failed: summary.failed,
        duplicates: summary.duplicates,
      },
      null,
      2,
    ),
  );

  const failures = summary.results.filter((r) => !r.result.ok);
  if (failures.length > 0) {
    console.log("Failures (first 30):");
    for (const f of failures.slice(0, 30)) {
      console.log(
        ` - ${f.file}: ${"error" in f.result ? f.result.error : "?"}`,
      );
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
