# Guion de Sustentacion en Vivo

## Objetivo de la demo

Demostrar que TravelGo no es solo una pagina web, sino una solucion SOA completa
para una agencia de tours: servicios gobernados, flujo orquestado, contratos,
seguridad, auditoria y notificaciones.

## Preparacion antes de exponer

1. Levantar backend:

```bash
cd backend
npm.cmd run dev
```

2. Levantar frontend:

```bash
cd frontend/client
npm.cmd run dev
```

3. Abrir:

- Frontend: `http://localhost:5173`
- Health: `http://localhost:3000/api/health`
- OpenAPI: `http://localhost:3000/api/openapi.yaml`
- WSDL: `http://localhost:3000/api/contracts/notification-service.wsdl`
- XSD: `http://localhost:3000/api/contracts/reservation-email.xsd`

## Flujo de negocio completo

### 1. Gobierno de servicios

Mostrar:

```txt
GET /api/health
```

Explicar:

- El gateway centraliza los servicios.
- Se evidencian variables configuradas.
- Se listan servicios del ecosistema SOA.

### 2. Registro y seguridad

Accion:

1. Registrar usuario.
2. Mostrar correo con codigo.
3. Ingresar codigo.
4. Iniciar sesion.
5. Validar nuevo codigo de acceso.

Explicar:

- Password con bcrypt.
- JWT.
- Verificacion por correo.
- Registro en `notifications`.
- Auditoria en `audit_logs`.

### 3. Catalogo de paquetes

Accion:

1. Ir a paquetes.
2. Filtrar destino.
3. Abrir detalle de un paquete.

Explicar:

- `tour-service` responde a la capacidad de negocio de venta de paquetes.
- El frontend no calcula reglas criticas: consulta al backend.

### 4. Orquestacion de reserva

Accion:

1. Elegir cantidad de personas y dias.
2. Seleccionar transporte.
3. Seleccionar hotel.
4. Registrar viajeros.

Explicar:

- `reservation-service` valida cupos.
- `flight-service` y `hotel-service` se filtran por destino.
- `bpm-service` orquesta validacion y calculo.

### 5. Pago y confirmacion

Accion:

1. Crear pago.
2. Usar tarjeta de prueba de Stripe.
3. Confirmar pago.
4. Mostrar pantalla de confirmacion.
5. Mostrar correo recibido.

Explicar:

- `payment-service` no confia solo en frontend.
- Consulta Stripe para verificar estado real.
- Actualiza reserva y pago.
- Invoca `notification-service`.
- Registra auditoria.

### 6. Evidencia en base de datos

Mostrar en Supabase:

```sql
select actor_email, action, entity, status, created_at
from public.audit_logs
order by created_at desc;
```

```sql
select destinatario, asunto, estado, created_at
from public.notifications
order by created_at desc;
```

Explicar:

- Auditoria responde a "quien, cuando y que accion".
- Notificaciones evidencian comunicaciones transaccionales.

## Preguntas teoricas probables

### Que es SOA?

SOA es un estilo de arquitectura que organiza el sistema como servicios
reutilizables, alineados a capacidades de negocio, con contratos definidos y bajo
gobernanza.

### Por que TravelGo aplica SOA?

Porque separa capacidades de negocio en servicios: autenticacion, tours, reservas,
pagos, notificaciones y auditoria. Ademas, estos servicios se orquestan para
completar un proceso real de agencia de tours.

### Que evita que sea un proyecto SOA accidental?

No son endpoints sueltos. Hay:

- Gateway central.
- Catalogo de servicios.
- Contratos OpenAPI/XML/XSD/WSDL.
- Workflow BPM.
- Servicios transversales reutilizados.
- Trazabilidad por auditoria.

### Que es ESB y como lo representan?

Un ESB gobierna comunicacion entre servicios. En TravelGo se implementa como
gateway ligero en Express: centraliza rutas, contratos, healthcheck, seguridad y
acceso a servicios internos.

### Que partes son stateless?

El backend. Cada request se valida con JWT y no depende de sesion en memoria.

### Que partes son stateful?

La base de datos guarda estado de usuarios, reservas, pagos, notificaciones,
cupos y auditoria.

### Que operaciones son sincronicas?

Login, consulta de paquetes, creacion de reserva, registro de viajeros y pago.
El usuario necesita respuesta inmediata.

### Como manejan fallos?

El correo esta aislado: si falla, el pago puede quedar confirmado y se registra
notificacion fallida y auditoria. Asi un servicio secundario no bloquea el
proceso principal.

### Como protegen la informacion?

- Hash bcrypt para contrasenas.
- JWT para sesion.
- Roles para administracion.
- Variables `.env` para secretos.
- Stripe para tarjetas.
- Service role solo en backend.
- Auditoria para trazabilidad.

## Cierre recomendado

TravelGo demuestra alineacion TI-negocio porque cada servicio existe para soportar
un proceso real de la agencia: vender tours, reservar, cobrar, confirmar y auditar.
