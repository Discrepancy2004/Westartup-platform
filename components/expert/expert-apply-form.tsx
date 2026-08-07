"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitExpertApplication } from "@/app/(expert)/actions";

export function ExpertApplyForm({
  defaultFullName = "",
}: {
  defaultFullName?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mx-auto w-full max-w-md space-y-5"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await submitExpertApplication(formData);
          if (result && !result.ok) {
            setError(result.error);
          }
        });
      }}
    >
      <div className="space-y-1">
        <h1 className="font-display text-2xl text-ink">Industry Expert application</h1>
        <p className="text-sm text-ink-secondary">
          Tell us who you are. An admin will review before you can mentor founders.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          name="full_name"
          required
          disabled={pending}
          defaultValue={defaultFullName}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="company">Company</Label>
        <Input id="company" name="company" required disabled={pending} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cv">Resume / CV</Label>
        <Input
          id="cv"
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf"
          disabled={pending}
          className="cursor-pointer file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
        />
        <p className="text-xs text-ink-tertiary">PDF or Word, max 5 MB.</p>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
