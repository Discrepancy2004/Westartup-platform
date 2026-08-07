import type { User } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/admin";

export function hasLinkedInIdentity(user: User) {
  const identities = user.identities ?? [];
  if (
    identities.some(
      (identity) =>
        identity.provider === "linkedin_oidc" || identity.provider === "linkedin",
    )
  ) {
    return true;
  }

  const providers = user.app_metadata?.providers;
  return (
    Array.isArray(providers) &&
    providers.some(
      (provider) => provider === "linkedin_oidc" || provider === "linkedin",
    )
  );
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function extractLinkedInFields(user: User) {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const identity = (user.identities ?? []).find(
    (entry) => entry.provider === "linkedin_oidc" || entry.provider === "linkedin",
  );
  const data = (identity?.identity_data ?? {}) as Record<string, unknown>;
  const vanity = pickString(data.vanityName, meta.vanityName);

  return {
    fullName: pickString(meta.full_name, meta.name, data.full_name, data.name),
    avatarUrl: pickString(
      meta.avatar_url,
      meta.picture,
      data.avatar_url,
      data.picture,
    ),
    email: pickString(user.email, meta.email, data.email),
    linkedinUrl: pickString(
      meta.linkedin_url,
      meta.profile,
      meta.profile_url,
      data.linkedin_url,
      data.profile,
      data.profileUrl,
      data.publicProfileUrl,
      vanity ? `https://www.linkedin.com/in/${vanity}` : null,
    ),
  };
}

/** Fill empty profile fields from LinkedIn OIDC. Never overwrites non-empty values. */
export async function applyLinkedInProfile(user: User) {
  if (!hasLinkedInIdentity(user)) return;

  const extracted = extractLinkedInFields(user);
  const admin = createServiceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, avatar_url, email, linkedin_url, linkedin_connected_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return;

  const patch: Record<string, string> = {};
  if (!profile.full_name && extracted.fullName) {
    patch.full_name = extracted.fullName;
  }
  if (!profile.avatar_url && extracted.avatarUrl) {
    patch.avatar_url = extracted.avatarUrl;
  }
  if (!profile.email && extracted.email) {
    patch.email = extracted.email;
  }
  if (!profile.linkedin_url && extracted.linkedinUrl) {
    patch.linkedin_url = extracted.linkedinUrl;
  }
  if (!profile.linkedin_connected_at) {
    patch.linkedin_connected_at = new Date().toISOString();
  }

  if (Object.keys(patch).length === 0) return;

  const { error } = await admin
    .from("profiles")
    .update(patch)
    .eq("id", user.id);
  if (error) throw error;
}
