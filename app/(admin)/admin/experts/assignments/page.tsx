import { AssignmentsPanel } from "@/components/admin/assignments-panel";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

function expertDisplayName(
  email: string | null | undefined,
  fullName: string | null | undefined,
) {
  return fullName?.trim() || email?.split("@")[0] || "Expert";
}

export default async function AdminAssignmentsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const supabase = await createClient();

  const [
    { data: assignments },
    { data: experts },
    { data: founders },
    { data: pendingRequests },
  ] = await Promise.all([
    supabase
      .from("review_assignments")
      .select("id, founder_id, expert_id, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, email")
      .eq("role", "expert")
      .order("email", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, email")
      .eq("role", "founder")
      .order("email", { ascending: true }),
    supabase
      .from("review_requests")
      .select("id, note, created_at, founder_id")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
  ]);

  const expertIds = (experts ?? []).map((e) => e.id);
  const nameByExpert = new Map<string, string>();
  if (expertIds.length > 0) {
    const { data: apps } = await supabase
      .from("expert_applications")
      .select("user_id, full_name")
      .in("user_id", expertIds)
      .eq("status", "approved");
    for (const a of apps ?? []) {
      nameByExpert.set(a.user_id, a.full_name);
    }
  }

  const assignedFounderIds = new Set(
    (assignments ?? []).map((a) => a.founder_id),
  );

  const emailById = new Map<string, string | null>();
  for (const founder of founders ?? []) {
    emailById.set(founder.id, founder.email);
  }

  const expertOptions = (experts ?? []).map((e) => ({
    id: e.id,
    email: e.email,
    name: expertDisplayName(e.email, nameByExpert.get(e.id)),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Assignments</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Pending founder requests and active expert ↔ founder matches.
        </p>
      </div>
      <AssignmentsPanel
        assignments={(assignments ?? []).map((a) => {
          const expert = (experts ?? []).find((e) => e.id === a.expert_id);
          return {
            id: a.id,
            created_at: a.created_at,
            founder_email: emailById.get(a.founder_id) ?? null,
            expert_name: expertDisplayName(
              expert?.email,
              nameByExpert.get(a.expert_id),
            ),
          };
        })}
        unassignedFounders={(founders ?? [])
          .filter((f) => !assignedFounderIds.has(f.id))
          .map((f) => ({ id: f.id, email: f.email }))}
        experts={expertOptions}
        pendingRequests={(pendingRequests ?? []).map((r) => ({
          id: r.id,
          note: r.note,
          created_at: r.created_at,
          founder_id: r.founder_id,
          founder_email: emailById.get(r.founder_id) ?? null,
        }))}
      />
    </div>
  );
}
