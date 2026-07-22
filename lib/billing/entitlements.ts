/**
 * Server-side plan entitlement checks.
 * Premium features (extended artifact regeneration, exports) gated here.
 */

import type { PlanId } from "@/lib/razorpay/plans";
import type { SubscriptionStatus } from "@/lib/types/billing";

const PLAN_RANK: Record<PlanId, number> = {
  starter: 0,
  growth: 1,
  scale: 2,
};

export function hasActiveSubscription(status: SubscriptionStatus | null | undefined) {
  return status === "active";
}

export function planAtLeast(
  current: PlanId | null | undefined,
  required: PlanId,
): boolean {
  if (!current) return required === "starter";
  return PLAN_RANK[current] >= PLAN_RANK[required];
}

/** Placeholder: growth+ required for unlimited artifact regeneration. */
export function canRegenerateArtifacts(
  planId: PlanId | null | undefined,
  status: SubscriptionStatus | null | undefined,
): boolean {
  if (!hasActiveSubscription(status) && planId !== "starter") return false;
  return planAtLeast(planId ?? "starter", "growth") || planId === "starter";
}
