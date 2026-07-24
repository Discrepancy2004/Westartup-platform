"use client";

import { useState } from "react";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How long does it actually take?",
    a: "Most founders finish onboarding in minutes, then spend the rest of the hour refining with the advisor and reviewing dashboard artifacts.",
  },
  {
    q: "Is this just another cheerleading AI?",
    a: "No. The advisor is built to challenge weak claims and ask for evidence. Encouragement is not the product.",
  },
  {
    q: "What do I walk away with?",
    a: "A live dashboard of investor-oriented documents: idea brief, financial projections, revenue model, market sizing, team overview, and deal structure when you are raising.",
  },
  {
    q: "Do you support Indian pricing and INR?",
    a: "Yes. Projections and market figures are framed in INR. Billing uses Razorpay when paid plans go live.",
  },
  {
    q: "Do I need a paid plan to start?",
    a: "Starter is free forever for core advisor chat and basic dashboard artifacts. Growth and Scale add higher limits when pricing is finalized.",
  },
  {
    q: "Will numbers be investor-grade facts?",
    a: "Artifacts are structured projections grounded in your inputs. Treat them as diligence prep, then replace illustrative figures with your verified data before the room.",
  },
] as const;

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mkt-band-faq scroll-mt-20 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="font-display text-3xl text-[var(--mkt-ink)] md:text-4xl">
            Questions founders ask
          </h2>
          <p className="text-[var(--mkt-muted)]">
            Straight answers on time, tone, output, and pricing.
          </p>
        </Reveal>

        <ul className="mx-auto mt-12 max-w-3xl space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} as="li" delayMs={i * 40}>
                <div className="overflow-hidden rounded-[var(--mkt-radius-sm)] bg-[var(--mkt-bg-elevated)] ring-1 ring-white/10">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="text-sm font-medium text-[var(--mkt-ink)] sm:text-base">
                      {item.q}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 text-[var(--mkt-faint)] transition-transform duration-200",
                        isOpen && "rotate-45",
                      )}
                      style={{ transitionTimingFunction: "var(--ease-out)" }}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 pr-10 text-sm leading-relaxed text-[var(--mkt-muted)]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
