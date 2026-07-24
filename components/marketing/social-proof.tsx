import Link from "next/link";
import { Reveal } from "./reveal";
import { SectionDecor } from "./section-decor";

const ITEMS = [
  {
    type: "stat" as const,
    value: "<1 hr",
    label: "Typical path from onboarding to first documents",
    tone: "bg-[var(--mkt-card-mint)]",
    span: "md:col-span-4 md:row-span-2",
  },
  {
    type: "quote" as const,
    quote:
      "It asked the exact TAM follow-up I was hoping investors would not ask first.",
    attr: "Pre-seed founder, B2B SaaS",
    tone: "bg-[var(--mkt-card-cream)]",
    span: "md:col-span-5",
  },
  {
    type: "stat" as const,
    value: "6",
    label: "Artifact kinds on the live dashboard",
    tone: "bg-[var(--mkt-card-blue)]",
    span: "md:col-span-3",
  },
  {
    type: "quote" as const,
    quote: "Felt like diligence rehearsal, not another brainstorming chatbot.",
    attr: "Solo builder, marketplace",
    tone: "bg-[var(--mkt-card-peach)]",
    span: "md:col-span-4",
  },
  {
    type: "stat" as const,
    value: "INR",
    label: "Projections and market sizing framed for Indian raises",
    tone: "bg-[var(--mkt-card-cream)]",
    span: "md:col-span-4",
  },
] as const;

export function SocialProof() {
  return (
    <section
      id="proof"
      className="mkt-field-mist mkt-section relative scroll-mt-20 overflow-hidden"
    >
      <SectionDecor variant="proof" tone="on-mist" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="font-display text-3xl text-[var(--mkt-section-ink)] md:text-4xl">
            Built for the room that does not clap
          </h2>
          <p className="text-base text-[var(--mkt-section-muted)] md:text-lg">
            Early signals from founders using WeStartup to rehearse diligence,
            not collect compliments.
          </p>
        </Reveal>

        <Reveal delayMs={160}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--mkt-section-muted)]">
            <p>
              <span className="font-semibold text-[var(--mkt-section-ink)]">
                4.8
              </span>{" "}
              · Advisor clarity (internal)
            </p>
            <p>
              <span className="font-semibold text-[var(--mkt-section-ink)]">
                4.6
              </span>{" "}
              · Document usefulness (internal)
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          {ITEMS.map((item, i) => (
            <Reveal
              key={item.type === "stat" ? item.value + item.label : item.quote}
              delayMs={i * 100}
              className={`${item.tone} ${item.span} mkt-card p-6 md:p-8 ${item.span.includes("row-span") ? "flex flex-col justify-center" : ""}`}
            >
              {item.type === "stat" ? (
                <>
                  <p className="font-display text-4xl text-[var(--mkt-card-ink)] md:text-5xl">
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--mkt-card-ink)]/70 md:text-base">
                    {item.label}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base leading-relaxed text-[var(--mkt-card-ink)] md:text-lg">
                    “{item.quote}”
                  </p>
                  <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-[var(--mkt-card-ink)]/50">
                    {item.attr}
                  </p>
                </>
              )}
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={240}>
          <p className="mt-10 text-center">
            <Link
              href="#resources"
              className="text-sm font-semibold text-[var(--mkt-section-ink)] underline-offset-4 hover:underline"
            >
              See all reviews
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
