-- =========================================================
-- TravelGo - Upgrade profesional para Supabase
-- Ejecutar en Supabase SQL Editor despues de revisar backup.
-- Objetivo: completar columnas usadas por la app, normalizar datos
-- antiguos y cargar contenido demo con apariencia profesional.
-- =========================================================

create extension if not exists pgcrypto;

-- =========================
-- RESERVAS
-- =========================

alter table public.reservations
    add column if not exists transport_nombre text null,
    add column if not exists hotel_nombre text null;

alter table public.users
    add column if not exists telefono text null,
    add column if not exists documento text null,
    add column if not exists estado text default 'activo',
    add column if not exists supabase_auth_id uuid null,
    add column if not exists email_verificado boolean default false,
    add column if not exists email_verificado_at timestamptz null,
    add column if not exists ultimo_login_at timestamptz null;

update public.users
set apellido = 'Cliente'
where lower(coalesce(apellido, '')) in ('undefined', 'null', 'nan');

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

update public.travelers
set dni = 'Documento registrado'
where lower(coalesce(dni, '')) in ('undefined', 'null', 'nan');

-- =========================
-- TOURS
-- =========================

alter table public.tours
    add column if not exists duracion integer default 1,
    add column if not exists imagen text null,
    add column if not exists categoria text default 'Experiencia',
    add column if not exists dificultad text default 'Moderada',
    add column if not exists idioma text default 'Espanol',
    add column if not exists punto_encuentro text null,
    add column if not exists vuelo_disponible boolean default true,
    add column if not exists bus_disponible boolean default true,
    add column if not exists hotel_disponible boolean default true,
    add column if not exists precio_vuelo numeric(12,2) default 180,
    add column if not exists precio_bus numeric(12,2) default 60,
    add column if not exists precio_hotel numeric(12,2) default 180,
    add column if not exists activo boolean default true;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'tours'
          and column_name = 'duracion_dias'
    ) then
        alter table public.tours
            alter column duracion_dias set default 1;

        update public.tours
        set duracion = coalesce(duracion, duracion_dias, 1)
        where duracion is null or duracion <= 0;

        update public.tours
        set duracion_dias = coalesce(duracion_dias, duracion, 1)
        where duracion_dias is null or duracion_dias <= 0;

        execute $sql$
            create or replace function public.sync_tours_duration_columns()
            returns trigger
            language plpgsql
            as $fn$
            begin
                if new.duracion is null or new.duracion <= 0 then
                    new.duracion := coalesce(new.duracion_dias, 1);
                end if;

                if new.duracion_dias is null or new.duracion_dias <= 0 then
                    new.duracion_dias := coalesce(new.duracion, 1);
                end if;

                return new;
            end;
            $fn$;
        $sql$;

        drop trigger if exists sync_tours_duration_columns on public.tours;

        create trigger sync_tours_duration_columns
            before insert or update on public.tours
            for each row
            execute function public.sync_tours_duration_columns();
    end if;
end $$;

update public.tours
set
    imagen = coalesce(
        imagen,
        case
            when lower(destino) like '%cusco%' then 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1200&auto=format&fit=crop'
            when lower(destino) like '%arequipa%' then 'https://images.unsplash.com/photo-1590602390121-9c2ec384a764?q=80&w=1200&auto=format&fit=crop'
            when lower(destino) like '%puno%' then 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=1200&auto=format&fit=crop'
            when lower(destino) like '%lima%' then 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1200&auto=format&fit=crop'
            else 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop'
        end
    ),
    categoria = coalesce(categoria, 'Experiencia'),
    dificultad = coalesce(dificultad, 'Moderada'),
    idioma = coalesce(idioma, 'Espanol'),
    punto_encuentro = coalesce(punto_encuentro, 'Recojo coordinado segun reserva'),
    precio_vuelo = coalesce(precio_vuelo, 180),
    precio_bus = coalesce(precio_bus, 60),
    precio_hotel = coalesce(precio_hotel, 180),
    activo = coalesce(activo, true);

insert into public.tours (
    titulo, destino, descripcion, precio, duracion, cupos, imagen,
    categoria, dificultad, idioma, punto_encuentro,
    vuelo_disponible, bus_disponible, hotel_disponible,
    precio_vuelo, precio_bus, precio_hotel, activo
)
select
    'Cusco Premium y Valle Sagrado',
    'Cusco',
    'Paquete cultural con recorrido guiado por sitios arqueologicos, mercados locales, miradores andinos y asistencia durante todo el viaje.',
    1290,
    4,
    18,
    'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1200&auto=format&fit=crop',
    'Cultural',
    'Moderada',
    'Espanol',
    'Plaza de Armas de Cusco',
    true,
    true,
    true,
    380,
    160,
    260,
    true
where not exists (
    select 1 from public.tours
    where lower(titulo) = lower('Cusco Premium y Valle Sagrado')
);

