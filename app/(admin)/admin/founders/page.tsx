import { FoundersTable } from "@/components/admin/founders-table";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

type Onboarding = {
  idea?: { description?: string };
} | null;

export default async function AdminFoundersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const supabase = await createClient();

  const [{ data: founders }, { data: assignments }, { data: pendingReviews }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, first_login, onboarding, created_at")
        .eq("role", "founder")
        .order("created_at", { ascending: false }),
      supabase
        .from("review_assignments")
        .select("founder_id")
        .eq("status", "active"),
      supabase
        .from("review_requests")
        .select("founder_id")
        .eq("status", "pending"),
    ]);

  const assigned = new Set((assignments ?? []).map((a) => a.founder_id));
  const pending = new Set((pendingReviews ?? []).map((r) => r.founder_id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Founders</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Platform founders. Open a row for details.
        </p>
      </div>
      <FoundersTable
        founders={(founders ?? []).map((f) => {
          const onboarding = f.onboarding as Onboarding;
          const idea = onboarding?.idea?.description?.trim() ?? null;
          return {
            id: f.id,
            email: f.email,
            first_login: f.first_login ?? true,
            created_at: f.created_at,
            hasAssignment: assigned.has(f.id),
            hasPendingReview: pending.has(f.id),
            ideaPreview: idea ? idea.slice(0, 120) : null,
          };
        })}
      />
    </div>
  );
}
