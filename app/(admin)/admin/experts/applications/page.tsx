import { ApplicationsPanel } from "@/components/admin/applications-panel";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function AdminApplicationsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const supabase = await createClient();
  const { data: apps } = await supabase
    .from("expert_applications")
    .select("id, full_name, company, cv_path, created_at, user_id")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const userIds = [...new Set((apps ?? []).map((a) => a.user_id))];
  const emailById = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      emailById.set(p.id, p.email);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Applications</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Pending Industry Expert applications.
        </p>
      </div>
      <ApplicationsPanel
        applications={(apps ?? []).map((a) => ({
          id: a.id,
          full_name: a.full_name,
          company: a.company,
          cv_path: a.cv_path,
          created_at: a.created_at,
          email: emailById.get(a.user_id) ?? null,
        }))}
      />
    </div>
  );
}
