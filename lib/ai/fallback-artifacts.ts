import type { OnboardingAnswers } from "@/lib/types/onboarding";

type ArtifactRow = {
  user_id: string;
  conversation_id: string;
  kind: string;
  title: string;
  summary: string;
  chart_data: Record<string, unknown>;
  updated_at: string;
};

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
  const idea = onboarding.idea.description.trim();
  const model = onboarding["business-specifics"].businessModelType;
  const price = onboarding["business-specifics"].pricePoint;
  const stage = onboarding.traction.stage;
  const team = onboarding.team.size;
  const about = onboarding["about-you"].roleAndBackground.trim();
  const deal = onboarding["deal-structure"];
  const shortIdea = idea.length > 140 ? `${idea.slice(0, 140)}…` : idea;

  const rows: ArtifactRow[] = [
    {
      user_id: userId,
      conversation_id: conversationId,
      kind: "idea-brief",
      title: "Idea brief",
      summary: shortIdea,
      chart_data: {
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
      updated_at: now,
    },
    {
      user_id: userId,
      conversation_id: conversationId,
      kind: "financial-projections",
      title: "YoY projections (illustrative)",
      summary:
        "Placeholder growth curve until the advisor has real inputs. Not a forecast.",
      chart_data: {
        currency: "INR",
        years: [
          { label: "Y1", revenue: 12, costs: 18 },
          { label: "Y2", revenue: 36, costs: 40 },
          { label: "Y3", revenue: 90, costs: 75 },
          { label: "Y4", revenue: 180, costs: 130 },
          { label: "Y5", revenue: 320, costs: 210 },
        ],
        notes: "Illustrative INR lakhs-scale placeholders for charting.",
      },
      updated_at: now,
    },
    {
      user_id: userId,
      conversation_id: conversationId,
      kind: "revenue-model",
      title: "Revenue model",
      summary: `${model} · ${price}`,
      chart_data: {
        streams: [
          { name: model, sharePercent: 70 },
          { name: "Adjacent services", sharePercent: 20 },
          { name: "Other", sharePercent: 10 },
        ],
      },
      updated_at: now,
    },
    {
      user_id: userId,
      conversation_id: conversationId,
      kind: "market-sizing",
      title: "Market sizing (illustrative)",
      summary: "Order-of-magnitude placeholders — replace with sourced TAM work.",
      chart_data: {
        currency: "INR",
        tam: 4200,
        sam: 860,
        som: 45,
        unit: "₹ Cr",
        rationale:
          "Placeholder funnel. Challenge every layer with who buys, budget owner, and switching cost.",
      },
      updated_at: now,
    },
    {
      user_id: userId,
      conversation_id: conversationId,
      kind: "team-overview",
      title: "Team overview",
      summary: `Team size: ${team}`,
      chart_data: {
        sizeLabel: team,
        roles: [
          { title: "Founder", focus: about.slice(0, 80) || "Background TBD" },
        ],
        gaps:
          team === "solo"
            ? ["Execution depth", "Sales coverage", "Domain spare capacity"]
            : ["Role clarity", "Hiring plan for next 2 critical seats"],
      },
      updated_at: now,
    },
  ];

  if (deal.currentlyRaising) {
    rows.push({
      user_id: userId,
      conversation_id: conversationId,
      kind: "deal-structure",
      title: "Deal structure",
      summary: `Raising${deal.amount ? ` · ${deal.amount}` : ""}${deal.stage ? ` · ${deal.stage}` : ""}`,
      chart_data: {
        currentlyRaising: true,
        amountInr: undefined,
        stage: deal.stage,
        useOfFunds: [
          "Product",
          "Go-to-market",
          "Runway buffer — require a monthly burn plan",
        ],
      },
      updated_at: now,
    });
  }

  const advisorOpening = [
    `I've loaded your onboarding into the dashboard as a first pass — treat the numbers as placeholders, not truth.`,
    `The biggest soft spot so far: you're at **${stage}** with a **${model}** at **${price},** but there's still thin evidence on who converts and why.`,
    `What is the single hardest piece of proof you can show an investor this week?`,
  ].join(" ");

  return { rows, advisorOpening };
}
