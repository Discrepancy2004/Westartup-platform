import { cn } from "@/lib/utils";

/**
 * Continuous Project Board canvas.
 * Ink depth + restrained DNA accent washes (saturation kept low).
 */
export function BoardCanvas({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-0 overflow-hidden rounded-[var(--radius-lg)]",
        className,
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              180deg,
              color-mix(in srgb, var(--canvas) 92%, #05080f) 0%,
              var(--canvas) 32%,
              color-mix(in srgb, var(--surface) 40%, var(--canvas)) 62%,
              color-mix(in srgb, var(--canvas) 85%, #05080f) 100%
            )
          `,
        }}
      />
      <div
        className="absolute -left-[18%] top-[-6%] h-[38%] w-[62%] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 11%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute -right-[12%] top-[40%] h-[30%] w-[48%] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in srgb, var(--accent-hover) 8%, transparent), transparent 72%)",
        }}
      />
    </div>
  );
}
