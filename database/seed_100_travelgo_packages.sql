-- =========================================================
-- TravelGo - Seed profesional de catalogo
-- Inserta 100 paquetes turisticos, 200 opciones de transporte
-- y 100 hoteles demo sin borrar datos existentes.
-- Ejecutar despues de supabase_professional_upgrade.sql.
-- =========================================================

alter table public.tours
    add column if not exists duracion integer default 1,
    add column if not exists imagen text null,
    add column if not exists categoria text default 'Experiencia',
    add column if not exists dificultad text default 'Moderada',
    add column if not exists idioma text default 'Espanol',
    add column if not exists punto_encuentro text null,
    add column if not exists incluye text[] default array['Guia local', 'Asistencia al viajero'],
    add column if not exists recomendaciones text[] default array['Llevar documento', 'Llegar con anticipacion'],
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

alter table public.hotels
    add column if not exists estrellas integer default 4,
    add column if not exists descripcion text default 'Hotel recomendado por ubicacion, comodidad y servicio al viajero.',
    add column if not exists precio_por_noche numeric(12,2) default 180,
    add column if not exists imagen text null,
    add column if not exists servicios text[] default array['Wifi', 'Desayuno', 'Asistencia'],
    add column if not exists activo boolean default true;

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

create temporary table if not exists travelgo_seed_destinations (
    destino text,
    categoria text,
    base_price numeric(12,2),
    flight_price numeric(12,2),
    bus_price numeric(12,2),
    hotel_price numeric(12,2),
    duracion integer,
    cupos integer,
    dificultad text,
    image_url text,
    punto_encuentro text
);

truncate table travelgo_seed_destinations;

