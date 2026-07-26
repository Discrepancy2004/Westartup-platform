import { KnowledgeTabs } from "@/components/admin/knowledge-tabs";
import {
  AdminCorpusPanel,
  type AdminCorpusRow,
} from "@/components/admin/admin-corpus-panel";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function AdminKnowledgeCorpusPage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="p-8 text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const supabase = await createClient();
  const { data: docs } = await supabase
    .from("knowledge_documents")
    .select(
      "id, title, source_type, status, startup_name, file_name, chunk_count, ignored, error_message, updated_at",
    )
    .order("updated_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 md:px-5">
      <KnowledgeTabs />
      <AdminCorpusPanel rows={(docs ?? []) as AdminCorpusRow[]} />
    </main>
  );
}
