import { ChatPreview } from "./chat-preview";
import { Reveal } from "./reveal";

const POINTS = [
  {
    title: "Assumptions get stress-tested",
    body: "Every claim invites a follow-up: what is the evidence, who pays, and why now?",
    tone: "bg-[var(--mkt-card-mint)]",
  },
  {
    title: "Viability over vibes",
    body: "Conversation steers toward marketability, unit economics, and deal readiness.",
    tone: "bg-[var(--mkt-card-peach)]",
  },
  {
    title: "Expert-informed judgment",
    body: "Advisor reasoning follows startup evaluation methodology, so answers sound like diligence.",
    tone: "bg-[var(--mkt-card-blue)]",
  },
] as const;

export function ChallengeDemo() {
  return (
    <section id="difference" className="mkt-band-challenge scroll-mt-20 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="font-display text-3xl text-[var(--mkt-ink)] md:text-4xl">
            Not a yes-man
          </h2>
          <p className="text-[var(--mkt-muted)]">
            Most AI tools validate. WeStartup prepares you for the room where
            nobody is polite.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <Reveal
            delayMs={60}
            className="overflow-hidden rounded-[var(--mkt-radius)] shadow-[0_28px_60px_-24px_rgba(0,0,0,0.5)] ring-1 ring-white/10 lg:col-span-7"
          >
            <ChatPreview compact />
          </Reveal>

          <div className="flex flex-col gap-4 lg:col-span-5">
            {POINTS.map((item, i) => (
              <Reveal
                key={item.title}
                delayMs={100 + i * 70}
                className={`${item.tone} mkt-card flex-1 p-5 md:p-6`}
              >
                <h3 className="font-semibold text-[var(--mkt-card-ink)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--mkt-card-ink)]/75">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
