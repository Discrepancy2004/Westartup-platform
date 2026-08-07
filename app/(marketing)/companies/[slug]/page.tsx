import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { listingInitials } from "@/lib/directory/derive";
import {
  FUNDING_LABELS,
  STAGE_LABELS,
  TEAM_LABELS,
  THEME_LABELS,
} from "@/lib/directory/labels";
import { getStartupListingBySlug } from "@/lib/directory/query";
import { isSupabaseConfigured } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isSupabaseConfigured()) {
    return { title: "Company · WeStartup" };
  }
  try {
    const listing = await getStartupListingBySlug(slug);
    if (!listing) return { title: "Company not found · WeStartup" };
    return {
      title: `${listing.name} · WeStartup`,
      description: listing.tagline,
    };
  } catch {
    return { title: "Company · WeStartup" };
  }
}

export default async function CompanyDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!isSupabaseConfigured()) notFound();

  let listing = null;
  try {
    listing = await getStartupListingBySlug(slug);
  } catch {
    notFound();
  }
  if (!listing) notFound();

  const themes = [listing.theme, ...listing.secondary_themes].filter(
    (value, index, all) => all.indexOf(value) === index,
  );

  return (
    <>
      <SiteHeader />
      <main className="mkt-field-dark flex-1">
        <div className="mx-auto max-w-5xl px-5 py-10 md:py-14">
          <p className="text-sm text-[var(--mkt-faint)]">
            <Link href="/companies" className="hover:text-[var(--mkt-ink)]">
              Companies
            </Link>
            <span aria-hidden> / </span>
            <span>{listing.name}</span>
          </p>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div>
              <div className="flex items-start gap-4">
                <div
                  className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--mkt-card-mint)] text-lg font-semibold text-[var(--mkt-card-ink)]"
                  aria-hidden
                >
                  {listingInitials(listing.name)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-4xl text-[var(--mkt-ink)]">
                      {listing.name}
                    </h1>
                    <span className="rounded-full border border-[var(--mkt-accent)]/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--mkt-accent)]">
                      Verified
                    </span>
                  </div>
                  <p className="mt-2 text-base leading-relaxed text-[var(--mkt-muted)]">
                    {listing.tagline}
                  </p>
                </div>
              </div>

              <section className="mt-10">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-faint)]">
                  About
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--mkt-ink)]/90">
                  {listing.description}
                </p>
              </section>

              <div className="mt-8 flex flex-wrap gap-1.5">
                {themes.map((theme) => (
                  <span
                    key={theme}
                    className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-[var(--mkt-muted)]"
                  >
                    {THEME_LABELS[theme] ?? theme}
                  </span>
                ))}
              </div>
            </div>

            <aside className="space-y-5 rounded-[var(--mkt-radius-sm)] border border-white/10 bg-[var(--mkt-bg-elevated)] p-5">
              <Fact label="Stage" value={STAGE_LABELS[listing.stage] ?? listing.stage} />
              <Fact label="Business model" value={listing.business_model} />
              <Fact label="Team" value={TEAM_LABELS[listing.team_size] ?? listing.team_size} />
              <Fact
                label="Funding"
                value={
                  listing.funding_intent
                    ? FUNDING_LABELS[listing.funding_intent]
                    : listing.currently_raising
                      ? "Raising"
                      : "—"
                }
              />
              <Fact
                label="Verified"
                value={new Date(listing.verified_at).toLocaleDateString()}
              />

              <Link href="/signup" className="mkt-btn-primary mt-4 w-full text-sm">
                Join WeStartup
              </Link>
              <Link
                href="/chat"
                className="block text-center text-sm text-[var(--mkt-muted)] hover:text-[var(--mkt-ink)]"
              >
                Open workspace
              </Link>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-faint)]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[var(--mkt-ink)]">{value}</p>
    </div>
  );
}
