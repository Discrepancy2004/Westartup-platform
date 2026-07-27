import Link from "next/link";
import { AdminKpiCards } from "@/components/admin/admin-kpi-cards";
import { getAdminNavCounts } from "@/lib/admin/counts";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const counts = await getAdminNavCounts();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Platform pulse — open a card to act on what needs attention.
        </p>
      </div>

      <AdminKpiCards counts={counts} />

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/admin/experts/applications" className="text-accent hover:underline">
          Review applications
        </Link>
        <Link href="/admin/experts/assignments" className="text-accent hover:underline">
          Manage assignments
        </Link>
        <Link href="/admin/founders" className="text-accent hover:underline">
          Browse founders
        </Link>
      </div>
    </div>
  );
}
