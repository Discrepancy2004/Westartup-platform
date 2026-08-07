import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function CompaniesLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mkt-field-dark flex-1">
        <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
          <div className="h-10 w-72 max-w-full animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-white/8" />
          <div className="mt-10 grid gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-[var(--mkt-radius-sm)] border border-white/10 bg-white/5"
              />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
