# TravelGo - Agencia Tours SOA

Sistema web para gestion integral de tours, reservas, viajeros, pagos,
notificaciones y auditoria. El proyecto esta organizado bajo un enfoque SOA:
servicios por dominio, contratos documentados, orquestacion de procesos,
seguridad y trazabilidad.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Base de datos: Supabase/PostgreSQL
- Autenticacion: JWT + verificacion por codigo de correo
- Pagos: Stripe
- Correos: Nodemailer + Gmail
- Auditoria: servicio transversal + tabla `audit_logs`
- Notificaciones: tabla `notifications`
- BPM simulado: `backend/services/bpm.service.js`
- Health SOA: `GET /api/health`
- OpenAPI: `GET /api/openapi.yaml`
- Contratos XML/XSD/WSDL: `docs/contracts/`

> Nota academica: el enunciado base menciona Spring Boot, Angular y SQL Server,
> pero el docente indico que la tecnologia puede variar. La equivalencia se
> documenta en `docs/SOA_ARCHITECTURE.md`.

## Entrega final Semana 18

| Requisito | Evidencia |
| --- | --- |
| Sistema funcional | Backend, frontend y base de datos con datos de prueba |
| Arquitectura SOA | `docs/SOA_ARCHITECTURE.md` |
| Catalogo de servicios | `docs/SERVICE_CATALOG.md` y `docs/openapi.yaml` |
| Seguridad | `docs/SECURITY_MANUAL.md` |
| Contratos XML/WSDL/XSD | `docs/contracts/` |
| Orquestacion | `backend/services/bpm.service.js` |
| Auditoria | `backend/services/audit.service.js` y `public.audit_logs` |
| Notificaciones | `notification-service` y `public.notifications` |
| Demo en vivo | `docs/LIVE_DEMO_SCRIPT.md` |
| Despliegue Ubuntu | `docs/DEPLOY_UBUNTU.md` |
| Checklist final | `docs/FINAL_PROJECT_DELIVERABLES.md` |

## Estructura

```txt
Agencia-Tours/
  backend/
    config/                 Conexion a Supabase
    middleware/             JWT y autorizacion
    services/               Servicios por dominio
      auth-service/
      tour-service/
      reservation-service/
      traveler-service/
      payment-service/
      notification-service/
      audit.service.js
      bpm.service.js
      email.service.js
    index.js                Entrada del servidor Express
  database/
    supabase_schema_professional.sql
    seed_100_travelgo_packages.sql
    audit_logs.sql
  docs/
    FINAL_PROJECT_DELIVERABLES.md
    SOA_ARCHITECTURE.md
    SERVICE_CATALOG.md
    SECURITY_MANUAL.md
    LIVE_DEMO_SCRIPT.md
    DEPLOY_UBUNTU.md
    openapi.yaml
    contracts/
  frontend/
    client/
      src/
        api/                Cliente Axios
        components/         Componentes reutilizables
        context/            AuthContext
        pages/              Pantallas
        routes/             Rutas de React
        services/           Consumo de APIs
```

## Ejecucion

Backend:

```bash
cd backend
npm.cmd install
npm.cmd run dev
```

Verificar backend:

```txt
http://localhost:3000/api/health
http://localhost:3000/api/openapi.yaml
http://localhost:3000/api/contracts/notification-service.wsdl
http://localhost:3000/api/contracts/reservation-email.xsd
```

Frontend:

```bash
cd frontend/client
npm.cmd install
npm.cmd run dev
```

## Variables de entorno

Configurar credenciales en:

```txt
backend/.env
frontend/client/.env
```

Variables principales del backend:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_CURRENCY`
- `EMAIL_USER`
- `EMAIL_PASS`

Variable principal del frontend:

- `VITE_STRIPE_PUBLIC_KEY`

La `SUPABASE_SERVICE_ROLE_KEY` solo debe usarse en backend.

## Evidencia para auditoria

Crear o actualizar tablas en Supabase ejecutando:

```txt
database/supabase_professional_upgrade.sql
database/add_auth_email_verification.sql
database/seed_100_travelgo_packages.sql
```

Consultar logs:

```sql
select *
from audit_logs
order by created_at desc;
```

Consultar notificaciones:

```sql
select *
from notifications
order by created_at desc;
```

## Flujo de negocio principal

1. Registro de usuario con codigo de verificacion.
2. Login con codigo de acceso.
3. Consulta de paquetes turisticos.
4. Seleccion de transporte filtrado por destino.
5. Seleccion de hotel filtrado por destino.
6. Creacion de reserva con validacion de cupos.
7. Registro de viajeros.
8. Pago con Stripe.
9. Confirmacion de reserva.
10. Envio de correo.
11. Auditoria y registro de notificacion.
