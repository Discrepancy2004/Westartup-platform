/**
 * Subscription plans — Starter is the free tier.
 * Amounts are in paise (INR × 100) for Razorpay.
 */

export type PlanId = "starter" | "growth" | "scale";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  description: string;
  /** Monthly price in paise; 0 = free */
  priceInPaise: number;
  currency: "INR";
  isFree: boolean;
  features: string[];
  /** Razorpay plan id when subscriptions are configured */
  razorpayPlanId: string | null;
};

export const PLANS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Free forever for core advisor + basic dashboard",
    priceInPaise: 0,
    currency: "INR",
    isFree: true,
    features: ["Core chat", "Basic artifacts", "Onboarding dashboard"],
    razorpayPlanId: null,
  },
  growth: {
    id: "growth",
    name: "Growth",
    description: "Placeholder — limits TBD",
    priceInPaise: 0,
    currency: "INR",
    isFree: false,
    features: ["Extended chat", "Full dashboard", "Artifact regeneration"],
    razorpayPlanId: null,
  },
  scale: {
    id: "scale",
    name: "Scale",
    description: "Placeholder — limits TBD",
    priceInPaise: 0,
    currency: "INR",
    isFree: false,
    features: ["Priority limits", "Export", "Team seat placeholder"],
    razorpayPlanId: null,
  },
};

export const PLAN_ORDER: PlanId[] = ["starter", "growth", "scale"];

export function formatPlanPrice(plan: PlanDefinition): {
  label: string;
  suffix: string;
} {
  if (plan.isFree) {
    return { label: "Free", suffix: "" };
  }
  // Paid tiers — placeholder until final INR pricing lands
  return {
    label: "₹—",
    suffix: "/mo",
  };
}
