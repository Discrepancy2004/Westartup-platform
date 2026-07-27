import type { ReactNode } from "react";
import { ExpertShellHeader } from "@/components/expert/expert-shell-header";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function ExpertLayout({
  children,
}: {
  children: ReactNode;
}) {
  let unread = 0;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .is("read_at", null);
        unread = count ?? 0;
      }
    } catch {
      unread = 0;
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas text-ink">
      <ExpertShellHeader unreadNotifications={unread} />
      {children}
    </div>
  );
}
