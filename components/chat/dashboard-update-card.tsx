"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DashboardUpdateProposal } from "@/lib/chat/dashboard-update";

type Props = {
  proposal: DashboardUpdateProposal;
  onApplied?: () => void;
};

export function DashboardUpdateCard({ proposal, onApplied }: Props) {
  const [status, setStatus] = useState<"idle" | "applying" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || status === "done") {
    return (
      <div className="mt-3 rounded-[var(--radius-md)] border border-accent/30 bg-accent-subtle px-3 py-2 text-xs text-ink">
        {status === "done"
          ? "Dashboard updated."
          : "Update skipped — dashboard left unchanged."}
      </div>
    );
  }

  async function apply() {
    setStatus("applying");
    setError(null);
    try {
      const res = await fetch("/api/artifacts/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposal),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not update dashboard");
      setStatus("done");
      onApplied?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
      setStatus("error");
    }
  }

  return (
    <div className="mt-3 rounded-[var(--radius-md)] border border-border bg-canvas px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-accent">
        Dashboard update ready
      </p>
      <p className="mt-1 text-sm text-ink">{proposal.reason}</p>
      <ul className="mt-2 space-y-1 text-xs text-ink-secondary">
        {proposal.artifacts.map((a) => (
          <li key={a.kind}>· {a.title || a.kind}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          className="text-xs"
          disabled={status === "applying"}
          onClick={() => void apply()}
        >
          {status === "applying" ? "Updating…" : "Update dashboard"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="text-xs"
          disabled={status === "applying"}
          onClick={() => setDismissed(true)}
        >
          Not now
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
