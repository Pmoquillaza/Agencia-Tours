# Estructura del Proyecto

## Backend

Ruta: `backend/`

- `index.js`: configura Express, CORS, JSON/XML y monta las rutas.
- `config/supabase.js`: cliente de Supabase.
- `middleware/auth.middleware.js`: autenticacion JWT y autorizacion admin.
- `services/auth-service`: registro, login y generacion de token.
- `services/tour-service`: CRUD administrativo de tours.
- `services/reservation-service`: creacion, consulta y cancelacion de reservas.
- `services/traveler-service`: registro de viajeros.
- `services/payment-service`: Stripe, confirmacion de pago y correo.
- `services/notification-service`: envio de correo por XML.
- `services/audit.service.js`: auditoria transversal.
- `services/bpm.service.js`: motor BPM simulado.
- `services/email.service.js`: transporte de correo con Nodemailer.
- `config/supabaseAdmin.js`: cliente backend con `SUPABASE_SERVICE_ROLE_KEY`
  para procesos internos como auditoria, notificaciones y codigos.

## Frontend

Ruta: `frontend/client/`

- `src/api/axios.js`: cliente HTTP centralizado.
- `src/context/AuthContext.jsx`: sesion de usuario.
- `src/routes/AppRoutes.jsx`: rutas de la aplicacion.
- `src/services`: funciones para consumir APIs.
- `src/pages`: pantallas de usuario y administracion.
- `src/components`: componentes reutilizables.

## Database

Ruta: `database/`

- `audit_logs.sql`: tabla e indices para auditoria.
- `supabase_professional_upgrade.sql`: actualizacion profesional incremental.
- `supabase_schema_professional.sql`: esquema completo desde cero.
- `seed_100_travelgo_packages.sql`: datos de prueba para paquetes, hoteles y transportes.
- `add_auth_email_verification.sql`: columnas y tabla para verificacion por codigo.

## Docs

Ruta: `docs/`

- `FINAL_PROJECT_DELIVERABLES.md`: mapeo contra requisitos de Semana 18.
- `SOA_ARCHITECTURE.md`: arquitectura, decisiones SOA y alineacion negocio.
- `SERVICE_CATALOG.md`: catalogo de servicios.
- `SECURITY_MANUAL.md`: seguridad, integridad y confidencialidad.
- `LIVE_DEMO_SCRIPT.md`: guion de sustentacion.
- `openapi.yaml`: contrato OpenAPI.
- `contracts/`: XML, XSD y WSDL del servicio de notificaciones.
