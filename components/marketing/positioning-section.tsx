import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./reveal";
import { SectionDecor } from "./section-decor";
import { cn } from "@/lib/utils";

type Row = {
  eyebrow: string;
  title: string;
  body: string;
  points: readonly string[];
  tone: string;
  image: string;
  imageAlt: string;
  /** text on left + media on right when false; flipped when true */
  flip: boolean;
};

const ROWS: Row[] = [
  {
    eyebrow: "Advisor",
    title: "Challenging advisor",
    body: "Weak claims get follow-ups. The conversation stays in diligence tone — evidence over applause.",
    points: [
      "Weak claims get follow-ups",
      "Evidence over narrative",
      "Diligence tone",
    ],
    tone: "bg-[var(--mkt-card-mint)]",
    image: "/marketing/panel-advisor.png",
    imageAlt: "Advisor challenge illustration",
    flip: false,
  },
  {
    eyebrow: "Finance",
    title: "Financial modeling",
    body: "INR projections and revenue mix land as documents you can defend — not a slide that collapses under questions.",
    points: ["INR projections", "Revenue mix", "Illustrative YoY paths"],
    tone: "bg-[var(--mkt-card-peach)]",
    image: "/marketing/panel-finance.png",
    imageAlt: "Financial modeling illustration",
    flip: true,
  },
  {
    eyebrow: "Market",
    title: "Market framing",
    body: "TAM / SAM / SOM with channel reality checks, so “huge market” becomes a number you can own.",
    points: ["TAM / SAM / SOM", "Channel reality checks", "Why now pressure"],
    tone: "bg-[var(--mkt-card-blue)]",
    image: "/marketing/panel-market.png",
    imageAlt: "Market sizing illustration",
    flip: false,
  },
  {
    eyebrow: "Documents",
    title: "Idea brief & revenue model",
    body: "One-liner, problem, solution, audience — plus stream mix ready for the slide when the room asks.",
    points: [
      "Idea brief with open challenges",
      "Revenue stream share",
      "Slide-ready narrative",
    ],
    tone: "bg-[var(--mkt-card-cream)]",
    image: "/marketing/feature-idea-brief.png",
    imageAlt: "Idea brief document illustration",
    flip: true,
  },
  {
    eyebrow: "Raise",
    title: "Team & deal structure",
    body: "Coverage gaps investors will probe next, alongside raise amount, stage, and use of funds when you are raising.",
    points: [
      "Team coverage and gaps",
      "Raise amount and stage",
      "Use of funds clarity",
    ],
    tone: "bg-[var(--mkt-card-peach)]",
    image: "/marketing/feature-deal.png",
    imageAlt: "Deal structure illustration",
    flip: false,
  },
];

function MediaCard({
  tone,
  image,
  imageAlt,
  title,
}: {
  tone: string;
  image: string;
  imageAlt: string;
  title: string;
}) {
  return (
    <div
      className={cn(
        tone,
        "overflow-hidden rounded-[var(--mkt-radius)] shadow-[0_24px_50px_-28px_rgba(0,0,0,0.4)]",
      )}
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[5/4]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 48vw"
        />
      </div>
      <div className="border-t border-black/5 px-5 py-3">
        <p className="text-sm font-semibold text-[var(--mkt-card-ink)]">
          {title}
        </p>
      </div>
    </div>
  );
}

function AlternatingRow({ row, index }: { row: Row; index: number }) {
  const textBlock = (
    <div className="flex flex-col justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mkt-section-faint)]">
        {row.eyebrow}
      </p>
      <h3 className="mt-3 font-display text-2xl leading-snug text-[var(--mkt-section-ink)] md:text-3xl">
        {row.title}
      </h3>
      <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--mkt-section-muted)] md:text-lg">
        {row.body}
      </p>
      <ul className="mt-6 space-y-2.5">
        {row.points.map((point) => (
          <li
            key={point}
            className="flex gap-3 text-sm text-[var(--mkt-section-ink)]/85 md:text-base"
          >
            <span
              className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--mkt-accent)]"
              aria-hidden
            />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );

  const mediaBlock = (
    <MediaCard
      tone={row.tone}
      image={row.image}
      imageAlt={row.imageAlt}
      title={row.title}
    />
  );

  return (
    <Reveal
      delayMs={100 + index * 80}
      className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16"
    >
      {/* Mobile: text then media. Desktop: honor flip. */}
      <div className={cn(row.flip ? "md:order-2" : "md:order-1")}>
        {textBlock}
      </div>
      <div className={cn(row.flip ? "md:order-1" : "md:order-2")}>
        {mediaBlock}
      </div>
    </Reveal>
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
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--mkt-accent)] sm:text-[13px]">
            How we work
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.14] md:text-4xl lg:text-[2.75rem]">
            <span className="text-[var(--mkt-section-ink)]">
              Advisory pressure
            </span>
            <br />
            <span className="text-[var(--mkt-accent)]">
              meets investor documents
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg font-sans text-base leading-relaxed text-[var(--mkt-section-muted)] md:text-lg">
            Challenge the narrative in chat, then leave with documents that
            hold up when the questions get sharp.
          </p>
          <div className="mt-7 flex justify-center">
            <Link href="/signup" className="mkt-btn-primary shrink-0">
              Try it free
            </Link>
          </div>
        </Reveal>

        <div className="mt-14 space-y-16 md:mt-20 md:space-y-24">
          {ROWS.map((row, i) => (
            <AlternatingRow key={row.title} row={row} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
