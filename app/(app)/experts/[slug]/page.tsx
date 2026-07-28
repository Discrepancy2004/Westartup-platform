import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app/app-header";
import { EXPERT_PLACEHOLDERS } from "@/lib/experts/placeholders";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ExpertDetailPage({ params }: Props) {
  const { slug } = await params;
  const expert = EXPERT_PLACEHOLDERS.find((entry) => entry.slug === slug);

  if (!expert) {
    notFound();
  }

  return (
    <div className="min-h-[100svh]">
      <AppHeader active="experts" />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/experts" className="text-sm text-accent underline">
          Back to experts
        </Link>

        <section className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
            Expert profile
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink">{expert.name}</h1>
          <p className="mt-2 text-sm text-accent">{expert.specialty}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
            {expert.note}
          </p>

          <div className="mt-8 rounded-[var(--radius-md)] border border-dashed border-border px-4 py-6 text-center">
            <p className="font-medium text-ink">Coming soon...</p>
            <p className="mt-2 text-sm text-ink-secondary">
              Detailed expert profiles will land here soon.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
