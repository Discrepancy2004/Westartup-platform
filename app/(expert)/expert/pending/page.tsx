import Link from "next/link";

export default function ExpertPendingPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center">
      <h1 className="font-display text-3xl text-ink">Application pending</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
        An admin is reviewing your Industry Expert application. You&apos;ll
        receive an email when you&apos;re approved. Until then, this is your
        only screen.
      </p>
      <Link href="/" className="mt-8 text-sm text-accent hover:underline">
        Back to home
      </Link>
    </div>
  );
}
