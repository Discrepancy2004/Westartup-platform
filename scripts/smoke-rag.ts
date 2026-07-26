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
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));

async function main() {
  const { createServiceClient } = await import("../lib/supabase/admin");
  const { ingestDocument } = await import("../lib/rag/ingest");
  const { retrieveRagChunks } = await import("../lib/rag/retrieve");

  const file = path.join(
    process.cwd(),
    "dataset",
    "Build-3-Projects",
    "Faro",
    "Executive Summary.pdf",
  );
  const buffer = readFileSync(file);
  const client = createServiceClient();
  const result = await ingestDocument(client, {
    fileName: "Executive Summary.pdf",
    buffer,
    startupName: "Faro",
  });
  console.log("ingest:", result);

  if (result.ok && !("skipped" in result && result.skipped)) {
    const hits = await retrieveRagChunks(
      client,
      "What does Faro do for founders?",
      { topK: 3, sourceTypes: ["executive_summary"] },
    );
    console.log(
      "retrieve:",
      hits.map((h) => ({
        similarity: h.similarity,
        preview: h.content.slice(0, 120),
      })),
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
