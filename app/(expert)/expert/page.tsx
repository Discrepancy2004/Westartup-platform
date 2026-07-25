import { RoleShellHeader } from "@/components/shell/role-shell-header";
import { ReviewChat } from "@/components/expert/review-chat";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

type OnboardingSlice = {
  "about-you"?: { roleAndBackground?: string };
  idea?: { description?: string };
} | null;

function founderSummary(onboarding: OnboardingSlice): string | null {
  const idea = onboarding?.idea?.description?.trim();
  if (idea) return idea.slice(0, 160);
  const about = onboarding?.["about-you"]?.roleAndBackground?.trim();
  if (about) return about.slice(0, 140);
  return null;
}

export default async function ExpertHomePage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="p-8 text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: founders }, { data: assignments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, first_login, onboarding, created_at")
      .eq("role", "founder")
      .order("created_at", { ascending: false }),
    supabase
      .from("review_assignments")
      .select("id, founder_id, status, created_at")
      .eq("expert_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ]);

  const assignmentByFounder = new Map(
    (assignments ?? []).map((a) => [a.founder_id, a]),
  );

  const assignmentIds = (assignments ?? []).map((a) => a.id);
  const messagesByAssignment = new Map<
    string,
    { id: string; sender_id: string; content: string; created_at: string }[]
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

  return (
    <>
      <RoleShellHeader
        title="Expert"
        links={[{ href: "/expert", label: "Founders" }]}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Expert dashboard</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            All founders on the platform. Chat appears when an admin assigns you
            to a review.
          </p>
        </div>

        {(founders ?? []).length === 0 ? (
          <p className="text-sm text-ink-secondary">No founders yet.</p>
        ) : (
          <ul className="divide-y divide-border border border-border">
            {(founders ?? []).map((f) => {
              const summary = founderSummary(
                f.onboarding as OnboardingSlice,
              );
              const assignment = assignmentByFounder.get(f.id);
              return (
                <li key={f.id} className="space-y-4 px-4 py-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium text-ink">
                        {f.email ?? "Founder"}
                      </p>
                      {summary ? (
                        <p className="text-sm text-ink-secondary">{summary}</p>
                      ) : (
                        <p className="text-sm text-ink-tertiary">
                          {f.first_login
                            ? "Has not completed onboarding"
                            : "No idea summary yet"}
                        </p>
                      )}
                      <p className="text-xs text-ink-tertiary">
                        Joined {new Date(f.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {assignment ? (
                      <span className="shrink-0 text-xs font-medium text-accent">
                        Assigned to you
                      </span>
                    ) : null}
                  </div>

                  {assignment ? (
                    <ReviewChat
                      assignmentId={assignment.id}
                      currentUserId={user.id}
                      peerLabel="founder"
                      messages={messagesByAssignment.get(assignment.id) ?? []}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
