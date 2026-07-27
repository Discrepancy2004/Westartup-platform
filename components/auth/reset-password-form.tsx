"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/utils";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setChecking(false);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    async function ensureSession() {
      // Implicit/hash recovery tokens (older email links)
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, ""),
        );
        if (hashParams.get("type") === "recovery" || hashParams.get("access_token")) {
          // getSession parses the hash via the client
          await supabase.auth.getSession();
          window.history.replaceState(null, "", "/reset-password");
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session) {
        setReady(true);
        setChecking(false);
        return;
      }

      setError(
        "This reset link is missing a valid session. Request a new password reset from the login page.",
      );
      setChecking(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
        setError(null);
        setChecking(false);
      }
    });

    void ensureSession();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (!isSupabaseConfigured()) {
    return (
      <div className="w-full max-w-sm space-y-4 text-left">
        <h1 className="font-display text-2xl text-ink">Reset password</h1>
        <p className="text-sm text-ink-secondary">
          Supabase is not configured yet.
        </p>
        <Link href="/login" className="text-sm text-accent hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      setMessage("Password updated. Redirecting to sign in…");
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update password. Request a new reset link.",
      );
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <div className="w-full max-w-sm space-y-3 py-8 text-center">
        <span
          className="inline-block size-9 animate-spin rounded-full border-2 border-border border-t-accent"
          aria-hidden
        />
        <p className="text-sm text-ink-secondary">Preparing reset session…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6 text-left">
      <div className="space-y-1">
        <Link href="/" className="font-display text-lg text-ink">
          WeStartup
        </Link>
        <h1 className="font-display text-2xl text-ink">Choose a new password</h1>
        <p className="text-sm text-ink-secondary">
          Enter a new password for your account.
        </p>
      </div>

      {!ready ? (
        <div className="space-y-4">
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-accent hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-ink-secondary">
        <Link href="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
