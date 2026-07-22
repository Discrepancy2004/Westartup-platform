import type { PlanId } from "@/lib/razorpay/plans";

export type SubscriptionStatus =
  | "none"
  | "active"
  | "past_due"
  | "cancelled"
  | "pending";

export type BillingProfile = {
  planId: PlanId | null;
  status: SubscriptionStatus;
  razorpaySubscriptionId: string | null;
  currentPeriodEnd: string | null;
};
