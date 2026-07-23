import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getLanguageModelResilient } from "@/lib/ai/provider";
import { PLANS, PLAN_ORDER } from "@/lib/razorpay/plans";
import { createClient } from "@/lib/supabase/server";
import { isAiConfigured } from "@/lib/utils";

export const maxDuration = 30;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(12),
});

export async function POST(request: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "AI is not configured." },
      { status: 503 },
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = bodySchema.parse(await request.json());
    const window = body.messages.slice(-12);
    const { model } = getLanguageModelResilient();

    const planBlurb = PLAN_ORDER.map((id) => {
      const p = PLANS[id];
      return `- ${p.name}: ${p.description}. Features: ${p.features.join(", ")}. ${p.isFree ? "Free." : "Paid (Razorpay)."}`;
    }).join("\n");

    const transcript = window
      .map((m) => `${m.role === "user" ? "Founder" : "Guide"}: ${m.content}`)
      .join("\n");

    const { text } = await generateText({
      model,
      prompt: `You are WeStartup’s billing companion. Answer plan and pricing questions helpfully and briefly (2–5 sentences).
Currency is INR. Payments use Razorpay. Do not invent discounts or legal claims.
If unsure, say to check the Billing page.

Plans:
${planBlurb}

Conversation:
${transcript}

Reply:`,
    });

    return NextResponse.json({ reply: text.trim().slice(0, 1200) });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "FAQ failed",
      },
      { status: 400 },
    );
  }
}
