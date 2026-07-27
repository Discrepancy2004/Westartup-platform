import Link from "next/link";

export default function ExpertDnaInterviewPage() {
  return (
    <ComingMode
      title="Guided Interview"
      description="A structured 15–20 minute survey of your frameworks, red flags, and decision criteria. Coming in a later sprint."
    />
  );
}

function ComingMode({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
        Expert DNA Studio
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
        {description}
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-ink-tertiary">
        Coming soon
      </p>
      <Link
        href="/expert/dna"
        className="mt-8 text-sm text-accent hover:underline"
      >
        Back to DNA Studio
      </Link>
      <Link
        href="/expert/dna/capsule"
        className="mt-2 text-sm text-ink-secondary hover:text-ink"
      >
        Or add a Quick Insight capsule
      </Link>
    </main>
  );
}
