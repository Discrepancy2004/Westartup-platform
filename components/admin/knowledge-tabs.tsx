"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/knowledge/dna", label: "Expert DNA" },
  { href: "/admin/knowledge/corpus", label: "Historical corpus" },
] as const;

export function KnowledgeTabs() {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Knowledge Base</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Curate Expert DNA capsules and historical startup materials for RAG.
          Founder chat injection ships in a later sprint.
        </p>
      </div>
      <nav className="flex gap-1 border-b border-border" aria-label="Knowledge">
        {TABS.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "border-b-2 px-3 py-2 text-sm transition-colors",
                active
                  ? "border-accent text-ink"
                  : "border-transparent text-ink-secondary hover:text-ink",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
