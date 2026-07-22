import type { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-full flex flex-col bg-canvas text-ink">
      {children}
    </div>
  );
}
