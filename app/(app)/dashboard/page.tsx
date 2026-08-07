import { Suspense } from "react";
import { getCachedProfile } from "@/lib/auth/get-profile";
import { getCachedUser } from "@/lib/auth/get-user";
import { getChatUsageSummary, RAG_WORKSPACE_TITLE, type ChatUsageSummary } from "@/lib/billing/usage";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { PlanId } from "@/lib/razorpay/plans";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import { getStartupListingForFounder } from "@/lib/directory/query";
import type { StartupListing } from "@/lib/directory/types";
import type { ArtifactRecord } from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}

async function DashboardData() {
  let artifacts: ArtifactRecord[] = [];
  let onboarding: OnboardingAnswers | null = null;
  let planId: PlanId = "starter";
  let ragMessages: {
    id: string;
    role: "user" | "assistant";
    content: string;
  }[] = [];
  let usage: ChatUsageSummary = {
    planId: "starter",
    used: 0,
    limit: 15,
    remaining: 15,
    percentageUsed: 0,
  };
  let listing: StartupListing | null = null;
  let linkedinConnected = false;
  let linkedinUrl: string | null = null;
  let review: {
    userId: string;
    pendingRequest: { id: string; note: string | null } | null;
    assignments: {
      id: string;
      status: "active" | "completed";
      expert_email: string | null;
      messages: {
        id: string;
        sender_id: string;
        content: string;
        created_at: string;
      }[];
    }[];
  } | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const user = await getCachedUser();
      if (user) {
        const [
          { data },
          profile,
          pendingRes,
          assignRes,
          listingResult,
          ragConversationRes,
        ] = await Promise.all([
          supabase
            .from("artifacts")
            .select("id, kind, title, summary, chart_data, updated_at, source")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false }),
          getCachedProfile(user.id),
          supabase
            .from("review_requests")
            .select("id, note")
            .eq("founder_id", user.id)
            .eq("status", "pending")
            .maybeSingle(),
          supabase
            .from("review_assignments")
            .select("id, expert_id, status")
            .eq("founder_id", user.id)
            .in("status", ["active", "completed"])
            .order("created_at", { ascending: false }),
          getStartupListingForFounder(user.id).catch(() => null),
          supabase
            .from("conversations")
            .select("id")
            .eq("user_id", user.id)
            .eq("title", RAG_WORKSPACE_TITLE)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);
        artifacts = (data as ArtifactRecord[] | null) ?? [];
        listing = listingResult;
        onboarding =
          (profile?.onboarding as OnboardingAnswers | null) ?? null;
        planId = (profile?.plan_id as PlanId | null) ?? "starter";
        linkedinConnected = Boolean(profile?.linkedin_connected_at);
        linkedinUrl =
          typeof profile?.linkedin_url === "string"
            ? profile.linkedin_url
            : null;

        const assignments = assignRes.data ?? [];
        const expertIds = [...new Set(assignments.map((a) => a.expert_id))];
        const assignmentIds = assignments.map((a) => a.id);
        const ragConversation = ragConversationRes.data;

        const [usageResult, messageRes, expertsRes, reviewMessagesRes] =
          await Promise.all([
            getChatUsageSummary(supabase, user.id, planId),
            ragConversation?.id
              ? supabase
                  .from("messages")
                  .select("id, role, content")
                  .eq("conversation_id", ragConversation.id)
                  .order("created_at", { ascending: true })
                  .limit(50)
              : Promise.resolve({ data: null }),
            expertIds.length > 0
              ? supabase
                  .from("profiles")
                  .select("id, email")
                  .in("id", expertIds)
              : Promise.resolve({ data: [] as { id: string; email: string | null }[] }),
            assignmentIds.length > 0
              ? supabase
                  .from("review_messages")
                  .select("id, assignment_id, sender_id, content, created_at")
                  .in("assignment_id", assignmentIds)
                  .order("created_at", { ascending: true })
              : Promise.resolve({ data: [] as {
                  id: string;
                  assignment_id: string;
                  sender_id: string;
                  content: string;
                  created_at: string;
                }[] }),
          ]);
        usage = usageResult;
        ragMessages =
          messageRes.data
            ?.filter((row) => row.role === "user" || row.role === "assistant")
            .map((row) => ({
              id: row.id,
              role: row.role as "user" | "assistant",
              content: row.content,
            })) ?? [];

        const emailById = new Map<string, string | null>();
        for (const e of expertsRes.data ?? []) {
          emailById.set(e.id, e.email);
        }

        const messagesByAssignment = new Map<
          string,
          {
            id: string;
            sender_id: string;
            content: string;
            created_at: string;
          }[]
        >();
        for (const m of reviewMessagesRes.data ?? []) {
          const list = messagesByAssignment.get(m.assignment_id) ?? [];
          list.push({
            id: m.id,
            sender_id: m.sender_id,
            content: m.content,
            created_at: m.created_at,
          });
          messagesByAssignment.set(m.assignment_id, list);
        }

        review = {
          userId: user.id,
          pendingRequest: pendingRes.data
            ? { id: pendingRes.data.id, note: pendingRes.data.note }
            : null,
          assignments: assignments.map((a) => ({
            id: a.id,
            status: (a.status === "completed" ? "completed" : "active") as
              | "active"
              | "completed",
            expert_email: emailById.get(a.expert_id) ?? null,
            messages: messagesByAssignment.get(a.id) ?? [],
          })),
        };
      }
    } catch {
      artifacts = [];
      onboarding = null;
      planId = "starter";
      ragMessages = [];
      usage = {
        planId: "starter",
        used: 0,
        limit: 15,
        remaining: 15,
        percentageUsed: 0,
      };
      review = null;
      listing = null;
      linkedinConnected = false;
      linkedinUrl = null;
    }
  }

  return (
    <DashboardShell
      artifacts={artifacts}
      onboarding={onboarding}
      planId={planId}
      ragMessages={ragMessages}
      usage={usage}
      review={review}
      listing={listing}
      linkedinConnected={linkedinConnected}
      linkedinUrl={linkedinUrl}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <div className="h-8 w-64 animate-pulse rounded bg-border/50" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded bg-border/40" />
      <div className="h-36 animate-pulse rounded-[var(--radius-lg)] border border-border bg-surface/50" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface/40"
          />
        ))}
      </div>
    </div>
  );
}
