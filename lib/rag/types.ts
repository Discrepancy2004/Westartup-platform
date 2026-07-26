export const RAG_EMBEDDING_MODEL = "gemini-embedding-001";
export const RAG_EMBEDDING_DIMENSIONS = 1536;
export const RAG_TOP_K = 5;
export const RAG_MAX_CONTEXT_CHARS = 12_000; // ~2–3k tokens ballpark

export const RAG_CHUNK_TARGET_TOKENS = 1000;
export const RAG_CHUNK_OVERLAP_TOKENS = 120;
export const RAG_CHUNK_MAX_TOKENS = 1200;
/** Hard cap so one noisy spreadsheet cannot exhaust embedding quota. */
export const RAG_MAX_CHUNKS_PER_DOCUMENT = 24;

export type RagSourceType =
  | "expert_dna"
  | "pitch_deck"
  | "executive_summary"
  | "investor_note"
  | "startup_review"
  | "other";

export type KnowledgeDocStatus =
  | "queued"
  | "processing"
  | "indexed"
  | "failed"
  | "ignored";

export type DnaCapsuleStatus = "draft" | "published" | "archived";

export type ExtractedUnit = {
  /** Page or slide number when known */
  unitIndex?: number;
  text: string;
};

export type ExtractedDocument = {
  units: ExtractedUnit[];
  /** Flat text fallback */
  fullText: string;
};

export type TextChunk = {
  index: number;
  content: string;
  unitIndex?: number;
};

export type RagChunkRecord = {
  id: string;
  sourceType: RagSourceType;
  documentId: string | null;
  capsuleId: string | null;
  chunkIndex: number;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
};

export type RetrieveOptions = {
  topK?: number;
  sourceTypes?: RagSourceType[];
  startupName?: string;
  /** Soft boosts applied after semantic rank (0–1 additive) */
  boosts?: {
    industry?: string;
    stage?: string;
    functionalArea?: string;
    category?: string;
  };
};

export type UpsertChunkInput = {
  sourceType: RagSourceType;
  documentId?: string | null;
  capsuleId?: string | null;
  chunkIndex: number;
  content: string;
  embedding: number[];
  retrievable: boolean;
  contentHash?: string | null;
  metadata?: Record<string, unknown>;
};

export type VectorStore = {
  upsertChunks: (chunks: UpsertChunkInput[]) => Promise<void>;
  deleteByDocumentId: (documentId: string) => Promise<void>;
  deleteByCapsuleId: (capsuleId: string) => Promise<void>;
  setCapsuleRetrievable: (
    capsuleId: string,
    retrievable: boolean,
  ) => Promise<void>;
  match: (
    embedding: number[],
    options?: RetrieveOptions,
  ) => Promise<RagChunkRecord[]>;
};
