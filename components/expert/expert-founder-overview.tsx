"use client";

import Link from "next/link";
import { ArtifactCard } from "@/components/dashboard/artifact-card";
import { InvestorReadinessPanel } from "@/components/dashboard/investor-readiness";
import type { ArtifactRecord } from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

const HIGHLIGHT_KINDS = [
  "idea-brief",
  "market-sizing",
  "traction-kpis",
  "deal-structure",
] as const;

export function ExpertFounderOverview({
  artifacts,
  onboarding,
  founderEmail,
  assignmentId,
}: {
  artifacts: ArtifactRecord[];
  onboarding: OnboardingAnswers | null;
  founderEmail: string | null;
  assignmentId: string;
}) {
  const idea =
    onboarding?.idea?.description?.trim() ||
    artifacts.find((a) => a.kind === "idea-brief")?.summary ||
    null;

  const highlights = HIGHLIGHT_KINDS.map((kind) =>
    artifacts.find((a) => a.kind === kind),
  ).filter((a): a is ArtifactRecord => Boolean(a));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
          Idea debrief
        </p>
        <h2 className="mt-1 font-display text-2xl text-ink">
          {founderEmail ?? "Founder"}
        </h2>
        {idea ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary">
            {idea}
          </p>
        ) : (
          <p className="mt-3 text-sm text-ink-tertiary">
            No idea summary yet. Open the full pack for available artifacts.
          </p>
        )}
      </div>

      {artifacts.length > 0 ? (
        <InvestorReadinessPanel
          artifacts={artifacts}
          onboarding={onboarding}
          centered={false}
        />
      ) : null}

      {highlights.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
            Key artifacts
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((a) => (
              <ArtifactCard key={a.id} artifact={a} />
            ))}
          </div>
        </section>
      ) : null}

      <Link
        href={`/expert/assignments/${assignmentId}?tab=full`}
        className="inline-flex text-sm font-medium text-accent hover:underline"
      >
        View full founder dashboard
      </Link>
    </div>
  );
}
