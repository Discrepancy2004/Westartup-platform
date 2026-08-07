import Link from "next/link";
import { SectionDecor } from "./section-decor";

export function SiteFooter() {
  return (
    <footer className="mkt-field-dark relative overflow-hidden border-t border-white/10">
      <SectionDecor variant="footer" tone="on-dark" />
      <div className="relative z-10 mx-auto grid max-w-5xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          <p className="font-display text-xl text-[var(--mkt-ink)]">WeStartup</p>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--mkt-muted)]">
            From idea to investor-ready in under an hour.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mkt-faint)]">
            Product
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-[var(--mkt-muted)]">
            <li>
              <a href="/#product" className="hover:text-[var(--mkt-ink)]">
                Showcase
              </a>
            </li>
            <li>
              <Link href="/companies" className="hover:text-[var(--mkt-ink)]">
                Directory
              </Link>
            </li>
            <li>
              <a href="/#positioning" className="hover:text-[var(--mkt-ink)]">
                Approach
              </a>
            </li>
            <li>
              <Link href="/signup" className="hover:text-[var(--mkt-ink)]">
                Get started
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mkt-faint)]">
            Company
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-[var(--mkt-muted)]">
            <li>
              <a href="/#audience" className="hover:text-[var(--mkt-ink)]">
                Who it is for
              </a>
            </li>
            <li>
              <a href="/#proof" className="hover:text-[var(--mkt-ink)]">
                Proof
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mkt-faint)]">
            Resources
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-[var(--mkt-muted)]">
            <li>
              <a href="/#resources" className="hover:text-[var(--mkt-ink)]">
                Guides
              </a>
            </li>
            <li>
              <Link href="/login" className="hover:text-[var(--mkt-ink)]">
                Log in
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-[var(--mkt-ink)]">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-4 text-xs text-[var(--mkt-faint)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} WeStartup. Pressure-tested ideas, not
            applause.
          </p>
          <Link href="/privacy" className="hover:text-[var(--mkt-muted)]">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
