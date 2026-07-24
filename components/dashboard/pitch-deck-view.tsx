"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { StepStatusStyles } from "@/components/dashboard/investor-readiness";
import { FadeIn } from "@/components/dashboard/motion-primitives";
import {
  evaluateReadiness,
  pitchSlideStatus,
  type StepStatus,
} from "@/lib/dashboard/readiness";
import { estimateValuation } from "@/lib/dashboard/valuation";
import type { ArtifactRecord } from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";

function data(artifacts: ArtifactRecord[], kind: string) {
  const hit = artifacts.find((a) => a.kind === kind);
  return (hit?.chart_data ?? null) as Record<string, unknown> | null;
}

function bullets(items: (string | null | undefined)[]) {
  return items.filter((x): x is string => Boolean(x && String(x).trim()));
}

const STAGE_LABEL: Record<string, string> = {
  idea: "concept / idea",
  building: "prototype / building",
  testing: "MVP / testing",
  growing: "early growth",
  revenue: "revenue",
};

export function PitchDeckView({
  artifacts,
  onboarding,
}: {
  artifacts: ArtifactRecord[];
  onboarding?: OnboardingAnswers | null;
}) {
  const brief = data(artifacts, "idea-brief");
  const market = data(artifacts, "market-sizing");
  const revenue = data(artifacts, "revenue-model");
  const unit = data(artifacts, "unit-economics");
  const traction = data(artifacts, "traction-kpis");
  const teamArt = data(artifacts, "team-overview");
  const gtm = data(artifacts, "gtm-plan");
  const deal = data(artifacts, "deal-structure");
  const burn = data(artifacts, "burn-runway");
  const milestones = data(artifacts, "milestones");

  const about = onboarding?.["about-you"]?.roleAndBackground?.trim() ?? "";
  const idea = onboarding?.idea?.description?.trim() ?? "";
  const model = onboarding?.["business-specifics"]?.businessModelType ?? "";
  const price = onboarding?.["business-specifics"]?.pricePoint ?? "";
  const stage = onboarding?.traction?.stage ?? "idea";
  const teamSize = onboarding?.team?.size ?? "solo";
  const monthYear = new Date().toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const valuation = estimateValuation({ artifacts, onboarding });

  const oneLiner = String(brief?.oneLiner ?? (idea.slice(0, 120) || "—"));
  const problem = String(brief?.problem ?? "—");
  const solution = String(brief?.solution ?? "—");
  const audience = String(brief?.audience ?? "—");
  const challenges = Array.isArray(brief?.challenges)
    ? (brief!.challenges as string[])
    : [];
  const streams = Array.isArray(revenue?.streams)
    ? (revenue!.streams as { name: string; sharePercent?: number }[])
    : [];
  const differentiator = streams[0]?.name
    ? `${streams[0].name} wedge`
    : model || "focused execution";
  const roles = Array.isArray(teamArt?.roles)
    ? (teamArt!.roles as { title: string; focus?: string }[])
    : [];
  const gaps = Array.isArray(teamArt?.gaps) ? (teamArt!.gaps as string[]) : [];
  const channels = Array.isArray(gtm?.channels)
    ? (gtm!.channels as { name: string; sharePercent: number }[])
    : [];
  const funnel = Array.isArray(gtm?.funnel)
    ? (gtm!.funnel as { stage: string; value: number }[])
    : [];
  const milestoneItems = Array.isArray(milestones?.items)
    ? (milestones!.items as { label: string; timing: string; status: string }[])
    : [];
  const funds = Array.isArray(deal?.useOfFunds)
    ? (deal!.useOfFunds as string[])
    : [];
  const nextMilestone =
    milestoneItems.find((m) => m.status === "next") ?? milestoneItems[0];

  const readiness = useMemo(
    () => evaluateReadiness({ artifacts, onboarding }),
    [artifacts, onboarding],
  );

  const cards = [
    {
      n: 1,
      title: "Cover",
      lines: bullets([
        `Company / idea: ${oneLiner}`,
        `Tagline: ${oneLiner}`,
        `Founder: ${about.slice(0, 100) || "—"}`,
        `Model: ${model || "—"} · ${price}`,
        `Deck prepared: ${monthYear}`,
      ]),
    },
    {
      n: 2,
      title: "Problem",
      lines: bullets([
        problem,
        challenges[0],
        challenges[1],
        challenges[2] ??
          "Existing alternatives are expensive, complex, or not built for this segment.",
      ]),
    },
    {
      n: 3,
      title: "Solution",
      lines: bullets([
        solution,
        `Built for ${audience}`,
        `Unlike alternatives, we lean on ${differentiator}.`,
        "Adoption path should stay simple — low switching cost, fast time-to-value.",
      ]),
    },
    {
      n: 4,
      title: "Market Opportunity",
      lines: bullets([
        `TAM: ${market?.tam ?? "—"} ${String(market?.unit ?? "₹ Cr")} — total addressable`,
        `SAM: ${market?.sam ?? "—"} ${String(market?.unit ?? "₹ Cr")} — Years 1–3 focus`,
        `SOM: ${market?.som ?? "—"} ${String(market?.unit ?? "₹ Cr")} — near-term capturable`,
        typeof market?.rationale === "string"
          ? String(market.rationale)
          : "Market sizing is illustrative until sourced bottom-up.",
      ]),
    },
    {
      n: 5,
      title: "Product / How It Works",
      lines: bullets([
        `Step 1: Customer engages — ${audience !== "—" ? audience : "target user"} starts with a clear job-to-be-done.`,
        `Step 2: Platform delivers — ${solution.slice(0, 120)}${solution.length > 120 ? "…" : ""}`,
        `Step 3: Outcome — measurable value tied to ${model || "the core offering"} within days, not quarters.`,
        `Tech / defensibility: Built around ${differentiator}; deepen IP and proprietary workflows over time.`,
        `Current status: ${STAGE_LABEL[stage] ?? stage}${
          typeof traction?.growthMoMPercent === "number"
            ? ` · illustrative MoM growth ~${traction.growthMoMPercent}%`
            : ""
        }.`,
      ]),
    },
    {
      n: 6,
      title: "Business Model",
      lines: bullets([
        `Revenue model: ${model || "—"}`,
        `Pricing: ${price || "—"} — designed for the stated customer segment.`,
        typeof unit?.grossMarginPercent === "number"
          ? `Gross margin target: ~${unit.grossMarginPercent}% at scale (illustrative).`
          : "Gross margin target: ~60–80% at scale (assumption — confirm with actuals).",
        streams.length > 1
          ? `Secondary streams: ${streams
              .slice(1)
              .map((s) => s.name)
              .join(", ")}`
          : "Secondary streams: upsells / services — add when proven.",
      ]),
    },
    {
      n: 7,
      title: "Traction",
      lines: bullets([
        `Stage: ${STAGE_LABEL[stage] ?? stage}${
          typeof traction?.retentionPercent === "number"
            ? ` · retention snapshot ~${traction.retentionPercent}%`
            : ""
        }.`,
        nextMilestone
          ? `Roadmap focus: ${nextMilestone.label} (${nextMilestone.timing}).`
          : "Roadmap: core features scoped; first build / beta timing TBD.",
        about
          ? `Founder experience: ${about.slice(0, 140)}${about.length > 140 ? "…" : ""}`
          : "Founder experience: domain context from onboarding.",
        typeof traction?.growthMoMPercent === "number"
          ? `Signal: illustrative growth ~${traction.growthMoMPercent}% MoM — replace with measured users / revenue.`
          : "Social proof: add waitlist, pilots, LOIs, or survey evidence as it lands.",
      ]),
    },
    {
      n: 8,
      title: "Team",
      lines: bullets([
        `Founder: ${about.slice(0, 120) || "—"}`,
        roles[0]
          ? `${roles[0].title}${roles[0].focus ? ` — ${roles[0].focus}` : ""}`
          : `Team size: ${String(teamArt?.sizeLabel ?? teamSize)}`,
        roles[1]
          ? `${roles[1].title}${roles[1].focus ? ` — ${roles[1].focus}` : ""}`
          : null,
        gaps[0]
          ? `Hiring focus: ${gaps.slice(0, 2).join("; ")}`
          : `Team of ${teamSize}; hire critical seats as the raise / runway allows.`,
      ]),
    },
    {
      n: 9,
      title: "Go-to-Market",
      lines: bullets([
        channels[0]
          ? `Phase 1 (Months 1–6): Founder-led motion via ${channels[0].name} (~${channels[0].sharePercent}% mix).`
          : "Phase 1 (Months 1–6): Close design partners via founder-led outreach and warm networks.",
        channels[1]
          ? `Phase 2 (Months 7–18): Scale via ${channels
              .slice(1, 3)
              .map((c) => c.name)
              .join(", ")}.`
          : "Phase 2 (Months 7–18): Scale via content, partnerships, or inside sales.",
        "Phase 3 (Year 2+): Expand to adjacent segment / geography as product matures.",
        typeof unit?.cac === "number"
          ? `Metrics: CAC ~₹${Number(unit.cac).toLocaleString("en-IN")}; payback ~${unit.paybackMonths ?? "—"} months; LTV:CAC ~${unit.ltvCacRatio ?? "—"}×.`
          : "Metrics: set CAC / payback targets once channel experiments run.",
        funnel[0]
          ? `Funnel snapshot: ${funnel.map((f) => `${f.stage} ${f.value}`).join(" → ")}.`
          : "Key distribution lever: pick one primary channel and prove conversion before spreading spend.",
      ]),
    },
    {
      n: 10,
      title: "The Ask",
      lines: bullets([
        deal?.currentlyRaising
          ? `Raising: ${deal.amountInr ? `₹${Number(deal.amountInr).toLocaleString("en-IN")}` : onboarding?.["deal-structure"]?.amount ?? "amount TBD"}${deal.stage || onboarding?.["deal-structure"]?.stage ? ` · ${String(deal.stage ?? onboarding?.["deal-structure"]?.stage)}` : ""}`
          : onboarding?.["deal-structure"]?.intent === "looking"
            ? "Looking for investors — round size and instrument TBD."
            : "Not actively raising — sharpen the ask when ready.",
        funds.length
          ? `Use of funds: ${funds.join(" · ")}`
          : "Use of funds: ~40% product & tech, ~30% team, ~20% GTM, ~10% ops & runway.",
        typeof burn?.runwayMonths === "number"
          ? `Runway target: ~${burn.runwayMonths} months to the next proof milestone.`
          : "Runway: 18–24 months to a clear Series A / profitability gate.",
        `Valuation (illustrative): ${valuation.lowLabel} – ${valuation.highLabel} pre-money — see Valuation workspace for methodology.`,
        "Looking for: a lead with domain expertise and portfolio synergies, not just capital.",
      ]),
    },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <h2 className="font-display text-2xl text-ink">Pitch Deck</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Full investor narrative (slides 1–10) synthesized from your onboarding
          and dashboard documents.
        </p>
      </FadeIn>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card, i) => {
          const status = pitchSlideStatus(
            card.title,
            readiness,
            artifacts,
            onboarding,
          );
          return (
            <PitchStepCard
              key={card.title}
              n={card.n}
              title={card.title}
              lines={card.lines}
              status={status}
              delay={0.04 * i}
            />
          );
        })}
      </div>
    </div>
  );
}

