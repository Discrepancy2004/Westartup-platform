-- Expert assignment workspace: artifact access, profile fields, notifications

alter table public.expert_applications
  add column if not exists expertise text,
  add column if not exists bio text;

-- Assigned experts can read founder artifacts (active or completed assignments)
drop policy if exists "artifacts_select_assigned_expert" on public.artifacts;
create policy "artifacts_select_assigned_expert"
  on public.artifacts for select
  using (
    exists (
      select 1 from public.review_assignments a
      where a.expert_id = auth.uid()
        and a.founder_id = artifacts.user_id
        and a.status in ('active', 'completed')
    )
  );

-- In-app notifications (experts + founders)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null
    check (type in ('new_assignment', 'founder_replied', 'expert_replied', 'review_completed')),
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inserts only via service role / security definer helper
create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text default null,
  p_link text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.notifications (user_id, type, title, body, link)
  values (p_user_id, p_type, p_title, p_body, p_link)
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.create_notification(uuid, text, text, text, text) from public;
grant execute on function public.create_notification(uuid, text, text, text, text) to authenticated;
grant execute on function public.create_notification(uuid, text, text, text, text) to service_role;

-- Chat remains open after review is marked complete
drop policy if exists "review_messages_insert" on public.review_messages;
create policy "review_messages_insert"
  on public.review_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.review_assignments a
      where a.id = assignment_id
        and a.status in ('active', 'completed')
        and (a.founder_id = auth.uid() or a.expert_id = auth.uid())
    )
  );
