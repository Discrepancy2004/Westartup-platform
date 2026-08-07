import { cache } from "react";
import { getCachedProfile } from "@/lib/auth/get-profile";
import { getCachedUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { resolveDna, type ResolvedDna } from "@/lib/dna/resolve";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import { isSupabaseConfigured } from "@/lib/utils";

/** Server helper: load stored DNA (re-detect from onboarding if missing). */
export const loadStartupDna = cache(async (): Promise<ResolvedDna> => {
  if (!isSupabaseConfigured()) {
    return resolveDna({});
  }

  try {
    const user = await getCachedUser();
    if (!user) return resolveDna({});

    const profile = await getCachedProfile(user.id);

    const resolved = resolveDna({
      stored: profile?.startup_dna,
      onboarding: profile?.onboarding as OnboardingAnswers | null,
    });

    const needsBackfill =
      !profile?.startup_dna ||
      !(profile.startup_dna as { companionPersona?: unknown })
        ?.companionPersona;

    if (needsBackfill && profile?.onboarding) {
      void (async () => {
        try {
          const supabase = await createClient();
          await supabase
            .from("profiles")
            .update({ startup_dna: resolved.dna })
            .eq("id", user.id);
        } catch {
          // non-fatal
        }
      })();
    }

    return resolved;
  } catch {
    return resolveDna({});
  }
});
