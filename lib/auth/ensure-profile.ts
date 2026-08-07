"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { homePathForAccess } from "@/lib/auth/access";
import { applyLinkedInProfile } from "@/lib/auth/apply-linkedin-profile";
import { loadAccessSnapshot } from "@/lib/auth/load-access";
import { BOOTSTRAP_ADMIN_EMAIL } from "@/lib/types/roles";

/** Ensure a profiles row exists after auth (covers missing DB trigger). */
export async function ensureProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, error: "Not signed in" };

  const isBootstrapAdmin =
    (user.email ?? "").toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

  // One round-trip: profile + application in parallel
  let access = await loadAccessSnapshot(user.id);

  if (access) {
    if (isBootstrapAdmin && access.role !== "admin") {
      try {
        const admin = createServiceClient();
        await admin
          .from("profiles")
          .update({ role: "admin", email: user.email })
          .eq("id", user.id);
        access = { ...access, role: "admin" };
      } catch {
        // Trigger / RLS may already handle this
      }
    }

    try {
      await applyLinkedInProfile(user);
    } catch {
      // Import is non-blocking
    }

    return {
      ok: true as const,
      firstLogin: access.firstLogin,
      home: homePathForAccess(access),
    };
  }

  const role = isBootstrapAdmin ? "admin" : "founder";

  try {
    const admin = createServiceClient();
    const { error } = await admin.from("profiles").upsert({
      id: user.id,
      email: user.email,
      first_login: true,
      role,
    });
    if (error) return { ok: false as const, error: error.message };
  } catch {
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      first_login: true,
      role,
    });
    if (error) return { ok: false as const, error: error.message };
  }

  try {
    await applyLinkedInProfile(user);
  } catch {
    // Import is non-blocking
  }

  return {
    ok: true as const,
    firstLogin: true,
    home: homePathForAccess({
      role,
      firstLogin: true,
      applicationStatus: null,
      founderContinuedAt: null,
    }),
  };
}
