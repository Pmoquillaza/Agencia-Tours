# Arquitectura SOA - TravelGo Agencia Tours

## Objetivo de negocio

TravelGo resuelve el proceso completo de una agencia de tours:

1. Publicar paquetes turisticos.
2. Permitir que el cliente seleccione tour, transporte y hotel.
3. Crear una reserva con validacion de cupos.
4. Registrar viajeros.
5. Procesar el pago.
6. Enviar confirmacion por correo.
7. Registrar auditoria de las transacciones criticas.

Cada servicio responde a una capacidad real del negocio. No son endpoints aislados:
trabajan coordinados para completar el flujo comercial de reserva y pago.

## Vista logica

```txt
Frontend React/Vite
        |
        v
Backend Express como API Gateway SOA
        |
        +-- auth-service
        +-- tour-service
        +-- flight-service
        +-- hotel-service
        +-- reservation-service
        +-- traveler-service
        +-- payment-service
        +-- notification-service
        +-- audit-service
        +-- bpm-service
        |
        +-- Supabase/PostgreSQL
        +-- Stripe
        +-- Gmail/Nodemailer
```

## API Gateway / ESB ligero

El archivo `backend/index.js` actua como punto central de entrada:

- Monta todos los servicios bajo `/api`.
- Aplica middlewares comunes como JSON, XML y CORS.
- Expone `GET /api/health` como punto de monitoreo.
- Expone contratos tecnicos: `/api/openapi.yaml`, WSDL y XSD.

En la sustentacion se puede explicar como un ESB ligero o gateway de servicios:
centraliza acceso, contratos y gobierno sin acoplar el frontend a cada modulo interno.

## Servicios y responsabilidades

| Servicio | Responsabilidad | Tipo |
| --- | --- | --- |
| `auth-service` | Registro, login, verificacion por codigo, JWT, perfil | Negocio / Seguridad |
| `tour-service` | Catalogo y mantenimiento de tours | Negocio |
| `flight-service` | Transportes: vuelo o bus por destino | Negocio |
| `hotel-service` | Hoteles disponibles por destino | Negocio |
| `reservation-service` | Reserva, cupos, totales y cancelacion | Orquestacion de negocio |
| `traveler-service` | Datos de viajeros asociados a reserva | Negocio |
| `payment-service` | Integracion con Stripe y confirmacion de pago | Integracion externa |
| `notification-service` | Correos transaccionales y registros de notificacion | Utilidad transversal |
| `audit-service` | Logs de transacciones criticas | Utilidad transversal |
| `bpm-service` | Workflow de reserva, pago y cancelacion | Orquestacion |

## Stateless y stateful

### Componentes stateless

El backend es principalmente stateless:

- Cada request lleva su contexto mediante JWT.
- Los servicios no guardan sesion en memoria.
- El estado durable vive en Supabase.
- Esto permite reiniciar o escalar el backend sin perder sesiones activas.

Ejemplos:

- `auth.middleware.js` valida el token en cada request.
- `payment-service` consulta la reserva y el pago en base de datos antes de operar.
- `reservation-service` calcula el total desde datos enviados y datos persistidos.

### Componentes stateful

El estado del negocio se guarda en base de datos:

- Usuario registrado y verificado.
- Reserva `pendiente`, `confirmada` o `cancelada`.
- Pago `pendiente`, `completado` o `cancelado`.
- Cupos disponibles del tour.
- Notificaciones enviadas o fallidas.
- Logs de auditoria.

## Sincronico y asincronico

### Sincronico

Se usa comunicacion sincronica cuando el usuario necesita respuesta inmediata:

- Login y verificacion de codigo.
- Listar tours, transportes y hoteles.
- Crear reserva.
- Crear Payment Intent en Stripe.
- Confirmar pago.

### Asincronico / desacoplado funcional

El envio de correo se trata como proceso aislado:

- Si el correo falla, el pago puede quedar confirmado.
- El resultado se guarda en `notifications`.
- El evento queda trazado en `audit_logs`.

Aunque tecnicamente se ejecuta dentro del flujo HTTP, esta desacoplado a nivel de
negocio: la confirmacion de pago no depende de que Gmail este disponible.

## Orquestacion BPM

`backend/services/bpm.service.js` contiene workflows reutilizables:

- `runReservationWorkflow`: valida cupos, transporte, hotel y calcula total.
- `runPaymentWorkflow`: valida reserva, confirma pago y marca paso de notificacion.
- `runReservationCancellationWorkflow`: cancela reserva y libera cupos si corresponde.

Esto evita un proyecto SOA accidental: no son webservices sueltos, sino servicios
gobernados por procesos de negocio.

## Alineacion TI y negocio

| Proceso de negocio | Servicio que lo soporta |
| --- | --- |
| Captar clientes | `auth-service`, `tour-service` |
| Vender paquetes | `tour-service`, `reservation-service` |
| Gestionar disponibilidad | `reservation-service`, `flight-service`, `hotel-service` |
| Procesar pagos | `payment-service` |
| Informar al cliente | `notification-service` |
| Control interno y trazabilidad | `audit-service` |
| Administrar oferta turistica | `tour-service`, `hotel-service`, `flight-service` |

## Tecnologia usada

El enunciado menciona Spring Boot, Angular y SQL Server, pero el docente indico que
la tecnologia puede variar si se cumplen los fundamentos. La equivalencia del proyecto es:

| Requisito base | Implementacion TravelGo |
| --- | --- |
| Backend Spring Boot | Backend Node.js + Express por servicios |
| Frontend Angular | Frontend React + Vite |
| SQL Server | Supabase/PostgreSQL con scripts SQL |
| Swagger/OpenAPI | `docs/openapi.yaml` y `/api/openapi.yaml` |
| WSDL/XSD/XML | `docs/contracts` y endpoint XML de notificaciones |
| Auditoria | `public.audit_logs` + `audit.service.js` |
