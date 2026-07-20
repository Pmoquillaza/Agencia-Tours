create table if not exists public.audit_logs (
    id bigserial primary key,
    actor_id text null,
    actor_email text null,
    action text not null,
    entity text not null,
    entity_id text null,
    status text not null default 'success',
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created_at
    on public.audit_logs (created_at desc);

create index if not exists idx_audit_logs_actor_id
    on public.audit_logs (actor_id);

create index if not exists idx_audit_logs_entity
    on public.audit_logs (entity, entity_id);

alter table public.audit_logs enable row level security;

drop policy if exists "allow_audit_log_insert" on public.audit_logs;

create policy "allow_audit_log_insert"
    on public.audit_logs
    for insert
    to anon, authenticated
    with check (true);
