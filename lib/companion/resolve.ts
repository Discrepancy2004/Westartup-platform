import {
  COMPANION_KITS,
  COMPANION_PERSONA_IDS,
  specialistKit,
  type CompanionGender,
  type CompanionKit,
  type CompanionPersonaId,
  type CompanionPersonaRecord,
} from "@/lib/companion/personas";
import type { StartupDna } from "@/lib/dna/types";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

function corpusFrom(options: {
  onboarding?: OnboardingAnswers | null;
  dna?: StartupDna | null;
}): string {
  const a = options.onboarding;
  const parts = [
    a?.["about-you"]?.roleAndBackground,
    a?.idea?.description,
    a?.["business-specifics"]?.businessModelType,
    a?.["business-specifics"]?.pricePoint,
    ...(options.dna?.keywordsFound ?? []),
  ];
  return ` ${parts.filter(Boolean).join(" ").toLowerCase()} `;
}

function scoreKit(corpus: string, kit: CompanionKit, theme?: string): number {
  let score = 0;
  for (const raw of kit.keywords) {
    const key = raw.toLowerCase();
    if (corpus.includes(key)) {
      score += key.includes(" ") ? 2 : 1;
    }
  }
  if (theme && kit.themeBoost?.includes(theme as never)) {
    score += 2;
  }
  return score;
}

/** Pull a short field label from idea text when no kit wins. */
export function extractFieldLabel(
  onboarding?: OnboardingAnswers | null,
): string | null {
  const idea = onboarding?.idea?.description?.trim() ?? "";
  if (idea.length < 12) return null;

  // Prefer a noun-ish phrase after "for/about/in"
  const m = idea.match(
    /\b(?:for|about|in|building|platform for)\s+([a-z][a-z0-9 &\-]{2,40})/i,
  );
  if (m?.[1]) {
    const label = m[1]
      .replace(/\b(app|platform|startup|business|company)\b/gi, "")
      .trim();
    if (label.length >= 3) {
      return label
        .split(/\s+/)
        .slice(0, 3)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  }

  const words = idea
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 2);
  if (!words.length) return null;
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function resolveCompanionPersona(options: {
  onboarding?: OnboardingAnswers | null;
  dna?: StartupDna | null;
  genderOverride?: CompanionGender | null;
}): CompanionPersonaRecord {
  const stored = options.dna?.companionPersona;
  const gender: CompanionGender =
    options.genderOverride ??
    stored?.gender ??
    options.onboarding?.["about-you"]?.companionGender ??
    "boy";

  const corpus = corpusFrom(options);
  const theme = options.dna?.theme;

  let bestId: CompanionPersonaId = "founder";
  let bestScore = 0;

  for (const kit of Object.values(COMPANION_KITS)) {
    const s = scoreKit(corpus, kit, theme);
    if (s > bestScore) {
      bestScore = s;
      bestId = kit.id;
    }
  }

  // Strong kit match
  if (bestScore >= 2) {
    const kit = COMPANION_KITS[bestId as Exclude<CompanionPersonaId, "specialist">];
    return {
      gender,
      id: kit.id,
      label: kit.label,
      source: "kit",
    };
  }

  // Domain-specific idea but no kit → learned specialist
  const learnedLabel =
    stored?.source === "learned" && stored.label
      ? stored.label
      : extractFieldLabel(options.onboarding);

  if (learnedLabel && corpus.trim().length > 20) {
    return {
      gender,
      id: "specialist",
      label: learnedLabel,
      source: "learned",
      learnedAt: stored?.learnedAt ?? new Date().toISOString(),
    };
  }

  const knownStored = COMPANION_PERSONA_IDS.includes(
    (stored?.id ?? "") as CompanionPersonaId,
  )
    ? (stored!.id as CompanionPersonaId)
    : null;

  // Soft default from stored kit id
  if (stored?.id && stored.label && knownStored && knownStored !== "specialist") {
    return {
      gender,
      id: knownStored,
      label: stored.label,
      source: stored.source ?? "kit",
      learnedAt: stored.learnedAt,
    };
  }

  if (stored?.id && stored.label) {
    return {
      gender,
      id: "specialist",
      label: stored.label,
      source: stored.source ?? "learned",
      learnedAt: stored.learnedAt,
    };
  }

  const founder = COMPANION_KITS.founder;
  return {
    gender,
    id: founder.id,
    label: founder.label,
    source: "kit",
  };
}

export function getCompanionKit(
  persona: CompanionPersonaRecord,
): CompanionKit {
  if (persona.id === "specialist") {
    return specialistKit(persona.label);
  }
  return COMPANION_KITS[persona.id] ?? COMPANION_KITS.founder;
}