function PitchStepCard({
  n,
  title,
  lines,
  status,
  delay,
}: {
  n: number;
  title: string;
  lines: string[];
  status: StepStatus;
  delay: number;
}) {
  const styles = StepStatusStyles(status);
  const done = status === "completed" || status === "validated";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: "easeOut" }}
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      className={cn(
        "rounded-[var(--radius-lg)] border bg-surface p-5 shadow-sm transition-[box-shadow,border-color] duration-250 ease-out",
        "hover:border-emerald-500/30 hover:shadow-[0_12px_28px_-12px_rgba(16,185,129,0.28)]",
        styles.card,
      )}
    >
      <div className="flex items-center gap-3">
        <motion.span
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "relative flex size-8 items-center justify-center rounded-full text-sm font-semibold",
            styles.number,
          )}
        >
          {done ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
              className="text-emerald-300"
            >
              ✓
            </motion.span>
          ) : (
            n
          )}
        </motion.span>
        <h3 className="font-display text-lg text-ink">{title}</h3>
        {styles.badge ? (
          <motion.span
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="ml-auto relative overflow-hidden rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300"
          >
            {styles.badge}
            <motion.span
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              animate={{ x: ["-120%", "180%"] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                repeatDelay: 2.4,
                ease: "easeOut",
              }}
            />
          </motion.span>
        ) : null}
        {status === "in_progress" ? (
          <span className="ml-auto text-[10px] uppercase tracking-wide text-sky-300/90">
            In progress
          </span>
        ) : null}
        {status === "not_started" ? (
          <span className="ml-auto text-[10px] uppercase tracking-wide text-ink-tertiary">
            Not started
          </span>
        ) : null}
      </div>
      <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-ink-secondary">
        {lines.map((line) => (
          <li key={line} className="flex gap-2">
            <span
              className={cn(
                "mt-2 size-1.5 shrink-0 rounded-full",
                done ? "bg-emerald-400" : "bg-accent",
              )}
            />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </motion.article>
  );
}
