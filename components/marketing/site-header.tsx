import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const NAV = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#difference", label: "Difference" },
  { href: "#preview", label: "Output" },
  { href: "#pricing", label: "Pricing" },
] as const;

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-lg tracking-tight text-ink"
          aria-label="WeStartup home"
        >
          WeStartup
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-ink-secondary transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden text-sm text-ink-secondary transition-colors hover:text-ink sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-[var(--radius-md)] bg-accent px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Get started free
          </Link>
        </div>
      </div>
    </header>
  );
}
