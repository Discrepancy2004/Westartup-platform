import Link from "next/link";
import { AppHeader } from "@/components/app/app-header";
import { EXPERT_PLACEHOLDERS } from "@/lib/experts/placeholders";

export default function ExpertsPage() {
  return (
    <div className="min-h-[100svh]">
      <AppHeader active="experts" />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="max-w-2xl space-y-2">
          <h1 className="font-display text-3xl text-ink">Meet your experts</h1>
          <p className="text-sm text-ink-secondary">
            Scale founders get direct follow-up from the WeStartup expert bench.
            These are placeholder profiles for now.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {EXPERT_PLACEHOLDERS.map((expert) => (
            <Link
              key={expert.slug}
              href={`/experts/${expert.slug}`}
              className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 transition-colors hover:border-accent/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{expert.name}</p>
                  <p className="mt-1 text-sm text-accent">{expert.specialty}</p>
                </div>
                <span className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
                  Placeholder
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
                {expert.note}
              </p>
              <p className="mt-4 text-sm font-medium text-accent">Open profile</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
