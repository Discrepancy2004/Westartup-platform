import Link from "next/link";

export default function ExpertDnaLibraryPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
        Expert DNA Studio
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink">Knowledge Library</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
        Upload white papers, decks, templates, and other material so founders
        inherit your playbooks. Wired later to the platform knowledge base.
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
    </main>
  );
}
