"use server";

import { createClient } from "@/lib/supabase/server";

export async function notifyUser(params: {
  userId: string;
  type:
    | "new_assignment"
    | "founder_replied"
    | "expert_replied"
    | "review_completed";
  title: string;
  body?: string;
  link?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_notification", {
    p_user_id: params.userId,
    p_type: params.type,
    p_title: params.title,
    p_body: params.body ?? null,
    p_link: params.link ?? null,
  });
  if (error) {
    console.error("create_notification failed", error.message);
  }
}
