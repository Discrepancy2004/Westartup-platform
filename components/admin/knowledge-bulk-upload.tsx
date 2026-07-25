"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  intakeBulkKnowledgeFiles,
  runBulkKnowledgeUploadPipeline,
} from "@/lib/admin/knowledge-upload";
import {
  KNOWLEDGE_BULK_UPLOAD,
  type KnowledgeDocument,
  type KnowledgeTopicId,
  type KnowledgeUploadJob,
  type KnowledgeUploadJobStatus,
} from "@/lib/types/knowledge";
import { cn } from "@/lib/utils";

const JOB_STATUS_STYLE: Record<KnowledgeUploadJobStatus, string> = {
  pending: "text-ink-tertiary",
  uploading: "text-accent",
  queued: "text-accent",
  failed: "text-danger",
  skipped: "text-challenge",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
  defaultTopic?: KnowledgeTopicId;
  onEnqueued: (documents: KnowledgeDocument[]) => void;
};

export function KnowledgeBulkUpload({
  defaultTopic = "general",
  onEnqueued,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<KnowledgeUploadJob[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | File[] | null) {
    if (!fileList || (Array.isArray(fileList) ? fileList.length === 0 : fileList.length === 0)) {
      return;
    }

    const files = Array.from(fileList);
    const result = intakeBulkKnowledgeFiles(files, {
      maxFiles: KNOWLEDGE_BULK_UPLOAD.maxFilesPerBatch,
      defaultTopic,
    });

    setJobs((prev) => [...result.jobs, ...prev].slice(0, 200));

    if (result.documents.length > 0) {
      onEnqueued(result.documents);
      // Hook for real pipeline — no-op until DB/storage exist.
      await runBulkKnowledgeUploadPipeline(
        result.jobs.filter((j) => j.status === "queued"),
        files,
      );
    }

    const parts: string[] = [];
    parts.push(
      `Queued ${result.documents.length} file${result.documents.length === 1 ? "" : "s"} for the ingest pipeline.`,
    );
    if (result.truncated > 0) {
      parts.push(
        `Skipped ${result.truncated} (max ${KNOWLEDGE_BULK_UPLOAD.maxFilesPerBatch} per batch).`,
      );
    }
    if (result.rejected.length > 0) {
      parts.push(
        `${result.rejected.length} rejected (type or size).`,
      );
    }
    parts.push(
      "Storage and embeddings are not connected yet — jobs stay queued in the UI.",
    );
    setSummary(parts.join(" "));

    if (inputRef.current) inputRef.current.value = "";
  }

  const queuedCount = jobs.filter((j) => j.status === "queued").length;
  const skippedCount = jobs.filter(
    (j) => j.status === "skipped" || j.status === "failed",
  ).length;

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border border-dashed px-4 py-8 text-center transition-colors",
          dragOver ? "border-accent bg-accent-subtle/40" : "border-border",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <p className="text-sm font-medium text-ink">Bulk upload</p>
        <p className="mt-1 text-sm text-ink-secondary">
          Drop up to {KNOWLEDGE_BULK_UPLOAD.maxFilesPerBatch} files at once
          (PDF, Markdown, TXT, DOC/DOCX). Max{" "}
          {Math.round(KNOWLEDGE_BULK_UPLOAD.maxFileBytes / (1024 * 1024))} MB
          each.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <label className="inline-flex cursor-pointer">
            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              multiple
              accept={KNOWLEDGE_BULK_UPLOAD.accept}
              onChange={(e) => void handleFiles(e.target.files)}
            />
            <span className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-[transform,background-color] duration-200 hover:scale-[1.02] hover:bg-accent-hover active:scale-95">
              Choose files
            </span>
          </label>
          {jobs.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              className="text-xs"
              onClick={() => {
                setJobs([]);
                setSummary(null);
              }}
            >
              Clear queue
            </Button>
          ) : null}
        </div>
      </div>

      {summary ? (
        <p className="border border-border bg-surface/70 px-4 py-3 text-sm text-ink-secondary">
          {summary}
        </p>
      ) : null}

      {jobs.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
              Upload queue
            </h3>
            <p className="text-xs text-ink-tertiary">
              {queuedCount} queued
              {skippedCount > 0 ? ` · ${skippedCount} skipped` : ""}
            </p>
          </div>
          <ul className="max-h-64 divide-y divide-border overflow-y-auto border border-border">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{job.fileName}</p>
                  <p className="text-xs text-ink-tertiary">
                    {formatBytes(job.bytes)} · {job.sourceType}
                    {job.errorMessage ? ` · ${job.errorMessage}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs font-medium capitalize",
                    JOB_STATUS_STYLE[job.status],
                  )}
                >
                  {job.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
