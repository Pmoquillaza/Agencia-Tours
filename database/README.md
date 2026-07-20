# Database

Scripts SQL usados por el proyecto TravelGo.

## Base profesional recomendada

Para reiniciar la base en Supabase y dejar el proyecto completo, ejecuta en el SQL Editor:

```txt
supabase_schema_professional.sql
```

Ese archivo crea:

- `users`
- `tours`
- `hotels`
- `flights`
- `reservations`
- `travelers`
- `payments`
- `notifications`
- `audit_logs`
- `service_health`

Tambien inserta datos demo para tours, hoteles, transportes y salud de servicios SOA.

## Catalogo grande de paquetes

Para cargar mas datos de demostracion sin borrar usuarios ni reservas, ejecuta:

```txt
seed_100_travelgo_packages.sql
```

Ese archivo agrega:

- 100 paquetes turisticos TravelGo
- 200 opciones de transporte entre avion y bus
- 100 hoteles asociados a los destinos

Si tu base ya existia antes y Supabase muestra `null value in column "duracion_dias"`, ejecuta primero:

```txt
fix_legacy_tours_duration.sql
```

Luego vuelve a ejecutar `seed_100_travelgo_packages.sql`.

## Migracion rapida para perfil

Si ya tienes datos cargados y solo necesitas corregir el error del perfil:

```txt
add_user_profile_columns.sql
```

Ese script agrega sin borrar datos:

- `telefono`
- `documento`
- `estado`
- `updated_at`

## Verificacion de correo y Supabase Auth

Para que los usuarios registrados aparezcan tambien en `Authentication > Users` y se confirme el correo con codigo, ejecuta:

```txt
add_auth_email_verification.sql
```

El backend debe tener una service key de Supabase:

```env
SUPABASE_SERVICE_ROLE_KEY=
```

Si `SUPABASE_KEY` ya es la `service_role`, tambien funcionara, pero lo recomendado es separar `SUPABASE_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.

## Crear usuario administrador

1. Registra un usuario desde la app.
2. Ejecuta en Supabase:

```sql
update public.users
set rol = 'admin'
where correo = 'tu-correo@dominio.com';
```

## Variables .env del backend

Revisa que tu `.env` tenga:

```env
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
STRIPE_SECRET_KEY=
EMAIL_USER=
EMAIL_PASS=
PORT=3000
```

## Consulta de auditoria

```sql
select *
from public.audit_logs
order by created_at desc;
```

## Consulta de notificaciones

```sql
select *
from public.notifications
order by created_at desc;
```

## Consulta de salud SOA

```sql
select *
from public.service_health
order by service_name;
```
