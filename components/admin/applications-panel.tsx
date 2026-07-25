"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  approveExpertApplication,
  rejectExpertApplication,
} from "@/app/(admin)/admin/actions";

export type PendingAppRow = {
  id: string;
  full_name: string;
  company: string;
  cv_path: string | null;
  created_at: string;
  email: string | null;
};

export function ApplicationsPanel({
  applications,
}: {
  applications: PendingAppRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {applications.length === 0 ? (
        <p className="text-sm text-ink-secondary">No pending applications.</p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {applications.map((app) => (
            <li
              key={app.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-ink">{app.full_name}</p>
                <p className="text-sm text-ink-secondary">
                  {app.company}
                  {app.email ? ` · ${app.email}` : ""}
                </p>
                <p className="text-xs text-ink-tertiary">
                  {new Date(app.created_at).toLocaleString()}
                  {app.cv_path ? " · CV uploaded" : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => approveExpertApplication(app.id))}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pending}
                  onClick={() => run(() => rejectExpertApplication(app.id))}
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
