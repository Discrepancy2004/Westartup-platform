import { Reveal } from "./reveal";

const CARDS = [
  {
    n: "01",
    title: "Converse",
    body: "Describe your idea once. The advisor digs into assumptions, market, and traction until the story holds.",
    tone: "bg-[var(--mkt-card-mint)]",
    span: "md:col-span-7 md:row-span-2",
  },
  {
    n: "02",
    title: "Refine",
    body: "Weak claims get challenged. Strong ones get sharpened.",
    tone: "bg-[var(--mkt-card-peach)]",
    span: "md:col-span-5",
  },
  {
    n: "03",
    title: "Documents",
    body: "Projections, revenue mix, and market sizing land on a live dashboard.",
    tone: "bg-[var(--mkt-card-blue)]",
    span: "md:col-span-5",
  },
  {
    n: "04",
    title: "Stress-test",
    body: "Practice the hard follow-ups before a partner meeting, not during it.",
    tone: "bg-[var(--mkt-card-cream)]",
    span: "md:col-span-12",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mkt-band-features scroll-mt-20 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="font-display text-3xl text-[var(--mkt-ink)] md:text-4xl">
            Everything starts with the conversation
          </h2>
          <p className="text-[var(--mkt-muted)]">
            Four moves from raw idea to documents investors can actually read.
          </p>
        </Reveal>

        <div className="mt-12 grid auto-rows-fr gap-4 md:grid-cols-12 md:grid-rows-[minmax(160px,auto)_minmax(160px,auto)]">
          {CARDS.map((card, i) => (
            <Reveal
              key={card.n}
              delayMs={i * 70}
              className={`${card.span} ${card.tone} mkt-card flex min-h-[160px] flex-col justify-between p-6 md:p-8`}
            >
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-[0.14em] text-[var(--mkt-card-ink)]/50">
                  {card.n}
                </p>
                <h3 className="text-xl font-semibold text-[var(--mkt-card-ink)] md:text-2xl">
                  {card.title}
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-[var(--mkt-card-ink)]/75 md:text-base">
                  {card.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
