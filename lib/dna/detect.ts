import { BUSINESS_MODEL_BOOSTS, THEME_KEYWORDS } from "@/lib/dna/keywords";
import type { StartupDna, StartupThemeId } from "@/lib/dna/types";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

function normalizeCorpus(answers: OnboardingAnswers): string {
  const parts = [
    answers["about-you"]?.roleAndBackground,
    answers.idea?.description,
    answers["business-specifics"]?.businessModelType,
    answers["business-specifics"]?.pricePoint,
    answers.traction?.stage,
    answers.team?.size,
    answers["deal-structure"]?.intent,
    answers["deal-structure"]?.stage,
    answers["deal-structure"]?.amount,
  ];
  return ` ${parts.filter(Boolean).join(" ").toLowerCase()} `;
}

function countKeywordHits(
  corpus: string,
  keywords: string[],
): { score: number; found: string[] } {
  const found: string[] = [];
  let score = 0;
  for (const raw of keywords) {
    const key = raw.toLowerCase();
    if (corpus.includes(key)) {
      found.push(raw.trim());
      // Multi-word phrases weigh slightly more
      score += key.includes(" ") ? 2 : 1;
    }
  }
  return { score, found };
}

/**
 * Lightweight keyword scoring over onboarding answers.
 * Highest score wins; runners-up become secondary themes.
 * Never expose this logic in the UI.
 */
export function detectStartupDna(answers: OnboardingAnswers): StartupDna {
  const corpus = normalizeCorpus(answers);
  const scores: Record<string, number> = {};
  const keywordsFound = new Set<string>();

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS) as [
    Exclude<StartupThemeId, "general">,
    string[],
  ][]) {
    const { score, found } = countKeywordHits(corpus, keywords);
    scores[theme] = score;
    found.forEach((k) => keywordsFound.add(k));
  }

  const model = answers["business-specifics"]?.businessModelType ?? "";
  const boosts = BUSINESS_MODEL_BOOSTS[model];
  if (boosts) {
    for (const [theme, boost] of Object.entries(boosts) as [
      Exclude<StartupThemeId, "general">,
      number,
    ][]) {
      scores[theme] = (scores[theme] ?? 0) + boost;
    }
  }

  const ranked = (
    Object.entries(scores) as [Exclude<StartupThemeId, "general">, number][]
  )
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1]);

  const primary: StartupThemeId = ranked[0]?.[0] ?? "general";
  const topScore = ranked[0]?.[1] ?? 0;
  const secondaryThemes = ranked
    .slice(1)
    .filter(([, s]) => s >= Math.max(2, topScore * 0.35))
    .slice(0, 3)
    .map(([id]) => id);

  const confidence =
    ranked.length === 0
      ? 0.35
      : Math.min(0.98, 0.45 + topScore * 0.08 + secondaryThemes.length * 0.03);

  return {
    theme: primary,
    secondaryThemes,
    confidence: Number(confidence.toFixed(2)),
    keywordsFound: [...keywordsFound].slice(0, 24),
    scores,
    detectedAt: new Date().toISOString(),
  };
}
