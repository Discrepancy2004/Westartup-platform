import { DashboardMock } from "./dashboard-mock";

export function DashboardPreview() {
  return (
    <section
      id="preview"
      className="scroll-mt-20 border-t border-border bg-surface"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mx-auto max-w-xl space-y-3 text-center">
          <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
            Documents you can show
          </h2>
          <p className="text-ink-secondary">
            Every artifact becomes a chart or visual summary — projections, revenue
            mix, market sizing — not a wall of prose.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl">
          <DashboardMock variant="section" />
        </div>
      </div>
    </section>
  );
}
