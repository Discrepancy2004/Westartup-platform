import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getLanguageModelResilient } from "@/lib/ai/provider";
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
  selectedText: z.string().max(800).optional(),
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

    const transcript = window
      .map((m) => `${m.role === "user" ? "Founder" : "Guide"}: ${m.content}`)
      .join("\n");

    const { text } = await generateText({
      model,
      prompt: `You are a friendly startup companion explaining dashboard content to a founder.
Be concise (2–4 short sentences). Plain language. No markdown headings.
Do not invent financial facts. If something is illustrative, say so briefly.
Do not update documents or tools — explain only.

${body.selectedText ? `Originally selected text:\n${body.selectedText}\n` : ""}
Conversation (limited memory):
${transcript}

Reply as the guide:`,
    });

    return NextResponse.json({
      reply: text.trim().slice(0, 1200),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Explain failed",
      },
      { status: 400 },
    );
  }
}
