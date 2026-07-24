import { DashboardMock } from "./dashboard-mock";
import { Reveal } from "./reveal";

export function DashboardPreview() {
  return (
    <section id="preview" className="mkt-band-showcase scroll-mt-20 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="font-display text-3xl text-[var(--mkt-ink)] md:text-4xl">
            Documents you can show
          </h2>
          <p className="text-[var(--mkt-muted)]">
            Idea brief, projections, revenue mix, and market sizing render as
            charts and summaries you can take into meetings.
          </p>
        </Reveal>

        <Reveal delayMs={80} className="mx-auto mt-12 max-w-5xl">
          <div className="overflow-hidden rounded-[var(--mkt-radius)] shadow-[0_32px_70px_-28px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
            <DashboardMock variant="section" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
