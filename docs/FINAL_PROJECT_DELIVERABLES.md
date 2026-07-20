# Entregables del Proyecto Final - Semana 18

## Resumen

TravelGo es una solucion integral para una agencia de tours. Implementa el flujo
completo de negocio: catalogo, reserva, viajeros, pago, notificacion y auditoria.

El profesor indico que la tecnologia puede variar si se respetan los fundamentos
SOA. Por eso el proyecto usa:

- Backend: Node.js + Express.
- Frontend: React + Vite.
- Base de datos: Supabase/PostgreSQL.
- Pagos: Stripe.
- Correos: Gmail/Nodemailer.
- Contratos: OpenAPI, XML, XSD y WSDL.

## 1. Sistema funcional desplegado

| Requisito | Evidencia en el proyecto |
| --- | --- |
| Backend operativo | `backend/index.js`, `npm run dev`, `GET /api/health` |
| Frontend operativo | `frontend/client`, `npm run dev`, `http://localhost:5173` |
| Base de datos poblada | `database/supabase_schema_professional.sql` y `database/seed_100_travelgo_packages.sql` |
| Usuarios y seguridad | `auth-service`, JWT, verificacion por codigo |
| Flujo completo de negocio | Inicio -> paquete -> transporte -> hotel -> viajeros -> pago -> confirmacion |

## 2. Documentacion tecnica y de negocio

| Documento | Archivo |
| --- | --- |
| Arquitectura SOA | `docs/SOA_ARCHITECTURE.md` |
| Catalogo de servicios | `docs/SERVICE_CATALOG.md` |
| OpenAPI | `docs/openapi.yaml` |
| Manual de seguridad | `docs/SECURITY_MANUAL.md` |
| Flujos y evidencia | `docs/FLOWS_AND_EVIDENCE.md` |
| Estructura del proyecto | `docs/PROJECT_STRUCTURE.md` |
| Sustentacion en vivo | `docs/LIVE_DEMO_SCRIPT.md` |
| Contratos XML/XSD/WSDL | `docs/contracts/` |

## 3. Sostenimiento y presentacion en vivo

La demostracion recomendada:

1. Mostrar `GET /api/health`.
2. Registrar usuario y validar codigo por correo.
3. Buscar paquete turistico.
4. Seleccionar transporte filtrado por destino.
5. Seleccionar hotel filtrado por destino.
6. Crear reserva.
7. Registrar viajeros.
8. Pagar con Stripe en modo prueba.
9. Confirmar reserva.
10. Mostrar correo recibido.
11. Mostrar registros en `notifications`.
12. Mostrar registros en `audit_logs`.

## 4. Control de versiones

Todo el codigo, documentos y contratos deben estar en GitHub:

- `backend/`
- `frontend/`
- `database/`
- `docs/`
- `docs/contracts/`

Comandos sugeridos:

```bash
git status
git add .
git commit -m "Entrega final SOA TravelGo"
git push origin main
```

## 5. Alineacion con el negocio

| Necesidad del negocio | Implementacion |
| --- | --- |
| Vender tours | Catalogo y detalle de paquetes |
| Gestionar disponibilidad | Cupos, transportes y hoteles |
| Reservar online | Servicio de reservas |
| Cobrar al cliente | Servicio de pagos con Stripe |
| Confirmar la compra | Servicio de notificaciones |
| Controlar operaciones | Servicio transversal de auditoria |
| Administrar oferta | Modulos admin de tours, hoteles y transportes |

## 6. Buenas practicas SOA aplicadas

- Servicios separados por dominio.
- API Gateway central en Express.
- Contratos OpenAPI y XML/XSD/WSDL.
- Servicio transversal de auditoria reutilizado.
- Servicio transversal de notificacion reutilizado.
- Workflow BPM para orquestacion de reservas y pagos.
- Seguridad por JWT, roles y verificacion por correo.
- Persistencia centralizada en base de datos.
- Integraciones externas aisladas: Stripe y Gmail.

## 7. Evidencias SQL para mostrar

Auditoria:

```sql
select actor_email, action, entity, status, created_at, metadata
from public.audit_logs
order by created_at desc;
```

Notificaciones:

```sql
select destinatario, asunto, estado, error, created_at, metadata
from public.notifications
order by created_at desc;
```

Pagos y reservas:

```sql
select r.id, r.estado, r.total, p.estado as pago_estado, p.monto
from public.reservations r
left join public.payments p on p.reservation_id = r.id
order by r.created_at desc;
```
