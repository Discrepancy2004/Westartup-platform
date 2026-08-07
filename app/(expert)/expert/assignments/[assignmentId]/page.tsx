import { notFound } from "next/navigation";
import { AssignmentWorkspace } from "@/components/expert/assignment-workspace";
import { DnaProvider } from "@/components/dna/dna-provider";
import { getCachedUser } from "@/lib/auth/get-user";
import { resolveDna } from "@/lib/dna/resolve";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import type { ArtifactRecord } from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

export default async function ExpertAssignmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ assignmentId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { assignmentId } = await params;
  const { tab: tabRaw } = await searchParams;
  const initialTab =
    tabRaw === "full" || tabRaw === "chat" ? tabRaw : "overview";

  if (!isSupabaseConfigured()) {
    return (
      <p className="p-8 text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const supabase = await createClient();
  const user = await getCachedUser();
  if (!user) return null;

  const { data: assignment } = await supabase
    .from("review_assignments")
    .select("id, founder_id, expert_id, status")
    .eq("id", assignmentId)
    .maybeSingle();

  if (!assignment || assignment.expert_id !== user.id) {
    notFound();
  }

  const [{ data: founder }, { data: artifacts }, { data: messages }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("email, onboarding, startup_dna")
        .eq("id", assignment.founder_id)
        .maybeSingle(),
      supabase
        .from("artifacts")
        .select("id, kind, title, summary, chart_data, updated_at, source")
        .eq("user_id", assignment.founder_id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("review_messages")
        .select("id, sender_id, content, created_at")
        .eq("assignment_id", assignmentId)
        .order("created_at", { ascending: true }),
    ]);

  const onboarding = (founder?.onboarding as OnboardingAnswers | null) ?? null;
  const resolved = resolveDna({
    stored: founder?.startup_dna,
    onboarding,
  });

  return (
    <DnaProvider dna={resolved.dna} secondaryLabels={resolved.secondaryLabels}>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-5">
        <AssignmentWorkspace
          assignmentId={assignment.id}
          status={assignment.status as "active" | "completed"}
          currentUserId={user.id}
          founderEmail={founder?.email ?? null}
          artifacts={(artifacts as ArtifactRecord[] | null) ?? []}
          onboarding={onboarding}
          messages={messages ?? []}
          initialTab={initialTab}
        />
      </main>
    </DnaProvider>
  );
}
