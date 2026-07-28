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
    description: "Pressure-test ideas with the advisor and track the first investor-ready outputs.",
    priceInPaise: 0,
    currency: "INR",
    isFree: true,
    features: [
      "15 AI chats per day",
      "Advisor chat with PDF and image questions",
      "Core dashboard views",
      "RAG workspace locked",
    ],
    razorpayPlanId: null,
  },
  growth: {
    id: "growth",
    name: "Growth",
    description: "For founders who need deeper research loops and grounded answers from the knowledge base.",
    priceInPaise: 0,
    currency: "INR",
    isFree: false,
    features: [
      "150 AI chats per day",
      "Advisor chat with PDF and image questions",
      "RAG workspace unlocked",
      "Full dashboard workspace",
    ],
    razorpayPlanId: null,
  },
  scale: {
    id: "scale",
    name: "Scale",
    description: "For founders who want the RAG workspace plus direct human follow-up from the expert team.",
    priceInPaise: 0,
    currency: "INR",
    isFree: false,
    features: [
      "Unlimited AI chats",
      "RAG workspace unlocked",
      "Expert attention workspace",
      "Advisor chat with PDF and image questions",
    ],
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
  return {
    label: "Upgrade",
    suffix: "",
  };
}
