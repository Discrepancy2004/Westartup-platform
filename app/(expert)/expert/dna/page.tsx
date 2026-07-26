import { redirect } from "next/navigation";
import { DnaStudioDashboard } from "@/components/expert/dna-studio-dashboard";
import {
  DNA_STARTER_QUESTIONS,
  type DnaCapsuleCategory,
} from "@/lib/expert/dna-questions";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function ExpertDnaPage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="p-8 text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("dna_welcome_seen_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.dna_welcome_seen_at) {
    redirect("/expert/dna/welcome");
  }

  const { data: capsules } = await supabase
    .from("expert_dna_capsules")
    .select("question_id, category")
    .eq("expert_id", user.id);

  const answeredIds = new Set((capsules ?? []).map((c) => c.question_id));
  const categoryCounts: Partial<Record<DnaCapsuleCategory, number>> = {};
  for (const q of DNA_STARTER_QUESTIONS) {
    if (answeredIds.has(q.id)) {
      categoryCounts[q.category] = (categoryCounts[q.category] ?? 0) + 1;
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-5">
      <DnaStudioDashboard
        answeredCount={answeredIds.size}
        totalQuestions={DNA_STARTER_QUESTIONS.length}
        categoryCounts={categoryCounts}
      />
    </main>
  );
}
