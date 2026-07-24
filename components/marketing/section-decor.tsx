import { cn } from "@/lib/utils";

export type DecorTone = "on-dark" | "on-teal" | "on-mist";

export type DecorVariant =
  | "hero"
  | "product"
  | "featured"
  | "proof"
  | "positioning"
  | "audience"
  | "resources"
  | "cta"
  | "footer";

type SectionDecorProps = {
  variant: DecorVariant;
  tone: DecorTone;
  className?: string;
};

function AccentBlob({
  className,
  color = "mint",
  delay,
}: {
  className?: string;
  color?: "mint" | "peach" | "cream" | "accent";
  delay?: 1 | 2 | 3;
}) {
  const fill =
    color === "mint"
      ? "var(--mkt-decor-mint)"
      : color === "peach"
        ? "var(--mkt-decor-peach)"
        : color === "cream"
          ? "var(--mkt-decor-cream)"
          : "var(--mkt-decor-accent)";

  return (
    <span
      className={cn(
        "absolute rounded-full",
        delay === 1
          ? "mkt-float-delay-1"
          : delay === 2
            ? "mkt-float-delay-2"
            : delay === 3
              ? "mkt-float-delay-3"
              : "mkt-float",
        className,
      )}
      style={{ background: fill }}
      aria-hidden
    />
  );
}

function VariantDecor({ variant }: { variant: DecorVariant }) {
  switch (variant) {
    case "hero":
      return (
        <>
          <AccentBlob
            className="right-[14%] top-[22%] size-3 rotate-45 rounded-sm md:size-3.5"
            color="peach"
            delay={2}
          />
          <AccentBlob
            className="bottom-[18%] left-[18%] h-2 w-12 rounded-full md:w-14"
            color="cream"
            delay={1}
          />
        </>
      );

    case "product":
      return (
        <>
          <AccentBlob
            className="right-[4%] top-[6%] h-2.5 w-10 rounded-full"
            color="peach"
            delay={2}
          />
          <AccentBlob
            className="left-[4%] top-[12%] size-3.5"
            color="mint"
            delay={1}
          />
        </>
      );

    case "featured":
      return (
        <>
          <AccentBlob
            className="left-[6%] top-[16%] size-3.5"
            color="accent"
            delay={1}
          />
          <AccentBlob
            className="bottom-[14%] right-[18%] size-2.5 rotate-12 rounded-sm"
            color="mint"
            delay={3}
          />
        </>
      );

    case "proof":
      return (
        <>
          <AccentBlob
            className="right-[10%] top-[12%] size-3.5"
            color="accent"
          />
          <AccentBlob
            className="bottom-[10%] left-[12%] h-2 w-9 rounded-full"
            color="peach"
            delay={2}
          />
        </>
      );

    case "positioning":
      return (
        <>
          <AccentBlob
            className="right-[12%] top-[20%] size-3 rotate-45 rounded-sm"
            color="peach"
            delay={2}
          />
          <AccentBlob
            className="left-[8%] top-[14%] size-3"
            color="mint"
            delay={1}
          />
        </>
      );

    case "audience":
      return (
        <>
          <AccentBlob
            className="right-[8%] top-[14%] size-3.5"
            color="cream"
            delay={1}
          />
          <AccentBlob
            className="bottom-[12%] right-[20%] size-2.5"
            color="accent"
            delay={3}
          />
        </>
      );

    case "resources":
      return (
        <>
          <AccentBlob
            className="right-[16%] top-[10%] size-3.5"
            color="peach"
            delay={2}
          />
          <AccentBlob
            className="bottom-[12%] right-[8%] h-2 w-9 rounded-full"
            color="mint"
            delay={1}
          />
        </>
      );

    case "cta":
      return (
        <>
          <AccentBlob
            className="right-[10%] top-[22%] size-2.5 rotate-45 rounded-sm"
            color="peach"
            delay={1}
          />
          <AccentBlob
            className="left-[14%] bottom-[20%] h-2 w-9 rounded-full"
            color="cream"
            delay={2}
          />
          <AccentBlob
            className="right-[18%] bottom-[16%] size-3.5 border-2 border-[var(--mkt-decor-accent)] bg-transparent"
            color="accent"
            delay={3}
          />
        </>
      );

    case "footer":
      return (
        <>
          <AccentBlob
            className="left-[10%] top-[30%] size-2"
            color="accent"
          />
          <AccentBlob
            className="left-[18%] bottom-[28%] size-1.5"
            color="mint"
            delay={2}
          />
        </>
      );

    default:
      return null;
  }
}

export function SectionDecor({ variant, tone, className }: SectionDecorProps) {
  const toneClass =
    tone === "on-dark"
      ? "mkt-decor-on-dark"
      : tone === "on-mist"
        ? "mkt-decor-on-mist"
        : "mkt-decor-on-teal";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        toneClass,
        className,
      )}
      aria-hidden
    >
      <VariantDecor variant={variant} />
    </div>
  );
}
