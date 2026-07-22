import { NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay/verify";
import { createServiceClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody) as {
      event: string;
      payload?: {
        payment?: { entity?: Record<string, unknown> };
        subscription?: { entity?: Record<string, unknown> };
      };
    };

    const supabase = createServiceClient();
    const payment = event.payload?.payment?.entity;
    const subscription = event.payload?.subscription?.entity;

    const notes =
      (payment?.notes as Record<string, string> | undefined) ??
      (subscription?.notes as Record<string, string> | undefined) ??
      {};
    const userId = notes.userId;
    const planId = notes.planId;

    if (event.event === "payment.captured" && userId) {
      await supabase.from("transactions").insert({
        user_id: userId,
        razorpay_payment_id: String(payment?.id ?? ""),
        razorpay_order_id: String(payment?.order_id ?? ""),
        plan_id: planId ?? null,
        amount_paise: Number(payment?.amount ?? 0),
        status: "paid",
        raw: event,
      });

      if (planId) {
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        await supabase
          .from("profiles")
          .update({
            plan_id: planId,
            subscription_status: "active",
            current_period_end: periodEnd.toISOString(),
          })
          .eq("id", userId);
      }
    }

    if (
      (event.event === "subscription.activated" ||
        event.event === "subscription.charged") &&
      userId
    ) {
      await supabase
        .from("profiles")
        .update({
          ...(planId ? { plan_id: planId } : {}),
          subscription_status: "active",
          razorpay_subscription_id: String(subscription?.id ?? ""),
        })
        .eq("id", userId);
    }

    if (
      (event.event === "subscription.cancelled" ||
        event.event === "subscription.completed") &&
      userId
    ) {
      await supabase
        .from("profiles")
        .update({
          subscription_status: "cancelled",
          plan_id: "starter",
        })
        .eq("id", userId);
    }

    if (event.event === "payment.failed" && userId) {
      await supabase.from("transactions").insert({
        user_id: userId,
        razorpay_payment_id: String(payment?.id ?? ""),
        plan_id: planId ?? null,
        status: "failed",
        raw: event,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook error" },
      { status: 500 },
    );
  }
}
