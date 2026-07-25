"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

export type ExpertListItem = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  created_at: string;
  activeCount: number;
};

export function ExpertsTable({ experts }: { experts: ExpertListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return experts;
    return experts.filter((e) => {
      const hay = [e.name, e.email ?? "", e.company ?? ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [experts, query]);

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, company, or email"
        className="max-w-md"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-secondary">
          {experts.length === 0
            ? "No experts yet. Approve applications to grow the roster."
            : "No experts match your search."}
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {filtered.map((e) => (
            <li key={e.id}>
              <Link
                href={`/admin/experts/${e.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-surface"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">{e.name}</p>
                  <p className="truncate text-xs text-ink-tertiary">
                    {[e.company, e.email].filter(Boolean).join(" · ")}
                    {" · "}
                    Joined {new Date(e.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-ink-secondary">
                  {e.activeCount} assigned
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
