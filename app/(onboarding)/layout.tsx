import type { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-canvas text-ink">{children}</div>;
}
