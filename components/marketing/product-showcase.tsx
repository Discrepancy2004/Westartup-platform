"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ChatPreview } from "./chat-preview";
import { DashboardMock } from "./dashboard-mock";
import { Reveal } from "./reveal";
import { SectionDecor } from "./section-decor";

/**
 * Layered product cluster — staggered cards with room to breathe.
 * Hover lifts a card above the stack.
 */
export function ProductShowcase() {
  const clusterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = clusterRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const layers = el.querySelectorAll<HTMLElement>("[data-layer]");

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(0, 1 - rect.top / (window.innerHeight * 0.85)),
      );
      const y = (1 - progress) * 22;
      layers.forEach((layer) => {
        const factor = Number(layer.dataset.parallax ?? "0.3");
        layer.style.setProperty("--parallax-y", `${y * factor}px`);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="product"
      className="mkt-field-teal mkt-section relative scroll-mt-20 overflow-hidden"
    >
      <SectionDecor variant="product" tone="on-teal" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-14">
        <div className="relative pt-1 lg:col-span-4 lg:pt-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mkt-section-faint)]">
              Product
            </p>
          </Reveal>
          <Reveal delayMs={120}>
            <h2 className="mt-3 font-display text-3xl leading-[1.12] text-[var(--mkt-section-ink)] md:text-4xl">
              Advisor chat and investor docs, layered in one session
            </h2>
          </Reveal>
          <Reveal delayMs={220}>
            <p className="mt-4 text-base leading-relaxed text-[var(--mkt-section-muted)] md:text-lg">
              Challenge the narrative in conversation, then watch projections,
              market sizing, and deal structure land on a live dashboard.
            </p>
          </Reveal>
          <Reveal delayMs={320}>
            <Link
              href="/signup"
              className="mt-6 inline-flex text-sm font-semibold text-[var(--mkt-section-ink)] underline-offset-4 hover:underline"
            >
              Learn more →
            </Link>
          </Reveal>
        </div>

        <Reveal delayMs={180} className="relative lg:col-span-8">
          <div
            ref={clusterRef}
            className="product-cluster relative mx-auto min-h-[480px] w-full px-1 pt-2 pb-4 sm:min-h-[520px] lg:min-h-[580px] xl:min-h-[620px]"
          >
            {/* BACK-LEFT — challenge card */}
            <div
              data-layer="back"
              data-parallax="0.65"
              className="product-cluster-card absolute left-0 top-0 z-10 w-[min(44%,300px)] sm:w-[40%] lg:left-[-4%]"
            >
              <div className="product-cluster-card-inner overflow-hidden rounded-[var(--mkt-radius)] bg-[var(--mkt-card-peach)] p-4 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/10 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-card-ink)]/50">
                  Challenge
                </p>
                <p className="mt-3 text-base font-semibold leading-snug text-[var(--mkt-card-ink)] sm:text-lg">
                  Huge is not a number. What is your SAM in INR?
                </p>
                <p className="mt-4 text-sm text-[var(--mkt-card-ink)]/60">
                  Advisor follow-up · live session
                </p>
              </div>
            </div>

            {/* MID — dashboard */}
            <div
              data-layer="mid"
              data-parallax="0.35"
              className="product-cluster-card absolute left-[18%] top-[12%] z-20 w-[72%] sm:left-[22%] sm:w-[66%] lg:left-[24%] lg:w-[64%]"
            >
              <div className="product-cluster-card-inner overflow-hidden rounded-[var(--mkt-radius)] shadow-[0_32px_64px_-24px_rgba(0,0,0,0.55)] ring-1 ring-black/15">
                <DashboardMock variant="section" />
              </div>
            </div>

            {/* FRONT-RIGHT — chat */}
            <div
              data-layer="front"
              data-parallax="0.1"
              className="product-cluster-card absolute bottom-0 right-0 z-30 w-[min(70%,400px)] sm:bottom-[-2%] sm:w-[50%] lg:right-[-4%] lg:w-[46%]"
            >
              <div className="product-cluster-card-inner overflow-hidden rounded-[var(--mkt-radius)] shadow-[0_28px_56px_-18px_rgba(0,0,0,0.5)] ring-1 ring-black/12">
                <ChatPreview compact />
              </div>
              <span
                aria-hidden
                className="absolute -right-2 -top-3 z-10 flex size-11 items-center justify-center rounded-full bg-[var(--mkt-accent)] text-xs font-bold text-[var(--mkt-field-dark)] shadow-lg ring-4 ring-[var(--mkt-field-teal)]"
              >
                AI
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
