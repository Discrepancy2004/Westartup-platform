"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/(expert)/actions";

export type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationsList({
  notifications,
}: {
  notifications: NotificationRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-ink">Notifications</h1>
        {notifications.some((n) => !n.read_at) ? (
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await markAllNotificationsRead();
                router.refresh();
              });
            }}
          >
            Mark all read
          </Button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-ink-secondary">No notifications yet.</p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {notifications.map((n) => {
            const inner = (
              <div className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={`text-sm ${n.read_at ? "text-ink-secondary" : "font-medium text-ink"}`}
                  >
                    {n.title}
                  </p>
                  <p className="shrink-0 text-[10px] text-ink-tertiary">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                {n.body ? (
                  <p className="mt-1 text-xs text-ink-tertiary">{n.body}</p>
                ) : null}
              </div>
            );

            return (
              <li key={n.id}>
                {n.link ? (
                  <Link
                    href={n.link}
                    className="block transition-colors hover:bg-surface"
                    onClick={() => {
                      if (!n.read_at) {
                        void markNotificationRead(n.id);
                      }
                    }}
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="block w-full text-left transition-colors hover:bg-surface"
                    onClick={() => {
                      if (!n.read_at) {
                        startTransition(async () => {
                          await markNotificationRead(n.id);
                          router.refresh();
                        });
                      }
                    }}
                  >
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
