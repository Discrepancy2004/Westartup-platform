import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="font-display text-xl text-ink">WeStartup</p>
          <p className="max-w-sm text-sm text-ink-secondary">
            From idea to investor-ready in under an hour.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-ink-secondary">
          <a href="#how-it-works" className="hover:text-ink">
            How it works
          </a>
          <a href="#pricing" className="hover:text-ink">
            Pricing
          </a>
          <Link href="/login" className="hover:text-ink">
            Sign in
          </Link>
          <Link href="/signup" className="hover:text-ink">
            Get started
          </Link>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-ink-tertiary">
          © {new Date().getFullYear()} WeStartup. Built for founders who want
          pressure-tested ideas, not applause.
        </p>
      </div>
    </footer>
  );
}
