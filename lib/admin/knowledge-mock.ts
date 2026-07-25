import type {
  KnowledgeDocument,
  KnowledgeIndexSummary,
  KnowledgeTopic,
} from "@/lib/types/knowledge";

/** Placeholder corpus for admin UI until Supabase + embeddings land. */
export const MOCK_KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: "doc_bm_01",
    title: "SaaS pricing and unit economics checklist",
    sourceType: "pdf",
    topic: "business-model",
    status: "indexed",
    chunkCount: 24,
    bytes: 482_000,
    updatedAt: "2026-07-20T10:12:00.000Z",
  },
  {
    id: "doc_tr_01",
    title: "Early traction signals for B2B startups",
    sourceType: "markdown",
    topic: "traction-signals",
    status: "indexed",
    chunkCount: 18,
    bytes: 64_000,
    updatedAt: "2026-07-18T14:40:00.000Z",
  },
  {
    id: "doc_ds_01",
    title: "Term sheet redlines — seed round notes",
    sourceType: "pdf",
    topic: "deal-structure",
    status: "processing",
    chunkCount: null,
    bytes: 910_000,
    updatedAt: "2026-07-25T08:05:00.000Z",
  },
  {
    id: "doc_rf_01",
    title: "Common founder red flags in diligence",
    sourceType: "text",
    topic: "red-flags",
    status: "indexed",
    chunkCount: 12,
    bytes: 28_000,
    updatedAt: "2026-07-12T16:22:00.000Z",
  },
  {
    id: "doc_mk_01",
    title: "TAM / SAM / SOM framing for Indian markets",
    sourceType: "url",
    topic: "market",
    status: "failed",
    chunkCount: null,
    bytes: null,
    updatedAt: "2026-07-24T19:01:00.000Z",
    errorMessage: "Fetch failed — source URL unreachable",
  },
  {
    id: "doc_gn_01",
    title: "Advisor voice — challenge without cruelty",
    sourceType: "markdown",
    topic: "general",
    status: "queued",
    chunkCount: null,
    bytes: 11_000,
    updatedAt: "2026-07-26T01:15:00.000Z",
  },
];

export function buildMockTopics(
  documents: KnowledgeDocument[],
): KnowledgeTopic[] {
  const defs: Omit<KnowledgeTopic, "documentCount" | "indexedCount">[] = [
    {
      id: "business-model",
      label: "Business model",
      description: "Pricing, margins, and how value is captured.",
    },
    {
      id: "traction-signals",
      label: "Traction signals",
      description: "Evidence that demand and retention are real.",
    },
    {
      id: "deal-structure",
      label: "Deal structure",
      description: "Round size, dilution, and investor terms.",
    },
    {
      id: "red-flags",
      label: "Red flags",
      description: "Patterns that should slow or stop a recommendation.",
    },
    {
      id: "market",
      label: "Market",
      description: "Sizing, competition, and go-to-market context.",
    },
    {
      id: "general",
      label: "General",
      description: "Cross-cutting advisor methodology.",
    },
  ];

  return defs.map((d) => {
    const docs = documents.filter((doc) => doc.topic === d.id);
    return {
      ...d,
      documentCount: docs.length,
      indexedCount: docs.filter((doc) => doc.status === "indexed").length,
    };
  });
}

export function buildMockIndexSummary(
  documents: KnowledgeDocument[],
): KnowledgeIndexSummary {
  return {
    totalDocuments: documents.length,
    indexed: documents.filter((d) => d.status === "indexed").length,
    processing: documents.filter(
      (d) => d.status === "processing" || d.status === "queued",
    ).length,
    failed: documents.filter((d) => d.status === "failed").length,
    lastSyncedAt: "2026-07-25T08:10:00.000Z",
    embeddingModel: "text-embedding-3-small (placeholder)",
  };
}
