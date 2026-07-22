import { Suspense } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ bootstrap?: string }>;
};

export default async function ChatPage({ searchParams }: Props) {
  const params = await searchParams;
  const bootstrap = params.bootstrap === "1";

  let initialMessages: {
    id: string;
    role: "user" | "assistant";
    content: string;
  }[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: conversation } = await supabase
          .from("conversations")
          .select("id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (conversation?.id) {
          const { data: rows } = await supabase
            .from("messages")
            .select("id, role, content")
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: true })
            .limit(50);

          initialMessages =
            rows
              ?.filter((r) => r.role === "user" || r.role === "assistant")
              .map((r) => ({
                id: r.id,
                role: r.role as "user" | "assistant",
                content: r.content,
              })) ?? [];
        }
      }
    } catch {
      initialMessages = [];
    }
  }

  return (
    <Suspense fallback={<p className="p-6 text-sm text-ink-tertiary">Loading…</p>}>
      <ChatPanel
        bootstrap={bootstrap && initialMessages.length === 0}
        initialMessages={initialMessages}
      />
    </Suspense>
  );
}
