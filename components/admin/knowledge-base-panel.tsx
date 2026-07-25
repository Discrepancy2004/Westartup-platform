"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KnowledgeBulkUpload } from "@/components/admin/knowledge-bulk-upload";
import {
  buildMockIndexSummary,
  buildMockTopics,
  MOCK_KNOWLEDGE_DOCUMENTS,
} from "@/lib/admin/knowledge-mock";
import {
  KNOWLEDGE_TOPIC_LABELS,
  type KnowledgeDocStatus,
  type KnowledgeDocument,
  type KnowledgeTopicId,
} from "@/lib/types/knowledge";
import { cn } from "@/lib/utils";

type TabId = "documents" | "upload" | "topics" | "index";

const TABS: { id: TabId; label: string }[] = [
  { id: "documents", label: "Documents" },
  { id: "upload", label: "Bulk upload" },
  { id: "topics", label: "Topics" },
  { id: "index", label: "Index status" },
];

const STATUS_STYLES: Record<KnowledgeDocStatus, string> = {
  indexed: "text-success",
  processing: "text-accent",
  queued: "text-ink-tertiary",
  failed: "text-danger",
};

function formatBytes(bytes: number | null) {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function KnowledgeBasePanel() {
  const [tab, setTab] = useState<TabId>("documents");
  const [query, setQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState<KnowledgeTopicId | "all">(
    "all",
  );
  const [defaultTopic, setDefaultTopic] =
    useState<KnowledgeTopicId>("general");
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(
    MOCK_KNOWLEDGE_DOCUMENTS,
  );
  const [notice, setNotice] = useState<string | null>(null);

  const topics = useMemo(() => buildMockTopics(documents), [documents]);
  const summary = useMemo(() => buildMockIndexSummary(documents), [documents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((d) => {
      if (topicFilter !== "all" && d.topic !== topicFilter) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        KNOWLEDGE_TOPIC_LABELS[d.topic].toLowerCase().includes(q)
      );
    });
  }, [documents, query, topicFilter]);

  function showDbNotice(action: string) {
    setNotice(
      `${action} will connect when the knowledge database is ready. UI only for now.`,
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Knowledge Base</h1>
          <p className="mt-1 max-w-xl text-sm text-ink-secondary">
            Corpus for advisor RAG. Bulk upload accepts up to 100 files per
            batch; the ingest pipeline hooks in when storage is ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => showDbNotice("Re-index")}
          >
            Re-index all
          </Button>
          <Button type="button" onClick={() => setTab("upload")}>
            Upload files
          </Button>
        </div>
      </div>

      {notice ? (
        <p className="border border-border bg-surface/70 px-4 py-3 text-sm text-ink-secondary">
          {notice}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Documents", value: summary.totalDocuments },
          { label: "Indexed", value: summary.indexed },
          { label: "In progress", value: summary.processing },
          { label: "Failed", value: summary.failed },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-border bg-surface/60 px-4 py-3"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-tertiary">
              {s.label}
            </p>
            <p className="mt-1 font-display text-2xl text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border pb-px">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm transition-colors",
              tab === t.id
                ? "border-accent text-ink"
                : "border-transparent text-ink-secondary hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "upload" ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-sm text-ink-secondary" htmlFor="bulk-topic">
              Default topic for this batch
            </label>
            <select
              id="bulk-topic"
              className="h-10 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm text-ink sm:max-w-xs"
              value={defaultTopic}
              onChange={(e) =>
                setDefaultTopic(e.target.value as KnowledgeTopicId)
              }
            >
              {Object.entries(KNOWLEDGE_TOPIC_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <KnowledgeBulkUpload
            defaultTopic={defaultTopic}
            onEnqueued={(docs) => {
              setDocuments((prev) => [...docs, ...prev]);
              setTab("documents");
            }}
          />
        </div>
      ) : null}

      {tab === "documents" ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents"
              className="sm:max-w-xs"
            />
            <select
              className="h-10 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm text-ink"
              value={topicFilter}
              onChange={(e) =>
                setTopicFilter(e.target.value as KnowledgeTopicId | "all")
              }
            >
              <option value="all">All topics</option>
              {Object.entries(KNOWLEDGE_TOPIC_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-ink-secondary">No documents match.</p>
          ) : (
            <ul className="divide-y divide-border border border-border">
              {filtered.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-ink">{doc.title}</p>
                    <p className="text-xs text-ink-tertiary">
                      {KNOWLEDGE_TOPIC_LABELS[doc.topic]} · {doc.sourceType}
                      {" · "}
                      {formatBytes(doc.bytes)}
                      {doc.chunkCount != null
                        ? ` · ${doc.chunkCount} chunks`
                        : ""}
                    </p>
                    {doc.errorMessage ? (
                      <p className="text-xs text-danger">{doc.errorMessage}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={cn(
                        "text-xs font-medium capitalize",
                        STATUS_STYLES[doc.status],
                      )}
                    >
                      {doc.status}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => showDbNotice("Retry / delete")}
                    >
                      Manage
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {tab === "topics" ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="border border-border bg-surface/50 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{topic.label}</p>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {topic.description}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-ink-tertiary">
                  {topic.indexedCount}/{topic.documentCount} indexed
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="mt-3 px-0 text-xs text-accent hover:bg-transparent"
                onClick={() => {
                  setTopicFilter(topic.id);
                  setTab("documents");
                }}
              >
                View documents
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "index" ? (
        <div className="space-y-4 border border-border px-4 py-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-ink-tertiary">
                Embedding model
              </dt>
              <dd className="mt-1 text-sm text-ink">{summary.embeddingModel}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-ink-tertiary">
                Last sync
              </dt>
              <dd className="mt-1 text-sm text-ink">
                {summary.lastSyncedAt
                  ? new Date(summary.lastSyncedAt).toLocaleString()
                  : "Never"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-ink-tertiary">
                Coverage
              </dt>
              <dd className="mt-1 text-sm text-ink">
                {summary.indexed} of {summary.totalDocuments} documents indexed
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-ink-tertiary">
                Pipeline
              </dt>
              <dd className="mt-1 text-sm text-ink">
                {summary.processing} in progress · {summary.failed} failed
              </dd>
            </div>
          </dl>
          <p className="text-xs text-ink-tertiary">
            Bulk ingest uses{" "}
            <code className="text-ink-secondary">
              runBulkKnowledgeUploadPipeline
            </code>{" "}
            in{" "}
            <code className="text-ink-secondary">
              lib/admin/knowledge-upload.ts
            </code>
            . Wire Storage + workers there when the DB is ready.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDocuments([...MOCK_KNOWLEDGE_DOCUMENTS]);
              showDbNotice("Reset sample corpus");
            }}
          >
            Reset sample data
          </Button>
        </div>
      ) : null}
    </div>
  );
}
