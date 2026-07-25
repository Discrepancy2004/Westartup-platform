export type KnowledgeTopicId =
  | "business-model"
  | "traction-signals"
  | "deal-structure"
  | "red-flags"
  | "market"
  | "general";

export type KnowledgeDocStatus =
  | "queued"
  | "processing"
  | "indexed"
  | "failed";

/** Client-side bulk upload job (before / while hitting storage + embed pipeline). */
export type KnowledgeUploadJobStatus =
  | "pending"
  | "uploading"
  | "queued"
  | "failed"
  | "skipped";

export type KnowledgeUploadJob = {
  id: string;
  fileName: string;
  bytes: number;
  sourceType: KnowledgeDocument["sourceType"];
  status: KnowledgeUploadJobStatus;
  errorMessage?: string | null;
  documentId?: string | null;
};

export type KnowledgeDocument = {
  id: string;
  title: string;
  sourceType: "pdf" | "markdown" | "text" | "url";
  topic: KnowledgeTopicId;
  status: KnowledgeDocStatus;
  chunkCount: number | null;
  bytes: number | null;
  updatedAt: string;
  errorMessage?: string | null;
};

export type KnowledgeTopic = {
  id: KnowledgeTopicId;
  label: string;
  description: string;
  documentCount: number;
  indexedCount: number;
};

export type KnowledgeIndexSummary = {
  totalDocuments: number;
  indexed: number;
  processing: number;
  failed: number;
  lastSyncedAt: string | null;
  embeddingModel: string;
};

export const KNOWLEDGE_TOPIC_LABELS: Record<KnowledgeTopicId, string> = {
  "business-model": "Business model",
  "traction-signals": "Traction signals",
  "deal-structure": "Deal structure",
  "red-flags": "Red flags",
  market: "Market",
  general: "General",
};

/** Pipeline limits — tune when wiring storage / workers. */
export const KNOWLEDGE_BULK_UPLOAD = {
  maxFilesPerBatch: 100,
  maxFileBytes: 10 * 1024 * 1024,
  accept:
    ".pdf,.md,.markdown,.txt,.doc,.docx,application/pdf,text/plain,text/markdown",
  allowedExtensions: [
    "pdf",
    "md",
    "markdown",
    "txt",
    "doc",
    "docx",
  ] as const,
} as const;
