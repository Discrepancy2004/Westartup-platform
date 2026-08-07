import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/config";
import {
  homePathForAccess,
  isAdminPath,
  isExpertPath,
  isFounderProductPath,
  type AccessSnapshot,
} from "@/lib/auth/access";
import {
  clearAccessGate,
  readAccessGate,
  readAuthJwtClaims,
  writeAccessGate,
} from "@/lib/auth/access-cookie";
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

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("-auth-token"));
}

function redirectToLogin(request: NextRequest, nextPath?: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.search = "";
  if (nextPath) redirectUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(redirectUrl);
}

function applyAccessGates(
  request: NextRequest,
  response: NextResponse,
  access: AccessSnapshot,
) {
  const pathname = request.nextUrl.pathname;
  const home = homePathForAccess(access);
  const onApply = pathname.startsWith("/expert/apply");
  const onPending = pathname.startsWith("/expert/pending");
  const onRejected = pathname.startsWith("/expert/rejected");

  if (access.role === "admin") {
    if (!isAdminPath(pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin";
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  if (access.role === "expert") {
    if (!isExpertPath(pathname) || onPending || onRejected || onApply) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/expert/dna";
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  if (access.applicationStatus === "pending") {
    if (!onPending) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/expert/pending";
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  if (access.applicationStatus === "rejected" && !access.founderContinuedAt) {
    if (!onRejected) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/expert/rejected";
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  if (onApply) return response;

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

  return response;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) return supabaseResponse;

  const pathname = request.nextUrl.pathname;
  if (pathname === "/privacy") return supabaseResponse;

  const isResetPassword = pathname.startsWith("/reset-password");
  const isProtected =
    isFounderProductPath(pathname) ||
    isAdminPath(pathname) ||
    isExpertPath(pathname);
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/callback") ||
    pathname.startsWith("/auth/reset");

  if (!hasSupabaseAuthCookie(request)) {
    if (isProtected) return redirectToLogin(request, pathname);
    if (isResetPassword) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.search = "";
      redirectUrl.searchParams.set("error", "reset_session");
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  const claims = readAuthJwtClaims(request);
  const jwtFresh = Boolean(claims && claims.expMs - Date.now() > 90_000);

  if (jwtFresh && claims) {
    if (isResetPassword || isAuthRoute) return supabaseResponse;
    if (isProtected) {
      const cached = readAccessGate(request, claims.sub);
      if (cached) return applyAccessGates(request, supabaseResponse, cached);
    } else {
      return supabaseResponse;
    }
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

  if (!user) {
    clearAccessGate(supabaseResponse);
    if (isProtected) return redirectToLogin(request, pathname);
    if (isResetPassword) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.search = "";
      redirectUrl.searchParams.set("error", "reset_session");
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  if (isResetPassword || isAuthRoute) return supabaseResponse;

  if (!isProtected) return supabaseResponse;

  let access = readAccessGate(request, user.id);
  if (!access) {
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

    access = {
      role: asRole(profileRes.data?.role),
      firstLogin: profileRes.data?.first_login ?? true,
      applicationStatus: asAppStatus(applicationRes.data?.status),
      founderContinuedAt: applicationRes.data?.founder_continued_at ?? null,
    };
    writeAccessGate(supabaseResponse, user.id, access);
  }

  return applyAccessGates(request, supabaseResponse, access);
}
