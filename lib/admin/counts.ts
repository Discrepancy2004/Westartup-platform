import { createClient } from "@/lib/supabase/server";

export type AdminNavCounts = {
  pendingApplications: number;
  pendingReviews: number;
  activeAssignments: number;
  expertCount: number;
  founderCount: number;
};

export async function getAdminNavCounts(): Promise<AdminNavCounts> {
  const empty: AdminNavCounts = {
    pendingApplications: 0,
    pendingReviews: 0,
    activeAssignments: 0,
    expertCount: 0,
    founderCount: 0,
  };

  try {
    const supabase = await createClient();
    const [
      apps,
      reviews,
      assignments,
      experts,
      founders,
    ] = await Promise.all([
      supabase
        .from("expert_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("review_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("review_assignments")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "expert"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "founder"),
    ]);

    return {
      pendingApplications: apps.count ?? 0,
      pendingReviews: reviews.count ?? 0,
      activeAssignments: assignments.count ?? 0,
      expertCount: experts.count ?? 0,
      founderCount: founders.count ?? 0,
    };
  } catch {
    return empty;
  }
}
