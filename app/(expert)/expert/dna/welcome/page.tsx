import { DnaWelcomeScreen } from "@/components/expert/dna-welcome-screen";
import { getCachedUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function ExpertDnaWelcomePage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="p-8 text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const supabase = await createClient();
  const user = await getCachedUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("dna_welcome_seen_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.dna_welcome_seen_at) {
    redirect("/expert/dna");
  }

  return <DnaWelcomeScreen />;
}
