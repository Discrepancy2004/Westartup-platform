import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  const isProtected =
    pathname.startsWith("/chat") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/onboarding");

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute && pathname !== "/callback") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_login")
      .eq("id", user.id)
      .maybeSingle();

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      profile?.first_login === false ? "/chat" : "/onboarding";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_login")
      .eq("id", user.id)
      .maybeSingle();

    const firstLogin = profile?.first_login ?? true;

    if (firstLogin && !pathname.startsWith("/onboarding")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/onboarding";
      return NextResponse.redirect(redirectUrl);
    }

    if (!firstLogin && pathname.startsWith("/onboarding")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/chat";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
