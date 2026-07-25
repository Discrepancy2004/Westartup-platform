import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

type OnboardingAnswers = Record<string, unknown> | null;

export default async function AdminFounderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const supabase = await createClient();
  const { data: founder } = await supabase
    .from("profiles")
    .select(
      "id, email, role, first_login, onboarding, plan_id, subscription_status, created_at, onboarding_completed_at",
    )
    .eq("id", id)
    .eq("role", "founder")
    .maybeSingle();

  if (!founder) notFound();

  const [{ data: assignment }, { data: pendingReview }, { data: artifacts }] =
    await Promise.all([
      supabase
        .from("review_assignments")
        .select("id, expert_id, created_at, status")
        .eq("founder_id", id)
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("review_requests")
        .select("id, note, created_at")
        .eq("founder_id", id)
        .eq("status", "pending")
        .maybeSingle(),
      supabase
        .from("artifacts")
        .select("kind, title, updated_at")
        .eq("user_id", id)
        .order("updated_at", { ascending: false }),
    ]);

  let expertEmail: string | null = null;
  if (assignment?.expert_id) {
    const { data: expert } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", assignment.expert_id)
      .maybeSingle();
    expertEmail = expert?.email ?? null;
  }

  const onboarding = founder.onboarding as OnboardingAnswers;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/founders"
          className="text-sm text-accent hover:underline"
        >
          ← Founders
        </Link>
        <h1 className="mt-3 font-display text-3xl text-ink">
          {founder.email ?? "Founder"}
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Joined {new Date(founder.created_at).toLocaleString()}
        </p>
      </div>

      <dl className="grid gap-4 border border-border sm:grid-cols-2">
        <div className="px-4 py-3">
          <dt className="text-[11px] uppercase tracking-wide text-ink-tertiary">
            Onboarding
          </dt>
          <dd className="mt-1 text-sm text-ink">
            {founder.first_login ? "Not completed" : "Completed"}
            {founder.onboarding_completed_at
              ? ` · ${new Date(founder.onboarding_completed_at).toLocaleDateString()}`
              : ""}
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-[11px] uppercase tracking-wide text-ink-tertiary">
            Plan
          </dt>
          <dd className="mt-1 text-sm text-ink">
            {founder.plan_id ?? "none"} · {founder.subscription_status}
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-[11px] uppercase tracking-wide text-ink-tertiary">
            Assignment
          </dt>
          <dd className="mt-1 text-sm text-ink">
            {assignment
              ? `Active → ${expertEmail ?? "expert"}`
              : "Unassigned"}
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-[11px] uppercase tracking-wide text-ink-tertiary">
            Review request
          </dt>
          <dd className="mt-1 text-sm text-ink">
            {pendingReview
              ? pendingReview.note || "Pending (no note)"
              : "None open"}
          </dd>
        </div>
      </dl>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
          Onboarding answers
        </h2>
        {onboarding ? (
          <pre className="overflow-x-auto border border-border bg-surface/50 p-4 text-xs text-ink-secondary">
            {JSON.stringify(onboarding, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-ink-secondary">No onboarding data.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
          Artifacts
        </h2>
        {(artifacts ?? []).length === 0 ? (
          <p className="text-sm text-ink-secondary">No artifacts yet.</p>
        ) : (
          <ul className="divide-y divide-border border border-border">
            {(artifacts ?? []).map((a) => (
              <li
                key={a.kind}
                className="flex items-center justify-between px-4 py-2.5 text-sm"
              >
                <span className="text-ink">{a.title}</span>
                <span className="text-xs text-ink-tertiary">{a.kind}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!assignment ? (
        <p className="text-sm text-ink-secondary">
          To match an expert, use{" "}
          <Link
            href="/admin/experts/assignments"
            className="text-accent hover:underline"
          >
            Assignments
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
