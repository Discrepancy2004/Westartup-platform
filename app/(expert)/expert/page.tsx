import Link from "next/link";
import { getCachedUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

type OnboardingSlice = {
  idea?: { description?: string };
  "about-you"?: { roleAndBackground?: string };
} | null;

export default async function ExpertHomePage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="p-8 text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const supabase = await createClient();
  const user = await getCachedUser();
  if (!user) return null;

  const { data: assignments } = await supabase
    .from("review_assignments")
    .select("id, founder_id, status, created_at")
    .eq("expert_id", user.id)
    .in("status", ["active", "completed"])
    .order("created_at", { ascending: false });

  const list = assignments ?? [];
  const active = list.filter((a) => a.status === "active");
  const completed = list.filter((a) => a.status === "completed");

  const founderIds = [...new Set(list.map((a) => a.founder_id))];
  const activeIds = active.map((a) => a.id);
  const foundersById = new Map<
    string,
    { email: string | null; summary: string | null }
  >();

  const [{ data: founders }, { data: messages }] = await Promise.all([
    founderIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, email, onboarding")
          .in("id", founderIds)
      : Promise.resolve({ data: [] as { id: string; email: string | null; onboarding: OnboardingSlice }[] }),
    activeIds.length > 0
      ? supabase
          .from("review_messages")
          .select("assignment_id, sender_id, created_at")
          .in("assignment_id", activeIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as { assignment_id: string; sender_id: string; created_at: string }[] }),
  ]);

  for (const f of founders ?? []) {
    const onboarding = f.onboarding as OnboardingSlice;
    const summary =
      onboarding?.idea?.description?.trim()?.slice(0, 140) ||
      onboarding?.["about-you"]?.roleAndBackground?.trim()?.slice(0, 140) ||
      null;
    foundersById.set(f.id, { email: f.email, summary });
  }

  let pendingReplies = 0;
  const pendingReplyIds = new Set<string>();
  if (activeIds.length > 0) {

    const latestByAssignment = new Map<string, string>();
    for (const m of messages ?? []) {
      if (!latestByAssignment.has(m.assignment_id)) {
        latestByAssignment.set(m.assignment_id, m.sender_id);
      }
    }
    for (const a of active) {
      const lastSender = latestByAssignment.get(a.id);
      if (lastSender && lastSender === a.founder_id) {
        pendingReplies += 1;
        pendingReplyIds.add(a.id);
      }
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8 md:px-5">
      <div>
        <h1 className="font-display text-3xl text-ink">Assignments</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Mentoring queue. Open a founder to review their pack and chat. Teach the
          AI in{" "}
          <Link href="/expert/dna" className="text-accent hover:underline">
            DNA Studio
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Active assignments", value: active.length },
          { label: "Pending replies", value: pendingReplies },
          { label: "Completed reviews", value: completed.length },
        ].map((c) => (
          <div
            key={c.label}
            className="border border-border bg-surface/60 px-4 py-4"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-tertiary">
              {c.label}
            </p>
            <p className="mt-1 font-display text-3xl text-ink">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
          Assignments
        </h2>
        {list.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            No assignments yet. An admin will match you with founders.
          </p>
        ) : (
          <ul className="divide-y divide-border border border-border">
            {list.map((a) => {
              const f = foundersById.get(a.founder_id);
              return (
                <li key={a.id}>
                  <Link
                    href={`/expert/assignments/${a.id}`}
                    className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-ink">
                        {f?.email ?? "Founder"}
                      </p>
                      {f?.summary ? (
                        <p className="truncate text-sm text-ink-secondary">
                          {f.summary}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs">
                      {pendingReplyIds.has(a.id) ? (
                        <span className="font-medium text-challenge">
                          Awaiting your reply
                        </span>
                      ) : null}
                      <span
                        className={
                          a.status === "completed"
                            ? "text-success"
                            : "text-accent"
                        }
                      >
                        {a.status === "completed" ? "Completed" : "Active"}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
