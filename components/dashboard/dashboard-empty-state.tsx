"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DashboardEmptyState() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/bootstrap?force=1", {
        method: "POST",
      });
      const data = (await res.json()) as {
        error?: string;
        hint?: string;
        ok?: boolean;
      };
      if (!res.ok) {
        throw new Error(
          [data.error, data.hint].filter(Boolean).join(" — ") ||
            "Could not generate documents",
        );
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-12 rounded-[var(--radius-lg)] border border-dashed border-border px-6 py-16 text-center">
      <p className="text-sm text-ink-secondary">
        No documents yet. Generate them from your onboarding answers — this works
        even if the AI provider is down (uses a local fallback).
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={generate} disabled={loading}>
          {loading ? "Generating…" : "Generate from onboarding"}
        </Button>
        <Link href="/chat" className="text-sm text-accent hover:underline">
          Back to chat
        </Link>
      </div>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
