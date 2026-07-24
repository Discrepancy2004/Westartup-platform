import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./reveal";
import { SectionDecor } from "./section-decor";

const AUDIENCES = [
  {
    label: "Pre-seed",
    title: "Founders entering first diligence",
    body: "Need a narrative that survives hard follow-ups.",
    tone: "bg-[var(--mkt-card-mint)]",
    image: "/marketing/panel-advisor.png",
    imageAlt: "Pre-seed founder diligence",
  },
  {
    label: "Solo",
    title: "Builders preparing decks alone",
    body: "Want projections and sizing without a consultant.",
    tone: "bg-[var(--mkt-card-peach)]",
    image: "/marketing/panel-finance.png",
    imageAlt: "Solo builder preparing projections",
  },
  {
    label: "Team",
    title: "Teams rehearsing the room",
    body: "Practice partner-meeting questions before the meeting.",
    tone: "bg-[var(--mkt-card-blue)]",
    image: "/marketing/feature-team.png",
    imageAlt: "Team rehearsing investor meeting",
  },
] as const;

const TAGS = [
  "SaaS",
  "Marketplace",
  "Services",
  "Hardware+",
  "India raises",
  "Pre-launch",
] as const;

export function AudienceCards() {
  return (
    <section
      id="audience"
      className="mkt-field-dark mkt-section relative scroll-mt-20 overflow-hidden"
    >
      <SectionDecor variant="audience" tone="on-dark" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="font-display text-3xl text-[var(--mkt-section-ink)] md:text-4xl">
            Who WeStartup is for
          </h2>
          <p className="text-base text-[var(--mkt-section-muted)] md:text-lg">
            Sharp segments beat a soft, everyone-welcome pitch.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {AUDIENCES.map((a, i) => (
            <Reveal
              key={a.title}
              delayMs={i * 140}
              className={`${a.tone} mkt-card flex min-h-[230px] flex-col items-center p-6 text-center md:p-7`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mkt-card-ink)]/50">
                {a.label}
              </p>
              <div className="relative mt-4 size-16 overflow-hidden rounded-xl">
                <Image
                  src={a.image}
                  alt={a.imageAlt}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[var(--mkt-card-ink)] md:text-xl">
                {a.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-[var(--mkt-card-ink)]/70 md:text-base">
                {a.body}
              </p>
              <Link
                href="/signup"
                className="mt-4 text-sm font-semibold text-[var(--mkt-card-ink)] underline-offset-4 hover:underline"
              >
                Learn more
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={240}>
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {TAGS.map((tag) => (
              <li key={tag}>
                <a
                  href="#resources"
                  className="inline-flex rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-[var(--mkt-section-muted)] transition-colors hover:border-white/30 hover:text-[var(--mkt-section-ink)]"
                >
                  {tag}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
