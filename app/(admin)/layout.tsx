import type { ReactNode } from "react";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { getAdminNavCounts, type AdminNavCounts } from "@/lib/admin/counts";
import { isSupabaseConfigured } from "@/lib/utils";

const EMPTY_COUNTS: AdminNavCounts = {
  pendingApplications: 0,
  pendingReviews: 0,
  activeAssignments: 0,
  expertCount: 0,
  founderCount: 0,
};

async function AdminHeaderWithCounts() {
  const counts = isSupabaseConfigured()
    ? await getAdminNavCounts()
    : EMPTY_COUNTS;
  return <AdminHeader counts={counts} />;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas text-ink">
      <Suspense fallback={<AdminHeader counts={EMPTY_COUNTS} />}>
        <AdminHeaderWithCounts />
      </Suspense>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-5">
        {children}
      </main>
    </div>
  );
}
