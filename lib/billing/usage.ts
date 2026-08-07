import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { PlanId } from "@/lib/razorpay/plans";

export const RAG_WORKSPACE_TITLE = "RAG workspace";

export type ChatUsageSummary = {
  planId: PlanId;
  used: number;
  limit: number | null;
  remaining: number | null;
  percentageUsed: number;
};

const CHAT_LIMITS: Record<PlanId, number | null> = {
  starter: 15,
  growth: 150,
  scale: null,
};

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function getChatLimit(planId: PlanId | null | undefined): number | null {
  return CHAT_LIMITS[planId ?? "starter"];
}

export function hasRagAccess(planId: PlanId | null | undefined): boolean {
  return planId === "growth" || planId === "scale";
}

export function hasExpertAccess(planId: PlanId | null | undefined): boolean {
  return planId === "scale";
}

export function getChatUsageLabel(usage: ChatUsageSummary): string {
  if (usage.limit === null) {
    return `${usage.used} AI chats today`;
  }

  return `${usage.remaining ?? 0} of ${usage.limit} left today`;
}

function getIstDayRange(now = new Date()) {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS);
  const startUtcMs =
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
      0,
      0,
      0,
      0,
    ) - IST_OFFSET_MS;

  return {
    start: new Date(startUtcMs),
    end: new Date(startUtcMs + DAY_MS),
  };
}

export async function getChatUsageSummary(
  _supabase: SupabaseClient | null,
  userId: string,
  planId: PlanId | null | undefined,
): Promise<ChatUsageSummary> {
  return loadChatUsageSummary(userId, planId ?? "starter");
}

const loadChatUsageSummary = cache(
  async (userId: string, normalizedPlan: PlanId): Promise<ChatUsageSummary> => {
  const supabase = await createClient();
  const limit = getChatLimit(normalizedPlan);

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_id", userId);

  const conversationIds = conversations?.map((conversation) => conversation.id) ?? [];

  if (conversationIds.length === 0) {
    return {
      planId: normalizedPlan,
      used: 0,
      limit,
      remaining: limit,
      percentageUsed: 0,
    };
  }

  const { start, end } = getIstDayRange();

  let query = supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());

  query =
    conversationIds.length === 1
      ? query.eq("conversation_id", conversationIds[0])
      : query.in("conversation_id", conversationIds);

  const { count } = await query;
  const used = count ?? 0;
  const remaining = limit === null ? null : Math.max(limit - used, 0);
  const percentageUsed =
    limit === null || limit === 0 ? 0 : Math.min((used / limit) * 100, 100);

  return {
    planId: normalizedPlan,
    used,
    limit,
    remaining,
    percentageUsed,
  };
  },
);
