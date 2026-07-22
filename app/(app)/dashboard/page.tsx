import { AppHeader } from "@/components/app/app-header";
import { ArtifactCard } from "@/components/dashboard/artifact-card";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
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

  return (
    <div className="min-h-[100svh]">
      <AppHeader active="dashboard" />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <h1 className="font-display text-3xl text-ink">Dashboard</h1>
            <p className="text-sm text-ink-secondary">
              Live investor documents. Generated from onboarding, then updated as
              you refine the idea.
            </p>
          </div>
        </div>

        {artifacts.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {artifacts.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
