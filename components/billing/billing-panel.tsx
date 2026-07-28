"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PLAN_ORDER, PLANS, formatPlanPrice, type PlanId } from "@/lib/razorpay/plans";
import type { BillingProfile } from "@/lib/types/billing";

export function BillingPanel({ profile }: { profile: BillingProfile }) {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(profile.planId ?? "starter");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlanId = profile.planId ?? "starter";
  const selectedPlan = PLANS[selectedPlanId];

  const ctaLabel = useMemo(() => {
    if (selectedPlanId === currentPlanId) {
      return "Current plan";
    }

    if (selectedPlanId === "starter") {
      return "Switch to Starter";
    }

    return `Move to ${PLANS[selectedPlanId].name}`;
  }, [currentPlanId, selectedPlanId]);

  async function switchPlan(planId: PlanId) {
    setBusy(planId);
    setError(null);
    setMessage(null);

    try {
      const action =
        planId === "starter"
          ? "downgrade"
          : currentPlanId === "starter"
            ? "upgrade"
            : "upgrade";

      const res = await fetch("/api/billing/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Plan update failed");
      setMessage(`You are now on the ${PLANS[planId].name} tier.`);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Plan update failed");
    } finally {
      setBusy(null);
    }
  }

  async function cancelPlan() {
    setBusy("cancel");
    setError(null);
    try {
      const res = await fetch("/api/billing/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Cancel failed");
      setMessage("Subscription cancelled.");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
          Current tier
        </p>
        <p className="mt-2 font-display text-2xl text-ink">
          {PLANS[currentPlanId].name}
        </p>
        <p className="mt-1 text-sm text-ink-secondary">
          Status: {profile.status === "none" ? "Starter access" : profile.status}
        </p>
        {currentPlanId !== "starter" ? (
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            disabled={busy === "cancel"}
            onClick={cancelPlan}
          >
            Move back to Starter
          </Button>
        ) : null}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-3">
        <div className="grid gap-2 md:grid-cols-3">
          {PLAN_ORDER.map((planId) => (
            <button
              key={planId}
              type="button"
              onClick={() => setSelectedPlanId(planId)}
              className={
                selectedPlanId === planId
                  ? "rounded-[var(--radius-md)] border border-accent bg-accent-subtle px-4 py-3 text-left"
                  : "rounded-[var(--radius-md)] border border-border px-4 py-3 text-left text-ink-secondary transition-colors hover:border-accent/40 hover:text-ink"
              }
            >
              <p className="font-medium text-ink">{PLANS[planId].name}</p>
              <p className="mt-1 text-xs">{PLANS[planId].description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
              Billing tab
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink">
              {selectedPlan.name}
            </h2>
            <p className="mt-2 text-sm text-ink-secondary">
              {selectedPlan.description}
            </p>
          </div>
          <div className="shrink-0 rounded-[var(--radius-md)] border border-border px-4 py-3 text-right">
            <p className="text-xs text-ink-tertiary">Access</p>
            <p className="mt-1 font-display text-2xl text-ink">
              {formatPlanPrice(selectedPlan).label}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {selectedPlan.features.map((feature) => (
            <div
              key={feature}
              className="rounded-[var(--radius-md)] border border-border px-4 py-3 text-sm text-ink-secondary"
            >
              {feature}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button
            type="button"
            disabled={selectedPlanId === currentPlanId || busy === selectedPlanId}
            onClick={() => switchPlan(selectedPlanId)}
          >
            {busy === selectedPlanId ? "Updating…" : ctaLabel}
          </Button>
        </div>
      </div>

      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <p className="text-xs text-ink-tertiary">
        Tier buttons switch access instantly for now. Razorpay checkout can be
        added later without changing the tier structure.
      </p>
    </div>
  );
}
