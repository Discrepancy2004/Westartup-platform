"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { AppHeader } from "@/components/app/app-header";
import { ArtifactCard } from "@/components/dashboard/artifact-card";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { FinancialModelView } from "@/components/dashboard/financial-model-view";
import { InvestorReadinessPanel } from "@/components/dashboard/investor-readiness";
import {
  AnimatedMetric,
  FadeIn,
  MotionCard,
} from "@/components/dashboard/motion-primitives";
import { PitchDeckView } from "@/components/dashboard/pitch-deck-view";
import { ProjectBoardView } from "@/components/dashboard/project-board-view";
import { ValuationView } from "@/components/dashboard/valuation-view";
import { useDna } from "@/components/dna/dna-provider";
import { DnaWelcome } from "@/components/dna/dna-ui";
import { resolveKpiValues } from "@/lib/dna/kpi";
import type { DashboardSectionId } from "@/lib/dna/types";
import {
  DASHBOARD_SECTIONS,
  type ArtifactKind,
  type ArtifactRecord,
} from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";

const VIEWS = [
  { id: "overview", label: "Overview" },
  { id: "board", label: "Project Board" },
  { id: "pitch", label: "Pitch Deck" },
  { id: "finance", label: "Financial Model" },
  { id: "valuation", label: "Valuation" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

function parseView(raw: string | null): ViewId {
  if (
    raw === "board" ||
    raw === "pitch" ||
    raw === "finance" ||
    raw === "valuation"
  ) {
    return raw;
  }
  return "overview";
}

export function DashboardShell({
  artifacts,
  onboarding = null,
}: {
  artifacts: ArtifactRecord[];
  onboarding?: OnboardingAnswers | null;
}) {
  const { experience } = useDna();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeView = parseView(searchParams.get("view"));

  const setView = useCallback(
    (view: ViewId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (view === "overview") params.delete("view");
      else params.set("view", view);
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const kpis = resolveKpiValues(artifacts);
  const byKind = useMemo(
    () => new Map(artifacts.map((a) => [a.kind, a])),
    [artifacts],
  );

  const sectionNav = DASHBOARD_SECTIONS.map((s) => ({
    id: s.id as DashboardSectionId,
    label: experience.sectionTitles[s.id as DashboardSectionId] ?? s.id,
  }));

  return (
    <div className="min-h-[100svh]">
      <AppHeader active="dashboard" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:py-8">
        {/* Mobile chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                activeView === v.id
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-surface text-ink-secondary hover:border-accent/50",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <aside className="hidden w-52 shrink-0 lg:block">
          <nav className="sticky top-6 space-y-1 rounded-[var(--radius-lg)] border border-border bg-surface/70 p-3">
            <p className="px-2 pb-2 text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
              Workspace
            </p>
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                className={cn(
                  "flex w-full rounded-[var(--radius-md)] px-3 py-2 text-left text-sm transition-[transform,colors,background-color] duration-200 ease-out hover:scale-[1.01] active:scale-[0.98]",
                  activeView === v.id
                    ? "bg-accent-subtle font-medium text-accent"
                    : "text-ink-secondary hover:bg-canvas hover:text-ink",
                )}
              >
                {v.label}
              </button>
            ))}

            {activeView === "overview" && artifacts.length > 0 ? (
              <div className="mt-4 border-t border-border pt-3">
                <p className="px-2 pb-2 text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
                  On this page
                </p>
                {sectionNav.map((s) => (
                  <a
                    key={s.id}
                    href={`#section-${s.id}`}
                    className="block rounded-[var(--radius-md)] px-3 py-1.5 text-xs text-ink-tertiary transition-colors hover:bg-canvas hover:text-ink"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            ) : null}

            {activeView === "board" && artifacts.length > 0 ? (
              <div className="mt-4 border-t border-border pt-3">
                <p className="px-2 pb-2 text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
                  Documents
                </p>
                {sectionNav.map((s) => (
                  <a
                    key={s.id}
                    href={`#board-section-${s.id}`}
                    className="block rounded-[var(--radius-md)] px-3 py-1.5 text-xs text-ink-tertiary transition-colors hover:bg-canvas hover:text-ink"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            ) : null}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {activeView === "overview" ? (
            <OverviewBody
              artifacts={artifacts}
              byKind={byKind}
              kpis={kpis}
              onboarding={onboarding}
            />
          ) : null}
          {activeView === "board" ? (
            <ProjectBoardView
              artifacts={artifacts}
              onboarding={onboarding}
            />
          ) : null}
          {activeView === "pitch" ? (
            <PitchDeckView artifacts={artifacts} onboarding={onboarding} />
          ) : null}
          {activeView === "finance" ? (
            <FinancialModelView artifacts={artifacts} onboarding={onboarding} />
          ) : null}
          {activeView === "valuation" ? (
            <ValuationView artifacts={artifacts} onboarding={onboarding} />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function OverviewBody({
  artifacts,
  byKind,
  kpis,
  onboarding,
}: {
  artifacts: ArtifactRecord[];
  byKind: Map<ArtifactKind, ArtifactRecord>;
  kpis: ReturnType<typeof resolveKpiValues>;
  onboarding?: OnboardingAnswers | null;
}) {
  const { experience } = useDna();

  return (
    <div className="text-center">
      <FadeIn className="mx-auto max-w-2xl space-y-3">
        <DnaWelcome className="text-center" />
        <div>
          <h1 className="font-display text-3xl text-ink text-balance">
            {experience.icons.spark} {experience.dashboardTitle}
          </h1>
          <p className="mt-2 text-sm text-ink-secondary text-pretty">
            {experience.dashboardSubtitle}
          </p>
        </div>
      </FadeIn>

      {artifacts.length > 0 ? (
        <InvestorReadinessPanel
          artifacts={artifacts}
          onboarding={onboarding}
          centered
        />
      ) : null}

      {artifacts.length === 0 ? (
        <DashboardEmptyState />
      ) : (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {experience.widgets.map((w, i) => (
              <MotionCard key={w.slot}>
                <FadeIn delay={0.06 + i * 0.05}>
                  <div
                    className="rounded-[var(--radius-md)] border border-border bg-surface/80 px-3 py-3 text-center shadow-sm transition-[border-color,box-shadow] duration-250 ease-out hover:border-accent/35 hover:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.35)]"
                    style={{
                      backgroundImage: `linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, transparent), transparent 72%)`,
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
                      {w.hint}
                    </p>
                    <p className="mt-1 text-sm font-medium text-ink">{w.title}</p>
                    <AnimatedMetric
                      value={kpis[w.slot]}
                      className="mt-2 block font-display text-2xl text-accent"
                    />
                  </div>
                </FadeIn>
              </MotionCard>
            ))}
          </div>

          <div className="mt-12 space-y-12">
            {DASHBOARD_SECTIONS.map((section, sectionIndex) => {
              const cards = section.kinds
                .map((kind) => byKind.get(kind))
                .filter((a): a is ArtifactRecord => Boolean(a));
              const sectionId = section.id as DashboardSectionId;
              const title =
                experience.sectionTitles[sectionId] ?? section.id;
              const heroKinds = new Set<ArtifactKind>(section.heroKinds ?? []);

              return (
                <FadeIn
                  key={section.id}
                  delay={0.08 + sectionIndex * 0.04}
                >
                  <section
                    id={`section-${section.id}`}
                    className="scroll-mt-8 space-y-4"
                  >
                    <div className="border-b border-border pb-3 text-center">
                      <h2 className="font-display text-2xl text-ink text-balance">
                        {title}
                      </h2>
                      <p className="mt-1 text-xs text-ink-tertiary">
                        {cards.length} document{cards.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    {!cards.length ? (
                      <div className="rounded-[var(--radius-md)] border border-dashed border-border px-4 py-8 text-center text-sm text-ink-tertiary">
                        Documents for this section are missing.{" "}
                        <Link href="/chat" className="text-accent underline">
                          Regenerate from chat
                        </Link>{" "}
                        or use Generate on the empty dashboard state.
                      </div>
                    ) : (
                      <div className="grid gap-5 lg:grid-cols-2">
                        {cards.map((artifact) => {
                          const fullWidth =
                            heroKinds.has(artifact.kind) || cards.length === 1;
                          return (
                            <ArtifactCard
                              key={artifact.id}
                              artifact={artifact}
                              centered
                              className={fullWidth ? "lg:col-span-2" : undefined}
                            />
                          );
                        })}
                      </div>
                    )}
                  </section>
                </FadeIn>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
