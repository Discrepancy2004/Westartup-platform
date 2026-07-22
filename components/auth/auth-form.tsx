"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ensureProfile } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/utils";

type Mode = "password" | "magic";

export function AuthForm({ variant }: { variant: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/chat";
  const callbackError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    callbackError === "auth_callback"
      ? "Auth callback failed. Check Supabase redirect URLs include http://localhost:3000/callback"
      : null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="w-full max-w-sm space-y-4 text-left">
        <h1 className="font-display text-2xl text-ink">
          {variant === "login" ? "Sign in" : "Create account"}
        </h1>
        <p className="text-sm leading-relaxed text-ink-secondary">
          Supabase is not configured yet. Add{" "}
          <code className="text-xs text-accent">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and{" "}
          <code className="text-xs text-accent">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          to <code className="text-xs">.env.local</code>, then run{" "}
          <code className="text-xs">supabase/migrations/001_initial.sql</code>{" "}
          in the SQL editor. Enable Email and Google providers in Auth settings.
        </p>
        <Link href="/" className="text-sm text-accent hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  async function finishAuth() {
    const profile = await ensureProfile();
    if (!profile.ok) {
      throw new Error(profile.error);
    }
    const destination = profile.firstLogin ? "/onboarding" : next || "/chat";
    router.replace(destination);
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "magic") {
        const { error: magicError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (magicError) throw magicError;
        setMessage("Check your email for the magic link.");
        return;
      }

      if (variant === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (signUpError) throw signUpError;

        // Email confirmation disabled → session present → continue
        if (data.session) {
          await finishAuth();
          return;
        }

        // Confirmation required — try password sign-in in case confirm is off but session missing
        const { data: signedIn, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });

        if (!signInError && signedIn.session) {
          await finishAuth();
          return;
        }

        setMessage(
          "Account created. If email confirmation is enabled in Supabase, open the confirmation link, then sign in.",
        );
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      await finishAuth();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Something went wrong.";
      setError(friendlyAuthError(raw));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(next)}`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(
        friendlyAuthError(
          err instanceof Error ? err.message : "Google sign-in failed.",
        ),
      );
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6 text-left">
      <div className="space-y-1">
        <Link href="/" className="font-display text-lg text-ink">
          WeStartup
        </Link>
        <h1 className="font-display text-2xl text-ink">
          {variant === "login" ? "Sign in" : "Create account"}
        </h1>
        <p className="text-sm text-ink-secondary">
          {variant === "login"
            ? "Continue pressure-testing your idea."
            : "Start with a challenging advisor, not a cheerleader."}
        </p>
      </div>

      <div className="flex gap-2 rounded-[var(--radius-md)] border border-border p-1">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`flex-1 rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "password" ? "bg-ink text-canvas" : "text-ink-secondary"
          }`}
        >
          Email & password
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={`flex-1 rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "magic" ? "bg-ink text-canvas" : "text-ink-secondary"
          }`}
        >
          Magic link
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {mode === "password" ? (
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={
                variant === "login" ? "current-password" : "new-password"
              }
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-success">{message}</p> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Please wait…"
            : mode === "magic"
              ? "Send magic link"
              : variant === "login"
                ? "Sign in"
                : "Create account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-canvas px-2 text-ink-tertiary">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={signInWithGoogle}
        disabled={loading}
      >
        Continue with Google
      </Button>

      <p className="text-center text-sm text-ink-secondary">
        {variant === "login" ? (
          <>
            No account?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Email not confirmed. In Supabase → Authentication → Providers → Email, disable “Confirm email” for local testing — or confirm via the email link.";
  }
  if (lower.includes("fetch") || lower.includes("network")) {
    return "Could not reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL and that your project is not paused.";
  }
  if (lower.includes("invalid api key") || lower.includes("jwt")) {
    return "Invalid Supabase API key. In Project Settings → API, copy the anon/publishable key into NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  }
  return message;
}
