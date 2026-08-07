"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { startLinkedInConnect } from "@/lib/auth/link-linkedin";

export function ConnectLinkedInCard({
  connected,
  returnTo,
  linkedinUrl = null,
}: {
  connected: boolean;
  returnTo: string;
  linkedinUrl?: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-5 text-left">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
        LinkedIn
      </h2>
      {connected ? (
        <p className="mt-1 text-sm text-ink-secondary">
          Connected
          {linkedinUrl ? (
            <>
              {" · "}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent underline"
              >
                View profile
              </a>
            </>
          ) : null}
          . Name and photo were imported only where those fields were empty.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-secondary">
            Optional. Connect LinkedIn to import your name and photo without
            overwriting anything you’ve already entered.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            disabled={pending}
            onClick={async () => {
              setError(null);
              setPending(true);
              try {
                const { error: linkError } = await startLinkedInConnect(returnTo);
                if (linkError) throw linkError;
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Could not start LinkedIn connect.",
                );
                setPending(false);
              }
            }}
          >
            {pending ? "Redirecting…" : "Connect LinkedIn"}
          </Button>
          {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
        </>
      )}
    </section>
  );
}
