import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getCachedUser } from "@/lib/auth/get-user";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function OnboardingPage() {
  let userEmail: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const user = await getCachedUser();
      userEmail = user?.email ?? null;
    } catch {
      userEmail = null;
    }
  }

  return <OnboardingFlow userEmail={userEmail} />;
}
