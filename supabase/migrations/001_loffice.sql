-- Loffice documents & storage
create table if not exists public.loffice_documents (
  id uuid primary key default gen_random_uuid(),
  engine_id text unique,
  name text not null,
  ext text not null,
  size bigint default 0,
  mime text,
  preview_type text default 'pdf',
  editable boolean default false,
  storage_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_loffice_documents_engine_id on public.loffice_documents(engine_id);
create index if not exists idx_loffice_documents_created_at on public.loffice_documents(created_at desc);

alter table public.loffice_documents enable row level security;

create policy "loffice_documents_public_read"
  on public.loffice_documents for select using (true);

create policy "loffice_documents_public_insert"
  on public.loffice_documents for insert with check (true);

create policy "loffice_documents_public_update"
  on public.loffice_documents for update using (true);

-- Storage bucket (run via dashboard if needed)
-- insert into storage.buckets (id, name, public) values ('loffice-files', 'loffice-files', true);
