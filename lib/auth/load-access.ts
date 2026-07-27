import { createClient } from "@/lib/supabase/server";
import type { AccessSnapshot } from "@/lib/auth/access";
import type { ExpertApplicationStatus, PlatformRole } from "@/lib/types/roles";
import type { SupabaseClient } from "@supabase/supabase-js";

function asRole(value: string | null | undefined): PlatformRole {
  if (value === "admin" || value === "expert" || value === "founder") {
    return value;
  }
  return "founder";
}

function asAppStatus(
  value: string | null | undefined,
): ExpertApplicationStatus | null {
  if (value === "pending" || value === "approved" || value === "rejected") {
    return value;
  }
  return null;
}

/** Load role + expert application gate state (parallel queries). */
export async function loadAccessSnapshot(
  userId: string,
  client?: SupabaseClient,
): Promise<AccessSnapshot | null> {
  const supabase = client ?? (await createClient());

  const [profileRes, applicationRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, first_login")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("expert_applications")
      .select("status, founder_continued_at")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  if (!profile) return null;

  const application = applicationRes.data;

  return {
    role: asRole(profile.role),
    firstLogin: profile.first_login ?? true,
    applicationStatus: asAppStatus(application?.status),
    founderContinuedAt: application?.founder_continued_at ?? null,
  };
}
