import { Reveal } from "./reveal";

const FOR = [
  {
    title: "Hard questions first",
    body: "Founders who want pressure before the partner meeting.",
    tone: "bg-[var(--mkt-card-mint)]",
  },
  {
    title: "INR-ready docs",
    body: "Builders who need projections and market sizing without a consultant.",
    tone: "bg-[var(--mkt-card-cream)]",
  },
  {
    title: "Diligence rehearsal",
    body: "Teams practicing follow-ups before the room gets sharp.",
    tone: "bg-[var(--mkt-card-blue)]",
  },
] as const;

const NOT_FOR = [
  "Motivational AI or pitch-deck templates alone",
  "Validation without evidence",
  "Enterprise procurement / CRM workflows",
] as const;

export function WhoItsFor() {
  return (
    <section id="who" className="mkt-band-audience scroll-mt-20 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="font-display text-3xl text-[var(--mkt-ink)] md:text-4xl">
            Who it is for
          </h2>
          <p className="text-[var(--mkt-muted)]">
            Sharp positioning beats a wider, softer audience.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {FOR.map((item, i) => (
            <Reveal
              key={item.title}
              delayMs={i * 70}
              className={`${item.tone} mkt-card p-6 md:p-7`}
            >
              <h3 className="text-lg font-semibold text-[var(--mkt-card-ink)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--mkt-card-ink)]/75">
                {item.body}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={120} className="mt-4 mkt-card bg-[var(--mkt-card-peach)] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mkt-card-ink)]/50">
            Not for
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {NOT_FOR.map((item) => (
              <li
                key={item}
                className="text-sm leading-relaxed text-[var(--mkt-card-ink)]/80"
              >
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
