"use client";

import { useMemo } from "react";
import { ArtifactCard } from "@/components/dashboard/artifact-card";
import { InvestorReadinessPanel } from "@/components/dashboard/investor-readiness";
import {
  DASHBOARD_SECTIONS,
  type ArtifactRecord,
} from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

export function ExpertFounderFullPack({
  artifacts,
  onboarding,
}: {
  artifacts: ArtifactRecord[];
  onboarding: OnboardingAnswers | null;
}) {
  const byKind = useMemo(
    () => new Map(artifacts.map((a) => [a.kind, a])),
    [artifacts],
  );

  if (artifacts.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">
        This founder has no artifacts yet.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <InvestorReadinessPanel
        artifacts={artifacts}
        onboarding={onboarding}
        centered={false}
      />
      {DASHBOARD_SECTIONS.map((section) => {
        const cards = section.kinds
          .map((kind) => byKind.get(kind))
          .filter((a): a is ArtifactRecord => Boolean(a));
        if (cards.length === 0) return null;
        return (
          <section key={section.id} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
              {section.id.replace(/-/g, " ")}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((a) => (
                <ArtifactCard key={a.id} artifact={a} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
