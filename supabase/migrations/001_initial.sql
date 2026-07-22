-- WeStartup initial schema
-- Run in Supabase SQL editor (or via CLI) after creating the project.

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  first_login boolean not null default true,
  onboarding jsonb,
  onboarding_completed_at timestamptz,
  plan_id text check (plan_id is null or plan_id in ('starter', 'growth', 'scale')),
  subscription_status text not null default 'none'
    check (subscription_status in ('none', 'active', 'past_due', 'cancelled', 'pending')),
  razorpay_customer_id text,
  razorpay_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  kind text not null check (kind in (
    'idea-brief',
    'financial-projections',
    'revenue-model',
    'market-sizing',
    'team-overview',
    'deal-structure'
  )),
  title text not null,
  summary text,
  chart_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, kind)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  razorpay_payment_id text,
  razorpay_order_id text,
  razorpay_subscription_id text,
  plan_id text,
  amount_paise integer,
  currency text not null default 'INR',
  status text not null default 'created',
  raw jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on public.messages (conversation_id, created_at);
create index if not exists artifacts_user_id_idx on public.artifacts (user_id);
create index if not exists transactions_user_id_idx on public.transactions (user_id, created_at desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_login)
  values (new.id, new.email, true)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.artifacts enable row level security;
alter table public.transactions enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "conversations_own" on public.conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "messages_own" on public.messages for all using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id and c.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id and c.user_id = auth.uid()
  )
);
create policy "artifacts_own" on public.artifacts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
