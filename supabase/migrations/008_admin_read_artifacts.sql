-- Admins can read founder artifacts (admin founder detail)
drop policy if exists "artifacts_select_admin" on public.artifacts;
create policy "artifacts_select_admin"
  on public.artifacts for select
  using (public.is_admin());
