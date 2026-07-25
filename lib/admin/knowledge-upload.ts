import {
  KNOWLEDGE_BULK_UPLOAD,
  type KnowledgeDocument,
  type KnowledgeUploadJob,
} from "@/lib/types/knowledge";

function extensionOf(fileName: string) {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function sourceTypeFromFileName(
  fileName: string,
): KnowledgeDocument["sourceType"] {
  const ext = extensionOf(fileName);
  if (ext === "pdf") return "pdf";
  if (ext === "md" || ext === "markdown") return "markdown";
  if (ext === "doc" || ext === "docx") return "text";
  return "text";
}

export function isAllowedKnowledgeFile(file: File): boolean {
  const ext = extensionOf(file.name);
  return (KNOWLEDGE_BULK_UPLOAD.allowedExtensions as readonly string[]).includes(
    ext,
  );
}

export type BulkFileIntakeResult = {
  jobs: KnowledgeUploadJob[];
  documents: KnowledgeDocument[];
  rejected: { fileName: string; reason: string }[];
  truncated: number;
};

/**
 * Build upload jobs + queued document rows from a FileList / File[].
 * Ready to swap the body for sequential Storage uploads + DB inserts.
 */
export function intakeBulkKnowledgeFiles(
  files: FileList | File[],
  options?: {
    maxFiles?: number;
    defaultTopic?: KnowledgeDocument["topic"];
  },
): BulkFileIntakeResult {
  const maxFiles = options?.maxFiles ?? KNOWLEDGE_BULK_UPLOAD.maxFilesPerBatch;
  const topic = options?.defaultTopic ?? "general";
  const list = Array.from(files);
  const truncated = Math.max(0, list.length - maxFiles);
  const slice = list.slice(0, maxFiles);

  const jobs: KnowledgeUploadJob[] = [];
  const documents: KnowledgeDocument[] = [];
  const rejected: { fileName: string; reason: string }[] = [];

  for (const file of slice) {
    if (!isAllowedKnowledgeFile(file)) {
      rejected.push({
        fileName: file.name,
        reason: "Unsupported type (use PDF, Markdown, TXT, DOC, DOCX)",
      });
      jobs.push({
        id: `job_${crypto.randomUUID()}`,
        fileName: file.name,
        bytes: file.size,
        sourceType: "text",
        status: "skipped",
        errorMessage: "Unsupported type",
      });
      continue;
    }

    if (file.size > KNOWLEDGE_BULK_UPLOAD.maxFileBytes) {
      rejected.push({
        fileName: file.name,
        reason: `Over ${Math.round(KNOWLEDGE_BULK_UPLOAD.maxFileBytes / (1024 * 1024))} MB limit`,
      });
      jobs.push({
        id: `job_${crypto.randomUUID()}`,
        fileName: file.name,
        bytes: file.size,
        sourceType: sourceTypeFromFileName(file.name),
        status: "skipped",
        errorMessage: "File too large",
      });
      continue;
    }

    const documentId = `doc_${crypto.randomUUID()}`;
    const jobId = `job_${crypto.randomUUID()}`;
    const sourceType = sourceTypeFromFileName(file.name);
    const title = file.name.replace(/\.[^.]+$/, "") || file.name;

    jobs.push({
      id: jobId,
      fileName: file.name,
      bytes: file.size,
      sourceType,
      status: "queued",
      documentId,
    });

    documents.push({
      id: documentId,
      title,
      sourceType,
      topic,
      status: "queued",
      chunkCount: null,
      bytes: file.size,
      updatedAt: new Date().toISOString(),
      errorMessage:
        "Queued locally — storage + embedding pipeline not connected yet",
    });
  }

  return { jobs, documents, rejected, truncated };
}

/**
 * Placeholder for the real pipeline:
 * for each job → upload to Storage → insert row → enqueue embed worker.
 * Keep this signature stable so the UI can call it later.
 */
export async function runBulkKnowledgeUploadPipeline(
  _jobs: KnowledgeUploadJob[],
  _files: File[],
): Promise<{ ok: true; mode: "ui-only" }> {
  // Intentionally no-op until Supabase storage + vector index exist.
  return { ok: true, mode: "ui-only" };
}
