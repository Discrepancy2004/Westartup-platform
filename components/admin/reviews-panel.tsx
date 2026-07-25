"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { assignExpertToRequest } from "@/app/(admin)/admin/actions";

export type PendingReviewRow = {
  id: string;
  note: string | null;
  created_at: string;
  founder_email: string | null;
  founder_id: string;
};

export type ExpertOption = {
  id: string;
  name: string;
  email: string | null;
};

export function ReviewsPanel({
  requests,
  experts,
}: {
  requests: PendingReviewRow[];
  experts: ExpertOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [assignMap, setAssignMap] = useState<Record<string, string>>({});

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
      {requests.length === 0 ? (
        <p className="text-sm text-ink-secondary">No pending founder reviews.</p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {requests.map((req) => (
            <li
              key={req.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-end sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-ink">
                  {req.founder_email ?? "Founder"}
                </p>
                {req.note ? (
                  <p className="text-sm text-ink-secondary">{req.note}</p>
                ) : (
                  <p className="text-sm text-ink-tertiary">No note</p>
                )}
                <p className="text-xs text-ink-tertiary">
                  {new Date(req.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  className="h-9 rounded-[var(--radius-md)] border border-border bg-surface px-2 text-sm text-ink"
                  value={assignMap[req.id] ?? ""}
                  onChange={(e) =>
                    setAssignMap((m) => ({ ...m, [req.id]: e.target.value }))
                  }
                >
                  <option value="">Select expert</option>
                    {experts.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                </select>
                <Button
                  type="button"
                  disabled={pending || !assignMap[req.id]}
                  onClick={() =>
                    run(() =>
                      assignExpertToRequest({
                        requestId: req.id,
                        expertId: assignMap[req.id],
                      }),
                    )
                  }
                >
                  Assign
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {experts.length === 0 ? (
        <p className="text-xs text-ink-tertiary">
          Approve at least one expert before assigning reviews.
        </p>
      ) : null}
    </div>
  );
}
