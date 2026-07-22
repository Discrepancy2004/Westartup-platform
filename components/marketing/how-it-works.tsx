const STEPS = [
  {
    n: "01",
    title: "Converse",
    body: "Describe your idea once. The advisor digs into assumptions, market, and traction — and keeps asking until the story holds.",
  },
  {
    n: "02",
    title: "Refine",
    body: "Weak claims get challenged. Strong ones get sharpened. You leave with a clearer narrative, not a pep talk.",
  },
  {
    n: "03",
    title: "Walk away ready",
    body: "Financial projections, revenue breakdowns, and market sizing render as a live analytics dashboard you can take into meetings.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-t border-border bg-surface"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-xl space-y-3">
          <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
            How it works
          </h2>
          <p className="text-ink-secondary">
            Three moves from raw idea to documents investors can actually read.
          </p>
        </div>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step) => (
            <li key={step.n} className="space-y-3 border-t border-border pt-6">
              <p className="text-xs font-medium tracking-[0.14em] text-accent">
                {step.n}
              </p>
              <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
              <p className="text-sm leading-relaxed text-ink-secondary">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
