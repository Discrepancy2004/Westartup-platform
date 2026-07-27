"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  assignExpertToRequest,
  assignFounderToExpert,
} from "@/app/(admin)/admin/actions";
import type { ExpertOption } from "@/components/admin/reviews-panel";
import type { PendingReviewRow } from "@/components/admin/reviews-panel";

export type UnassignedFounder = {
  id: string;
  email: string | null;
};

export type ActiveAssignmentRow = {
  id: string;
  created_at: string;
  founder_email: string | null;
  expert_name: string;
};

export function AssignmentsPanel({
  assignments,
  unassignedFounders,
  experts,
  pendingRequests = [],
}: {
  assignments: ActiveAssignmentRow[];
  unassignedFounders: UnassignedFounder[];
  experts: ExpertOption[];
  pendingRequests?: PendingReviewRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [founderId, setFounderId] = useState("");
  const [expertId, setExpertId] = useState("");
  const [assignMap, setAssignMap] = useState<Record<string, string>>({});

  const canAssign = useMemo(
    () => Boolean(founderId && expertId && experts.length > 0),
    [founderId, expertId, experts.length],
  );

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
    <div className="space-y-10">
      {pendingRequests.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
            Pending founder requests
          </h2>
          <ul className="divide-y divide-border border border-border">
            {pendingRequests.map((req) => (
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
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
          Manual assign
        </h2>
        <p className="text-sm text-ink-secondary">
          Match an unassigned founder to an expert.
        </p>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            className="h-9 flex-1 rounded-[var(--radius-md)] border border-border bg-surface px-2 text-sm text-ink"
            value={founderId}
            onChange={(e) => setFounderId(e.target.value)}
          >
            <option value="">Select founder</option>
            {unassignedFounders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.email ?? f.id}
              </option>
            ))}
          </select>
          <select
            className="h-9 flex-1 rounded-[var(--radius-md)] border border-border bg-surface px-2 text-sm text-ink"
            value={expertId}
            onChange={(e) => setExpertId(e.target.value)}
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
            disabled={pending || !canAssign}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await assignFounderToExpert({
                  founderId,
                  expertId,
                });
                if (!result.ok) {
                  setError(result.error ?? "Assign failed");
                  return;
                }
                setFounderId("");
                setExpertId("");
                router.refresh();
              });
            }}
          >
            Assign
          </Button>
        </div>
        {unassignedFounders.length === 0 ? (
          <p className="text-xs text-ink-tertiary">
            Every founder already has an active assignment.
          </p>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
          Active assignments
        </h2>
        {assignments.length === 0 ? (
          <p className="text-sm text-ink-secondary">No active assignments.</p>
        ) : (
          <ul className="divide-y divide-border border border-border">
            {assignments.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-ink">
                    <span className="font-medium">
                      {a.founder_email ?? "Founder"}
                    </span>
                    <span className="text-ink-tertiary"> → </span>
                    <span>{a.expert_name}</span>
                  </p>
                  <p className="text-xs text-ink-tertiary">
                    Since {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
