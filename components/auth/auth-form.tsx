"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ensureProfile } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/utils";

type Mode = "password" | "magic" | "forgot";
type Pending =
  | null
  | "logging-in"
  | "creating-account"
  | "sending-magic"
  | "sending-reset"
  | "google";

export function AuthForm({ variant }: { variant: "login" | "signup" }) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/chat";
  const callbackError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>(
    callbackError === "reset_session" ? "forgot" : "password",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    callbackError === "auth_callback"
      ? "Auth callback failed. Check Supabase redirect URLs include http://localhost:3000/callback"
      : callbackError === "reset_session"
        ? "That reset link expired or is invalid. Request a new one below."
        : null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [alreadySignedIn, setAlreadySignedIn] = useState(false);
  const [applyAsExpert, setApplyAsExpert] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured() || variant !== "login") return;
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!cancelled) setAlreadySignedIn(Boolean(user));
      } catch {
        if (!cancelled) setAlreadySignedIn(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [variant]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="w-full max-w-sm space-y-4 text-left">
        <h1 className="font-display text-2xl text-ink">
          {variant === "login" ? "Sign in" : "Create account"}
        </h1>
        <p className="text-sm leading-relaxed text-ink-secondary">
          Supabase is not configured yet. Add{" "}
          <code className="text-xs text-accent">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and either{" "}
          <code className="text-xs text-accent">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          or{" "}
          <code className="text-xs text-accent">
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          </code>{" "}
          in <code className="text-xs">.env.local</code>, then run{" "}
          <code className="text-xs">supabase/migrations/001_initial.sql</code>{" "}
          in the SQL editor. Enable Email and Google providers in Auth settings.
        </p>
        <Link href="/" className="text-sm text-accent hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  async function finishAuth(opts?: { expertIntent?: boolean }) {
    const profile = await ensureProfile();
    if (!profile.ok) {
      throw new Error(profile.error);
    }
    const expertIntent = opts?.expertIntent ?? applyAsExpert;
    const destination = expertIntent ? "/expert/apply" : profile.home;
    // Hard navigation avoids soft-nav hangs (spinner stuck on "Logging in…").
    window.location.assign(destination);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();

      if (mode === "forgot") {
        setPending("sending-reset");
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent("/reset-password")}`,
          },
        );
        if (resetError) throw resetError;
        setMessage(
          "If an account exists for that email, we sent a password reset link.",
        );
        setPending(null);
        return;
      }

      const postAuthNext =
        variant === "signup" && applyAsExpert ? "/expert/apply" : next;

      if (mode === "magic") {
        setPending("sending-magic");
        const { error: magicError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(postAuthNext)}`,
          },
        });
        if (magicError) throw magicError;
        setMessage("Check your email for the magic link.");
        setPending(null);
        return;
      }

      if (variant === "signup") {
        setPending("creating-account");
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(postAuthNext)}`,
          },
        });
        if (signUpError) throw signUpError;

        // Email confirmation disabled → session present → continue
        if (data.session) {
          setPending("logging-in");
          await finishAuth({ expertIntent: applyAsExpert });
          return;
        }

        // Confirmation required — try password sign-in in case confirm is off but session missing
        const { data: signedIn, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });

        if (!signInError && signedIn.session) {
          setPending("logging-in");
          await finishAuth({ expertIntent: applyAsExpert });
          return;
        }

        setMessage(
          "Account created. If email confirmation is enabled in Supabase, open the confirmation link, then sign in.",
        );
        setPending(null);
        return;
      }

      setPending("logging-in");
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      await finishAuth({ expertIntent: false });
      // Keep the logging-in screen until navigation completes.
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Something went wrong.";
      setError(friendlyAuthError(raw));
      setPending(null);
    }
  }

  async function signInWithGoogle() {
    setError(null);
    setPending("google");
    try {
      const supabase = createClient();
      const postAuthNext =
        variant === "signup" && applyAsExpert ? "/expert/apply" : next;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(postAuthNext)}`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (oauthError) throw oauthError;
      // Redirect leaves this page; keep pending UI visible until then.
    } catch (err) {
      setError(
        friendlyAuthError(
          err instanceof Error ? err.message : "Google sign-in failed.",
        ),
      );
      setPending(null);
    }
  }

  if (pending) {
    return <AuthPendingScreen pending={pending} />;
  }

  if (mode === "forgot" && variant === "login") {
    return (
      <div className="w-full max-w-sm space-y-6 text-left">
        <div className="space-y-1">
          <Link href="/" className="font-display text-lg text-ink">
            WeStartup
          </Link>
          <h1 className="font-display text-2xl text-ink">Forgot password</h1>
          <p className="text-sm text-ink-secondary">
            Enter your email and we’ll send a link to reset your password.
          </p>
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

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}

          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>

        <p className="text-center text-sm text-ink-secondary">
          <button
            type="button"
            onClick={() => {
              setMode("password");
              setError(null);
              setMessage(null);
            }}
            className="text-accent hover:underline"
          >
            Back to sign in
          </button>
        </p>
      </div>
    );
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

      {alreadySignedIn && variant === "login" ? (
        <div className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-sm text-ink-secondary">
          You’re already signed in.{" "}
          <Link href={next || "/chat"} className="font-medium text-accent hover:underline">
            Continue to app
          </Link>
        </div>
      ) : null}

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
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password">Password</Label>
              {variant === "login" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Forgot password?
                </button>
              ) : null}
            </div>
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

        {variant === "signup" ? (
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-secondary">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 rounded border-border accent-[var(--accent)]"
              checked={applyAsExpert}
              onChange={(e) => setApplyAsExpert(e.target.checked)}
            />
            <span>
              I&apos;d like to apply as an Industry Expert
              <span className="mt-0.5 block text-xs text-ink-tertiary">
                Requires admin approval. You&apos;ll submit details next.
              </span>
            </span>
          </label>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-success">{message}</p> : null}

        <Button type="submit" className="w-full">
          {mode === "magic"
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

function AuthPendingScreen({ pending }: { pending: Exclude<Pending, null> }) {
  const copy = {
    "logging-in": {
      title: "Logging in…",
      subtitle: "Setting up your workspace. This can take a few seconds.",
    },
    "creating-account": {
      title: "Creating your account…",
      subtitle: "Hang tight while we get things ready.",
    },
    "sending-magic": {
      title: "Sending magic link…",
      subtitle: "Check your inbox in a moment.",
    },
    "sending-reset": {
      title: "Sending reset link…",
      subtitle: "Check your inbox in a moment.",
    },
    google: {
      title: "Continuing with Google…",
      subtitle: "You’ll be redirected to finish signing in.",
    },
  }[pending];

  return (
    <div
      className="flex w-full max-w-sm flex-col items-center gap-5 py-8 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="font-display text-lg text-ink">WeStartup</p>
      <span
        className="inline-block size-9 animate-spin rounded-full border-2 border-border border-t-accent"
        aria-hidden
      />
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl text-ink">{copy.title}</h1>
        <p className="text-sm text-ink-secondary">{copy.subtitle}</p>
      </div>
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
    return "Invalid Supabase API key. In Project Settings -> API, copy the anon or publishable key into NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";
  }
  return message;
}
