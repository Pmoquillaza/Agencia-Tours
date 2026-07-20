-- =========================================================
-- TravelGo - Migracion ligera para perfil de usuario
-- Ejecutar en Supabase SQL Editor si aparece:
-- "Could not find the 'documento' column of 'users' in the schema cache"
-- =========================================================

alter table public.users
    add column if not exists telefono text null;

alter table public.users
    add column if not exists documento text null;

alter table public.users
    add column if not exists estado text not null default 'activo';

alter table public.users
    add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_users_documento
    on public.users (documento);

-- Opcional: refresca datos existentes
update public.users
set estado = coalesce(estado, 'activo')
where estado is null;
