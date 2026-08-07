import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function PrivacyLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mkt-field-dark flex-1">
        <div className="mx-auto max-w-3xl px-5 py-10 md:py-16">
          <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
          <div className="mt-4 h-10 w-64 max-w-full animate-pulse rounded bg-white/15" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-white/8" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-white/8" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-white/8" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
