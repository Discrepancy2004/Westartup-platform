export function Differentiator() {
  return (
    <section
      id="difference"
      className="scroll-mt-20 border-t border-border bg-canvas"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-12 md:gap-16 md:py-28">
        <div className="md:col-span-5 space-y-4">
          <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
            Not a yes-man
          </h2>
          <p className="text-ink-secondary">
            Most AI tools validate. WeStartup is built to prepare you for the
            room where nobody is polite.
          </p>
        </div>

        <ul className="md:col-span-7 space-y-0">
          {[
            {
              title: "Assumptions get stress-tested",
              body: "Every claim invites a follow-up: what’s the evidence, who pays, and why now?",
            },
            {
              title: "Viability over vibes",
              body: "Conversation steers toward marketability, unit economics, and deal readiness — not encouragement.",
            },
            {
              title: "Expert-informed judgment",
              body: "Advisor reasoning is structured around startup evaluation methodology — so answers sound like diligence, not brainstorming.",
            },
          ].map((item) => (
            <li
              key={item.title}
              className="border-t border-border py-6 first:border-t-0 first:pt-0 last:pb-0"
            >
              <h3 className="font-medium text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
