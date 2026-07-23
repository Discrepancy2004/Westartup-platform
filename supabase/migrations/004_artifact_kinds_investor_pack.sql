-- Widen artifacts.kind for investor dashboard pack
alter table public.artifacts
  drop constraint if exists artifacts_kind_check;

alter table public.artifacts
  add constraint artifacts_kind_check check (
    kind = any (
      array[
        'idea-brief'::text,
        'financial-projections'::text,
        'revenue-model'::text,
        'market-sizing'::text,
        'team-overview'::text,
        'deal-structure'::text,
        'unit-economics'::text,
        'traction-kpis'::text,
        'competitive-landscape'::text,
        'gtm-plan'::text,
        'burn-runway'::text,
        'milestones'::text
      ]
    )
  );
