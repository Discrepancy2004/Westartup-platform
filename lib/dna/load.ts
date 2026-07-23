import { createClient } from "@/lib/supabase/server";
import { resolveDna, type ResolvedDna } from "@/lib/dna/resolve";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import { isSupabaseConfigured } from "@/lib/utils";

/** Server helper: load stored DNA (re-detect from onboarding if missing). */
export async function loadStartupDna(): Promise<ResolvedDna> {
  if (!isSupabaseConfigured()) {
    return resolveDna({});
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return resolveDna({});

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding, startup_dna")
      .eq("id", user.id)
      .maybeSingle();

    const resolved = resolveDna({
      stored: profile?.startup_dna,
      onboarding: profile?.onboarding as OnboardingAnswers | null,
    });

    // Backfill if we have onboarding but no stored DNA yet
    if (!profile?.startup_dna && profile?.onboarding) {
      try {
        await supabase
          .from("profiles")
          .update({ startup_dna: resolved.dna })
          .eq("id", user.id);
      } catch {
        // non-fatal — column may not exist until migration runs
      }
    }

    return resolved;
  } catch {
    return resolveDna({});
  }
}
