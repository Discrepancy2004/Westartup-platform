import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { getAdminNavCounts } from "@/lib/admin/counts";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const counts = isSupabaseConfigured()
    ? await getAdminNavCounts()
    : {
        pendingApplications: 0,
        pendingReviews: 0,
        activeAssignments: 0,
        expertCount: 0,
        founderCount: 0,
      };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas text-ink">
      <AdminHeader counts={counts} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-5">
        {children}
      </main>
    </div>
  );
}