insert into public.tours (
    titulo, destino, descripcion, precio, duracion, cupos, imagen,
    categoria, dificultad, idioma, punto_encuentro,
    vuelo_disponible, bus_disponible, hotel_disponible,
    precio_vuelo, precio_bus, precio_hotel, activo
)
select
    'Arequipa, Colca y Gastronomia',
    'Arequipa',
    'Experiencia de ciudad historica, miradores del Colca y seleccion gastronomica regional con hospedaje recomendado.',
    980,
    3,
    16,
    'https://images.unsplash.com/photo-1590602390121-9c2ec384a764?q=80&w=1200&auto=format&fit=crop',
    'Naturaleza',
    'Moderada',
    'Espanol',
    'Centro historico de Arequipa',
    true,
    true,
    true,
    320,
    120,
    230,
    true
where not exists (
    select 1 from public.tours
    where lower(titulo) = lower('Arequipa, Colca y Gastronomia')
);

-- =========================
-- HOTELES
-- =========================

alter table public.hotels
    add column if not exists estrellas integer default 4,
    add column if not exists descripcion text default 'Hotel recomendado por ubicacion, comodidad y servicio al viajero.',
    add column if not exists precio_por_noche numeric(12,2) default 180,
    add column if not exists imagen text null,
    add column if not exists activo boolean default true;

update public.hotels
set
    estrellas = coalesce(estrellas, 4),
    descripcion = coalesce(descripcion, 'Hotel recomendado por ubicacion, comodidad y servicio al viajero.'),
    precio_por_noche = coalesce(precio_por_noche, 180),
    imagen = coalesce(imagen, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop'),
    activo = coalesce(activo, true);

insert into public.hotels (
    nombre, ciudad, estrellas, descripcion, precio_por_noche, imagen, activo
)
select
    'Andes Boutique Cusco',
    'Cusco',
    4,
    'Hotel centrico con desayuno, wifi, recepcion continua y coordinacion para excursiones.',
    260,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
    true
where not exists (
    select 1 from public.hotels
    where lower(nombre) = lower('Andes Boutique Cusco')
);

insert into public.hotels (
    nombre, ciudad, estrellas, descripcion, precio_por_noche, imagen, activo
)
select
    'Casa Blanca Arequipa',
    'Arequipa',
    5,
    'Hotel superior cerca del centro historico con desayuno, traslado coordinado y habitaciones familiares.',
    230,
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop',
    true
where not exists (
    select 1 from public.hotels
    where lower(nombre) = lower('Casa Blanca Arequipa')
);

-- =========================
-- TRANSPORTES
-- =========================

alter table public.flights
    add column if not exists fecha_salida date null,
    add column if not exists fecha_llegada date null,
    add column if not exists capacidad integer default 40,
    add column if not exists activo boolean default true;

do $$
declare
    constraint_record record;
begin
    for constraint_record in
        select conname
        from pg_constraint
        where conrelid = 'public.flights'::regclass
          and contype = 'c'
          and pg_get_constraintdef(oid) ilike '%tipo%'
    loop
        execute format(
            'alter table public.flights drop constraint if exists %I',
            constraint_record.conname
        );
    end loop;
end $$;

update public.flights
set
    tipo = case
        when translate(lower(tipo), chr(243), 'o') = 'avion' then 'vuelo'
        else tipo
    end,
    capacidad = coalesce(capacidad, 40),
    activo = coalesce(activo, true);

alter table public.flights
    drop constraint if exists flights_tipo_professional_check;

alter table public.flights
    add constraint flights_tipo_professional_check
    check (tipo in ('vuelo', 'bus'));

insert into public.flights (
    origen, destino, aerolinea, tipo, fecha_salida, fecha_llegada, precio, capacidad, activo
)
select
    'Lima',
    'Cusco',
    'LATAM Peru',
    'vuelo',
    current_date + 7,
    current_date + 7,
    380,
    50,
    true
where not exists (
    select 1 from public.flights
    where lower(aerolinea) = lower('LATAM Peru')
      and destino = 'Cusco'
      and tipo = 'vuelo'
);

insert into public.flights (
    origen, destino, aerolinea, tipo, fecha_salida, fecha_llegada, precio, capacidad, activo
)
select
    'Lima',
    'Arequipa',
    'Cruz del Sur Premium',
    'bus',
    current_date + 8,
    current_date + 8,
    120,
    46,
    true
where not exists (
    select 1 from public.flights
    where lower(aerolinea) = lower('Cruz del Sur Premium')
      and destino = 'Arequipa'
      and tipo = 'bus'
);

-- =========================
-- PAGOS
-- =========================

alter table public.payments
    add column if not exists moneda text not null default 'usd';

update public.payments
set moneda = 'usd'
where moneda is null;

notify pgrst, 'reload schema';

-- =========================
-- NOTIFICACIONES / AUDITORIA
-- =========================

create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    reservation_id uuid null references public.reservations(id) on delete set null,
    user_id uuid null references public.users(id) on delete set null,
    canal text not null default 'email',
    destinatario text not null,
    asunto text not null,
    estado text not null default 'pendiente',
    error text null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

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

alter table public.notifications
    add column if not exists metadata jsonb default '{}'::jsonb;

alter table public.audit_logs
    add column if not exists metadata jsonb default '{}'::jsonb;
