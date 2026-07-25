import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/chat";
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/login?error=auth_callback&detail=${encodeURIComponent(oauthError)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      try {
        const admin = createServiceClient();
        const { data: existing } = await admin
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (!existing) {
          await admin.from("profiles").insert({
            id: data.user.id,
            email: data.user.email,
            first_login: true,
          });
        }
      } catch {
        // Profile may already exist via trigger
      }

      // Password recovery must land on the reset form, even for first-login users.
      if (next.startsWith("/reset-password")) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_login")
        .eq("id", data.user.id)
        .maybeSingle();

      const destination =
        profile?.first_login === false ? next : "/onboarding";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
