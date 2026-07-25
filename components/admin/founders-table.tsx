"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

export type FounderListItem = {
  id: string;
  email: string | null;
  first_login: boolean;
  created_at: string;
  hasAssignment: boolean;
  hasPendingReview: boolean;
  ideaPreview: string | null;
};

type Filter = "all" | "onboarded" | "not_onboarded" | "assigned" | "unassigned" | "pending_review";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "onboarded", label: "Onboarded" },
  { id: "not_onboarded", label: "Not onboarded" },
  { id: "assigned", label: "Assigned" },
  { id: "unassigned", label: "Unassigned" },
  { id: "pending_review", label: "Pending review" },
];

export function FoundersTable({ founders }: { founders: FounderListItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return founders.filter((f) => {
      if (filter === "onboarded" && f.first_login) return false;
      if (filter === "not_onboarded" && !f.first_login) return false;
      if (filter === "assigned" && !f.hasAssignment) return false;
      if (filter === "unassigned" && f.hasAssignment) return false;
      if (filter === "pending_review" && !f.hasPendingReview) return false;
      if (q && !(f.email ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [founders, filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-[var(--radius-md)] border px-2.5 py-1 text-xs transition-colors ${
                filter === f.id
                  ? "border-accent bg-accent-subtle text-accent"
                  : "border-border text-ink-secondary hover:border-accent/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search email"
          className="sm:max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-secondary">No founders match.</p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {filtered.map((f) => (
            <li key={f.id}>
              <Link
                href={`/admin/founders/${f.id}`}
                className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium text-ink">{f.email ?? "No email"}</p>
                  {f.ideaPreview ? (
                    <p className="truncate text-sm text-ink-secondary">
                      {f.ideaPreview}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 text-[11px] text-ink-tertiary">
                  <span>{f.first_login ? "Not onboarded" : "Onboarded"}</span>
                  <span>·</span>
                  <span>{f.hasAssignment ? "Assigned" : "Unassigned"}</span>
                  {f.hasPendingReview ? (
                    <>
                      <span>·</span>
                      <span className="text-challenge">Pending review</span>
                    </>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
