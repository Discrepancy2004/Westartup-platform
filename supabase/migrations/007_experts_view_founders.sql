-- Experts can list all founder profiles (v1: open roster)
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

revoke all on function public.is_expert() from public;
grant execute on function public.is_expert() to authenticated;

drop policy if exists "profiles_select_founders_for_experts" on public.profiles;
create policy "profiles_select_founders_for_experts"
  on public.profiles for select
  using (
    public.is_expert()
    and role = 'founder'
  );
