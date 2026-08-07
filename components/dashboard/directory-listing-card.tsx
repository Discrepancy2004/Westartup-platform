"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateDirectoryListing } from "@/app/(app)/dashboard/directory-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StartupListing } from "@/lib/directory/types";

export function DirectoryListingCard({
  listing,
}: {
  listing: StartupListing | null;
}) {
  const [name, setName] = useState(listing?.name ?? "");
  const [tagline, setTagline] = useState(listing?.tagline ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!listing) {
    return (
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-5 text-left">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
          Public directory
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Your company is not listed yet. Finish onboarding to appear in the
          public directory.
        </p>
        <Link href="/companies" className="mt-3 inline-block text-sm text-accent underline">
          Browse directory
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-5 text-left">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
            Public directory
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">
            Verified listing. Edit the public name and one-liner — starter
            answers stay private.
          </p>
        </div>
        <Link
          href={`/companies/${listing.slug}`}
          className="text-sm text-accent underline"
        >
          View public page
        </Link>
      </div>

      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          startTransition(async () => {
            const result = await updateDirectoryListing({ name, tagline });
            setMessage(result.error ?? "Saved.");
          });
        }}
      >
        <div>
          <Label htmlFor="listing-name">Company name</Label>
          <Input
            id="listing-name"
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            disabled={pending}
          />
        </div>
        <div>
          <Label htmlFor="listing-tagline">One-liner</Label>
          <Textarea
            id="listing-tagline"
            value={tagline}
            maxLength={180}
            rows={3}
            onChange={(event) => setTagline(event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save listing"}
          </Button>
          {message ? (
            <p className="text-xs text-ink-secondary">{message}</p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
