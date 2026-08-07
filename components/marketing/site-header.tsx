import Link from "next/link";
import { SiteHeaderFrame } from "@/components/marketing/site-header-frame";
import {
  SiteHeaderMobileDirectory,
  SiteHeaderNav,
} from "@/components/marketing/site-header-nav";
import { SiteHeaderSession } from "@/components/marketing/site-header-session";

export function SiteHeader() {
  return (
    <SiteHeaderFrame>
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:h-16">
        <Link
          href="/"
          className="font-display text-lg text-[var(--mkt-ink)]"
          aria-label="WeStartup home"
        >
          WeStartup
        </Link>

        <SiteHeaderNav />

        <div className="flex items-center gap-2 sm:gap-2.5">
          <SiteHeaderMobileDirectory />
          <SiteHeaderSession />
        </div>
      </div>
    </SiteHeaderFrame>
  );
}
