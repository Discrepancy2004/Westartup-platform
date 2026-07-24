import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveCompanionPersona } from "@/lib/companion/resolve";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import type { StartupDna } from "@/lib/dna/types";

const bodySchema = z.object({
  gender: z.enum(["boy", "girl"]),
});

/** Persist companion gender preference onto startup_dna. */
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
      .select("onboarding, startup_dna")
      .eq("id", user.id)
      .maybeSingle();

    const dna = (profile?.startup_dna ?? {}) as Partial<StartupDna>;
    const onboarding = profile?.onboarding as OnboardingAnswers | null;
    const persona = resolveCompanionPersona({
      onboarding,
      dna: dna as StartupDna,
      genderOverride: body.gender,
    });

    const nextDna = {
      ...dna,
      companionPersona: persona,
      theme: dna.theme ?? "general",
      secondaryThemes: dna.secondaryThemes ?? [],
      confidence: dna.confidence ?? 0.4,
      keywordsFound: dna.keywordsFound ?? [],
      detectedAt: dna.detectedAt ?? new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update({ startup_dna: nextDna })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, persona });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 },
    );
  }
}
