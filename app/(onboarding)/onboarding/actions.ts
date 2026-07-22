"use server";

import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  onboardingAnswersSchema,
  type OnboardingAnswers,
} from "@/lib/types/onboarding";

export async function completeOnboarding(raw: OnboardingAnswers) {
  const parsed = onboardingAnswersSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Please complete all required fields." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be signed in to finish onboarding." };
    }

    const payload = {
      id: user.id,
      email: user.email,
      onboarding: parsed.data,
      onboarding_completed_at: new Date().toISOString(),
      first_login: false,
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      // Fallback: service role (covers missing insert policy / RLS edge cases)
      try {
        const admin = createServiceClient();
        const { error: adminError } = await admin
          .from("profiles")
          .upsert(payload);
        if (adminError) {
          return { error: adminError.message };
        }
      } catch (err) {
        return {
          error:
            error?.message ??
            (err instanceof Error ? err.message : "Could not save onboarding."),
        };
      }
    }

    return { ok: true as const };
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not save onboarding. Check Supabase configuration.",
    };
  }
}
