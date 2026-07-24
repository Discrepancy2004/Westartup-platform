import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./reveal";
import { SectionDecor } from "./section-decor";

export function ResourcesGrid() {
  return (
    <section
      id="resources"
      className="mkt-field-mist mkt-section relative scroll-mt-20 overflow-hidden"
    >
      <SectionDecor variant="resources" tone="on-mist" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <Reveal className="max-w-xl space-y-3">
          <h2 className="font-display text-3xl text-[var(--mkt-section-ink)] md:text-4xl">
            Resources for the raise
          </h2>
          <p className="text-base text-[var(--mkt-section-muted)] md:text-lg">
            Guides and paths that match how WeStartup actually works.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          <Reveal className="mkt-card overflow-hidden bg-[var(--mkt-card-cream)] md:col-span-8 md:flex">
            <div className="relative min-h-[160px] md:w-2/5">
              <Image
                src="/marketing/resource-path.png"
                alt="Path from conversation to dashboard documents"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mkt-card-ink)]/50">
                Case path
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--mkt-card-ink)]">
                From onboarding answers to a live dashboard
              </h3>
              <p className="mt-2 text-sm text-[var(--mkt-card-ink)]/70 md:text-base">
                How bootstrap artifacts are generated, then refined in chat with
                Accept / Not now updates.
              </p>
              <Link
                href="/signup"
                className="mt-4 text-sm font-semibold text-[var(--mkt-card-ink)] underline-offset-4 hover:underline"
              >
                Start the path
              </Link>
            </div>
          </Reveal>

          <Reveal
            delayMs={120}
            className="mkt-card bg-[var(--mkt-card-mint)] p-6 md:col-span-4 md:p-7"
          >
            <div className="relative mb-4 aspect-square w-14 overflow-hidden rounded-xl">
              <Image
                src="/marketing/panel-advisor.png"
                alt="Diligence checklist"
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <h3 className="text-lg font-semibold text-[var(--mkt-card-ink)]">
              Diligence checklist
            </h3>
            <p className="mt-2 text-sm text-[var(--mkt-card-ink)]/70">
              Questions the advisor will keep asking until answers hold.
            </p>
          </Reveal>

          <Reveal
            delayMs={180}
            className="mkt-card bg-[var(--mkt-card-peach)] p-6 md:col-span-4 md:p-7"
          >
            <div className="relative mb-4 aspect-square w-14 overflow-hidden rounded-xl">
              <Image
                src="/marketing/panel-market.png"
                alt="Market sizing notes"
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <h3 className="text-lg font-semibold text-[var(--mkt-card-ink)]">
              INR market sizing notes
            </h3>
            <p className="mt-2 text-sm text-[var(--mkt-card-ink)]/70">
              How we frame TAM / SAM / SOM for Indian contexts.
            </p>
          </Reveal>

          <Reveal
            delayMs={240}
            className="mkt-card overflow-hidden bg-[var(--mkt-card-blue)] md:col-span-8 md:flex"
          >
            <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mkt-card-ink)]/50">
                Plans
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--mkt-card-ink)]">
                Starter free · Growth & Scale soon
              </h3>
              <p className="mt-2 text-sm text-[var(--mkt-card-ink)]/70 md:text-base">
                Core chat and basic artifacts on Starter. Paid tiers finalize with
                Razorpay billing.
              </p>
              <Link
                href="/signup"
                className="mt-4 text-sm font-semibold text-[var(--mkt-card-ink)] underline-offset-4 hover:underline"
              >
                Compare plans in product
              </Link>
            </div>
            <div className="relative min-h-[140px] md:w-2/5">
              <Image
                src="/marketing/resource-plans.png"
                alt="Pricing plans illustration"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
