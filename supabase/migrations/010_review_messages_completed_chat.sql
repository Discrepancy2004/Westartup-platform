-- Allow chat after review is marked complete
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
