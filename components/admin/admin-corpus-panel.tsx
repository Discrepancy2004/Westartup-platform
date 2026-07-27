"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  setKnowledgeDocumentIgnored,
  uploadKnowledgeFiles,
} from "@/app/(admin)/admin/knowledge-actions";

export type AdminCorpusRow = {
  id: string;
  title: string;
  source_type: string;
  status: string;
  startup_name: string | null;
  file_name: string;
  chunk_count: number | null;
  ignored: boolean;
  error_message: string | null;
  updated_at: string;
};

export function AdminCorpusPanel({ rows }: { rows: AdminCorpusRow[] }) {
  const [q, setQ] = useState("");
  const [source, setSource] = useState("all");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [startupName, setStartupName] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (source !== "all" && r.source_type !== source) return false;
      if (!needle) return true;
      return [r.title, r.file_name, r.startup_name, r.source_type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [rows, q, source]);

  const stats = useMemo(() => {
    const indexed = rows.filter((r) => r.status === "indexed" && !r.ignored)
      .length;
    const failed = rows.filter((r) => r.status === "failed").length;
    const ignored = rows.filter((r) => r.ignored).length;
    return { indexed, failed, ignored, total: rows.length };
  }, [rows]);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Documents", value: stats.total },
          { label: "Indexed", value: stats.indexed },
          { label: "Failed", value: stats.failed },
          { label: "Ignored", value: stats.ignored },
        ].map((c) => (
          <div key={c.label} className="border border-border px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">
              {c.label}
            </p>
            <p className="mt-1 font-display text-2xl text-ink">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="border border-border px-4 py-4">
        <h2 className="text-sm font-semibold text-ink">Upload documents</h2>
        <p className="mt-1 text-xs text-ink-tertiary">
          PDF, PPTX, DOCX, XLSX. Same pipeline as the corpus ingest script.
        </p>
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setMessage(null);
            startTransition(async () => {
              const res = await uploadKnowledgeFiles(fd);
              if (!res.ok) {
                setMessage(res.error);
                return;
              }
              const ok = res.results.filter((r) => r.ok).length;
              const bad = res.results.filter((r) => !r.ok).length;
              setMessage(`Processed ${ok} ok, ${bad} failed.`);
              e.currentTarget.reset();
              setStartupName("");
            });
          }}
        >
          <input
            name="startup_name"
            value={startupName}
            onChange={(e) => setStartupName(e.target.value)}
            placeholder="Startup name (optional metadata)"
            className="h-10 w-full max-w-md rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm"
          />
          <input
            name="files"
            type="file"
            multiple
            accept=".pdf,.pptx,.docx,.xlsx,.xls"
            className="block w-full text-sm text-ink-secondary"
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Ingesting…" : "Upload & index"}
          </Button>
        </form>
      </section>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search files, startups…"
          className="h-10 min-w-[200px] flex-1 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm"
        />
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="h-10 rounded-[var(--radius-md)] border border-border bg-surface px-2 text-sm"
        >
          <option value="all">All types</option>
          <option value="pitch_deck">Pitch deck</option>
          <option value="executive_summary">Executive summary</option>
          <option value="investor_note">Investor note</option>
          <option value="startup_review">Startup review</option>
          <option value="other">Other</option>
        </select>
      </div>

      {message ? <p className="text-sm text-ink-secondary">{message}</p> : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-secondary">
          No corpus documents yet. Run{" "}
          <code className="text-xs">npm run rag:ingest-corpus</code> or upload
          above.
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{r.file_name}</p>
                <p className="text-xs text-ink-tertiary">
                  {r.startup_name ?? "—"} · {r.source_type} · {r.status}
                  {r.chunk_count != null ? ` · ${r.chunk_count} chunks` : ""}
                  {r.ignored ? " · ignored" : ""}
                </p>
                {r.error_message ? (
                  <p className="text-xs text-danger">{r.error_message}</p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="secondary"
                className="text-xs"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await setKnowledgeDocumentIgnored(
                      r.id,
                      !r.ignored,
                    );
                    setMessage(
                      res.ok
                        ? r.ignored
                          ? "Document included again."
                          : "Document ignored (excluded from RAG)."
                        : res.error,
                    );
                  });
                }}
              >
                {r.ignored ? "Un-ignore" : "Ignore"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
