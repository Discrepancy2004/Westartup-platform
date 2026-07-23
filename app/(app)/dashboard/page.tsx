import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import type { ArtifactRecord } from "@/lib/types/artifacts";

export default async function DashboardPage() {
  let artifacts: ArtifactRecord[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("artifacts")
          .select("id, kind, title, summary, chart_data, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });
        artifacts = (data as ArtifactRecord[] | null) ?? [];
      }
    } catch {
      artifacts = [];
    }
  }

  return <DashboardShell artifacts={artifacts} />;
}
