import { Suspense } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { getCachedProfile } from "@/lib/auth/get-profile";
import { getCachedUser } from "@/lib/auth/get-user";
import { getChatUsageSummary, RAG_WORKSPACE_TITLE } from "@/lib/billing/usage";
import type { PlanId } from "@/lib/razorpay/plans";
import { createClient } from "@/lib/supabase/server";
import type { ChatUsageSummary } from "@/lib/billing/usage";
import { isSupabaseConfigured } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ bootstrap?: string }>;
};

export default function ChatPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-ink-tertiary">Loading…</p>}>
      <ChatData searchParams={searchParams} />
    </Suspense>
  );
}

async function ChatData({ searchParams }: Props) {
  const params = await searchParams;
  const bootstrap = params.bootstrap === "1";
  let planId: PlanId = "starter";
  let usage: ChatUsageSummary = {
    planId: "starter",
    used: 0,
    limit: 15,
    remaining: 15,
    percentageUsed: 0,
  };

  let initialMessages: {
    id: string;
    role: "user" | "assistant";
    content: string;
  }[] = [];

  if (isSupabaseConfigured()) {
    try {
      const user = await getCachedUser();

      if (user) {
        const supabase = await createClient();
        const [profile, { data: conversation }] = await Promise.all([
          getCachedProfile(user.id),
          supabase
            .from("conversations")
            .select("id")
            .eq("user_id", user.id)
            .neq("title", RAG_WORKSPACE_TITLE)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        planId = (profile?.plan_id as PlanId | null) ?? "starter";

        const [usageResult, messageRes] = await Promise.all([
          getChatUsageSummary(supabase, user.id, planId),
          conversation?.id
            ? supabase
                .from("messages")
                .select("id, role, content")
                .eq("conversation_id", conversation.id)
                .order("created_at", { ascending: true })
                .limit(50)
            : Promise.resolve({ data: null }),
        ]);

        usage = usageResult;
        initialMessages =
          messageRes.data
            ?.filter((r) => r.role === "user" || r.role === "assistant")
            .map((r) => ({
              id: r.id,
              role: r.role as "user" | "assistant",
              content: r.content,
            })) ?? [];
      }
    } catch {
      initialMessages = [];
    }
  }

  return (
    <ChatPanel
      bootstrap={bootstrap && initialMessages.length === 0}
      initialMessages={initialMessages}
      planId={planId}
      usage={usage}
    />
  );
}
