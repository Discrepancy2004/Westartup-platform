import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

type Onboarding = {
  idea?: { description?: string };
} | null;

export default async function AdminExpertDetailPage({
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
  const { data: expert } = await supabase
    .from("profiles")
    .select("id, email, created_at")
    .eq("id", id)
    .eq("role", "expert")
    .maybeSingle();

  if (!expert) notFound();

  const [{ data: app }, { data: assignments }] = await Promise.all([
    supabase
      .from("expert_applications")
      .select("full_name, company, created_at")
      .eq("user_id", id)
      .eq("status", "approved")
      .maybeSingle(),
    supabase
      .from("review_assignments")
      .select("id, founder_id, created_at, status")
      .eq("expert_id", id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ]);

  const founderIds = [...new Set((assignments ?? []).map((a) => a.founder_id))];
  const foundersById = new Map<
    string,
    { email: string | null; idea: string | null; first_login: boolean }
  >();

  if (founderIds.length > 0) {
    const { data: founders } = await supabase
      .from("profiles")
      .select("id, email, first_login, onboarding")
      .in("id", founderIds);
    for (const f of founders ?? []) {
      const onboarding = f.onboarding as Onboarding;
      const idea = onboarding?.idea?.description?.trim() ?? null;
      foundersById.set(f.id, {
        email: f.email,
        idea: idea ? idea.slice(0, 140) : null,
        first_login: f.first_login ?? true,
      });
    }
  }

  const displayName =
    app?.full_name ?? expert.email?.split("@")[0] ?? "Expert";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/experts"
          className="text-sm text-accent hover:underline"
        >
          ← All experts
        </Link>
        <h1 className="mt-3 font-display text-3xl text-ink">{displayName}</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          {[app?.company, expert.email].filter(Boolean).join(" · ")}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
          Assigned founders
        </h2>
        {(assignments ?? []).length === 0 ? (
          <p className="text-sm text-ink-secondary">
            No founders assigned yet.{" "}
            <Link
              href="/admin/experts/assignments"
              className="text-accent hover:underline"
            >
              Assign from Assignments
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-border border border-border">
            {(assignments ?? []).map((a) => {
              const f = foundersById.get(a.founder_id);
              return (
                <li key={a.id}>
                  <Link
                    href={`/admin/founders/${a.founder_id}`}
                    className="block px-4 py-3 transition-colors hover:bg-surface"
                  >
                    <p className="font-medium text-ink">
                      {f?.email ?? "Founder"}
                    </p>
                    {f?.idea ? (
                      <p className="mt-0.5 text-sm text-ink-secondary">
                        {f.idea}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-sm text-ink-tertiary">
                        {f?.first_login
                          ? "Has not completed onboarding"
                          : "No idea summary"}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-ink-tertiary">
                      Assigned {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
