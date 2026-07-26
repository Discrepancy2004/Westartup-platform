"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { markDnaWelcomeSeen } from "@/app/(expert)/dna-actions";

export function DnaWelcomeScreen() {
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col justify-center px-4 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
        Expert DNA Studio
      </p>
      <h1 className="mt-3 font-display text-3xl text-ink text-balance sm:text-4xl">
        Help us preserve your professional legacy
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
        You&apos;re not filling out a form. You&apos;re mentoring thousands of
        founders — one sharp judgment at a time. Each DNA capsule captures how
        you think so WeStartup&apos;s advisor can challenge founders the way you
        would.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
        Start with a two-minute insight. Build coverage over weeks. Interview,
        library, and calibration unlock as the studio grows.
      </p>
      <div className="mt-8">
        <Button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await markDnaWelcomeSeen();
            });
          }}
        >
          {pending ? "Starting…" : "Begin your first DNA capsule"}
        </Button>
      </div>
    </div>
  );
}
