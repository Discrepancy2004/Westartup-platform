import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  homePathForAccess,
  isAdminPath,
  isExpertPath,
  isFounderProductPath,
  type AccessSnapshot,
} from "@/lib/auth/access";
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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/callback");

  const isResetPassword = pathname.startsWith("/reset-password");

  const isProtected =
    isFounderProductPath(pathname) ||
    isAdminPath(pathname) ||
    isExpertPath(pathname);

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (!user && isResetPassword) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "reset_session");
    return NextResponse.redirect(redirectUrl);
  }

  // Recovery session must stay on /reset-password to set a new password.
  // Also allow /login and /signup while authenticated so "Log in" always
  // reaches the auth form (users can switch accounts or re-auth).
  if (user && (isResetPassword || isAuthRoute)) {
    return supabaseResponse;
  }

  if (user && isProtected) {
    const [profileRes, applicationRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("role, first_login")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("expert_applications")
        .select("status, founder_continued_at")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    const profile = profileRes.data;
    const application = applicationRes.data;

    const access: AccessSnapshot = {
      role: asRole(profile?.role),
      firstLogin: profile?.first_login ?? true,
      applicationStatus: asAppStatus(application?.status),
      founderContinuedAt: application?.founder_continued_at ?? null,
    };

    const home = homePathForAccess(access);
    const onApply = pathname.startsWith("/expert/apply");
    const onPending = pathname.startsWith("/expert/pending");
    const onRejected = pathname.startsWith("/expert/rejected");

    // Admin shell (checked before application gates)
    if (access.role === "admin") {
      if (!isAdminPath(pathname)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/admin";
        return NextResponse.redirect(redirectUrl);
      }
      return supabaseResponse;
    }

    // Expert shell
    if (access.role === "expert") {
      if (!isExpertPath(pathname) || onPending || onRejected || onApply) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/expert";
        return NextResponse.redirect(redirectUrl);
      }
      return supabaseResponse;
    }

    // Pending expert application — pending screen only (apply allowed until submitted)
    if (access.applicationStatus === "pending") {
      if (!onPending) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/expert/pending";
        return NextResponse.redirect(redirectUrl);
      }
      return supabaseResponse;
    }

    // Rejected — force acknowledgment unless they already continued as founder
    if (
      access.applicationStatus === "rejected" &&
      !access.founderContinuedAt
    ) {
      if (!onRejected) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/expert/rejected";
        return NextResponse.redirect(redirectUrl);
      }
      return supabaseResponse;
    }

    // Founder — allow expert apply form before/without a pending app
    if (onApply) {
      return supabaseResponse;
    }

    // Founders must not enter admin/expert product shells
    if (isAdminPath(pathname) || (isExpertPath(pathname) && !onApply)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = home;
      return NextResponse.redirect(redirectUrl);
    }

    if (access.firstLogin && !pathname.startsWith("/onboarding")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/onboarding";
      return NextResponse.redirect(redirectUrl);
    }

    if (!access.firstLogin && pathname.startsWith("/onboarding")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/chat";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
