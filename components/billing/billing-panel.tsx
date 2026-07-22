"use client";

import Script from "next/script";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PLAN_ORDER, PLANS, formatPlanPrice, type PlanId } from "@/lib/razorpay/plans";
import type { BillingProfile } from "@/lib/types/billing";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function BillingPanel({ profile }: { profile: BillingProfile }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(planId: PlanId) {
    setBusy(planId);
    setError(null);
    setMessage(null);
    try {
      const plan = PLANS[planId];

      // Free tier — no Razorpay charge
      if (plan.isFree || plan.priceInPaise === 0 && planId === "starter") {
        const res = await fetch("/api/billing/manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "downgrade", planId: "starter" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not switch to Starter");
        setMessage("Switched to Starter (free).");
        window.location.reload();
        return;
      }

      if (plan.priceInPaise <= 0) {
        throw new Error(
          "This paid plan still has placeholder pricing. Set priceInPaise in lib/razorpay/plans.ts before checkout.",
        );
      }

      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      if (data.mode === "subscription") {
        setMessage(
          `Subscription ${data.subscriptionId} created (pending). Complete payment in Razorpay dashboard/test checkout when plan IDs are live.`,
        );
        return;
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay.js failed to load.");
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "WeStartup",
        description: `${PLANS[planId].name} plan`,
        order_id: data.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId, ...response }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            setError(verifyData.error ?? "Verification failed");
            return;
          }
          setMessage("Payment successful. Plan updated.");
          window.location.reload();
        },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
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
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
          Current plan
        </p>
        <p className="mt-2 font-display text-2xl text-ink">
          {profile.planId
            ? PLANS[profile.planId].name
            : "Starter (default)"}
        </p>
        <p className="mt-1 text-sm text-ink-secondary">
          Status · {profile.status}
          {profile.currentPeriodEnd
            ? ` · renews ${new Date(profile.currentPeriodEnd).toLocaleDateString("en-IN")}`
            : ""}
        </p>
        {profile.status === "active" && profile.planId !== "starter" ? (
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            disabled={busy === "cancel"}
            onClick={cancelPlan}
          >
            Cancel subscription
          </Button>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const current =
            profile.planId === id ||
            ((!profile.planId || profile.planId === "starter") && id === "starter");
          const price = formatPlanPrice(plan);
          return (
            <div
              key={id}
              className="flex flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-5"
            >
              <p className="text-sm font-medium text-ink">{plan.name}</p>
              {plan.isFree ? (
                <p className="mt-1 text-xs text-ink-tertiary">Free tier</p>
              ) : null}
              <p className="mt-3 font-display text-3xl text-ink">
                {price.label}
                {price.suffix ? (
                  <span className="ml-1 text-sm font-sans text-ink-tertiary">
                    {price.suffix}
                  </span>
                ) : null}
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-ink-secondary">
                {plan.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <Button
                type="button"
                className="mt-6"
                variant={current ? "secondary" : "primary"}
                disabled={current || busy === id}
                onClick={() => startCheckout(id)}
              >
                {current
                  ? "Current plan"
                  : busy === id
                    ? "Opening…"
                    : plan.isFree
                      ? "Use free plan"
                      : "Choose plan"}
              </Button>
            </div>
          );
        })}
      </div>

      {message ? <p className="mt-6 text-sm text-success">{message}</p> : null}
      {error ? <p className="mt-6 text-sm text-danger">{error}</p> : null}
      <p className="mt-6 text-xs text-ink-tertiary">
        Supports UPI, cards, netbanking, and wallets via Razorpay Checkout.
        Prices are placeholders until plan amounts are finalized.
      </p>
    </>
  );
}
