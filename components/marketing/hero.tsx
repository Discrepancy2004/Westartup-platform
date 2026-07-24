import Link from "next/link";
import { SectionDecor } from "./section-decor";

const PLACEHOLDERS = [
  "Pre-seed",
  "Solo founders",
  "Ops builders",
  "Diligence prep",
  "INR raises",
] as const;

export function Hero() {
  return (
    <section className="mkt-field-dark mkt-section relative overflow-hidden pt-20 md:pt-24">
      <SectionDecor variant="hero" tone="on-dark" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="animate-fade-up mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mkt-accent)] sm:text-sm">
          WeStartup
        </p>
        <h1 className="animate-hero-title font-display text-4xl font-bold leading-[1.08] text-[var(--mkt-section-ink)] sm:text-5xl md:text-6xl lg:text-[4.25rem] lg:leading-[1.05]">
          Pressure-test the idea.
          <br />
          Walk in ready.
        </h1>
        <p className="animate-fade-up-delay mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--mkt-section-muted)] sm:text-lg md:text-xl md:leading-relaxed">
          WeStartup is an AI advisor that challenges weak assumptions, then
          leaves you with investor-ready documents, not applause.
        </p>
        <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className="mkt-btn-primary">
            Get started
          </Link>
          <a href="#product" className="mkt-btn-ghost text-[var(--mkt-section-ink)]">
            See the product
          </a>
        </div>
      </div>

      <div className="animate-fade-up-delay-3 relative z-10 mx-auto mt-14 max-w-4xl border-t border-white/10 pt-8">
        <p className="text-center text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--mkt-section-faint)] sm:text-xs">
          Built for
        </p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {PLACEHOLDERS.map((label) => (
            <li
              key={label}
              className="text-sm font-medium tracking-wide text-[var(--mkt-section-muted)]/85 sm:text-base"
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
