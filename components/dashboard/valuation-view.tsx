"use client";

import { FadeIn, MotionCard } from "@/components/dashboard/motion-primitives";
import { estimateValuation } from "@/lib/dashboard/valuation";
import type { ArtifactRecord } from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

export function ValuationView({
  artifacts,
  onboarding,
}: {
  artifacts: ArtifactRecord[];
  onboarding?: OnboardingAnswers | null;
}) {
  const estimate = estimateValuation({ artifacts, onboarding });

  return (
    <div className="space-y-6">
      <FadeIn>
        <h2 className="font-display text-2xl text-ink">Valuation</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Illustrative pre-money range for early conversations — not a formal
          appraisal.
        </p>
      </FadeIn>

      <MotionCard>
        <article className="mx-auto max-w-2xl rounded-[var(--radius-lg)] border border-border bg-surface px-6 py-10 text-center shadow-sm transition-[border-color,box-shadow] duration-250 ease-out hover:border-accent/40 hover:shadow-[0_14px_32px_-16px_rgba(0,0,0,0.4)]">
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink-tertiary">
            Estimated valuation
          </p>
          <p className="mt-4 font-display text-4xl text-accent md:text-5xl">
            {estimate.lowLabel} – {estimate.highLabel}
          </p>
          <div className="mt-8 rounded-[var(--radius-md)] border border-accent/20 bg-accent-subtle/40 px-5 py-4 text-left">
            <p className="text-sm font-medium text-ink">Methodology</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              {estimate.methodology}
            </p>
          </div>
        </article>
      </MotionCard>
    </div>
  );
}
