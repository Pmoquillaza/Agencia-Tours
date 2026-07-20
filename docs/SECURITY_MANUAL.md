# Manual de Seguridad

## Objetivo

Proteger la confidencialidad, integridad y trazabilidad de las operaciones de
TravelGo: registro, reservas, pagos, viajeros, notificaciones y administracion.

## Autenticacion

El sistema usa JWT:

- El usuario ingresa correo y contrasena.
- El backend valida la contrasena con hash bcrypt.
- Se envia un codigo de verificacion al correo.
- Al validar el codigo se entrega un token JWT.
- Las rutas privadas requieren `Authorization: Bearer <token>`.

Archivos:

- `backend/services/auth-service/auth.controller.js`
- `backend/middleware/auth.middleware.js`
- `frontend/client/src/context/AuthContext.jsx`

## Verificacion por correo

La verificacion protege contra cuentas falsas o accesos no autorizados:

- Codigo de 6 digitos.
- Expiracion de 10 minutos.
- Hash del codigo guardado en `auth_verification_codes`.
- Maximo de intentos para bloquear codigos abusados.
- Registro del envio en `notifications`.
- Auditoria del evento en `audit_logs`.

## Autorizacion

El middleware `authorizeAdmin` protege operaciones administrativas:

- Crear, editar o eliminar tours.
- Crear, editar o eliminar hoteles.
- Crear, editar o eliminar transportes.

Los clientes no pueden modificar catalogos maestros.

## Confidencialidad

Medidas aplicadas:

- Contrasenas almacenadas con bcrypt, no en texto plano.
- JWT firmado con `JWT_SECRET`.
- Claves de Stripe, Supabase y Gmail guardadas en `.env`.
- La clave `SUPABASE_SERVICE_ROLE_KEY` solo se usa en backend.
- El frontend solo usa claves publicas como `VITE_STRIPE_PUBLIC_KEY`.
- No se guardan datos completos de tarjetas en la base de datos.

## Integridad

Medidas aplicadas:

- Validacion de cupos antes de crear reserva.
- Descuento de cupos al reservar.
- Liberacion de cupos si se cancela una reserva pendiente.
- Recalculo de totales en backend antes de crear pago.
- Confirmacion de pago consultando a Stripe.
- Estados controlados: reserva pendiente, confirmada o cancelada.
- Auditoria de acciones criticas con fecha, actor y metadata.

## Pagos

Stripe maneja los datos sensibles de tarjeta:

- El backend crea Payment Intent.
- El frontend usa Stripe Elements.
- El backend confirma consultando el estado real del Payment Intent.
- La base de datos guarda referencia del pago, monto, moneda y estado.

## Auditoria

Cada transaccion critica se registra en `public.audit_logs`:

- Registro de usuario.
- Envio de codigo de login.
- Verificacion de codigo.
- Actualizacion de perfil.
- Creacion y cancelacion de reservas.
- Registro de viajeros.
- Creacion y confirmacion de pagos.
- CRUD administrativo de tours, hoteles y transportes.
- Envio de notificaciones.

Consulta recomendada:

```sql
select actor_email, action, entity, entity_id, status, created_at
from public.audit_logs
order by created_at desc;
```

## Notificaciones

La tabla `public.notifications` registra:

- Destinatario.
- Asunto.
- Estado: `enviado` o `fallido`.
- Error si el correo no pudo enviarse.
- Metadata del servicio que genero el mensaje.

Esto permite demostrar sostenimiento y trazabilidad de comunicaciones con el cliente.

## RLS y clave de servicio

Supabase puede tener Row Level Security activo. Por eso:

- El frontend nunca escribe directamente datos sensibles.
- El backend usa `SUPABASE_SERVICE_ROLE_KEY` para procesos internos.
- Auditoria y notificaciones se insertan desde backend con permisos de servidor.
- Las claves no deben subirse a GitHub.

## Recomendaciones para produccion

- Usar HTTPS obligatorio.
- Rotar secretos periodicamente.
- Separar ambientes: desarrollo, pruebas y produccion.
- Usar dominio verificado para correo.
- Activar politicas RLS especificas por tabla.
- Guardar logs centralizados.
- Configurar backups de base de datos.
