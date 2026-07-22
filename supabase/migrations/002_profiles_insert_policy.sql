-- Run ONLY this in Supabase SQL editor (do not re-run 001_initial.sql)

drop policy if exists "profiles_insert_own" on public.profiles;

create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);
