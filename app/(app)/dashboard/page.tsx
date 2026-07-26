import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import type { ArtifactRecord } from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

export default async function DashboardPage() {
  let artifacts: ArtifactRecord[] = [];
  let onboarding: OnboardingAnswers | null = null;
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const [{ data }, profileRes, pendingRes, assignRes] = await Promise.all([
          supabase
            .from("artifacts")
            .select("id, kind, title, summary, chart_data, updated_at, source")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false }),
          supabase
            .from("profiles")
            .select("onboarding")
            .eq("id", user.id)
            .maybeSingle(),
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
        ]);
        artifacts = (data as ArtifactRecord[] | null) ?? [];
        onboarding =
          (profileRes.data?.onboarding as OnboardingAnswers | null) ?? null;

        const assignments = assignRes.data ?? [];
        const expertIds = [...new Set(assignments.map((a) => a.expert_id))];
        const emailById = new Map<string, string | null>();
        if (expertIds.length > 0) {
          const { data: experts } = await supabase
            .from("profiles")
            .select("id, email")
            .in("id", expertIds);
          for (const e of experts ?? []) {
            emailById.set(e.id, e.email);
          }
        }

        const assignmentIds = assignments.map((a) => a.id);
        const messagesByAssignment = new Map<
          string,
          {
            id: string;
            sender_id: string;
            content: string;
            created_at: string;
          }[]
        >();
        if (assignmentIds.length > 0) {
          const { data: messages } = await supabase
            .from("review_messages")
            .select("id, assignment_id, sender_id, content, created_at")
            .in("assignment_id", assignmentIds)
            .order("created_at", { ascending: true });
          for (const m of messages ?? []) {
            const list = messagesByAssignment.get(m.assignment_id) ?? [];
            list.push({
              id: m.id,
              sender_id: m.sender_id,
              content: m.content,
              created_at: m.created_at,
            });
            messagesByAssignment.set(m.assignment_id, list);
          }
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
      review = null;
    }
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardShell
        artifacts={artifacts}
        onboarding={onboarding}
        review={review}
      />
    </Suspense>
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
