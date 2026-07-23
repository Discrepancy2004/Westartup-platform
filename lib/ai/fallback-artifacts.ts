import type { OnboardingAnswers } from "@/lib/types/onboarding";

type ArtifactRow = {
  user_id: string;
  conversation_id: string;
  kind: string;
  title: string;
  summary: string;
  chart_data: Record<string, unknown>;
  updated_at: string;
  source: "bootstrap";
};

function row(
  base: Pick<ArtifactRow, "user_id" | "conversation_id">,
  kind: string,
  title: string,
  summary: string,
  chart_data: Record<string, unknown>,
  now: string,
): ArtifactRow {
  return {
    ...base,
    kind,
    title,
    summary,
    chart_data,
    updated_at: now,
    source: "bootstrap",
  };
}

/**
 * Deterministic artifacts from onboarding — used when AI providers fail.
 * Keeps the dashboard useful offline / on free-tier outages.
 */
export function buildFallbackArtifacts(options: {
  userId: string;
  conversationId: string;
  onboarding: OnboardingAnswers;
}): { rows: ArtifactRow[]; advisorOpening: string } {
  const { userId, conversationId, onboarding } = options;
  const now = new Date().toISOString();
  const base = { user_id: userId, conversation_id: conversationId };
  const idea = onboarding.idea.description.trim();
  const model = onboarding["business-specifics"].businessModelType;
  const price = onboarding["business-specifics"].pricePoint;
  const stage = onboarding.traction.stage;
  const team = onboarding.team.size;
  const about = onboarding["about-you"].roleAndBackground.trim();
  const deal = onboarding["deal-structure"];
  const shortIdea = idea.length > 140 ? `${idea.slice(0, 140)}…` : idea;

  const rows: ArtifactRow[] = [
    row(
      base,
      "idea-brief",
      "Idea brief",
      shortIdea,
      {
        oneLiner: shortIdea,
        problem: `Founder framing (needs evidence): ${shortIdea}`,
        solution: `${model} at ${price}`,
        audience: about || "Not specified — probe who pays and why now.",
        challenges: [
          `Traction is ${stage} — investors will discount narrative without proof.`,
          "Willingness-to-pay vs stated price point is unvalidated.",
          "Distribution path is unclear from onboarding alone.",
        ],
      },
      now,
    ),
    row(
      base,
      "financial-projections",
      "YoY projections (illustrative)",
      "Placeholder growth curve until the advisor has real inputs. Not a forecast.",
      {
        currency: "INR",
        years: [
          { label: "Y1", revenue: 12, costs: 18 },
          { label: "Y2", revenue: 36, costs: 40 },
          { label: "Y3", revenue: 90, costs: 75 },
          { label: "Y4", revenue: 180, costs: 130 },
          { label: "Y5", revenue: 320, costs: 210 },
        ],
        notes: "Illustrative INR lakhs-scale placeholders for charting.",
        capexNotes:
          "Minimal — cloud-first; ~₹2–4L one-time for tooling, licenses, and initial infra in Year 1.",
        opexNotes: `Year 1 OpEx tracks a ${team} team: infra, salaries/contractor spend, GTM, and legal buffer — refine with real payroll.`,
      },
      now,
    ),
    row(
      base,
      "revenue-model",
      "Revenue model",
      `${model} · ${price}`,
      {
        streams: [
          { name: model, sharePercent: 70 },
          { name: "Adjacent services", sharePercent: 20 },
          { name: "Other", sharePercent: 10 },
        ],
      },
      now,
    ),
    row(
      base,
      "market-sizing",
      "Market sizing (illustrative)",
      "Order-of-magnitude placeholders — replace with sourced TAM work.",
      {
        currency: "INR",
        tam: 4200,
        sam: 860,
        som: 45,
        unit: "₹ Cr",
        rationale:
          "Placeholder funnel. Challenge every layer with who buys, budget owner, and switching cost.",
      },
      now,
    ),
    row(
      base,
      "team-overview",
      "Team overview",
      `Team size: ${team}`,
      {
        sizeLabel: team,
        roles: [
          { title: "Founder", focus: about.slice(0, 80) || "Background TBD" },
        ],
        gaps:
          team === "solo"
            ? ["Execution depth", "Sales coverage", "Domain spare capacity"]
            : ["Role clarity", "Hiring plan for next 2 critical seats"],
      },
      now,
    ),
    row(
      base,
      "unit-economics",
      "Unit economics (illustrative)",
      "Placeholder CAC / LTV — pressure-test with real channel data.",
      {
        currency: "INR",
        cac: 2400,
        ltv: 9800,
        ltvCacRatio: 4.1,
        paybackMonths: 8,
        grossMarginPercent: 68,
        arpu: 899,
        notes: "Illustrative INR figures for early-stage discussion.",
      },
      now,
    ),
    row(
      base,
      "traction-kpis",
      "Traction snapshot (illustrative)",
      `Stage: ${stage} — replace with measured users and retention.`,
      {
        series: [
          { label: "M1", users: 40, revenue: 0.4 },
          { label: "M2", users: 75, revenue: 0.9 },
          { label: "M3", users: 120, revenue: 1.6 },
          { label: "M4", users: 180, revenue: 2.8 },
          { label: "M5", users: 260, revenue: 4.2 },
          { label: "M6", users: 340, revenue: 6.1 },
        ],
        retentionPercent: 42,
        growthMoMPercent: 28,
        notes: "Illustrative monthly series in INR lakhs where revenue shown.",
      },
      now,
    ),
    row(
      base,
      "competitive-landscape",
      "Competitive landscape",
      "Relative positioning placeholders — refine with named rivals.",
      {
        competitors: [
          { name: "Incumbent A", score: 78, note: "Brand + distribution" },
          { name: "Startup B", score: 62, note: "Product velocity" },
          { name: "You (projection)", score: 48, note: "Needs proof points" },
          { name: "Niche player", score: 35, note: "Narrow wedge" },
        ],
        axisLabel: "Relative strength",
        notes: "Scores are illustrative for conversation, not market research.",
      },
      now,
    ),
    row(
      base,
      "gtm-plan",
      "Go-to-market plan",
      "Channel mix and funnel placeholders for investor conversation.",
      {
        channels: [
          { name: "Outbound / partnerships", sharePercent: 35 },
          { name: "Content / organic", sharePercent: 30 },
          { name: "Paid acquisition", sharePercent: 25 },
          { name: "Referrals", sharePercent: 10 },
        ],
        funnel: [
          { stage: "Aware", value: 1000 },
          { stage: "Trial", value: 220 },
          { stage: "Paid", value: 55 },
          { stage: "Retained", value: 28 },
        ],
        notes: "Replace with real channel CAC and conversion.",
      },
      now,
    ),
    row(
      base,
      "burn-runway",
      "Burn & runway (illustrative)",
      "Placeholder burn path — map to actual monthly spend.",
      {
        currency: "INR",
        months: [
          { label: "M1", burn: 4.2 },
          { label: "M2", burn: 4.5 },
          { label: "M3", burn: 5.0 },
          { label: "M4", burn: 5.4 },
          { label: "M5", burn: 5.8 },
          { label: "M6", burn: 6.2 },
        ],
        runwayMonths: 11,
        monthlyBurn: 5.2,
        notes: "Burn in ₹ lakhs / month. Illustrative only.",
      },
      now,
    ),
    row(
      base,
      "milestones",
      "Milestones",
      "Near-term proof plan investors will ask about.",
      {
        items: [
          { label: "Problem interviews / validation", timing: "Done", status: "done" },
          { label: "MVP in market", timing: "Now", status: "next" },
          { label: "First paid cohort", timing: "Q+1", status: "later" },
          { label: "Repeatable acquisition channel", timing: "Q+2", status: "later" },
        ],
        notes: "Tighten dates with founder evidence.",
      },
      now,
    ),
  ];

  if (deal.currentlyRaising) {
    rows.push(
      row(
        base,
        "deal-structure",
        "Deal structure",
        `Raising${deal.amount ? ` · ${deal.amount}` : ""}${deal.stage ? ` · ${deal.stage}` : ""}`,
        {
          currentlyRaising: true,
          amountInr: undefined,
          stage: deal.stage,
          useOfFunds: [
            "Product",
            "Go-to-market",
            "Runway buffer — require a monthly burn plan",
          ],
        },
        now,
      ),
    );
  }

  const advisorOpening = [
    `I've loaded a fuller investor dashboard from your onboarding — treat the numbers as placeholders, not truth.`,
    `The biggest soft spot so far: you're at **${stage}** with a **${model}** at **${price},** but there's still thin evidence on who converts and why.`,
    `What is the single hardest piece of proof you can show an investor this week?`,
  ].join(" ");

  return { rows, advisorOpening };
}
