import Link from "next/link";

export default function ExpertDnaCalibratePage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
        Expert DNA Studio
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink">AI Calibration</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
        Review and refine AI-generated recommendations so the advisor reasons
        more like you. For now, calibrate by reviewing assigned founders under
        Assignments.
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-ink-tertiary">
        Coming soon
      </p>
      <div className="mt-8 flex flex-col gap-2">
        <Link href="/expert" className="text-sm text-accent hover:underline">
          Go to Assignments
        </Link>
        <Link
          href="/expert/dna"
          className="text-sm text-ink-secondary hover:text-ink"
        >
          Back to DNA Studio
        </Link>
      </div>
    </main>
  );
}
