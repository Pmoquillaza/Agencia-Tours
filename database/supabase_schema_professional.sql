-- =========================================================
-- TravelGo - Supabase Schema Profesional
-- Proyecto SOA: Auth, Tours, Reservas, Hoteles, Transportes,
-- Viajeros, Pagos, Notificaciones, Auditoria y Salud de Servicios
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- LIMPIEZA ORDENADA
-- =========================================================

drop table if exists public.service_health cascade;
drop table if exists public.notifications cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.payments cascade;
drop table if exists public.travelers cascade;
drop table if exists public.reservations cascade;
drop table if exists public.flights cascade;
drop table if exists public.hotels cascade;
drop table if exists public.tours cascade;
drop table if exists public.users cascade;

-- =========================================================
-- USUARIOS
-- =========================================================

create table public.users (
    id uuid primary key default gen_random_uuid(),
    nombre text not null,
    apellido text not null,
    correo text not null unique,
    email text generated always as (correo) stored,
    password text not null,
    supabase_auth_id uuid unique,
    email_verificado boolean not null default false,
    email_verificado_at timestamptz null,
    ultimo_login_at timestamptz null,
    rol text not null default 'cliente'
        check (rol in ('cliente', 'admin')),
    telefono text null,
    documento text null,
    estado text not null default 'activo'
        check (estado in ('activo', 'bloqueado')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_users_correo on public.users (correo);
create index idx_users_rol on public.users (rol);

create table public.auth_verification_codes (
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

create index idx_auth_codes_user_purpose
    on public.auth_verification_codes (user_id, purpose, created_at desc);

create index idx_auth_codes_correo
    on public.auth_verification_codes (correo);

-- =========================================================
-- TOURS
-- =========================================================

create table public.tours (
    id uuid primary key default gen_random_uuid(),
    titulo text not null,
    nombre text generated always as (titulo) stored,
    destino text not null,
    descripcion text not null,
    precio numeric(12,2) not null check (precio >= 0),
    precio_base numeric(12,2) generated always as (precio) stored,
    duracion integer not null default 1 check (duracion > 0),
    cupos integer not null default 0 check (cupos >= 0),
    imagen text null,
    categoria text not null default 'Experiencia',
    dificultad text not null default 'Moderada',
    idioma text not null default 'Espanol',
    punto_encuentro text null,
    incluye text[] not null default array['Guia local', 'Asistencia al viajero'],
    recomendaciones text[] not null default array['Llevar documento', 'Llegar con anticipacion'],
    vuelo_disponible boolean not null default true,
    bus_disponible boolean not null default true,
    hotel_disponible boolean not null default true,
    precio_vuelo numeric(12,2) not null default 180,
    precio_bus numeric(12,2) not null default 60,
    precio_hotel numeric(12,2) not null default 180,
    activo boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_tours_destino on public.tours (destino);
create index idx_tours_activo on public.tours (activo);

-- =========================================================
-- HOTELES
-- =========================================================

create table public.hotels (
    id uuid primary key default gen_random_uuid(),
    nombre text not null,
    ciudad text not null,
    estrellas integer not null default 4 check (estrellas between 1 and 5),
    descripcion text not null,
    precio_por_noche numeric(12,2) not null check (precio_por_noche >= 0),
    imagen text null,
    servicios text[] not null default array['Wifi', 'Desayuno', 'Asistencia'],
    activo boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_hotels_ciudad on public.hotels (ciudad);

-- =========================================================
-- TRANSPORTES / FLIGHTS
-- =========================================================

create table public.flights (
    id uuid primary key default gen_random_uuid(),
    origen text not null,
    destino text not null,
    aerolinea text not null,
    tipo text not null default 'vuelo'
        check (tipo in ('vuelo', 'bus')),
    fecha_salida date null,
    fecha_llegada date null,
    precio numeric(12,2) not null check (precio >= 0),
    capacidad integer not null default 20 check (capacidad >= 0),
    activo boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_flights_destino_tipo on public.flights (destino, tipo);

-- =========================================================
-- RESERVAS
-- =========================================================

create table public.reservations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    tour_id uuid not null references public.tours(id) on delete restrict,
    cantidad_personas integer not null check (cantidad_personas > 0),
    tipo_transporte text not null default 'vuelo'
        check (tipo_transporte in ('vuelo', 'bus')),
    hotel boolean not null default true,
    dias integer not null default 1 check (dias > 0),
    precio_transporte numeric(12,2) not null default 0,
    precio_hotel numeric(12,2) not null default 0,
    transport_nombre text null,
    hotel_nombre text null,
    subtotal numeric(12,2) not null default 0,
    impuesto numeric(12,2) not null default 0,
    total numeric(12,2) not null default 0,
    estado text not null default 'pendiente'
        check (estado in ('pendiente', 'confirmada', 'cancelada', 'expirada')),
    codigo text generated always as ('TG-' || upper(substr(id::text, 1, 8))) stored,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_reservations_user_id on public.reservations (user_id);
create index idx_reservations_tour_id on public.reservations (tour_id);
create index idx_reservations_estado on public.reservations (estado);

-- =========================================================
-- VIAJEROS
-- =========================================================

create table public.travelers (
    id uuid primary key default gen_random_uuid(),
    reservation_id uuid not null references public.reservations(id) on delete cascade,
    nombres text not null,
    apellidos text null,
    dni text null,
    documento text generated always as (dni) stored,
    fecha_nacimiento date null,
    genero text null,
    telefono text null,
    created_at timestamptz not null default now()
);

create index idx_travelers_reservation_id on public.travelers (reservation_id);

-- =========================================================
-- PAGOS
-- =========================================================

create table public.payments (
    id uuid primary key default gen_random_uuid(),
    reservation_id uuid not null references public.reservations(id) on delete cascade,
    stripe_payment_intent text not null,
    monto numeric(12,2) not null check (monto >= 0),
    moneda text not null default 'usd',
    estado text not null default 'pendiente'
        check (estado in ('pendiente', 'completado', 'fallido', 'cancelado')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_payments_reservation_id on public.payments (reservation_id);
create index idx_payments_estado on public.payments (estado);

-- =========================================================
-- NOTIFICACIONES
-- =========================================================

create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    reservation_id uuid null references public.reservations(id) on delete set null,
    user_id uuid null references public.users(id) on delete set null,
    canal text not null default 'email'
        check (canal in ('email', 'sms', 'system')),
    destinatario text not null,
    asunto text not null,
    estado text not null default 'pendiente'
        check (estado in ('pendiente', 'enviado', 'fallido')),
    error text null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index idx_notifications_reservation_id on public.notifications (reservation_id);
create index idx_notifications_estado on public.notifications (estado);

-- =========================================================
-- AUDITORIA SOA
-- =========================================================

create table public.audit_logs (
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

create index idx_audit_logs_created_at on public.audit_logs (created_at desc);
create index idx_audit_logs_actor_id on public.audit_logs (actor_id);
create index idx_audit_logs_entity on public.audit_logs (entity, entity_id);

-- =========================================================
-- SALUD DE SERVICIOS SOA
-- =========================================================

create table public.service_health (
    id uuid primary key default gen_random_uuid(),
    service_name text not null unique,
    status text not null default 'up'
        check (status in ('up', 'degraded', 'down')),
    description text null,
    last_checked_at timestamptz not null default now(),
    metadata jsonb not null default '{}'::jsonb
);

insert into public.service_health (service_name, status, description) values
('auth-service', 'up', 'Registro, login y emision de JWT'),
('tour-service', 'up', 'Catalogo y administracion de tours'),
('reservation-service', 'up', 'Reservas, cupos y cancelaciones'),
('traveler-service', 'up', 'Registro de pasajeros por reserva'),
('payment-service', 'up', 'Integracion con Stripe'),
('notification-service', 'up', 'Envio de correos transaccionales')
on conflict (service_name) do nothing;

-- =========================================================
-- DATOS DE DEMO
-- IMPORTANTE: las contrasenas reales se crean desde la app.
-- Para admin, crea un usuario desde /register y luego ejecuta:
-- update users set rol = 'admin' where correo = 'tu-correo@dominio.com';
-- =========================================================

insert into public.tours (
    titulo, destino, descripcion, precio, duracion, cupos, imagen,
    categoria, dificultad, punto_encuentro, precio_vuelo, precio_bus, precio_hotel
) values
(
    'Cusco Magico y Valle Sagrado',
    'Cusco',
    'Experiencia cultural con recorrido por sitios arqueologicos, mercados locales y paisajes andinos.',
    295,
    4,
    18,
    'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1200&auto=format&fit=crop',
    'Cultural',
    'Moderada',
    'Plaza de Armas de Cusco',
    190,
    70,
    210
),
(
    'Paracas e Islas Ballestas',
    'Paracas',
    'Ruta costera con fauna marina, reserva natural y paseo guiado por la bahia.',
    180,
    2,
    24,
    'https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1200&auto=format&fit=crop',
    'Naturaleza',
    'Ligera',
    'Terminal turistico de Paracas',
    160,
    55,
    160
),
(
    'Arequipa y Canon del Colca',
    'Arequipa',
    'Recorrido por ciudad historica, miradores naturales y experiencia gastronomica regional.',
    260,
    3,
    16,
    'https://images.unsplash.com/photo-1590602390121-9c2ec384a764?q=80&w=1200&auto=format&fit=crop',
    'Aventura',
    'Moderada',
    'Plaza de Armas de Arequipa',
    175,
    65,
    190
);

insert into public.hotels (
    nombre, ciudad, estrellas, descripcion, precio_por_noche, imagen, servicios
) values
(
    'Hotel Andino Boutique',
    'Cusco',
    4,
    'Hospedaje centrico con desayuno, wifi y asistencia para excursiones.',
    210,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
    array['Wifi', 'Desayuno', 'Recojo coordinado']
),
(
    'Costa Paracas Lodge',
    'Paracas',
    4,
    'Hotel cercano a la bahia con piscina y acceso rapido a tours marinos.',
    160,
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop',
    array['Wifi', 'Piscina', 'Desayuno']
),
(
    'Casa Blanca Arequipa',
    'Arequipa',
    5,
    'Hospedaje premium con ubicacion historica y servicio de traslado.',
    230,
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop',
    array['Wifi', 'Desayuno', 'Traslado']
);

insert into public.flights (
    origen, destino, aerolinea, tipo, fecha_salida, fecha_llegada, precio, capacidad
) values
('Lima', 'Cusco', 'Andes Air', 'vuelo', current_date + 7, current_date + 7, 190, 40),
('Lima', 'Cusco', 'Bus Turistico Imperial', 'bus', current_date + 7, current_date + 8, 70, 35),
('Lima', 'Paracas', 'Bus Costa Sur', 'bus', current_date + 5, current_date + 5, 55, 45),
('Lima', 'Arequipa', 'Peru Sky', 'vuelo', current_date + 10, current_date + 10, 175, 38),
('Lima', 'Arequipa', 'Bus Sur Premium', 'bus', current_date + 10, current_date + 11, 65, 42);

-- =========================================================
-- RLS PARA DEMO CON BACKEND
-- El backend usa SUPABASE_KEY desde .env. Para una demo academica,
-- estas politicas permiten operar desde API sin bloquear el flujo.
-- =========================================================

alter table public.users enable row level security;
alter table public.tours enable row level security;
alter table public.hotels enable row level security;
alter table public.flights enable row level security;
alter table public.reservations enable row level security;
alter table public.travelers enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.service_health enable row level security;

create policy "demo_all_users" on public.users for all to anon, authenticated using (true) with check (true);
create policy "demo_all_tours" on public.tours for all to anon, authenticated using (true) with check (true);
create policy "demo_all_hotels" on public.hotels for all to anon, authenticated using (true) with check (true);
create policy "demo_all_flights" on public.flights for all to anon, authenticated using (true) with check (true);
create policy "demo_all_reservations" on public.reservations for all to anon, authenticated using (true) with check (true);
create policy "demo_all_travelers" on public.travelers for all to anon, authenticated using (true) with check (true);
create policy "demo_all_payments" on public.payments for all to anon, authenticated using (true) with check (true);
create policy "demo_all_notifications" on public.notifications for all to anon, authenticated using (true) with check (true);
create policy "demo_all_audit_logs" on public.audit_logs for all to anon, authenticated using (true) with check (true);
create policy "demo_all_service_health" on public.service_health for all to anon, authenticated using (true) with check (true);
