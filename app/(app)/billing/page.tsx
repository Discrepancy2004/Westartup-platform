import { AppHeader } from "@/components/app/app-header";
import { BillingPanel } from "@/components/billing/billing-panel";
import { getCachedProfile } from "@/lib/auth/get-profile";
import { getCachedUser } from "@/lib/auth/get-user";
import { isSupabaseConfigured } from "@/lib/utils";
import type { BillingProfile } from "@/lib/types/billing";
import type { PlanId } from "@/lib/razorpay/plans";
import type { SubscriptionStatus } from "@/lib/types/billing";

export default async function BillingPage() {
  let profile: BillingProfile = {
    planId: "starter",
    status: "none",
    razorpaySubscriptionId: null,
    currentPeriodEnd: null,
  };

  if (isSupabaseConfigured()) {
    try {
      const user = await getCachedUser();
      if (user) {
        const data = await getCachedProfile(user.id);

        if (data) {
          profile = {
            planId: (data.plan_id as PlanId | null) ?? "starter",
            status: (data.subscription_status as SubscriptionStatus) ?? "none",
            razorpaySubscriptionId: data.razorpay_subscription_id,
            currentPeriodEnd: data.current_period_end,
          };
        }
      }
    } catch {
      // keep defaults
    }
  }

  return (
    <div className="min-h-[100svh]">
      <AppHeader active="billing" />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="max-w-xl space-y-2">
          <h1 className="font-display text-3xl text-ink">Billing</h1>
          <p className="text-sm text-ink-secondary">
            Move between Starter, Growth, and Scale while pricing is still internal.
          </p>
        </div>
        <div className="mt-8">
          <BillingPanel profile={profile} />
        </div>
      </main>
    </div>
  );
}
