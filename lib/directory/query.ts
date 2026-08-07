import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";
import { DIRECTORY_PAGE_SIZE } from "@/lib/directory/labels";
import type { DirectoryFilters, StartupListing } from "@/lib/directory/types";
import type { StartupThemeId } from "@/lib/dna/types";
import type { FundingIntent, TeamSize, TractionStage } from "@/lib/types/onboarding";

const LISTING_COLUMNS =
  "id, founder_id, slug, name, tagline, description, business_model, stage, team_size, funding_intent, currently_raising, theme, secondary_themes, verified_at, published_at";

function asListing(row: Record<string, unknown>): StartupListing {
  return {
    id: String(row.id),
    founder_id: String(row.founder_id),
    slug: String(row.slug),
    name: String(row.name),
    tagline: String(row.tagline),
    description: String(row.description),
    business_model: String(row.business_model),
    stage: row.stage as TractionStage,
    team_size: row.team_size as TeamSize,
    funding_intent: (row.funding_intent as FundingIntent | null) ?? null,
    currently_raising: Boolean(row.currently_raising),
    theme: (row.theme as StartupThemeId) ?? "general",
    secondary_themes: Array.isArray(row.secondary_themes)
      ? (row.secondary_themes as StartupThemeId[])
      : [],
    verified_at: String(row.verified_at),
    published_at: String(row.published_at),
  };
}

function sanitizeSearch(raw: string) {
  return raw
    .replace(/[%*,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

type ListingPage = {
  listings: StartupListing[];
  total: number;
  limit: number;
};

async function fetchStartupListings(filterKey: string): Promise<ListingPage> {
  const filters = JSON.parse(filterKey) as {
    q: string;
    theme: string;
    stage: string;
    model: string;
    raising: boolean;
    limit: number;
  };
  const supabase = createAnonClient();
  const limit = Math.min(
    Math.max(filters.limit || DIRECTORY_PAGE_SIZE, 1),
    DIRECTORY_PAGE_SIZE * 4,
  );

  let query = supabase
    .from("startup_listings")
    .select(LISTING_COLUMNS, { count: "exact" })
    .order("published_at", { ascending: false })
    .limit(limit);

  const q = filters.q ? sanitizeSearch(filters.q) : "";
  if (q) {
    query = query.or(
      `name.ilike.%${q}%,tagline.ilike.%${q}%,description.ilike.%${q}%,business_model.ilike.%${q}%`,
    );
  }
  if (filters.theme) {
    query = query.or(
      `theme.eq.${filters.theme},secondary_themes.cs.{${filters.theme}}`,
    );
  }
  if (filters.stage) query = query.eq("stage", filters.stage);
  if (filters.model) query = query.eq("business_model", filters.model);
  if (filters.raising) query = query.eq("currently_raising", true);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    listings: (data ?? []).map((row) =>
      asListing(row as Record<string, unknown>),
    ),
    total: count ?? 0,
    limit,
  };
}

const cachedListStartupListings = unstable_cache(
  fetchStartupListings,
  ["startup-listings-v1"],
  { revalidate: 45 },
);

const cachedListingBySlug = unstable_cache(
  async (slug: string) => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("startup_listings")
      .select(LISTING_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? asListing(data as Record<string, unknown>) : null;
  },
  ["startup-listing-slug-v1"],
  { revalidate: 60 },
);

export const listStartupListings = cache(
  async (filters: DirectoryFilters = {}) => {
    const key = JSON.stringify({
      q: filters.q ?? "",
      theme: filters.theme ?? "",
      stage: filters.stage ?? "",
      model: filters.model ?? "",
      raising: Boolean(filters.raising),
      limit: filters.limit ?? DIRECTORY_PAGE_SIZE,
    });
    return cachedListStartupListings(key);
  },
);

export const getStartupListingBySlug = cache(async (slug: string) => {
  return cachedListingBySlug(slug);
});

export const getStartupListingForFounder = cache(async (founderId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("startup_listings")
    .select(LISTING_COLUMNS)
    .eq("founder_id", founderId)
    .maybeSingle();
  if (error) throw error;
  return data ? asListing(data as Record<string, unknown>) : null;
});
