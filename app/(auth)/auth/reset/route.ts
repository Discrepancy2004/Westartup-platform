import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/config";

/**
 * Public origin behind Vercel / reverse proxies.
 * `request.url` origin alone can be wrong in production and break redirects.
 */
function getPublicOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) {
    return `${forwardedProto.split(",")[0].trim()}://${forwardedHost.split(",")[0].trim()}`;
  }
  return request.nextUrl.origin;
}

/**
 * Password-recovery landing. Email redirectTo must be this path (no query
 * string) so Supabase allowlisting does not fall back to Site URL.
 *
 * Cookies are written onto the redirect response (required on Vercel). Using
 * only `cookies().set()` often drops the session before /reset-password loads.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = getPublicOrigin(request);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const oauthError =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/login?error=reset_session&detail=${encodeURIComponent(oauthError)}`,
    );
  }

  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) {
    return NextResponse.redirect(`${origin}/login?error=reset_session`);
  }

  const successRedirect = NextResponse.redirect(`${origin}/reset-password`);

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          successRedirect.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=reset_session&detail=${encodeURIComponent(error.message)}`,
      );
    }
    return successRedirect;
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=reset_session&detail=${encodeURIComponent(error.message)}`,
      );
    }
    return successRedirect;
  }

  return NextResponse.redirect(`${origin}/login?error=reset_session`);
}
