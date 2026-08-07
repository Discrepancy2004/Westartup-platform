import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CachedProfile = {
  id: string;
  email: string | null;
  onboarding: unknown;
  startup_dna: unknown;
  plan_id: string | null;
  subscription_status: string | null;
  razorpay_subscription_id: string | null;
  current_period_end: string | null;
  linkedin_connected_at: string | null;
  linkedin_url: string | null;
  full_name: string | null;
  avatar_url: string | null;
  first_login: boolean | null;
  role: string | null;
  dna_welcome_seen_at: string | null;
};

const PROFILE_COLUMNS =
  "id, email, onboarding, startup_dna, plan_id, subscription_status, razorpay_subscription_id, current_period_end, linkedin_connected_at, linkedin_url, full_name, avatar_url, first_login, role, dna_welcome_seen_at";

export const getCachedProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();
  return (data as CachedProfile | null) ?? null;
});
