import Link from "next/link";
import { ExpertApplyForm } from "@/components/expert/expert-apply-form";
import { getCachedUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function ExpertApplyPage() {
  let defaultFullName = "";
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const user = await getCachedUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();
        defaultFullName = profile?.full_name?.trim() ?? "";
      }
    } catch {
      defaultFullName = "";
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-8 font-display text-lg text-ink">
        WeStartup
      </Link>
      <ExpertApplyForm defaultFullName={defaultFullName} />
    </div>
  );
}
