import type { ReactNode } from "react";
import { ExpertShellHeader } from "@/components/expert/expert-shell-header";

export default function ExpertLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas text-ink">
      <ExpertShellHeader />
      {children}
    </div>
  );
}
