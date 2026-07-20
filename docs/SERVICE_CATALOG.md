# Catalogo de Servicios

Contrato OpenAPI: `docs/openapi.yaml`  
Endpoint del contrato en ejecucion: `GET /api/openapi.yaml`

## Resumen

| Servicio | Endpoint base | Proposito |
| --- | --- | --- |
| Auth | `/api/auth` | Registro, login, verificacion por codigo y perfil |
| Tours | `/api/tours` | Catalogo y administracion de paquetes |
| Transportes | `/api/flights` | Vuelos y buses por destino |
| Hoteles | `/api/hotels` | Hospedajes por destino |
| Reservas | `/api/reservations` | Reserva, calculo, cupos y cancelacion |
| Viajeros | `/api/travelers` | Pasajeros asociados a reserva |
| Pagos | `/api/payments` | Stripe Payment Intent y confirmacion |
| Notificaciones | `/api/notifications` | Envio de correos XML |
| Auditoria | Servicio interno | Registro transversal en `audit_logs` |
| BPM | Servicio interno | Orquestacion de procesos |

## Auth Service

| Metodo | Ruta | Seguridad | Descripcion |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Publico | Crea usuario, registra en Supabase Auth y envia codigo |
| POST | `/api/auth/login` | Publico | Valida credenciales y envia codigo de acceso |
| POST | `/api/auth/verify-code` | Publico | Verifica codigo de registro o login |
| GET | `/api/auth/profile` | JWT | Obtiene perfil autenticado |
| PUT | `/api/auth/profile` | JWT | Actualiza nombre, apellido, telefono y documento |

Tablas: `users`, `auth_verification_codes`, `notifications`, `audit_logs`.

## Tour Service

| Metodo | Ruta | Seguridad | Descripcion |
| --- | --- | --- | --- |
| GET | `/api/tours/list` | Publico | Lista paquetes turisticos |
| GET | `/api/tours/:id` | Publico | Obtiene detalle de paquete |
| POST | `/api/tours/create` | JWT + admin | Crea tour usando XML |
| PUT | `/api/tours/:id` | JWT + admin | Actualiza tour |
| DELETE | `/api/tours/:id` | JWT + admin | Elimina tour |

Tablas: `tours`, `audit_logs`.

## Flight/Transport Service

| Metodo | Ruta | Seguridad | Descripcion |
| --- | --- | --- | --- |
| GET | `/api/flights/list` | Publico | Lista vuelos y buses |
| GET | `/api/flights/:id` | Publico | Obtiene transporte por ID |
| POST | `/api/flights/create` | JWT + admin | Crea transporte |
| PUT | `/api/flights/:id` | JWT + admin | Actualiza transporte |
| DELETE | `/api/flights/:id` | JWT + admin | Elimina transporte |

Tablas: `flights`, `audit_logs`.

## Hotel Service

| Metodo | Ruta | Seguridad | Descripcion |
| --- | --- | --- | --- |
| GET | `/api/hotels/list` | Publico | Lista hoteles filtrados por destino |
| POST | `/api/hotels/create` | JWT + admin | Crea hotel |
| PUT | `/api/hotels/:id` | JWT + admin | Actualiza hotel |
| DELETE | `/api/hotels/:id` | JWT + admin | Elimina hotel |

Tablas: `hotels`, `audit_logs`.

## Reservation Service

| Metodo | Ruta | Seguridad | Descripcion |
| --- | --- | --- | --- |
| POST | `/api/reservations/create` | JWT | Crea reserva, calcula total y descuenta cupos |
| GET | `/api/reservations/list` | JWT | Lista reservas del usuario |
| GET | `/api/reservations/:id` | JWT | Obtiene reserva por ID |
| POST | `/api/reservations/:id/cancel` | JWT | Cancela reserva y libera cupos si aplica |

Tablas: `reservations`, `tours`, `audit_logs`.

## Traveler Service

| Metodo | Ruta | Seguridad | Descripcion |
| --- | --- | --- | --- |
| POST | `/api/travelers/create` | JWT | Crea viajero asociado a reserva |
| GET | `/api/travelers/reservation/:reservationId` | JWT | Lista viajeros de una reserva |

Tablas: `travelers`, `audit_logs`.

## Payment Service

| Metodo | Ruta | Seguridad | Descripcion |
| --- | --- | --- | --- |
| POST | `/api/payments/create-intent` | JWT | Crea o reutiliza Stripe Payment Intent |
| POST | `/api/payments/confirm` | JWT | Confirma pago, actualiza reserva y envia correo |

Tablas: `payments`, `reservations`, `notifications`, `audit_logs`.

Integracion externa: Stripe.

## Notification Service

| Metodo | Ruta | Seguridad | Descripcion |
| --- | --- | --- | --- |
| POST | `/api/notifications/send` | JWT | Envia correo mediante XML |

Contratos:

- XML de ejemplo: `docs/contracts/reservation-email-sample.xml`
- XSD: `docs/contracts/reservation-email.xsd`
- WSDL: `docs/contracts/notification-service.wsdl`

Tablas: `notifications`, `audit_logs`.

Integracion externa: Gmail/Nodemailer.

## Audit Service

Servicio interno usado transversalmente por los demas modulos.

Campos principales:

- `actor_id`: usuario o sistema que ejecuta la accion.
- `actor_email`: correo del actor.
- `action`: accion ejecutada.
- `entity`: entidad afectada.
- `entity_id`: identificador de la entidad.
- `status`: `success` o `error`.
- `metadata`: detalle tecnico/negocio en JSON.
- `created_at`: fecha y hora.

Consulta de evidencia:

```sql
select actor_email, action, entity, status, created_at, metadata
from public.audit_logs
order by created_at desc;
```
