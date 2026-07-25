import Link from "next/link";
import type { AdminNavCounts } from "@/lib/admin/counts";

export function AdminKpiCards({ counts }: { counts: AdminNavCounts }) {
  const cards = [
    {
      label: "Pending applications",
      value: counts.pendingApplications,
      href: "/admin/experts/applications",
      hint: "Expert applications awaiting review",
    },
    {
      label: "Pending founder reviews",
      value: counts.pendingReviews,
      href: "/admin/experts/assignments",
      hint: "Founders waiting for an expert",
    },
    {
      label: "Active assignments",
      value: counts.activeAssignments,
      href: "/admin/experts/assignments",
      hint: "Expert ↔ founder matches in progress",
    },
    {
      label: "Platform",
      value: `${counts.expertCount} / ${counts.founderCount}`,
      href: "/admin/founders",
      hint: "Experts / Founders",
      isText: true,
    },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className="group border border-border bg-surface/60 px-4 py-4 transition-colors hover:border-accent/40 hover:bg-surface"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-tertiary">
            {card.label}
          </p>
          <p
            className={`mt-2 font-display text-ink transition-colors group-hover:text-accent ${
              "isText" in card && card.isText ? "text-2xl" : "text-3xl"
            }`}
          >
            {card.value}
          </p>
          <p className="mt-1 text-xs text-ink-secondary">{card.hint}</p>
        </Link>
      ))}
    </div>
  );
}
