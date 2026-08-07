import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function CompanyDetailLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mkt-field-dark flex-1">
        <div className="mx-auto max-w-5xl px-5 py-10 md:py-14">
          <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
          <div className="mt-8 flex gap-4">
            <div className="size-16 animate-pulse rounded-2xl bg-white/10" />
            <div className="space-y-3">
              <div className="h-9 w-56 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-80 max-w-full animate-pulse rounded bg-white/8" />
            </div>
          </div>
          <div className="mt-10 h-40 animate-pulse rounded-[var(--mkt-radius-sm)] bg-white/5" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