insert into travelgo_seed_destinations values
('Cusco', 'Cultural', 520, 380, 160, 260, 4, 24, 'Moderada', 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1200&auto=format&fit=crop', 'Plaza de Armas de Cusco'),
('Machu Picchu', 'Cultural', 890, 420, 190, 320, 5, 18, 'Moderada', 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1200&auto=format&fit=crop', 'Estacion Ollantaytambo'),
('Valle Sagrado', 'Cultural', 610, 360, 150, 250, 4, 22, 'Ligera', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200&auto=format&fit=crop', 'Plaza de Pisac'),
('Arequipa', 'Gastronomia', 500, 320, 120, 180, 2, 28, 'Ligera', 'https://images.unsplash.com/photo-1590602390121-9c2ec384a764?q=80&w=1200&auto=format&fit=crop', 'Centro historico de Arequipa'),
('Canon del Colca', 'Naturaleza', 680, 350, 150, 210, 3, 20, 'Moderada', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop', 'Mirador Cruz del Condor'),
('Puno', 'Cultural', 430, 280, 110, 170, 3, 26, 'Ligera', 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=1200&auto=format&fit=crop', 'Puerto de Puno'),
('Lago Titicaca', 'Naturaleza', 560, 300, 120, 185, 3, 24, 'Ligera', 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=1200&auto=format&fit=crop', 'Puerto lacustre'),
('Paracas', 'Naturaleza', 350, 220, 75, 150, 2, 30, 'Ligera', 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1200&auto=format&fit=crop', 'Malecon El Chaco'),
('Ica y Huacachina', 'Aventura', 370, 230, 80, 145, 2, 30, 'Moderada', 'https://images.unsplash.com/photo-1534777367038-9404f45b869a?q=80&w=1200&auto=format&fit=crop', 'Oasis de Huacachina'),
('Nazca', 'Aventura', 480, 260, 95, 160, 2, 24, 'Moderada', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop', 'Aerodromo Maria Reiche'),
('Huaraz', 'Aventura', 590, 300, 115, 175, 4, 22, 'Alta', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop', 'Plaza de Armas de Huaraz'),
('Cordillera Blanca', 'Aventura', 730, 330, 125, 210, 5, 18, 'Alta', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop', 'Parque Nacional Huascaran'),
('Trujillo', 'Cultural', 410, 260, 95, 155, 3, 28, 'Ligera', 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1200&auto=format&fit=crop', 'Plaza Mayor de Trujillo'),
('Chiclayo', 'Cultural', 390, 250, 90, 150, 3, 28, 'Ligera', 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1200&auto=format&fit=crop', 'Museo Tumbas Reales'),
('Cajamarca', 'Cultural', 440, 270, 100, 165, 3, 24, 'Ligera', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', 'Plaza de Armas de Cajamarca'),
('Tarapoto', 'Naturaleza', 620, 360, 130, 190, 4, 22, 'Moderada', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop', 'Plaza de Tarapoto'),
('Iquitos', 'Naturaleza', 780, 420, 180, 230, 5, 18, 'Moderada', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop', 'Puerto de Iquitos'),
('Puerto Maldonado', 'Naturaleza', 760, 390, 160, 220, 5, 18, 'Moderada', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop', 'Reserva Tambopata'),
('Mancora', 'Playa', 470, 310, 115, 180, 3, 30, 'Ligera', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', 'Malecon de Mancora'),
('Tumbes', 'Playa', 450, 300, 110, 175, 3, 28, 'Ligera', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', 'Plaza de Tumbes'),
('Lima Historica', 'Urbano', 280, 160, 60, 140, 2, 36, 'Ligera', 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1200&auto=format&fit=crop', 'Plaza San Martin'),
('Lunahuana', 'Aventura', 320, 180, 70, 145, 2, 32, 'Moderada', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop', 'Plaza de Lunahuana'),
('Ayacucho', 'Cultural', 420, 280, 100, 160, 3, 24, 'Ligera', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', 'Plaza Mayor de Ayacucho'),
('Chachapoyas', 'Naturaleza', 650, 360, 140, 190, 4, 20, 'Moderada', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', 'Plaza de Chachapoyas'),
('Kuelap', 'Cultural', 720, 380, 150, 205, 4, 18, 'Moderada', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', 'Teleferico Kuelap'),
('Oxapampa', 'Naturaleza', 430, 250, 95, 160, 3, 26, 'Ligera', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop', 'Plaza de Oxapampa'),
('Pozuzo', 'Naturaleza', 470, 260, 100, 170, 3, 24, 'Ligera', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop', 'Centro de Pozuzo'),
('Huancayo', 'Cultural', 360, 220, 85, 150, 2, 28, 'Ligera', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', 'Plaza Constitucion'),
('Huancavelica', 'Cultural', 380, 230, 90, 150, 3, 24, 'Ligera', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', 'Plaza de Huancavelica'),
('Moquegua', 'Gastronomia', 390, 250, 95, 160, 2, 24, 'Ligera', 'https://images.unsplash.com/photo-1590602390121-9c2ec384a764?q=80&w=1200&auto=format&fit=crop', 'Centro de Moquegua'),
('Tacna', 'Urbano', 400, 260, 100, 165, 2, 26, 'Ligera', 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1200&auto=format&fit=crop', 'Paseo Civico de Tacna'),
('Piura', 'Playa', 390, 250, 95, 160, 2, 28, 'Ligera', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', 'Plaza de Armas de Piura'),
('La Paz', 'Cultural', 720, 520, 220, 210, 4, 20, 'Moderada', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop', 'Centro historico de La Paz'),
('Salar de Uyuni', 'Aventura', 980, 620, 260, 240, 5, 16, 'Moderada', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop', 'Terminal turistica de Uyuni'),
('Copacabana Bolivia', 'Naturaleza', 610, 460, 190, 190, 3, 20, 'Ligera', 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=1200&auto=format&fit=crop', 'Puerto de Copacabana'),
('Santiago', 'Urbano', 890, 680, 320, 260, 4, 22, 'Ligera', 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1200&auto=format&fit=crop', 'Centro de Santiago'),
('San Pedro de Atacama', 'Aventura', 1050, 720, 360, 280, 5, 16, 'Moderada', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop', 'Plaza de San Pedro'),
('Valparaiso', 'Cultural', 760, 620, 300, 240, 3, 22, 'Ligera', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', 'Puerto de Valparaiso'),
('Quito', 'Cultural', 830, 690, 330, 250, 4, 22, 'Ligera', 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1200&auto=format&fit=crop', 'Centro historico de Quito'),
('Galapagos', 'Naturaleza', 1580, 980, 420, 360, 6, 14, 'Moderada', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', 'Muelle turistico de Galapagos'),
('Guayaquil', 'Urbano', 760, 640, 300, 230, 3, 22, 'Ligera', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', 'Malecon 2000'),
('Bogota', 'Urbano', 920, 720, 340, 260, 4, 22, 'Ligera', 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1200&auto=format&fit=crop', 'La Candelaria'),
('Cartagena', 'Playa', 1120, 780, 360, 300, 5, 20, 'Ligera', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', 'Ciudad amurallada'),
('Medellin', 'Urbano', 860, 710, 330, 250, 4, 22, 'Ligera', 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1200&auto=format&fit=crop', 'Parque Berrio'),
('Buenos Aires', 'Cultural', 1180, 840, 420, 320, 5, 20, 'Ligera', 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1200&auto=format&fit=crop', 'Obelisco de Buenos Aires'),
('Bariloche', 'Naturaleza', 1320, 880, 450, 340, 5, 18, 'Moderada', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop', 'Centro Civico de Bariloche'),
('Mendoza', 'Gastronomia', 1050, 810, 390, 300, 4, 20, 'Ligera', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', 'Plaza Independencia'),
('Rio de Janeiro', 'Playa', 1450, 920, 460, 350, 5, 18, 'Ligera', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', 'Copacabana'),
('Cataratas de Iguazu', 'Naturaleza', 1280, 860, 430, 320, 4, 18, 'Moderada', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop', 'Centro de visitantes Iguazu'),
('Montevideo', 'Urbano', 1020, 790, 390, 290, 4, 20, 'Ligera', 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1200&auto=format&fit=crop', 'Ciudad Vieja');

with estilos(nombre, descripcion, multiplicador, extra_precio, extra_dias, extra_cupos, extra_vuelo, extra_bus, extra_hotel) as (
    values
    ('Esencial', 'itinerario curado con alojamiento recomendado, asistencia y experiencias principales.', 1.00::numeric, 0::numeric, 0, 0, 0::numeric, 0::numeric, 0::numeric),
    ('Premium', 'experiencia superior con hoteles mejor ubicados, ritmos flexibles y servicios preferentes.', 1.35::numeric, 190::numeric, 1, -4, 120::numeric, 45::numeric, 90::numeric)
)
insert into public.tours (
    titulo, destino, descripcion, precio, duracion, cupos, imagen,
    categoria, dificultad, idioma, punto_encuentro, incluye, recomendaciones,
    vuelo_disponible, bus_disponible, hotel_disponible,
    precio_vuelo, precio_bus, precio_hotel, activo
)
select
    'TravelGo ' || d.destino || ' ' || e.nombre,
    d.destino,
    'Paquete ' || lower(e.nombre) || ' hacia ' || d.destino || ': ' || e.descripcion,
    round((d.base_price * e.multiplicador) + e.extra_precio, 2),
    d.duracion + e.extra_dias,
    greatest(d.cupos + e.extra_cupos, 8),
    d.image_url,
    d.categoria,
    d.dificultad,
    'Espanol',
    d.punto_encuentro,
    array['Guia local', 'Asistencia 24/7', 'Itinerario digital', case when e.nombre = 'Premium' then 'Atencion preferente' else 'Coordinacion de viaje' end],
    array['Llevar documento', 'Confirmar datos de viajeros', 'Llegar 30 minutos antes'],
    true,
    true,
    true,
    d.flight_price + e.extra_vuelo,
    d.bus_price + e.extra_bus,
    d.hotel_price + e.extra_hotel,
    true
from travelgo_seed_destinations d
cross join estilos e
where not exists (
    select 1
    from public.tours t
    where lower(t.titulo) = lower('TravelGo ' || d.destino || ' ' || e.nombre)
);

with opciones(empresa, tipo, price_extra, capacity_extra, day_offset) as (
    values
    ('SkyHigh Airways', 'vuelo', 0::numeric, 8, 7),
    ('LATAM Connect', 'vuelo', 120::numeric, 2, 9),
    ('TravelGo Bus Premium', 'bus', 0::numeric, 10, 8),
    ('TransNational Express', 'bus', 45::numeric, 4, 10)
)
insert into public.flights (
    origen, destino, aerolinea, tipo, fecha_salida, fecha_llegada, precio, capacidad, activo
)
select
    case when o.tipo = 'vuelo' then 'Lima Airport' else 'Terminal Lima' end,
    d.destino,
    o.empresa,
    o.tipo,
    current_date + o.day_offset,
    current_date + o.day_offset,
    case
        when o.tipo = 'vuelo' then d.flight_price + o.price_extra
        else d.bus_price + o.price_extra
    end,
    case
        when o.tipo = 'vuelo' then 42 + o.capacity_extra
        else 46 + o.capacity_extra
    end,
    true
from travelgo_seed_destinations d
cross join opciones o
where not exists (
    select 1
    from public.flights f
    where lower(f.aerolinea) = lower(o.empresa)
      and lower(f.destino) = lower(d.destino)
      and f.tipo = o.tipo
);

with hoteles(nombre_tipo, estrellas, price_extra, servicios_extra) as (
    values
    ('Select', 4, 0::numeric, array['Wifi', 'Desayuno', 'Asistencia']),
    ('Boutique', 5, 90::numeric, array['Wifi', 'Desayuno', 'Traslado', 'Vista superior'])
)
insert into public.hotels (
    nombre, ciudad, estrellas, descripcion, precio_por_noche, imagen, servicios, activo
)
select
    'TravelGo ' || h.nombre_tipo || ' ' || d.destino,
    d.destino,
    h.estrellas,
    'Alojamiento ' || lower(h.nombre_tipo) || ' en ' || d.destino || ' con ubicacion conveniente, habitaciones confortables y soporte de viaje.',
    d.hotel_price + h.price_extra,
    d.image_url,
    h.servicios_extra,
    true
from travelgo_seed_destinations d
cross join hoteles h
where not exists (
    select 1
    from public.hotels existing
    where lower(existing.nombre) = lower('TravelGo ' || h.nombre_tipo || ' ' || d.destino)
);

notify pgrst, 'reload schema';

select
    (select count(*) from public.tours where titulo like 'TravelGo %') as paquetes_travelgo,
    (select count(*) from public.flights where aerolinea in ('SkyHigh Airways', 'LATAM Connect', 'TravelGo Bus Premium', 'TransNational Express')) as transportes_travelgo,
    (select count(*) from public.hotels where nombre like 'TravelGo %') as hoteles_travelgo;
