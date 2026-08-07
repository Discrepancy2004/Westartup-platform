import type { FundingIntent, TeamSize, TractionStage } from "@/lib/types/onboarding";
import type { StartupThemeId } from "@/lib/dna/types";
import { BUSINESS_MODELS } from "@/lib/types/onboarding";

export const THEME_LABELS: Record<StartupThemeId, string> = {
  health: "Health",
  fintech: "Fintech",
  education: "Education",
  fashion: "Fashion",
  food: "Food",
  ai: "AI",
  travel: "Travel",
  saas: "SaaS",
  marketplace: "Marketplace",
  general: "General",
};

export const STAGE_LABELS: Record<TractionStage, string> = {
  idea: "Idea",
  building: "Building",
  testing: "Testing",
  growing: "Growing",
  revenue: "Revenue",
};

export const TEAM_LABELS: Record<TeamSize, string> = {
  solo: "Solo founder",
  "2-3": "2–3 people",
  "4+": "4+ people",
};

export const FUNDING_LABELS: Record<FundingIntent, string> = {
  bootstrapping: "Bootstrapping",
  looking: "Looking for investors",
  raising: "Raising",
  "too-early": "Too early to raise",
};

export const DIRECTORY_PAGE_SIZE = 24;

export const DIRECTORY_MODELS = [...BUSINESS_MODELS];
