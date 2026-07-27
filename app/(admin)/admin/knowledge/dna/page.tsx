import { KnowledgeTabs } from "@/components/admin/knowledge-tabs";
import {
  AdminDnaKnowledgePanel,
  type AdminDnaRow,
} from "@/components/admin/admin-dna-knowledge-panel";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function AdminKnowledgeDnaPage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="p-8 text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const supabase = await createClient();
  const { data: capsules } = await supabase
    .from("expert_dna_capsules")
    .select(
      "id, question_id, question_text, answer, why, category, functional_area, industry, stage, status, usage_count, expert_id, updated_at",
    )
    .order("updated_at", { ascending: false });

  const expertIds = [...new Set((capsules ?? []).map((c) => c.expert_id))];
  const emailById = new Map<string, string | null>();
  const nameById = new Map<string, string | null>();

  if (expertIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", expertIds);
    for (const p of profiles ?? []) {
      emailById.set(p.id, p.email);
    }
    const { data: apps } = await supabase
      .from("expert_applications")
      .select("user_id, full_name")
      .in("user_id", expertIds);
    for (const a of apps ?? []) {
      nameById.set(a.user_id, a.full_name);
    }
  }

  const rows: AdminDnaRow[] = (capsules ?? []).map((c) => ({
    ...c,
    expert_email: emailById.get(c.expert_id) ?? null,
    expert_name: nameById.get(c.expert_id) ?? null,
  }));

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 md:px-5">
      <KnowledgeTabs />
      <AdminDnaKnowledgePanel rows={rows} />
    </main>
  );
}
