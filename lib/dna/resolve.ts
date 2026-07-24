import { resolveCompanionPersona } from "@/lib/companion/resolve";
import { detectStartupDna } from "@/lib/dna/detect";
import { getThemeExperience } from "@/lib/dna/catalog";
import {
  startupDnaSchema,
  type StartupDna,
  type ThemeExperience,
} from "@/lib/dna/types";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

export type ResolvedDna = {
  dna: StartupDna;
  experience: ThemeExperience;
  secondaryLabels: string[];
};

export function parseStartupDna(raw: unknown): StartupDna | null {
  const parsed = startupDnaSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function resolveDna(options: {
  stored?: unknown;
  onboarding?: OnboardingAnswers | null;
}): ResolvedDna {
  let dna = parseStartupDna(options.stored);
  if (!dna && options.onboarding) {
    dna = detectStartupDna(options.onboarding);
  }
  if (!dna) {
    dna = {
      theme: "general",
      secondaryThemes: [],
      confidence: 0.3,
      keywordsFound: [],
      detectedAt: new Date().toISOString(),
    };
  }

  if (!dna.companionPersona) {
    dna = {
      ...dna,
      companionPersona: resolveCompanionPersona({
        onboarding: options.onboarding,
        dna,
      }),
    };
  } else if (options.onboarding?.["about-you"]?.companionGender) {
    dna = {
      ...dna,
      companionPersona: {
        ...dna.companionPersona,
        gender: options.onboarding["about-you"].companionGender,
      },
    };
  }

  const experience = getThemeExperience(dna.theme);
  const secondaryLabels = dna.secondaryThemes.map(
    (id) => getThemeExperience(id).label,
  );

  return { dna, experience, secondaryLabels };
}

/** Hidden AI context — never render in the UI. */
export function buildHiddenDnaContext(
  dna: StartupDna,
  onboarding?: OnboardingAnswers | null,
): string {
  const experience = getThemeExperience(dna.theme);
  const secondary = dna.secondaryThemes
    .map((id) => getThemeExperience(id).label)
    .join(", ");

  const model = onboarding?.["business-specifics"]?.businessModelType ?? "n/a";
  const stage = onboarding?.traction?.stage ?? "n/a";
  const background =
    onboarding?.["about-you"]?.roleAndBackground?.slice(0, 280) ?? "n/a";
  const raising = onboarding?.["deal-structure"]?.currentlyRaising
    ? "raising"
    : (onboarding?.["deal-structure"]?.intent ?? "not raising");
  const companion = dna.companionPersona
    ? `${dna.companionPersona.label} (${dna.companionPersona.gender})`
    : "n/a";

  return `
## Startup DNA (internal — never mention detection, keywords, or scoring to the founder)
- Primary theme: ${experience.label}
- Secondary themes: ${secondary || "none"}
- Companion persona: ${companion}
- Confidence: ${Math.round(dna.confidence * 100)}%
- Business model: ${model}
- Stage: ${stage}
- Funding posture: ${raising}
- Founder background (excerpt): ${background}

${experience.aiFocus}

Speak and prioritize like an expert in this vertical. Do not say "we detected" or name the scoring system. Personalize examples and challenges to this domain.
`.trim();
}
