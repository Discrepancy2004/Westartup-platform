import Link from "next/link";
import { listingInitials } from "@/lib/directory/derive";
import { STAGE_LABELS, THEME_LABELS } from "@/lib/directory/labels";
import type { StartupListing } from "@/lib/directory/types";

export function CompanyCard({ listing }: { listing: StartupListing }) {
  return (
    <Link
      href={`/companies/${listing.slug}`}
      className="group flex gap-4 rounded-[var(--mkt-radius-sm)] border border-white/10 bg-[var(--mkt-bg-elevated)] p-4 transition-colors hover:border-[var(--mkt-accent)]/40 hover:bg-white/[0.03]"
    >
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--mkt-card-mint)] text-sm font-semibold text-[var(--mkt-card-ink)]"
        aria-hidden
      >
        {listingInitials(listing.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="truncate font-medium text-[var(--mkt-ink)] group-hover:text-white">
            {listing.name}
          </h2>
          <span className="shrink-0 rounded-full border border-[var(--mkt-accent)]/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--mkt-accent)]">
            Verified
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--mkt-muted)]">
          {listing.tagline}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-[var(--mkt-muted)]">
            {STAGE_LABELS[listing.stage] ?? listing.stage}
          </span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-[var(--mkt-muted)]">
            {THEME_LABELS[listing.theme] ?? listing.theme}
          </span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-[var(--mkt-muted)]">
            {listing.business_model}
          </span>
        </div>
      </div>
    </Link>
  );
}
