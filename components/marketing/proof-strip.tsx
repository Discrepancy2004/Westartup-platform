import { Reveal } from "./reveal";

const AUDIENCES = [
  "Pre-seed founders",
  "Solo builders",
  "Ops-turned-founders",
  "Teams rehearsing diligence",
] as const;

export function ProofStrip() {
  return (
    <section className="mkt-band-proof border-y border-white/5 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--mkt-faint)]">
            Built for founders entering the room
          </p>
        </Reveal>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {AUDIENCES.map((label, i) => (
            <Reveal key={label} as="li" delayMs={i * 50}>
              <span className="text-sm font-medium text-[var(--mkt-muted)] sm:text-base">
                {label}
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
