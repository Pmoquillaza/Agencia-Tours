# Flujos Implementados y Evidencia

## Registro, verificacion e inicio de sesion

Archivos:

- `backend/services/auth-service/auth.controller.js`
- `frontend/client/src/pages/Register.jsx`
- `frontend/client/src/pages/Login.jsx`
- `backend/services/notification-service/notification.service.js`

Evidencia:

- Valida datos.
- Verifica usuario existente.
- Encripta contrasena con bcrypt.
- Registra usuario en Supabase Auth.
- Envia codigo de verificacion por correo.
- Guarda el codigo con hash y expiracion en `auth_verification_codes`.
- Registra el envio en `notifications`.
- Genera JWT solo despues de validar codigo de login.
- Registra auditoria `REGISTER_USER`, `LOGIN_CODE_SENT`, `VERIFY_REGISTER_CODE` y `VERIFY_LOGIN_CODE`.

## Administracion de tours

Archivos:

- `backend/services/tour-service/tour.controller.js`
- `backend/services/tour-service/tour.routes.js`
- `frontend/client/src/pages/AdminTours.jsx`
- `frontend/client/src/services/tourService.js`

Evidencia:

- Crear, editar y eliminar tours.
- Valida datos.
- Protege rutas con JWT y rol admin.
- Registra auditoria `CREATE_TOUR`, `UPDATE_TOUR`, `DELETE_TOUR`.

## Reserva, pago y confirmacion

Archivos:

- `backend/services/reservation-service/reservation.controller.js`
- `backend/services/payment-service/confirmPayment.controller.js`
- `backend/services/bpm.service.js`
- `frontend/client/src/pages/Payment.jsx`

Evidencia:

- Reserva en estado `pendiente`.
- Validacion de cupos.
- Reserva temporal de cupos.
- Pago aprobado: reserva `confirmada`, correo enviado y auditoria `CONFIRM_PAYMENT`.
- Pago no aprobado: reserva `cancelada`, liberacion de cupos y auditoria `CANCEL_RESERVATION`.
- El correo de confirmacion queda registrado en `notifications`.

## Auditoria

Archivos:

- `backend/services/audit.service.js`
- `database/audit_logs.sql`

Evidencia:

- Registra quien ejecuto la accion.
- Registra cuando ocurrio por `created_at`.
- Registra que accion se ejecuto en `action`.
- Guarda estado `success` o `error`.
- Guarda detalle tecnico/negocio en `metadata`.

Consulta:

```sql
select *
from audit_logs
order by created_at desc;
```

## Seguridad JWT

Archivos:

- `backend/services/auth-service/auth.controller.js`
- `backend/middleware/auth.middleware.js`

Evidencia:

- Login genera token JWT.
- Middleware valida token.
- Middleware `authorizeAdmin` protege acciones administrativas.

## Contratos y documentacion

Archivos:

- `docs/openapi.yaml`
- `docs/contracts/reservation-email.xsd`
- `docs/contracts/notification-service.wsdl`
- `docs/SOA_ARCHITECTURE.md`
- `docs/SERVICE_CATALOG.md`
- `docs/SECURITY_MANUAL.md`

Evidencia:

- OpenAPI expuesto en `GET /api/openapi.yaml`.
- WSDL expuesto en `GET /api/contracts/notification-service.wsdl`.
- XSD expuesto en `GET /api/contracts/reservation-email.xsd`.
