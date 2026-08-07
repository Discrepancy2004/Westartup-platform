import type { FundingIntent, TeamSize, TractionStage } from "@/lib/types/onboarding";
import type { StartupThemeId } from "@/lib/dna/types";

export type StartupListing = {
  id: string;
  founder_id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  business_model: string;
  stage: TractionStage;
  team_size: TeamSize;
  funding_intent: FundingIntent | null;
  currently_raising: boolean;
  theme: StartupThemeId;
  secondary_themes: StartupThemeId[];
  verified_at: string;
  published_at: string;
};

export type DirectoryFilters = {
  q?: string;
  theme?: string;
  stage?: string;
  model?: string;
  raising?: boolean;
  limit?: number;
};
