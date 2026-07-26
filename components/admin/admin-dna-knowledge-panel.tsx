"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { archiveDnaCapsule } from "@/app/(admin)/admin/knowledge-actions";
import { DNA_CATEGORY_LABELS, type DnaCapsuleCategory } from "@/lib/expert/dna-questions";

export type AdminDnaRow = {
  id: string;
  question_id: string;
  question_text: string;
  answer: string;
  why: string | null;
  category: string | null;
  functional_area: string | null;
  industry: string | null;
  stage: string | null;
  status: string;
  usage_count: number;
  expert_id: string;
  expert_email: string | null;
  expert_name: string | null;
  updated_at: string;
};

export function AdminDnaKnowledgePanel({ rows }: { rows: AdminDnaRow[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!needle) return true;
      const hay = [
        r.question_text,
        r.answer,
        r.why,
        r.expert_email,
        r.expert_name,
        r.category,
        r.functional_area,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q, status]);

  const stats = useMemo(() => {
    const published = rows.filter((r) => r.status === "published").length;
    const draft = rows.filter((r) => r.status === "draft").length;
    const archived = rows.filter((r) => r.status === "archived").length;
    const usage = rows.reduce((s, r) => s + (r.usage_count ?? 0), 0);
    return { published, draft, archived, usage, total: rows.length };
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Published", value: stats.published },
          { label: "Draft", value: stats.draft },
          { label: "Usage injections", value: stats.usage },
        ].map((c) => (
          <div key={c.label} className="border border-border px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">
              {c.label}
            </p>
            <p className="mt-1 font-display text-2xl text-ink">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search capsules, experts…"
          className="h-10 min-w-[200px] flex-1 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-[var(--radius-md)] border border-border bg-surface px-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {message ? <p className="text-sm text-ink-secondary">{message}</p> : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-secondary">No capsules match.</p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {filtered.map((r) => (
            <li key={r.id} className="space-y-2 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-ink-tertiary">
                    {r.expert_name || r.expert_email || r.expert_id.slice(0, 8)}
                    {" · "}
                    {DNA_CATEGORY_LABELS[r.category as DnaCapsuleCategory] ??
                      r.category ??
                      "—"}
                    {" · "}
                    <span className="uppercase">{r.status}</span>
                    {" · usage "}
                    {r.usage_count}
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {r.question_text}
                  </p>
                </div>
                {r.status !== "archived" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 text-xs"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        const res = await archiveDnaCapsule(r.id);
                        setMessage(
                          res.ok
                            ? "Capsule archived (removed from RAG retrieval)."
                            : res.error,
                        );
                      });
                    }}
                  >
                    Archive
                  </Button>
                ) : null}
              </div>
              <p className="line-clamp-3 text-sm text-ink-secondary">{r.answer}</p>
              {r.why ? (
                <p className="text-xs text-ink-tertiary">
                  Why: {r.why.slice(0, 160)}
                  {r.why.length > 160 ? "…" : ""}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
