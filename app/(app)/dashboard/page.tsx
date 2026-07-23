import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import type { ArtifactRecord } from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

export default async function DashboardPage() {
  let artifacts: ArtifactRecord[] = [];
  let onboarding: OnboardingAnswers | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const [{ data }, profileRes] = await Promise.all([
          supabase
            .from("artifacts")
            .select("id, kind, title, summary, chart_data, updated_at, source")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false }),
          supabase
            .from("profiles")
            .select("onboarding")
            .eq("id", user.id)
            .maybeSingle(),
        ]);
        artifacts = (data as ArtifactRecord[] | null) ?? [];
        onboarding =
          (profileRes.data?.onboarding as OnboardingAnswers | null) ?? null;
      }
    } catch {
      artifacts = [];
      onboarding = null;
    }
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardShell artifacts={artifacts} onboarding={onboarding} />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <div className="h-8 w-64 animate-pulse rounded bg-border/50" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded bg-border/40" />
      <div className="h-36 animate-pulse rounded-[var(--radius-lg)] border border-border bg-surface/50" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface/40"
          />
        ))}
      </div>
    </div>
  );
}
