-- =========================================================
-- TravelGo - Supabase Auth + verificacion por codigo
-- Ejecutar en Supabase SQL Editor antes de probar registro/login.
-- No borra usuarios, reservas ni pagos.
-- =========================================================

alter table public.users
    add column if not exists supabase_auth_id uuid null,
    add column if not exists email_verificado boolean default false,
    add column if not exists email_verificado_at timestamptz null,
    add column if not exists ultimo_login_at timestamptz null;

update public.users
set email_verificado = true,
    email_verificado_at = coalesce(email_verificado_at, now())
where email_verificado is false
  and supabase_auth_id is null
  and created_at < now();

create table if not exists public.auth_verification_codes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    correo text not null,
    purpose text not null check (purpose in ('registro', 'login')),
    code_hash text not null,
    expires_at timestamptz not null,
    used_at timestamptz null,
    attempts integer not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists idx_auth_codes_user_purpose
    on public.auth_verification_codes (user_id, purpose, created_at desc);

create index if not exists idx_auth_codes_correo
    on public.auth_verification_codes (correo);

notify pgrst, 'reload schema';
