import type { ReactNode } from "react";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-canvas text-ink">
      {children}
    </div>
  );
}
