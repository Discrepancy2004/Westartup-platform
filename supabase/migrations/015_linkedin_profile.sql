-- LinkedIn OIDC profile import (empty-fill only in app code)

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists linkedin_url text,
  add column if not exists linkedin_connected_at timestamptz;

comment on column public.profiles.full_name is
  'Display name; may be imported from OAuth when empty.';
comment on column public.profiles.avatar_url is
  'Profile photo URL; may be imported from OAuth when empty.';
comment on column public.profiles.linkedin_url is
  'Public LinkedIn profile URL when the provider supplies one.';
comment on column public.profiles.linkedin_connected_at is
  'Set when the user authenticates or links LinkedIn (OIDC).';
