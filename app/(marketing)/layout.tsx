import type { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="marketing-monday relative flex min-h-full flex-col">
      {children}
    </div>
  );
}
