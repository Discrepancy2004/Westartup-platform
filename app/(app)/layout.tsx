import type { ReactNode } from "react";
import { Suspense } from "react";
import { CompanionMount } from "@/components/companion/companion-mount";
import { CompanionProvider } from "@/components/companion/companion-provider";
import { DnaProvider } from "@/components/dna/dna-provider";
import { RouteLoading } from "@/components/ui/route-loading";
import { loadStartupDna } from "@/lib/dna/load";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<RouteLoading label="Loading workspace" />}>
      <DnaBoundShell>{children}</DnaBoundShell>
    </Suspense>
  );
}

async function DnaBoundShell({ children }: { children: ReactNode }) {
  const { dna, experience, secondaryLabels } = await loadStartupDna();

  return (
    <DnaProvider
      dna={dna}
      experience={experience}
      secondaryLabels={secondaryLabels}
    >
      <CompanionProvider>
        <div className="dna-shell flex min-h-full flex-col bg-canvas text-ink">
          {children}
          <CompanionMount />
        </div>
      </CompanionProvider>
    </DnaProvider>
  );
}
