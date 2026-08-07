"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  DIRECTORY_MODELS,
  STAGE_LABELS,
  THEME_LABELS,
} from "@/lib/directory/labels";
import { STARTUP_THEME_IDS } from "@/lib/dna/types";
import type { TractionStage } from "@/lib/types/onboarding";

const STAGES = Object.keys(STAGE_LABELS) as TractionStage[];

type Props = {
  q: string;
  theme: string;
  stage: string;
  model: string;
  raising: boolean;
};

function buildHref(next: Props) {
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.theme) params.set("theme", next.theme);
  if (next.stage) params.set("stage", next.stage);
  if (next.model) params.set("model", next.model);
  if (next.raising) params.set("raising", "1");
  const query = params.toString();
  return query ? `/companies?${query}` : "/companies";
}

export function DirectoryFilters({ q, theme, stage, model, raising }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(patch: Partial<Props>) {
    startTransition(() => {
      router.push(buildHref({ q, theme, stage, model, raising, ...patch }));
    });
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        navigate({ q: String(form.get("q") ?? "").trim() });
      }}
    >
      <div>
        <label htmlFor="directory-q" className="sr-only">
          Search companies
        </label>
        <input
          id="directory-q"
          name="q"
          defaultValue={q}
          placeholder="Search by name, idea, or model"
          className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-[var(--mkt-ink)] placeholder:text-[var(--mkt-faint)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mkt-accent)]"
        />
      </div>

      <fieldset className="space-y-2" disabled={pending}>
        <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-faint)]">
          Industry
        </legend>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={!theme}
            onClick={() => navigate({ theme: "" })}
            label="All"
          />
          {STARTUP_THEME_IDS.filter((id) => id !== "general").map((id) => (
            <FilterChip
              key={id}
              active={theme === id}
              onClick={() => navigate({ theme: theme === id ? "" : id })}
              label={THEME_LABELS[id]}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2" disabled={pending}>
        <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-faint)]">
          Stage
        </legend>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={!stage}
            onClick={() => navigate({ stage: "" })}
            label="All"
          />
          {STAGES.map((id) => (
            <FilterChip
              key={id}
              active={stage === id}
              onClick={() => navigate({ stage: stage === id ? "" : id })}
              label={STAGE_LABELS[id]}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2" disabled={pending}>
        <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-faint)]">
          Model
        </legend>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={!model}
            onClick={() => navigate({ model: "" })}
            label="All"
          />
          {DIRECTORY_MODELS.map((id) => (
            <FilterChip
              key={id}
              active={model === id}
              onClick={() => navigate({ model: model === id ? "" : id })}
              label={id}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2" disabled={pending}>
        <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-faint)]">
          Funding
        </legend>
        <FilterChip
          active={raising}
          onClick={() => navigate({ raising: !raising })}
          label="Raising now"
        />
      </fieldset>
    </form>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-[var(--mkt-accent)] px-2.5 py-1 text-[11px] font-medium text-[var(--mkt-field-dark)]"
          : "rounded-full border border-white/12 px-2.5 py-1 text-[11px] text-[var(--mkt-muted)] hover:border-white/30 hover:text-[var(--mkt-ink)]"
      }
    >
      {label}
    </button>
  );
}
