import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { homePathForAccess } from "@/lib/auth/access";
import { applyLinkedInProfile } from "@/lib/auth/apply-linkedin-profile";
import { isSafeAuthReturnPath } from "@/lib/auth/safe-next";
import { BOOTSTRAP_ADMIN_EMAIL } from "@/lib/types/roles";
import type { ExpertApplicationStatus, PlatformRole } from "@/lib/types/roles";

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

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/chat";
  const oauthError =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/login?error=auth_callback&detail=${encodeURIComponent(oauthError)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const email = data.user.email ?? null;
      const isBootstrapAdmin =
        (email ?? "").toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

      try {
        const admin = createServiceClient();
        const { data: existing } = await admin
          .from("profiles")
          .select("id, role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (!existing) {
          await admin.from("profiles").insert({
            id: data.user.id,
            email,
            first_login: true,
            role: isBootstrapAdmin ? "admin" : "founder",
          });
        } else if (isBootstrapAdmin && existing.role !== "admin") {
          await admin
            .from("profiles")
            .update({ role: "admin", email })
            .eq("id", data.user.id);
        }
      } catch {
        // Profile may already exist via trigger
      }

      try {
        await applyLinkedInProfile(data.user);
      } catch {
        // Import is non-blocking
      }

      // Password recovery must land on the reset form, even for first-login users.
      if (next.startsWith("/reset-password")) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Expert signup intent — collect details before founder onboarding
      if (next.startsWith("/expert/apply")) {
        return NextResponse.redirect(`${origin}/expert/apply`);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, first_login")
        .eq("id", data.user.id)
        .maybeSingle();

      const { data: application } = await supabase
        .from("expert_applications")
        .select("status, founder_continued_at")
        .eq("user_id", data.user.id)
        .maybeSingle();

      const role = asRole(profile?.role);
      const firstLogin = profile?.first_login ?? true;
      if (
        (!firstLogin || role === "expert" || role === "admin") &&
        isSafeAuthReturnPath(next)
      ) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const destination = homePathForAccess({
        role,
        firstLogin,
        applicationStatus: asAppStatus(application?.status),
        founderContinuedAt: application?.founder_continued_at ?? null,
      });

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
