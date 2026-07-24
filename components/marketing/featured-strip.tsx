import Link from "next/link";
import { Reveal } from "./reveal";
import { SectionDecor } from "./section-decor";

export function FeaturedStrip() {
  return (
    <section className="mkt-field-dark mkt-section relative overflow-hidden">
      <SectionDecor variant="featured" tone="on-dark" />
      <div className="relative z-10 mx-auto grid max-w-6xl gap-4 lg:grid-cols-12">
        <Reveal className="mkt-card relative flex min-h-[260px] flex-col justify-end overflow-hidden bg-[#0a1f1c] p-6 text-[var(--mkt-ink)] lg:col-span-7 md:min-h-[300px] md:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(45,212,191,0.18),transparent_55%)]"
          />
          <button
            type="button"
            className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[var(--mkt-field-dark)] shadow-lg transition-transform hover:scale-[1.04] active:scale-95"
            aria-label="Watch demo (coming soon)"
          >
            <span className="ml-0.5 border-y-7 border-l-[13px] border-y-transparent border-l-[var(--mkt-field-dark)]" />
          </button>
          <p className="relative text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mkt-faint)]">
            Demo
          </p>
          <h3 className="relative mt-2 font-display text-2xl text-[var(--mkt-ink)] md:text-3xl">
            Watch a session from idea to dashboard
          </h3>
          <p className="relative mt-2 max-w-lg text-sm text-[var(--mkt-muted)] md:text-base">
            See how the advisor challenges a claim, then updates investor docs
            in place.
          </p>
        </Reveal>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <Reveal
            delayMs={140}
            className="mkt-card flex flex-1 flex-col justify-between bg-[var(--mkt-card-mint)] p-6 md:p-7"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mkt-card-ink)]/50">
                Guide
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--mkt-card-ink)] md:text-xl">
                What “investor-ready” actually means
              </h3>
              <p className="mt-2 text-sm text-[var(--mkt-card-ink)]/70 md:text-base">
                A short brief on evidence, unit economics, and diligence questions.
              </p>
            </div>
            <Link
              href="#resources"
              className="mt-4 text-sm font-semibold text-[var(--mkt-card-ink)] underline-offset-4 hover:underline"
            >
              Read the guide
            </Link>
          </Reveal>

          <Reveal
            delayMs={240}
            className="mkt-card flex flex-1 flex-col justify-between bg-[var(--mkt-card-peach)] p-6 md:p-7"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mkt-card-ink)]/50">
                Pricing
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--mkt-card-ink)] md:text-xl">
                Start free on Starter
              </h3>
              <p className="mt-2 text-sm text-[var(--mkt-card-ink)]/70 md:text-base">
                Core advisor chat and basic dashboard artifacts, no card required.
              </p>
            </div>
            <Link
              href="/signup"
              className="mt-4 text-sm font-semibold text-[var(--mkt-card-ink)] underline-offset-4 hover:underline"
            >
              Create account
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
