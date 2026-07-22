"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

/** Ensure a profiles row exists after auth (covers missing DB trigger). */
export async function ensureProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, error: "Not signed in" };

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, first_login")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return {
      ok: true as const,
      firstLogin: existing.first_login ?? true,
    };
  }

  // Prefer service role so insert works even if RLS blocks client insert
  try {
    const admin = createServiceClient();
    const { error } = await admin.from("profiles").upsert({
      id: user.id,
      email: user.email,
      first_login: true,
    });
    if (error) return { ok: false as const, error: error.message };
  } catch {
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      first_login: true,
    });
    if (error) return { ok: false as const, error: error.message };
  }

  return { ok: true as const, firstLogin: true };
}
