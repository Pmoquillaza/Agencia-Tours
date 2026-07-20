# Flujo SOA profesional - Agencia Tours

## Servicios

- `auth-service`: registro, login y JWT.
- `tour-service`: catalogo y administracion de tours.
- `flight-service`: transporte por vuelo o bus.
- `hotel-service`: hospedajes.
- `reservation-service`: creacion, calculo, cupos y cancelacion de reservas.
- `traveler-service`: pasajeros asociados a una reserva.
- `payment-service`: integracion con Stripe.
- `notification-service`: correos transaccionales.
- `audit-service`: trazabilidad tecnica y de negocio.

## Flujo principal

1. Usuario inicia sesion.
2. Consulta tours desde `tour-service`.
3. Configura reserva.
4. Selecciona transporte y hotel.
5. `reservation-service` crea reserva y descuenta cupos.
6. `traveler-service` registra pasajeros.
7. `payment-service` crea Payment Intent en Stripe.
8. Al confirmar pago:
   - `payment-service` valida en Stripe que el Payment Intent este `succeeded`.
   - Reserva cambia a `confirmada`.
   - Pago cambia a `completado`.
   - `notification-service` intenta enviar correo profesional con Nodemailer/Gmail.
   - `audit-service` registra todo el proceso.

## Health check SOA

El gateway expone:

```txt
GET /api/health
```

La respuesta muestra estado del gateway, variables requeridas configuradas y lista de servicios:

- `auth-service`
- `tour-service`
- `reservation-service`
- `traveler-service`
- `payment-service`
- `notification-service`
- `audit-service`

El dashboard del frontend consume este endpoint para evidenciar el estado SOA.

## Tolerancia a fallos

El envio de correo esta aislado. Si Gmail/Nodemailer falla:

- La reserva sigue `confirmada`.
- El pago sigue `completado`.
- Se registra una notificacion `fallido`.
- Se registra auditoria con `email_status: failed`.
- El usuario recibe respuesta indicando que el pago fue confirmado aunque el correo no pudo enviarse.

Esto demuestra SOA: la caida del servicio de notificaciones no detiene el servicio de pagos ni el de reservas.

## Base de datos

Usar:

```txt
database/supabase_schema_professional.sql
```

Despues de registrar un usuario administrador desde la app:

```sql
update public.users
set rol = 'admin'
where correo = 'tu-correo@dominio.com';
```
