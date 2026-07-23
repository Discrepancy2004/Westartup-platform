-- Distinguish post-onboarding drafts from chat-refined investor docs.
alter table public.artifacts
  add column if not exists source text not null default 'bootstrap'
    check (source in ('bootstrap', 'chat'));

comment on column public.artifacts.source is
  'bootstrap = generated at onboarding; chat = updated via advisor chat';
