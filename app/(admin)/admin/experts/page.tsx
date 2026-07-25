import Link from "next/link";
import { ExpertsTable } from "@/components/admin/experts-table";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function AdminExpertsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const supabase = await createClient();
  const { data: experts } = await supabase
    .from("profiles")
    .select("id, email, created_at")
    .eq("role", "expert")
    .order("created_at", { ascending: false });

  const expertIds = (experts ?? []).map((e) => e.id);

  const nameById = new Map<string, { name: string; company: string | null }>();
  const loadByExpert = new Map<string, number>();

  if (expertIds.length > 0) {
    const [{ data: apps }, { data: assignments }] = await Promise.all([
      supabase
        .from("expert_applications")
        .select("user_id, full_name, company, status")
        .in("user_id", expertIds)
        .eq("status", "approved"),
      supabase
        .from("review_assignments")
        .select("expert_id")
        .eq("status", "active")
        .in("expert_id", expertIds),
    ]);

    for (const a of apps ?? []) {
      nameById.set(a.user_id, {
        name: a.full_name,
        company: a.company,
      });
    }
    for (const a of assignments ?? []) {
      loadByExpert.set(a.expert_id, (loadByExpert.get(a.expert_id) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">All experts</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Approved industry experts. Open one to see assigned founders.
          </p>
        </div>
        <Link
          href="/admin/experts/applications"
          className="text-sm text-accent hover:underline"
        >
          Review applications
        </Link>
      </div>

      <ExpertsTable
        experts={(experts ?? []).map((e) => {
          const meta = nameById.get(e.id);
          return {
            id: e.id,
            name: meta?.name ?? e.email?.split("@")[0] ?? "Expert",
            email: e.email,
            company: meta?.company ?? null,
            created_at: e.created_at,
            activeCount: loadByExpert.get(e.id) ?? 0,
          };
        })}
      />
    </div>
  );
}
