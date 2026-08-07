import { createServiceClient } from "@/lib/supabase/admin";
import type { StartupDna } from "@/lib/dna/types";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import { deriveListingName, deriveTagline, slugifyListing } from "@/lib/directory/derive";

export async function publishStartupListing(options: {
  founderId: string;
  onboarding: OnboardingAnswers;
  dna?: Pick<StartupDna, "theme" | "secondaryThemes"> | null;
  verifiedAt?: string;
}) {
  const idea = options.onboarding.idea.description.trim();
  if (!idea) return;

  const name = deriveListingName(idea);
  const verifiedAt = options.verifiedAt ?? new Date().toISOString();
  const row = {
    founder_id: options.founderId,
    slug: slugifyListing(name, options.founderId),
    name,
    tagline: deriveTagline(idea),
    description: idea,
    business_model: options.onboarding["business-specifics"].businessModelType,
    stage: options.onboarding.traction.stage,
    team_size: options.onboarding.team.size,
    funding_intent: options.onboarding["deal-structure"].intent ?? null,
    currently_raising: options.onboarding["deal-structure"].currentlyRaising,
    theme: options.dna?.theme ?? "general",
    secondary_themes: options.dna?.secondaryThemes ?? [],
    verified_at: verifiedAt,
    published_at: verifiedAt,
  };

  const admin = createServiceClient();
  const { data: existing } = await admin
    .from("startup_listings")
    .select("id")
    .eq("founder_id", options.founderId)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("startup_listings")
      .update({
        description: row.description,
        business_model: row.business_model,
        stage: row.stage,
        team_size: row.team_size,
        funding_intent: row.funding_intent,
        currently_raising: row.currently_raising,
        theme: row.theme,
        secondary_themes: row.secondary_themes,
        verified_at: row.verified_at,
      })
      .eq("founder_id", options.founderId);
    if (error) throw error;
    return;
  }

  const { error } = await admin.from("startup_listings").insert(row);
  if (error) throw error;
}
