import { DnaCapsuleEngine } from "@/components/expert/dna-capsule-engine";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function ExpertDnaCapsulePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

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

  const { data: capsules } = await supabase
    .from("expert_dna_capsules")
    .select("question_id")
    .eq("expert_id", user.id);

  const answeredIds = (capsules ?? []).map((c) => c.question_id);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-5">
      <DnaCapsuleEngine
        answeredIds={answeredIds}
        answeredCount={answeredIds.length}
        initialQuestionId={q}
      />
    </main>
  );
}
