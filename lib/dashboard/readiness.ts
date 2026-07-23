import type { ArtifactRecord } from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

export type StepStatus = "not_started" | "in_progress" | "completed" | "validated";

export type ReadinessStepId =
  | "cover"
  | "problem"
  | "solution"
  | "market"
  | "business"
  | "financial"
  | "pitch_pack";

export type ReadinessStep = {
  id: ReadinessStepId;
  label: string;
  weight: number;
  status: StepStatus;
  attention: boolean;
  /** True when advisor chat has refined the related artifacts. */
  chatRefined: boolean;
};

export type AchievementId =
  | "problem_validated"
  | "revenue_model_built"
  | "tam_calculated"
  | "investor_ready";

export type Achievement = {
  id: AchievementId;
  label: string;
  unlocked: boolean;
};

const PLACEHOLDER_RE =
  /(^—$|\bplaceholder\b|\billustrative\b|\bpending\b|\btbd\b|\badd any\b|\breplace with\b|\bneeds evidence\b|\border-of-magnitude\b|\[your|\[[a-z])/i;

/** Draft credit for onboarding/bootstrap only — never awards badges. */
const DRAFT_WEIGHT = 0.12;
/** In-progress after chat has touched the section but content still incomplete. */
const CHAT_PROGRESS_WEIGHT = 0.4;
const COMPLETED_WEIGHT = 0.85;

function chart(artifacts: ArtifactRecord[], kind: string) {
  const hit = artifacts.find((a) => a.kind === kind);
  return (hit?.chart_data ?? null) as Record<string, unknown> | null;
}

function artifactOf(artifacts: ArtifactRecord[], kind: string) {
  return artifacts.find((a) => a.kind === kind) ?? null;
}

/** Section is chat-refined only when a related artifact was updated via chat. */
export function isChatRefined(
  artifacts: ArtifactRecord[],
  kinds: string[],
): boolean {
  return kinds.some((kind) => artifactOf(artifacts, kind)?.source === "chat");
}

/** True when text looks like real founder/AI content, not a template stub. */
export function isMeaningfulText(value: unknown, minLen = 24): boolean {
  if (typeof value !== "string") return false;
  const t = value.trim();
  if (t.length < minLen) return false;
  if (PLACEHOLDER_RE.test(t)) return false;
  return true;
}

function countMeaningful(values: unknown[], minLen = 24): number {
  return values.filter((v) => isMeaningfulText(v, minLen)).length;
}

function statusFromCounts(
  meaningful: number,
  required: number,
  validatedExtra = false,
): StepStatus {
  if (meaningful <= 0) return "not_started";
  if (meaningful < required) return "in_progress";
  if (validatedExtra) return "validated";
  return "completed";
}

/**
 * Bootstrap / onboarding drafts never reach completed or validated.
 * Only chat-refined sections can unlock full credit and badges.
 */
function gateByChat(raw: StepStatus, chatRefined: boolean): StepStatus {
  if (!chatRefined) {
    if (raw === "not_started") return "not_started";
    return "in_progress";
  }
  return raw;
}

function creditFor(status: StepStatus, chatRefined: boolean, weight: number) {
  if (status === "validated" && chatRefined) return weight;
  if (status === "completed" && chatRefined) return weight * COMPLETED_WEIGHT;
  if (status === "in_progress") {
    return weight * (chatRefined ? CHAT_PROGRESS_WEIGHT : DRAFT_WEIGHT);
  }
  return 0;
}

export function evaluateReadiness(options: {
  artifacts: ArtifactRecord[];
  onboarding?: OnboardingAnswers | null;
}): {
  percent: number;
  steps: ReadinessStep[];
  achievements: Achievement[];
  attention: { label: string; ok: boolean }[];
  targetHint: string;
} {
  const { artifacts, onboarding } = options;
  const brief = chart(artifacts, "idea-brief");
  const market = chart(artifacts, "market-sizing");
  const revenue = chart(artifacts, "revenue-model");
  const finance = chart(artifacts, "financial-projections");
  const unit = chart(artifacts, "unit-economics");
  const traction = chart(artifacts, "traction-kpis");
  const team = chart(artifacts, "team-overview");
  const gtm = chart(artifacts, "gtm-plan");
  const deal = chart(artifacts, "deal-structure");

  const about = onboarding?.["about-you"]?.roleAndBackground ?? "";
  const idea = onboarding?.idea?.description ?? "";
  const model = onboarding?.["business-specifics"]?.businessModelType ?? "";
  const price = onboarding?.["business-specifics"]?.pricePoint ?? "";

  const coverChat = isChatRefined(artifacts, ["idea-brief"]);
  const problemChat = isChatRefined(artifacts, ["idea-brief"]);
  const solutionChat = isChatRefined(artifacts, ["idea-brief"]);
  const marketChat = isChatRefined(artifacts, ["market-sizing"]);
  const businessChat = isChatRefined(artifacts, [
    "revenue-model",
    "unit-economics",
  ]);
  const financialChat = isChatRefined(artifacts, [
    "financial-projections",
    "unit-economics",
    "burn-runway",
  ]);
  const pitchChat = isChatRefined(artifacts, [
    "traction-kpis",
    "team-overview",
    "gtm-plan",
    "deal-structure",
    "milestones",
    "idea-brief",
  ]);

  const coverFields = [brief?.oneLiner ?? idea, about, model];
  const coverMeaningful = countMeaningful(coverFields, 12);
  const coverStatus = gateByChat(
    statusFromCounts(
      coverMeaningful,
      2,
      coverMeaningful >= 3 && isMeaningfulText(about, 40),
    ),
    coverChat,
  );

  const problemFields = [
    brief?.problem,
    ...(Array.isArray(brief?.challenges)
      ? (brief!.challenges as unknown[])
      : []),
  ];
  const problemMeaningful = countMeaningful(problemFields, 20);
  const problemStatus = gateByChat(
    statusFromCounts(
      problemMeaningful,
      2,
      problemMeaningful >= 3 &&
        !PLACEHOLDER_RE.test(String(brief?.problem ?? "")),
    ),
    problemChat,
  );

  const solutionFields = [brief?.solution, brief?.audience];
  const solutionMeaningful = countMeaningful(solutionFields, 20);
  const solutionStatus = gateByChat(
    statusFromCounts(
      solutionMeaningful,
      2,
      solutionMeaningful >= 2 && isMeaningfulText(brief?.solution, 40),
    ),
    solutionChat,
  );

  const marketOk =
    typeof market?.tam === "number" &&
    typeof market?.sam === "number" &&
    typeof market?.som === "number" &&
    market.tam > 0 &&
    market.sam > 0 &&
    market.som > 0;
  const marketRationale = isMeaningfulText(market?.rationale, 20);
  const marketRaw: StepStatus = !market
    ? "not_started"
    : !marketOk
      ? "in_progress"
      : marketRationale && !PLACEHOLDER_RE.test(String(market?.rationale ?? ""))
        ? "validated"
        : "completed";
  const marketStatus = gateByChat(marketRaw, marketChat);

  const streams = Array.isArray(revenue?.streams) ? revenue!.streams : [];
  const businessMeaningful =
    (isMeaningfulText(model, 3) ? 1 : 0) +
    (isMeaningfulText(price, 2) ? 1 : 0) +
    (streams.length > 0 ? 1 : 0) +
    (typeof unit?.ltvCacRatio === "number" ? 1 : 0);
  const businessStatus = gateByChat(
    statusFromCounts(
      businessMeaningful,
      3,
      businessMeaningful >= 4 && typeof unit?.cac === "number",
    ),
    businessChat,
  );

  const years = Array.isArray(finance?.years) ? finance!.years : [];
  const financeMeaningful =
    (years.length >= 3 ? 1 : 0) +
    (years.some((y: { revenue?: number }) => typeof y.revenue === "number")
      ? 1
      : 0) +
    (isMeaningfulText(finance?.capexNotes, 16) ||
    isMeaningfulText(finance?.opexNotes, 16)
      ? 1
      : 0) +
    (typeof unit?.paybackMonths === "number" ? 1 : 0);
  const financialStatus = gateByChat(
    statusFromCounts(
      financeMeaningful,
      3,
      financeMeaningful >= 4 &&
        !PLACEHOLDER_RE.test(String(finance?.notes ?? "")),
    ),
    financialChat,
  );

  const pitchPackBits =
    (traction ? 1 : 0) +
    (team ? 1 : 0) +
    (gtm ? 1 : 0) +
    (deal || onboarding?.["deal-structure"] ? 1 : 0) +
    (isMeaningfulText(brief?.solution, 20) ? 1 : 0);
  const pitchPackStatus = gateByChat(
    statusFromCounts(pitchPackBits, 3, pitchPackBits >= 4),
    pitchChat,
  );

  const steps: ReadinessStep[] = [
    {
      id: "cover",
      label: "Cover",
      weight: 5,
      status: coverStatus,
      chatRefined: coverChat,
      attention: coverStatus !== "completed" && coverStatus !== "validated",
    },
    {
      id: "problem",
      label: "Problem Definition",
      weight: 15,
      status: problemStatus,
      chatRefined: problemChat,
      attention: problemStatus !== "completed" && problemStatus !== "validated",
    },
    {
      id: "solution",
      label: "Solution",
      weight: 15,
      status: solutionStatus,
      chatRefined: solutionChat,
      attention:
        solutionStatus !== "completed" && solutionStatus !== "validated",
    },
    {
      id: "market",
      label: "Market Opportunity",
      weight: 20,
      status: marketStatus,
      chatRefined: marketChat,
      attention: marketStatus !== "completed" && marketStatus !== "validated",
    },
    {
      id: "business",
      label: "Business Model",
      weight: 15,
      status: businessStatus,
      chatRefined: businessChat,
      attention:
        businessStatus !== "completed" && businessStatus !== "validated",
    },
    {
      id: "financial",
      label: "Financial Forecast",
      weight: 20,
      status: financialStatus,
      chatRefined: financialChat,
      attention:
        financialStatus !== "completed" && financialStatus !== "validated",
    },
    {
      id: "pitch_pack",
      label: "Pitch Deck",
      weight: 10,
      status: pitchPackStatus,
      chatRefined: pitchChat,
      attention:
        pitchPackStatus !== "completed" && pitchPackStatus !== "validated",
    },
  ];

  const customerValidationOk =
    isChatRefined(artifacts, ["traction-kpis", "idea-brief"]) &&
    isMeaningfulText(brief?.audience, 16) &&
    (typeof traction?.retentionPercent === "number" ||
      isMeaningfulText(String(traction?.notes ?? ""), 20));

  const pricingOk =
    isMeaningfulText(price, 2) &&
    !PLACEHOLDER_RE.test(price) &&
    businessChat;

  let earned = 0;
  for (const step of steps) {
    earned += creditFor(step.status, step.chatRefined, step.weight);
  }
  const percent = Math.min(100, Math.round(earned));

  // Badges only after chat has refined the related section into completed+.
  const achievements: Achievement[] = [
    {
      id: "problem_validated",
      label: "Problem Validated",
      unlocked:
        problemChat &&
        (problemStatus === "validated" || problemStatus === "completed"),
    },
    {
      id: "revenue_model_built",
      label: "Revenue Model Built",
      unlocked:
        businessChat &&
        (businessStatus === "validated" || businessStatus === "completed"),
    },
    {
      id: "tam_calculated",
      label: "TAM Calculated",
      unlocked:
        marketChat &&
        (marketStatus === "validated" || marketStatus === "completed"),
    },
    {
      id: "investor_ready",
      label: "Investor Ready",
      unlocked: percent >= 100,
    },
  ];

  const attention = [
    {
      label: "Problem Definition",
      ok: !steps.find((s) => s.id === "problem")?.attention,
    },
    {
      label: "Solution",
      ok: !steps.find((s) => s.id === "solution")?.attention,
    },
    { label: "Customer Validation", ok: customerValidationOk },
    { label: "Pricing Strategy", ok: pricingOk },
    {
      label: "Financial Forecast",
      ok: !steps.find((s) => s.id === "financial")?.attention,
    },
  ];

  const anyChat = artifacts.some((a) => a.source === "chat");
  const targetHint = !anyChat
    ? "Chat with the advisor to refine your drafts — progress unlocks as documents update."
    : percent >= 80
      ? "You're in strong shape — keep refining validated sections."
      : "Complete the highlighted sections in chat to reach 80%.";

  return { percent, steps, achievements, attention, targetHint };
}

export function stepXp(weight: number): number {
  return Math.round(weight * 10);
}

function gateSlide(
  raw: StepStatus,
  artifacts: ArtifactRecord[],
  kinds: string[],
): StepStatus {
  return gateByChat(raw, isChatRefined(artifacts, kinds));
}

/** Map pitch-deck slide titles to readiness status for step cards. */
export function pitchSlideStatus(
  title: string,
  readiness: ReturnType<typeof evaluateReadiness>,
  artifacts: ArtifactRecord[],
  onboarding?: OnboardingAnswers | null,
): StepStatus {
  const byId = Object.fromEntries(
    readiness.steps.map((s) => [s.id, s.status]),
  ) as Record<ReadinessStepId, StepStatus>;

  switch (title) {
    case "Cover":
      return byId.cover;
    case "Problem":
      return byId.problem;
    case "Solution":
      return byId.solution;
    case "Market Opportunity":
      return byId.market;
    case "Business Model":
      return byId.business;
    case "Product / How It Works": {
      const brief = chart(artifacts, "idea-brief");
      const traction = chart(artifacts, "traction-kpis");
      const n =
        (isMeaningfulText(brief?.solution, 24) ? 1 : 0) +
        (isMeaningfulText(brief?.audience, 16) ? 1 : 0) +
        (traction ? 1 : 0);
      return gateSlide(
        statusFromCounts(n, 2, n >= 3),
        artifacts,
        ["idea-brief", "traction-kpis"],
      );
    }
    case "Traction": {
      const traction = chart(artifacts, "traction-kpis");
      const stage = onboarding?.traction?.stage;
      const n =
        (stage ? 1 : 0) +
        (typeof traction?.retentionPercent === "number" ? 1 : 0) +
        (typeof traction?.growthMoMPercent === "number" ? 1 : 0) +
        (Array.isArray(traction?.series) &&
        (traction!.series as unknown[]).length
          ? 1
          : 0);
      return gateSlide(
        statusFromCounts(n, 2, n >= 3),
        artifacts,
        ["traction-kpis"],
      );
    }
    case "Team": {
      const team = chart(artifacts, "team-overview");
      const about = onboarding?.["about-you"]?.roleAndBackground ?? "";
      const roles = Array.isArray(team?.roles) ? team!.roles : [];
      const n =
        (isMeaningfulText(about, 24) ? 1 : 0) +
        (roles.length ? 1 : 0) +
        (team ? 1 : 0);
      return gateSlide(
        statusFromCounts(n, 2, n >= 3 && isMeaningfulText(about, 40)),
        artifacts,
        ["team-overview"],
      );
    }
    case "Go-to-Market": {
      const gtm = chart(artifacts, "gtm-plan");
      const channels = Array.isArray(gtm?.channels) ? gtm!.channels : [];
      const n =
        (channels.length ? 1 : 0) +
        (Array.isArray(gtm?.funnel) && (gtm!.funnel as unknown[]).length
          ? 1
          : 0) +
        (isMeaningfulText(gtm?.notes, 16) ? 1 : 0);
      return gateSlide(statusFromCounts(n, 2, n >= 3), artifacts, ["gtm-plan"]);
    }
    case "The Ask": {
      const deal = chart(artifacts, "deal-structure");
      const intent = onboarding?.["deal-structure"]?.intent;
      const n =
        (deal || intent ? 1 : 0) +
        (Array.isArray(deal?.useOfFunds) &&
        (deal!.useOfFunds as unknown[]).length
          ? 1
          : 0) +
        (deal?.currentlyRaising || intent === "looking" ? 1 : 0);
      return gateSlide(
        statusFromCounts(n, 2, n >= 3),
        artifacts,
        ["deal-structure"],
      );
    }
    default:
      return "not_started";
  }
}

export const STORAGE_KEYS = {
  // v2: chat-gated scoring — invalidate old celebration seeds from bootstrap era
  celebratedMilestones: "westartup-readiness-milestones-v2",
  completedSteps: "westartup-readiness-completed-steps-v2",
  unlockedAchievements: "westartup-readiness-achievements-v2",
} as const;
