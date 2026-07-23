"use client";

import { AppHeader } from "@/components/app/app-header";
import { ArtifactCard } from "@/components/dashboard/artifact-card";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DnaWelcome, DnaWidgetStrip } from "@/components/dna/dna-ui";
import { useDna } from "@/components/dna/dna-provider";
import type { ArtifactRecord } from "@/lib/types/artifacts";

export function DashboardShell({
  artifacts,
}: {
  artifacts: ArtifactRecord[];
}) {
  const { experience } = useDna();

  return (
    <div className="min-h-[100svh]">
      <AppHeader active="dashboard" />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <DnaWelcome />
            <div>
              <h1 className="font-display text-3xl text-ink">
                {experience.icons.spark} {experience.dashboardTitle}
              </h1>
              <p className="mt-2 text-sm text-ink-secondary">
                {experience.dashboardSubtitle}
              </p>
            </div>
          </div>
        </div>

        <DnaWidgetStrip className="mt-8" />

        {artifacts.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {artifacts.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
