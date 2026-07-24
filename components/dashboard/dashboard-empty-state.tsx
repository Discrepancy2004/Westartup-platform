"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDna } from "@/components/dna/dna-provider";
import { Button } from "@/components/ui/button";

export function DashboardEmptyState() {
  const router = useRouter();
  const { experience } = useDna();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/bootstrap?force=1", {
        method: "POST",
      });
      const raw = await res.text();
      let data: { error?: string; hint?: string; ok?: boolean } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        throw new Error(
          res.status === 404
            ? "Document API not found. Restart the dev server (npm run dev) and try again."
            : `Document generation failed (HTTP ${res.status}).`,
        );
      }
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
      <p className="font-display text-xl text-ink">
        {experience.icons.primary} {experience.emptyDashboardTitle}
      </p>
      <p className="mx-auto mt-3 max-w-lg text-sm text-ink-secondary">
        {experience.emptyDashboardBody}
      </p>
      <p className="mx-auto mt-3 max-w-md text-xs text-ink-tertiary">
        Includes story, market, competition, unit economics, projections, burn,
        traction, GTM, milestones, and raise docs.
      </p>
      {loading ? (
        <div className="mx-auto mt-8 max-w-md space-y-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-[var(--radius-md)] bg-border/50"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
          <p className="pt-2 text-xs text-ink-tertiary">
            Generating investor documents…
          </p>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={generate} disabled={loading}>
            {experience.generateCta}
          </Button>
          <Link href="/chat" className="text-sm text-accent hover:underline">
            Back to chat
          </Link>
        </div>
      )}
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
