-- Startup DNA personalization (theme detection from onboarding)
alter table public.profiles
  add column if not exists startup_dna jsonb;

comment on column public.profiles.startup_dna is
  'Detected startup theme: { theme, secondaryThemes, confidence, keywordsFound, detectedAt }';
