-- Platform roles, expert applications, review requests/assignments, human chat

-- ─── Profiles: role ─────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists role text not null default 'founder'
    constraint profiles_role_check
    check (role in ('founder', 'expert', 'admin'));

comment on column public.profiles.role is
  'Platform role: founder | expert | admin. Trusted; never set from client user_metadata.';

create index if not exists profiles_role_idx on public.profiles (role);

-- Bootstrap admin by email (also applied in handle_new_user)
update public.profiles
set role = 'admin'
where lower(email) = lower('thishuarnav@gmail.com');

-- ─── Helpers ────────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_expert()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'expert'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.is_expert() from public;
grant execute on function public.is_expert() to authenticated;

-- Block self-service role changes (service_role + admins allowed)
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- Migrations / superuser (no JWT) and service_role may change roles.
    if auth.uid() is null
       or coalesce(auth.jwt() ->> 'role', '') = 'service_role' then
      return new;
    end if;
    if exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    ) then
      return new;
    end if;
    raise exception 'Cannot change profile role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Auto-create profile: default founder, admin email → admin
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role text := 'founder';
begin
  if lower(coalesce(new.email, '')) = lower('thishuarnav@gmail.com') then
    new_role := 'admin';
  end if;

  insert into public.profiles (id, email, first_login, role)
  values (new.id, new.email, true, new_role)
  on conflict (id) do update
    set email = excluded.email,
        role = case
          when lower(coalesce(excluded.email, '')) = lower('thishuarnav@gmail.com')
            then 'admin'
          else public.profiles.role
        end;
  return new;
end;
$$;

-- Promote admin if email already exists / gets updated to bootstrap address
create or replace function public.promote_bootstrap_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(new.email, '')) = lower('thishuarnav@gmail.com') then
    new.role := 'admin';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_bootstrap_admin on public.profiles;
create trigger profiles_bootstrap_admin
  before insert or update of email on public.profiles
  for each row execute function public.promote_bootstrap_admin();

-- ─── Expert applications ────────────────────────────────────────────────────
create table if not exists public.expert_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  company text not null,
  cv_path text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  founder_continued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists expert_applications_status_idx
  on public.expert_applications (status, created_at desc);

drop trigger if exists expert_applications_updated_at on public.expert_applications;
create trigger expert_applications_updated_at
  before update on public.expert_applications
  for each row execute function public.set_updated_at();

-- ─── Review requests (founder → admin queue) ────────────────────────────────
create table if not exists public.review_requests (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references public.profiles (id) on delete cascade,
  note text,
  status text not null default 'pending'
    check (status in ('pending', 'assigned', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists review_requests_status_idx
  on public.review_requests (status, created_at desc);
create index if not exists review_requests_founder_idx
  on public.review_requests (founder_id, created_at desc);

drop trigger if exists review_requests_updated_at on public.review_requests;
create trigger review_requests_updated_at
  before update on public.review_requests
  for each row execute function public.set_updated_at();

-- ─── Assignments (admin assigns expert) ─────────────────────────────────────
create table if not exists public.review_assignments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.review_requests (id) on delete cascade,
  founder_id uuid not null references public.profiles (id) on delete cascade,
  expert_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id)
);

create index if not exists review_assignments_expert_idx
  on public.review_assignments (expert_id, created_at desc);
create index if not exists review_assignments_founder_idx
  on public.review_assignments (founder_id, created_at desc);

drop trigger if exists review_assignments_updated_at on public.review_assignments;
create trigger review_assignments_updated_at
  before update on public.review_assignments
  for each row execute function public.set_updated_at();

-- ─── Human chat (expert ↔ founder) ──────────────────────────────────────────
create table if not exists public.review_messages (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.review_assignments (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists review_messages_assignment_idx
  on public.review_messages (assignment_id, created_at);

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.expert_applications enable row level security;
alter table public.review_requests enable row level security;
alter table public.review_assignments enable row level security;
alter table public.review_messages enable row level security;

-- Applications
drop policy if exists "expert_apps_select_own_or_admin" on public.expert_applications;
create policy "expert_apps_select_own_or_admin"
  on public.expert_applications for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "expert_apps_insert_own" on public.expert_applications;
create policy "expert_apps_insert_own"
  on public.expert_applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "expert_apps_update_own_or_admin" on public.expert_applications;
create policy "expert_apps_update_own_or_admin"
  on public.expert_applications for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Review requests
drop policy if exists "review_requests_select" on public.review_requests;
create policy "review_requests_select"
  on public.review_requests for select
  using (
    auth.uid() = founder_id
    or public.is_admin()
    or exists (
      select 1 from public.review_assignments a
      where a.request_id = id and a.expert_id = auth.uid()
    )
  );

drop policy if exists "review_requests_insert_founder" on public.review_requests;
create policy "review_requests_insert_founder"
  on public.review_requests for insert
  with check (auth.uid() = founder_id);

drop policy if exists "review_requests_update_admin" on public.review_requests;
create policy "review_requests_update_admin"
  on public.review_requests for update
  using (public.is_admin())
  with check (public.is_admin());

-- Assignments
drop policy if exists "review_assignments_select" on public.review_assignments;
create policy "review_assignments_select"
  on public.review_assignments for select
  using (
    auth.uid() = founder_id
    or auth.uid() = expert_id
    or public.is_admin()
  );

drop policy if exists "review_assignments_insert_admin" on public.review_assignments;
create policy "review_assignments_insert_admin"
  on public.review_assignments for insert
  with check (public.is_admin());

drop policy if exists "review_assignments_update_parties" on public.review_assignments;
create policy "review_assignments_update_parties"
  on public.review_assignments for update
  using (
    auth.uid() = founder_id
    or auth.uid() = expert_id
    or public.is_admin()
  )
  with check (
    auth.uid() = founder_id
    or auth.uid() = expert_id
    or public.is_admin()
  );

-- Messages
drop policy if exists "review_messages_select" on public.review_messages;
create policy "review_messages_select"
  on public.review_messages for select
  using (
    exists (
      select 1 from public.review_assignments a
      where a.id = assignment_id
        and (a.founder_id = auth.uid() or a.expert_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "review_messages_insert" on public.review_messages;
create policy "review_messages_insert"
  on public.review_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.review_assignments a
      where a.id = assignment_id
        and a.status = 'active'
        and (a.founder_id = auth.uid() or a.expert_id = auth.uid())
    )
  );

-- Admins can read all profiles (for assignment UI)
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

-- Experts/founders can see counterpart on shared assignment
drop policy if exists "profiles_select_assignment_peer" on public.profiles;
create policy "profiles_select_assignment_peer"
  on public.profiles for select
  using (
    exists (
      select 1 from public.review_assignments a
      where (a.founder_id = auth.uid() and a.expert_id = id)
         or (a.expert_id = auth.uid() and a.founder_id = id)
    )
  );

-- ─── Storage: optional CVs ──────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'expert-cvs',
  'expert-cvs',
  false,
  5242880,
  array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

drop policy if exists "expert_cvs_upload_own" on storage.objects;
create policy "expert_cvs_upload_own"
  on storage.objects for insert
  with check (
    bucket_id = 'expert-cvs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "expert_cvs_select_own_or_admin" on storage.objects;
create policy "expert_cvs_select_own_or_admin"
  on storage.objects for select
  using (
    bucket_id = 'expert-cvs'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin()
    )
  );

drop policy if exists "expert_cvs_update_own" on storage.objects;
create policy "expert_cvs_update_own"
  on storage.objects for update
  using (
    bucket_id = 'expert-cvs'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'expert-cvs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
