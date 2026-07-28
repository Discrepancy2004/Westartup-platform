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
      if (profile?.razorpay_subscription_id && isRazorpayConfigured()) {
        const razorpay = getRazorpayClient();
        await razorpay.subscriptions.cancel(profile.razorpay_subscription_id);
      }

      await supabase
        .from("profiles")
        .update({
          subscription_status: "none",
          plan_id: "starter",
          razorpay_subscription_id: null,
          current_period_end: null,
        })
        .eq("id", user.id);

      return NextResponse.json({ ok: true, status: "none", planId: "starter" });
    }

    if (!body.planId) {
      return NextResponse.json({ error: "planId required" }, { status: 400 });
    }

    const nextStatus = body.planId === "starter" ? "none" : "active";

    await supabase
      .from("profiles")
      .update({
        plan_id: body.planId,
        subscription_status: nextStatus,
        current_period_end: null,
        razorpay_subscription_id:
          body.planId === "starter" ? null : profile?.razorpay_subscription_id ?? null,
      })
      .eq("id", user.id);

    return NextResponse.json({
      ok: true,
      planId: body.planId,
      action: body.action,
      status: nextStatus,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Billing action failed" },
      { status: 500 },
    );
  }
}
