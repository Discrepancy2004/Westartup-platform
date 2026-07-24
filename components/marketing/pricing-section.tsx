import Link from "next/link";
import {
  PLAN_ORDER,
  PLANS,
  formatPlanPrice,
  type PlanId,
} from "@/lib/razorpay/plans";
import { Reveal } from "./reveal";

const HIGHLIGHT: PlanId = "starter";

const PLAN_BLURBS: Record<
  PlanId,
  { cta: string; note?: string; tone: string }
> = {
  starter: {
    cta: "Start free",
    note: "No card required",
    tone: "bg-[var(--mkt-card-mint)]",
  },
  growth: {
    cta: "Get Growth",
    note: "Extended chat and regeneration",
    tone: "bg-[var(--mkt-card-cream)]",
  },
  scale: {
    cta: "Get Scale",
    note: "Pricing finalized soon",
    tone: "bg-[var(--mkt-card-blue)]",
  },
};

export function PricingSection() {
  return (
    <section id="pricing" className="mkt-band-pricing scroll-mt-20 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="font-display text-3xl text-[var(--mkt-ink)] md:text-4xl">
            Pricing
          </h2>
          <p className="text-[var(--mkt-muted)]">
            Start free on Starter. Growth and Scale pricing finalize with billing.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PLAN_ORDER.map((id, i) => {
            const plan = PLANS[id];
            const blurb = PLAN_BLURBS[id];
            const featured = id === HIGHLIGHT;
            const price = formatPlanPrice(plan);

            return (
              <Reveal
                key={id}
                delayMs={i * 70}
                className={`${blurb.tone} mkt-card flex flex-col p-6 md:p-7 ${featured ? "ring-2 ring-[var(--mkt-accent)] ring-offset-2 ring-offset-[var(--mkt-band-5)]" : ""}`}
              >
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[var(--mkt-card-ink)]">
                    {plan.name}
                  </p>
                  {blurb.note ? (
                    <p className="text-xs text-[var(--mkt-card-ink)]/55">
                      {blurb.note}
                    </p>
                  ) : null}
                </div>

                <p className="mt-6 font-display text-4xl text-[var(--mkt-card-ink)]">
                  {price.label}
                  {price.suffix ? (
                    <span className="ml-1 font-sans text-sm font-normal text-[var(--mkt-card-ink)]/55">
                      {price.suffix}
                    </span>
                  ) : null}
                </p>

                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-[var(--mkt-card-ink)]/75">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--mkt-card-ink)]/40" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={
                    featured
                      ? "mt-8 inline-flex justify-center rounded-full bg-[var(--mkt-bg)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--mkt-ink)] transition-transform hover:opacity-90 active:scale-[0.97]"
                      : "mt-8 inline-flex justify-center rounded-full border border-[var(--mkt-card-ink)]/25 px-4 py-2.5 text-center text-sm font-semibold text-[var(--mkt-card-ink)] transition-transform hover:border-[var(--mkt-card-ink)]/50 active:scale-[0.97]"
                  }
                >
                  {blurb.cta}
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
