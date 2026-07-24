import Link from "next/link";
import { Reveal } from "./reveal";
import { SectionDecor } from "./section-decor";

export function FinalCta() {
  return (
    <section className="mkt-field-teal mkt-section relative overflow-hidden">
      <SectionDecor variant="cta" tone="on-teal" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <Reveal className="relative rounded-[var(--mkt-radius)] bg-white px-8 py-10 text-center shadow-[0_30px_70px_-28px_rgba(0,0,0,0.4)] md:px-12 md:py-14">
          <h2 className="font-display text-3xl font-semibold text-[var(--mkt-card-ink)] md:text-4xl">
            Ready for a harder conversation?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-[var(--mkt-card-ink)]/70 md:text-lg">
            Start free. Bring your idea. Leave with documents that hold up when
            the questions get sharp.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="mkt-btn-dark">
              Get started
            </Link>
            <a href="#product" className="mkt-btn-ghost-on-light">
              See the product
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
