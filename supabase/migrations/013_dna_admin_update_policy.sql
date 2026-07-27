-- Allow admins to archive DNA capsules
drop policy if exists "dna_capsules_admin_update" on public.expert_dna_capsules;
create policy "dna_capsules_admin_update"
  on public.expert_dna_capsules for update
  using (public.is_admin())
  with check (public.is_admin());
