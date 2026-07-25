import type { ReactNode } from "react";

export default function ExpertLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas text-ink">
      {children}
    </div>
  );
}
