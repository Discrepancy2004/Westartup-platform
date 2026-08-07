import Link from "next/link";
import { CompanyCard } from "@/components/directory/company-card";
import { DirectoryFilters } from "@/components/directory/directory-filters";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { DIRECTORY_PAGE_SIZE } from "@/lib/directory/labels";
import { listStartupListings } from "@/lib/directory/query";
import { isSupabaseConfigured } from "@/lib/utils";

type Search = {
  q?: string;
  theme?: string;
  stage?: string;
  model?: string;
  raising?: string;
  limit?: string;
};

export const metadata = {
  title: "Startup Directory · WeStartup",
  description:
    "Browse verified WeStartup companies. Every listing completed the starter questions.",
};

export const revalidate = 45;

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const theme = params.theme?.trim() ?? "";
  const stage = params.stage?.trim() ?? "";
  const model = params.model?.trim() ?? "";
  const raising = params.raising === "1" || params.raising === "true";
  const limit = Math.min(
    Math.max(Number(params.limit) || DIRECTORY_PAGE_SIZE, DIRECTORY_PAGE_SIZE),
    DIRECTORY_PAGE_SIZE * 4,
  );

  let listings: Awaited<ReturnType<typeof listStartupListings>>["listings"] =
    [];
  let total = 0;
  let loadError = false;

  if (isSupabaseConfigured()) {
    try {
      const result = await listStartupListings({
        q: q || undefined,
        theme: theme || undefined,
        stage: stage || undefined,
        model: model || undefined,
        raising: raising || undefined,
        limit,
      });
      listings = result.listings;
      total = result.total;
    } catch {
      loadError = true;
    }
  }

  const nextLimit = Math.min(limit + DIRECTORY_PAGE_SIZE, DIRECTORY_PAGE_SIZE * 4);
  const moreHref = (() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (theme) next.set("theme", theme);
    if (stage) next.set("stage", stage);
    if (model) next.set("model", model);
    if (raising) next.set("raising", "1");
    next.set("limit", String(nextLimit));
    return `/companies?${next.toString()}`;
  })();

  return (
    <>
      <SiteHeader />
      <main className="mkt-field-dark flex-1">
        <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--mkt-accent)]">
              Public directory
            </p>
            <h1 className="mt-2 font-display text-4xl text-[var(--mkt-ink)] md:text-5xl">
              Startup Directory
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--mkt-muted)]">
              Verified companies from founders who completed every starter
              question. Open to everyone.
            </p>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <DirectoryFilters
                q={q}
                theme={theme}
                stage={stage}
                model={model}
                raising={raising}
              />
            </aside>

            <section>
              <p className="text-sm text-[var(--mkt-muted)]">
                {loadError
                  ? "Could not load companies right now."
                  : `${total} ${total === 1 ? "company" : "companies"}`}
              </p>

              {listings.length === 0 && !loadError ? (
                <div className="mt-8 rounded-[var(--mkt-radius)] border border-dashed border-white/15 px-6 py-16 text-center">
                  <p className="font-display text-2xl text-[var(--mkt-ink)]">
                    No verified companies yet
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-[var(--mkt-muted)]">
                    Companies appear here after founders finish the starter
                    questions. Be the first to publish yours.
                  </p>
                  <Link href="/signup" className="mkt-btn-primary mt-6 !px-4 !py-2 text-sm">
                    Get started
                  </Link>
                </div>
              ) : (
                <div className="mt-5 grid gap-3">
                  {listings.map((listing) => (
                    <CompanyCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}

              {listings.length > 0 && listings.length < total ? (
                <div className="mt-8 text-center">
                  <Link href={moreHref} className="mkt-btn-ghost text-sm">
                    Load more
                  </Link>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
