import { createClient } from "@/lib/supabase/client";

export async function startLinkedInConnect(returnTo: string) {
  const supabase = createClient();
  return supabase.auth.linkIdentity({
    provider: "linkedin_oidc",
    options: {
      redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(returnTo)}`,
    },
  });
}
