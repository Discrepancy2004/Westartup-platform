import Link from "next/link";
import { DashboardMock } from "./dashboard-mock";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Atmosphere — cool wash, not flat white */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 70% 10%, color-mix(in oklab, var(--accent-subtle) 70%, transparent), transparent 55%), linear-gradient(180deg, #eef2f6 0%, var(--canvas) 42%, #e8edf3 100%)",
        }}
      />

      <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col px-6 pb-0 pt-28">
        <div className="animate-fade-up max-w-2xl space-y-6">
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl md:text-7xl">
            WeStartup
          </h1>
          <p className="max-w-xl text-lg text-ink-secondary sm:text-xl">
            From idea to investor-ready in under an hour — pressure-tested by an
            advisor that challenges you, not cheers you on.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/signup"
              className="rounded-[var(--radius-md)] bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Get started free
            </Link>
            <a
              href="#how-it-works"
              className="rounded-[var(--radius-md)] border border-border bg-surface/70 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Full-bleed visual plane within hero — edge-to-edge of content column, bleeds bottom */}
        <div className="animate-fade-up-delay relative mt-14 flex-1 min-h-[280px] sm:min-h-[360px]">
          <div className="absolute inset-x-0 bottom-0 top-0 origin-bottom scale-[1.02] sm:scale-100">
            <DashboardMock variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}
