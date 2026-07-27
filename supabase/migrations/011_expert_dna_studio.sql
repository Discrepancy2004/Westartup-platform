-- Expert DNA Studio: capsules + welcome flag

alter table public.profiles
  add column if not exists dna_welcome_seen_at timestamptz;

create table if not exists public.expert_dna_capsules (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null,
  question_text text not null,
  answer text not null,
  industry text,
  stage text,
  category text,
  confidence smallint
    check (confidence is null or (confidence >= 1 and confidence <= 5)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (expert_id, question_id)
);

create index if not exists expert_dna_capsules_expert_idx
  on public.expert_dna_capsules (expert_id, updated_at desc);

drop trigger if exists expert_dna_capsules_updated_at on public.expert_dna_capsules;
create trigger expert_dna_capsules_updated_at
  before update on public.expert_dna_capsules
  for each row execute function public.set_updated_at();

alter table public.expert_dna_capsules enable row level security;

drop policy if exists "dna_capsules_select_own" on public.expert_dna_capsules;
create policy "dna_capsules_select_own"
  on public.expert_dna_capsules for select
  using (auth.uid() = expert_id or public.is_admin());

drop policy if exists "dna_capsules_insert_own" on public.expert_dna_capsules;
create policy "dna_capsules_insert_own"
  on public.expert_dna_capsules for insert
  with check (auth.uid() = expert_id);

drop policy if exists "dna_capsules_update_own" on public.expert_dna_capsules;
create policy "dna_capsules_update_own"
  on public.expert_dna_capsules for update
  using (auth.uid() = expert_id)
  with check (auth.uid() = expert_id);

drop policy if exists "dna_capsules_delete_own" on public.expert_dna_capsules;
create policy "dna_capsules_delete_own"
  on public.expert_dna_capsules for delete
  using (auth.uid() = expert_id);
