-- Public startup directory snapshots (sanitized; never expose full profiles)

create table if not exists public.startup_listings (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null unique references public.profiles (id) on delete cascade,
  slug text not null unique,
  name text not null,
  tagline text not null,
  description text not null,
  business_model text not null,
  stage text not null,
  team_size text not null,
  funding_intent text,
  currently_raising boolean not null default false,
  theme text not null default 'general',
  secondary_themes text[] not null default '{}'::text[],
  verified_at timestamptz not null,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists startup_listings_published_at_idx
  on public.startup_listings (published_at desc);
create index if not exists startup_listings_stage_idx
  on public.startup_listings (stage);
create index if not exists startup_listings_theme_idx
  on public.startup_listings (theme);
create index if not exists startup_listings_slug_idx
  on public.startup_listings (slug);

drop trigger if exists startup_listings_updated_at on public.startup_listings;
create trigger startup_listings_updated_at
  before update on public.startup_listings
  for each row execute function public.set_updated_at();

alter table public.startup_listings enable row level security;

drop policy if exists "startup_listings_public_select" on public.startup_listings;
create policy "startup_listings_public_select"
  on public.startup_listings for select
  using (true);

grant select on public.startup_listings to anon, authenticated;

-- Backfill verified founders who completed starter onboarding
insert into public.startup_listings (
  founder_id,
  slug,
  name,
  tagline,
  description,
  business_model,
  stage,
  team_size,
  funding_intent,
  currently_raising,
  theme,
  secondary_themes,
  verified_at,
  published_at
)
select
  p.id,
  trim(both '-' from lower(regexp_replace(
    coalesce(
      nullif(left(trim(p.onboarding -> 'idea' ->> 'description'), 40), ''),
      'startup'
    ),
    '[^a-zA-Z0-9]+',
    '-',
    'g'
  ))) || '-' || substr(replace(p.id::text, '-', ''), 1, 8),
  left(
    coalesce(
      nullif(trim(split_part(p.onboarding -> 'idea' ->> 'description', '.', 1)), ''),
      nullif(trim(p.onboarding -> 'idea' ->> 'description'), ''),
      'Untitled startup'
    ),
    80
  ),
  left(trim(p.onboarding -> 'idea' ->> 'description'), 140),
  trim(p.onboarding -> 'idea' ->> 'description'),
  coalesce(nullif(p.onboarding -> 'business-specifics' ->> 'businessModelType', ''), 'Other'),
  coalesce(nullif(p.onboarding -> 'traction' ->> 'stage', ''), 'idea'),
  coalesce(nullif(p.onboarding -> 'team' ->> 'size', ''), 'solo'),
  nullif(p.onboarding -> 'deal-structure' ->> 'intent', ''),
  coalesce((p.onboarding -> 'deal-structure' ->> 'currentlyRaising')::boolean, false),
  coalesce(nullif(p.startup_dna ->> 'theme', ''), 'general'),
  case
    when jsonb_typeof(p.startup_dna -> 'secondaryThemes') = 'array'
      then array(
        select jsonb_array_elements_text(p.startup_dna -> 'secondaryThemes')
      )
    else '{}'::text[]
  end,
  coalesce(p.onboarding_completed_at, p.updated_at, now()),
  coalesce(p.onboarding_completed_at, p.created_at, now())
from public.profiles p
where p.role = 'founder'
  and p.first_login = false
  and p.onboarding_completed_at is not null
  and p.onboarding is not null
  and coalesce(trim(p.onboarding -> 'idea' ->> 'description'), '') <> ''
  and coalesce(trim(p.onboarding -> 'about-you' ->> 'roleAndBackground'), '') <> ''
  and coalesce(trim(p.onboarding -> 'business-specifics' ->> 'businessModelType'), '') <> ''
  and coalesce(trim(p.onboarding -> 'business-specifics' ->> 'pricePoint'), '') <> ''
  and coalesce(trim(p.onboarding -> 'traction' ->> 'stage'), '') <> ''
  and coalesce(trim(p.onboarding -> 'team' ->> 'size'), '') <> ''
  and (p.onboarding -> 'deal-structure' ? 'currentlyRaising')
on conflict (founder_id) do nothing;
