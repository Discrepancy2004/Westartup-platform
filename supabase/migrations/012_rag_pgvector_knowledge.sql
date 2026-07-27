-- RAG: pgvector + knowledge corpus + DNA capsule fields for retrieval

create extension if not exists vector;

-- DNA capsule enrichment
alter table public.expert_dna_capsules
  add column if not exists why text,
  add column if not exists functional_area text,
  add column if not exists status text not null default 'draft',
  add column if not exists usage_count integer not null default 0,
  add column if not exists published_at timestamptz,
  add column if not exists content_hash text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'expert_dna_capsules_status_check'
  ) then
    alter table public.expert_dna_capsules
      add constraint expert_dna_capsules_status_check
      check (status in ('draft', 'published', 'archived'));
  end if;
end$$;

create index if not exists expert_dna_capsules_status_idx
  on public.expert_dna_capsules (status, updated_at desc);

-- Historical / uploaded knowledge documents
create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null
    check (source_type in (
      'expert_dna',
      'pitch_deck',
      'executive_summary',
      'investor_note',
      'startup_review',
      'other'
    )),
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'indexed', 'failed', 'ignored')),
  startup_name text,
  file_name text not null,
  content_hash text,
  storage_path text,
  bytes bigint,
  mime_type text,
  chunk_count integer,
  error_message text,
  ignored boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists knowledge_documents_content_hash_uidx
  on public.knowledge_documents (content_hash)
  where content_hash is not null;

create index if not exists knowledge_documents_source_idx
  on public.knowledge_documents (source_type, status, ignored);

create index if not exists knowledge_documents_startup_idx
  on public.knowledge_documents (startup_name);

drop trigger if exists knowledge_documents_updated_at on public.knowledge_documents;
create trigger knowledge_documents_updated_at
  before update on public.knowledge_documents
  for each row execute function public.set_updated_at();

-- Unified vector chunks (DNA + corpus)
create table if not exists public.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  source_type text not null
    check (source_type in (
      'expert_dna',
      'pitch_deck',
      'executive_summary',
      'investor_note',
      'startup_review',
      'other'
    )),
  document_id uuid references public.knowledge_documents (id) on delete cascade,
  capsule_id uuid references public.expert_dna_capsules (id) on delete cascade,
  chunk_index integer not null default 0,
  content text not null,
  embedding vector(1536),
  retrievable boolean not null default false,
  content_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (source_type = 'expert_dna' and capsule_id is not null)
    or (source_type <> 'expert_dna' and document_id is not null)
  )
);

create unique index if not exists rag_chunks_capsule_uidx
  on public.rag_chunks (capsule_id)
  where capsule_id is not null;

create unique index if not exists rag_chunks_document_chunk_uidx
  on public.rag_chunks (document_id, chunk_index)
  where document_id is not null;

create index if not exists rag_chunks_retrievable_idx
  on public.rag_chunks (retrievable, source_type)
  where retrievable = true;

-- IVFFlat needs rows; create after some data or with lists=1 for empty — use hnsw if available
create index if not exists rag_chunks_embedding_hnsw
  on public.rag_chunks
  using hnsw (embedding vector_cosine_ops);

drop trigger if exists rag_chunks_updated_at on public.rag_chunks;
create trigger rag_chunks_updated_at
  before update on public.rag_chunks
  for each row execute function public.set_updated_at();

alter table public.knowledge_documents enable row level security;
alter table public.rag_chunks enable row level security;

drop policy if exists "knowledge_documents_admin_all" on public.knowledge_documents;
create policy "knowledge_documents_admin_all"
  on public.knowledge_documents for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "rag_chunks_admin_all" on public.rag_chunks;
create policy "rag_chunks_admin_all"
  on public.rag_chunks for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "rag_chunks_expert_own_dna" on public.rag_chunks;
create policy "rag_chunks_expert_own_dna"
  on public.rag_chunks for select
  using (
    source_type = 'expert_dna'
    and capsule_id in (
      select id from public.expert_dna_capsules where expert_id = auth.uid()
    )
  );

create or replace function public.match_rag_chunks(
  query_embedding vector(1536),
  match_count integer default 5,
  filter_source_types text[] default null,
  filter_startup_name text default null
)
returns table (
  id uuid,
  source_type text,
  document_id uuid,
  capsule_id uuid,
  chunk_index integer,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.source_type,
    c.document_id,
    c.capsule_id,
    c.chunk_index,
    c.content,
    c.metadata,
    (1 - (c.embedding <=> query_embedding))::float as similarity
  from public.rag_chunks c
  left join public.knowledge_documents d on d.id = c.document_id
  where c.retrievable = true
    and c.embedding is not null
    and (filter_source_types is null or c.source_type = any(filter_source_types))
    and (
      filter_startup_name is null
      or coalesce(c.metadata->>'startup_name', d.startup_name) = filter_startup_name
    )
    and (d.id is null or (d.ignored = false and d.status = 'indexed'))
  order by c.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

revoke all on function public.match_rag_chunks(vector, integer, text[], text) from public;
grant execute on function public.match_rag_chunks(vector, integer, text[], text) to service_role;
grant execute on function public.match_rag_chunks(vector, integer, text[], text) to authenticated;

create or replace function public.increment_dna_usage(p_capsule_ids uuid[])
returns void
language sql
security definer
set search_path = public
as $$
  update public.expert_dna_capsules
  set usage_count = usage_count + 1
  where id = any(p_capsule_ids)
    and status = 'published';
$$;

revoke all on function public.increment_dna_usage(uuid[]) from public;
grant execute on function public.increment_dna_usage(uuid[]) to service_role;
