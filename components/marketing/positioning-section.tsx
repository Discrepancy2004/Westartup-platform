import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./reveal";
import { SectionDecor } from "./section-decor";

const PANELS = [
  {
    title: "Challenging advisor",
    best: [
      "Weak claims get follow-ups",
      "Evidence over narrative",
      "Diligence tone",
    ],
    tone: "bg-[var(--mkt-card-mint)]",
    image: "/marketing/panel-advisor.png",
    imageAlt: "Advisor challenge illustration",
  },
  {
    title: "Financial modeling",
    best: ["INR projections", "Revenue mix", "Illustrative YoY paths"],
    tone: "bg-[var(--mkt-card-peach)]",
    image: "/marketing/panel-finance.png",
    imageAlt: "Financial modeling illustration",
  },
  {
    title: "Market framing",
    best: ["TAM / SAM / SOM", "Channel reality checks", "Why now pressure"],
    tone: "bg-[var(--mkt-card-blue)]",
    image: "/marketing/panel-market.png",
    imageAlt: "Market sizing illustration",
  },
] as const;

const FEATURES = [
  {
    title: "Idea brief",
    body: "One-liner, problem, solution, audience, open challenges.",
    tone: "bg-[var(--mkt-card-cream)]",
    image: "/marketing/feature-idea-brief.png",
    imageAlt: "Idea brief document illustration",
  },
  {
    title: "Revenue model",
    body: "Stream mix and share of revenue, ready for the slide.",
    tone: "bg-[var(--mkt-card-mint)]",
    image: "/marketing/feature-revenue.png",
    imageAlt: "Revenue charts illustration",
  },
  {
    title: "Team overview",
    body: "Coverage and gaps investors will ask about next.",
    tone: "bg-[var(--mkt-card-blue)]",
    image: "/marketing/feature-team.png",
    imageAlt: "Team overview illustration",
  },
  {
    title: "Deal structure",
    body: "Raise amount, stage, and use of funds when you are raising.",
    tone: "bg-[var(--mkt-card-peach)]",
    image: "/marketing/feature-deal.png",
    imageAlt: "Deal structure illustration",
  },
] as const;

function PanelCard({
  title,
  best,
  tone,
  image,
  imageAlt,
  className,
}: {
  title: string;
  best: readonly string[];
  tone: string;
  image: string;
  imageAlt: string;
  className?: string;
}) {
  return (
    <div
      className={`${tone} mkt-card flex flex-col items-center p-6 text-center shadow-[0_20px_48px_-24px_rgba(0,0,0,0.35)] md:p-7 ${className ?? ""}`}
    >
      <div className="relative mb-4 size-16 overflow-hidden rounded-xl sm:size-20">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
      <h3 className="text-xl font-semibold text-[var(--mkt-card-ink)] md:text-[1.35rem]">
        {title}
      </h3>
      <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-card-ink)]/45">
        Best for
      </p>
      <ul className="mt-2 space-y-2 text-sm text-[var(--mkt-card-ink)]/75 md:text-base">
        {best.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

export function PositioningSection() {
  return (
    <section
      id="positioning"
      className="mkt-field-teal mkt-section relative scroll-mt-20 overflow-hidden"
    >
      <SectionDecor variant="positioning" tone="on-teal" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <Reveal className="max-w-lg">
            <h2 className="font-display text-3xl leading-[1.14] text-[var(--mkt-section-ink)] md:text-4xl">
              Advisory pressure
              <br />
              meets investor documents
            </h2>
          </Reveal>
          <Reveal delayMs={120} className="sm:pt-1">
            <Link href="/signup" className="mkt-btn-primary shrink-0">
              Try it free
            </Link>
          </Reveal>
        </div>

        <Reveal delayMs={180}>
          <div className="relative mt-10 md:mt-12">
            <div className="flex flex-col gap-3 md:hidden">
              {PANELS.map((panel) => (
                <PanelCard key={panel.title} {...panel} />
              ))}
            </div>

            <div className="relative hidden min-h-[500px] md:block lg:min-h-[540px]">
              <PanelCard
                {...PANELS[0]}
                className="absolute left-0 top-0 z-10 w-[47%] min-h-[260px]"
              />
              <PanelCard
                {...PANELS[1]}
                className="absolute right-0 top-0 z-10 w-[47%] min-h-[260px]"
              />
              <PanelCard
                {...PANELS[2]}
                className="absolute left-1/2 top-[40%] z-20 w-[48%] min-h-[260px] -translate-x-1/2"
              />
            </div>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal
              key={f.title}
              delayMs={i * 120}
              className={`${f.tone} mkt-card overflow-hidden text-center`}
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <Image
                  src={f.image}
                  alt={f.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-5 md:p-6">
                <h3 className="text-lg font-semibold text-[var(--mkt-card-ink)]">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--mkt-card-ink)]/70 md:text-base">
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
