import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

export default async function ExpertProfilePage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="p-8 text-sm text-ink-secondary">Supabase is not configured.</p>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: app } = await supabase
    .from("expert_applications")
    .select("full_name, company, expertise, bio, cv_path, status")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();

  let cvUrl: string | null = null;
  if (app?.cv_path) {
    const { data } = await supabase.storage
      .from("expert-cvs")
      .createSignedUrl(app.cv_path, 60 * 60);
    cvUrl = data?.signedUrl ?? null;
  }

  const rows = [
    { label: "Name", value: app?.full_name ?? "—" },
    { label: "Company", value: app?.company ?? "—" },
    { label: "Expertise", value: app?.expertise?.trim() || "—" },
    { label: "Bio", value: app?.bio?.trim() || "—" },
    { label: "Email", value: user.email ?? "—" },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8 md:px-5">
      <div>
        <h1 className="font-display text-3xl text-ink">My profile</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          From your approved application. Editing comes later.
        </p>
      </div>

      <dl className="divide-y divide-border border border-border">
        {rows.map((r) => (
          <div key={r.label} className="px-4 py-3">
            <dt className="text-[11px] uppercase tracking-wide text-ink-tertiary">
              {r.label}
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">
              {r.value}
            </dd>
          </div>
        ))}
        <div className="px-4 py-3">
          <dt className="text-[11px] uppercase tracking-wide text-ink-tertiary">
            Resume / CV
          </dt>
          <dd className="mt-1 text-sm text-ink">
            {cvUrl ? (
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Download CV
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>
    </main>
  );
}
