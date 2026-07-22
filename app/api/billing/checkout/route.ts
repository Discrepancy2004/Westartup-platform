import { NextResponse } from "next/server";
import { z } from "zod";
import { getRazorpayClient } from "@/lib/razorpay/client";
import { PLANS, type PlanId } from "@/lib/razorpay/plans";
import { createClient } from "@/lib/supabase/server";
import { isRazorpayConfigured } from "@/lib/utils";

const bodySchema = z.object({
  planId: z.enum(["starter", "growth", "scale"]),
});

/**
 * Creates a Razorpay order (one-time) for plan upgrade scaffold.
 * Subscriptions: when razorpayPlanId is set on the plan, prefer subscriptions.create.
 */
export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Razorpay is not configured." },
      { status: 503 },
    );
  }

  try {
    const json = await request.json();
    const { planId } = bodySchema.parse(json);
    const plan = PLANS[planId as PlanId];

    if (plan.priceInPaise <= 0) {
      return NextResponse.json(
        {
          error:
            "Plan price is a placeholder (₹—). Set priceInPaise in lib/razorpay/plans.ts before charging.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const razorpay = getRazorpayClient();

    if (plan.razorpayPlanId) {
      const subscription = await razorpay.subscriptions.create({
        plan_id: plan.razorpayPlanId,
        total_count: 12,
        customer_notify: 1,
        notes: {
          userId: user.id,
          planId: plan.id,
        },
      });

      await supabase.from("transactions").insert({
        user_id: user.id,
        razorpay_subscription_id: subscription.id,
        plan_id: plan.id,
        amount_paise: plan.priceInPaise,
        status: "pending",
        raw: subscription,
      });

      await supabase
        .from("profiles")
        .update({
          subscription_status: "pending",
          plan_id: plan.id,
          razorpay_subscription_id: subscription.id,
        })
        .eq("id", user.id);

      return NextResponse.json({
        mode: "subscription",
        subscriptionId: subscription.id,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        planId: plan.id,
      });
    }

    const order = await razorpay.orders.create({
      amount: plan.priceInPaise,
      currency: "INR",
      receipt: `ws_${plan.id}_${Date.now()}`,
      notes: {
        userId: user.id,
        planId: plan.id,
      },
    });

    await supabase.from("transactions").insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      plan_id: plan.id,
      amount_paise: plan.priceInPaise,
      status: "created",
      raw: order,
    });

    return NextResponse.json({
      mode: "order",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      planId: plan.id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
