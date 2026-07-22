import Link from "next/link";
import {
  PLAN_ORDER,
  PLANS,
  formatPlanPrice,
  type PlanId,
} from "@/lib/razorpay/plans";

const HIGHLIGHT: PlanId = "growth";

const PLAN_BLURBS: Record<PlanId, { cta: string; note?: string }> = {
  starter: {
    cta: "Start free",
    note: "Free tier · no card required",
  },
  growth: {
    cta: "Get Growth",
    note: "Most founders start here",
  },
  scale: {
    cta: "Get Scale",
    note: "Pricing finalized soon",
  },
};

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 border-t border-border bg-canvas"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mx-auto max-w-xl space-y-3 text-center">
          <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
            Pricing
          </h2>
          <p className="text-ink-secondary">
            Start free on Starter. Growth and Scale pricing finalize with billing.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const blurb = PLAN_BLURBS[id];
            const featured = id === HIGHLIGHT;
            const price = formatPlanPrice(plan);

            return (
              <div
                key={id}
                className={
                  featured
                    ? "flex flex-col rounded-[var(--radius-lg)] border-2 border-accent bg-surface p-6"
                    : "flex flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-6"
                }
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-ink">{plan.name}</p>
                  {blurb.note ? (
                    <p className="text-xs text-ink-tertiary">{blurb.note}</p>
                  ) : null}
                </div>

                <p className="mt-6 font-display text-4xl tracking-tight text-ink">
                  {price.label}
                  {price.suffix ? (
                    <span className="ml-1 text-sm font-sans font-normal text-ink-tertiary">
                      {price.suffix}
                    </span>
                  ) : null}
                </p>

                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-ink-secondary">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={
                    featured
                      ? "mt-8 block rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                      : "mt-8 block rounded-[var(--radius-md)] border border-border px-4 py-2.5 text-center text-sm font-medium text-ink transition-colors hover:bg-canvas"
                  }
                >
                  {blurb.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
