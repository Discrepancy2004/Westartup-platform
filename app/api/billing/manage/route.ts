import { NextResponse } from "next/server";
import { z } from "zod";
import { getRazorpayClient } from "@/lib/razorpay/client";
import { createClient } from "@/lib/supabase/server";
import { isRazorpayConfigured } from "@/lib/utils";

const bodySchema = z.object({
  action: z.enum(["cancel", "downgrade", "upgrade"]),
  planId: z.enum(["starter", "growth", "scale"]).optional(),
});

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Razorpay is not configured." },
      { status: 503 },
    );
  }

  try {
    const body = bodySchema.parse(await request.json());
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("razorpay_subscription_id, plan_id")
      .eq("id", user.id)
      .single();

    if (body.action === "cancel") {
      if (profile?.razorpay_subscription_id) {
        const razorpay = getRazorpayClient();
        await razorpay.subscriptions.cancel(profile.razorpay_subscription_id);
      }

      await supabase
        .from("profiles")
        .update({
          subscription_status: "cancelled",
          plan_id: "starter",
        })
        .eq("id", user.id);

      return NextResponse.json({ ok: true, status: "cancelled" });
    }

    if (!body.planId) {
      return NextResponse.json({ error: "planId required" }, { status: 400 });
    }

    // Upgrade / downgrade: mark intent; checkout route completes payment.
    await supabase
      .from("profiles")
      .update({
        plan_id: body.planId,
        subscription_status: "pending",
      })
      .eq("id", user.id);

    return NextResponse.json({
      ok: true,
      next: "checkout",
      planId: body.planId,
      action: body.action,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Billing action failed" },
      { status: 500 },
    );
  }
}
