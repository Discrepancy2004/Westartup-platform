"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

type ProfileRole = "founder" | "expert" | "admin" | string | null;

function homeFor(firstLogin: boolean, role: ProfileRole, next: string) {
  if (firstLogin) return "/onboarding";
  if (role === "admin") return "/admin";
  if (next && next !== "/chat") return next;
  return "/chat";
}

/** Ensure a profiles row exists after auth (covers missing DB trigger). */
export async function ensureProfile(next = "/chat") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, error: "Not signed in" };

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, first_login, role")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    const firstLogin = existing.first_login ?? true;
    return {
      ok: true as const,
      firstLogin,
      role: (existing.role as ProfileRole) ?? "founder",
      destination: homeFor(firstLogin, existing.role, next),
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

  return {
    ok: true as const,
    firstLogin: true,
    role: "founder" as const,
    destination: "/onboarding",
  };
}
