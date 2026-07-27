import { createHash } from "crypto";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed, embedMany } from "ai";
import { sanitizeRagText } from "@/lib/rag/sanitize";
import {
  RAG_EMBEDDING_DIMENSIONS,
  RAG_EMBEDDING_MODEL,
} from "@/lib/rag/types";

function getGoogle() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required for RAG embeddings.");
  }
  return createGoogleGenerativeAI({ apiKey });
}

function embeddingModel() {
  return getGoogle().embeddingModel(RAG_EMBEDDING_MODEL);
}

const providerOptions = {
  google: {
    outputDimensionality: RAG_EMBEDDING_DIMENSIONS,
    taskType: "RETRIEVAL_DOCUMENT" as const,
  },
};

const queryProviderOptions = {
  google: {
    outputDimensionality: RAG_EMBEDDING_DIMENSIONS,
    taskType: "RETRIEVAL_QUERY" as const,
  },
};

export function hashContent(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /quota|rate.?limit|429|resource.?exhausted/i.test(msg);
}

function retryAfterMs(err: unknown, attempt: number): number {
  const msg = err instanceof Error ? err.message : String(err);
  const match = msg.match(/retry in ([\d.]+)\s*s/i);
  if (match) {
    return Math.ceil(Number(match[1]) * 1000) + 500;
  }
  // Exponential backoff: 15s, 30s, 60s…
  return Math.min(60_000, 15_000 * 2 ** attempt);
}

async function withEmbedRetry<T>(fn: () => Promise<T>): Promise<T> {
  const maxAttempts = 6;
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isQuotaError(err) || attempt === maxAttempts - 1) {
        throw err;
      }
      const wait = retryAfterMs(err, attempt);
      console.warn(
        `[rag/embed] quota hit, retry ${attempt + 1}/${maxAttempts} in ${wait}ms`,
      );
      await sleep(wait);
    }
  }
  throw lastError;
}

export async function embedDocumentText(text: string): Promise<number[]> {
  const value = sanitizeRagText(text);
  return withEmbedRetry(async () => {
    const { embedding } = await embed({
      model: embeddingModel(),
      value,
      providerOptions,
    });
    return embedding;
  });
}

export async function embedQueryText(text: string): Promise<number[]> {
  const value = sanitizeRagText(text);
  return withEmbedRetry(async () => {
    const { embedding } = await embed({
      model: embeddingModel(),
      value,
      providerOptions: queryProviderOptions,
    });
    return embedding;
  });
}

export async function embedDocumentTexts(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) return [];
  const values = texts.map((t) => sanitizeRagText(t));

  // Prefer smaller batches to stay under free-tier request limits
  const batchSize = Math.max(
    1,
    Number(process.env.RAG_EMBED_BATCH_SIZE ?? "4") || 4,
  );
  const all: number[][] = [];

  for (let i = 0; i < values.length; i += batchSize) {
    const slice = values.slice(i, i + batchSize);
    const embeddings = await withEmbedRetry(async () => {
      const { embeddings: batch } = await embedMany({
        model: embeddingModel(),
        values: slice,
        providerOptions,
      });
      return batch;
    });
    all.push(...embeddings);
    // Gentle pacing between batches on free tier
    if (i + batchSize < values.length) {
      await sleep(Number(process.env.RAG_EMBED_BATCH_DELAY_MS ?? "2500") || 2500);
    }
  }

  return all;
}
