import { readFileSync, existsSync } from "fs";
import path from "path";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));

async function main() {
  const { createServiceClient } = await import("../lib/supabase/admin");
  const { ingestDocument } = await import("../lib/rag/ingest");

  const targets = [
    {
      startupName: "Dashfit",
      fileName: "DashFit_FM_V8_For Google Sheets.xlsx",
    },
  ];

  const client = createServiceClient();
  for (const t of targets) {
    const file = path.join(
      process.cwd(),
      "dataset",
      "Build-3-Projects",
      t.startupName,
      t.fileName,
    );
    console.log("\n===", t.startupName, t.fileName);
    try {
      const buffer = readFileSync(file);
      const result = await ingestDocument(client, {
        fileName: t.fileName,
        buffer,
        startupName: t.startupName,
        metadata: {
          startup_id: t.startupName,
          startup_name: t.startupName,
          folder: t.startupName,
        },
      });
      console.log(result);
    } catch (e) {
      console.error("throw", e);
    }
  }
}

main();
