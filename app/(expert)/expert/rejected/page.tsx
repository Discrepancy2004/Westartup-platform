"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { continueAsFounder } from "@/app/(expert)/actions";
import { RoleShellHeader } from "@/components/shell/role-shell-header";

export default function ExpertRejectedPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <RoleShellHeader title="Expert" links={[]} />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center">
        <h1 className="font-display text-3xl text-ink">Application not approved</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Your Industry Expert application was rejected. You can continue as a
          founder and use the advisor to pressure-test your own startup.
        </p>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <div className="mt-8">
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await continueAsFounder();
                if (result && !result.ok) setError(result.error);
              });
            }}
          >
            {pending ? "Continuing…" : "Continue as founder?"}
          </Button>
        </div>
      </div>
    </>
  );
}
