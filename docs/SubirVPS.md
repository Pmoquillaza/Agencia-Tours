# Despliegue en Ubuntu VPS - TravelGo

Guia para publicar TravelGo en un servidor Ubuntu de 2GB RAM usando:

- Nginx como servidor web y reverse proxy.
- PM2 para mantener vivo el backend Node.js.
- Supabase externo como base de datos.
- Stripe en modo test para pagos simulados.
- Gmail/Nodemailer para correos.

## 1. Recomendacion para 2GB RAM

No uses Docker si no es necesario. Para este proyecto conviene:

```txt
Nginx -> frontend estatico React
Nginx /api -> backend Node.js en localhost:3000
Supabase -> base de datos externa
Stripe test -> pagos simulados
Gmail -> correos
```

## 2. Instalar paquetes base

En el servidor:

```bash
sudo apt update
sudo apt install -y git nginx curl
```

Instalar Node.js LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Instalar PM2:

```bash
sudo npm install -g pm2
```

## 3. Subir o clonar el proyecto

Crear carpeta:

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
```

Clonar desde GitHub:

```bash
git clone https://github.com/TU_USUARIO/Agencia-Tours.git travelgo
cd travelgo
```

## 4. Configurar backend

Crear archivo:

```bash
nano backend/.env
```

Ejemplo:

```env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://tudominio.com,http://TU_IP_PUBLICA

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_publishable_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

JWT_SECRET=un_secret_largo_y_privado

STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxx
STRIPE_CURRENCY=usd

EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
EMAIL_FROM_NAME=TravelGo
```

`SUPABASE_SERVICE_ROLE_KEY` es obligatoria en el backend desplegado. Si falta o
si el backend usa solo la key publica, Supabase puede devolver errores como:

```txt
new row violates row-level security policy for table "users"
```

La key de servicio nunca debe ir en el frontend ni subirse a GitHub.

Para pagos simulados usa siempre:

- Backend: `STRIPE_SECRET_KEY=sk_test_...`
- Frontend: `VITE_STRIPE_PUBLIC_KEY=pk_test_...`

No uses `sk_live` ni `pk_live` para la demo.

Instalar dependencias:

```bash
cd /var/www/travelgo/backend
npm install --omit=dev
```

## 5. Configurar frontend

Crear archivo:

```bash
nano /var/www/travelgo/frontend/client/.env
```

Con dominio:

```env
VITE_API_URL=https://tudominio.com/api
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxx
```

Si aun no tienes dominio y vas a probar con IP:

```env
VITE_API_URL=http://TU_IP_PUBLICA/api
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxx
```

Compilar:

```bash
cd /var/www/travelgo/frontend/client
npm install
npm run build
```

El build queda en:

```txt
/var/www/travelgo/frontend/client/dist
```

## 6. Levantar backend con PM2

Desde la raiz del proyecto:

```bash
cd /var/www/travelgo
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

Verificar:

```bash
pm2 status
pm2 logs travelgo-backend
curl http://127.0.0.1:3000/api/health
```

## 7. Configurar Nginx

Copiar configuracion:

```bash
sudo cp /var/www/travelgo/deploy/nginx-travelgo.conf /etc/nginx/sites-available/travelgo
```

Editar dominio o IP:

```bash
sudo nano /etc/nginx/sites-available/travelgo
```

Si no tienes dominio, cambia:

```nginx
server_name tudominio.com www.tudominio.com;
```

por:

```nginx
server_name _;
```

Activar sitio:

```bash
sudo ln -s /etc/nginx/sites-available/travelgo /etc/nginx/sites-enabled/travelgo
sudo nginx -t
sudo systemctl reload nginx
```

Abrir firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 8. HTTPS con dominio

Si tienes dominio apuntando al servidor:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Despues cambia en frontend:

```env
VITE_API_URL=https://tudominio.com/api
```

Y recompila:

```bash
cd /var/www/travelgo/frontend/client
npm run build
```

## 9. Verificaciones finales

Frontend:

```txt
http://TU_IP_PUBLICA
https://tudominio.com
```

Backend:

```txt
https://tudominio.com/api/health
https://tudominio.com/api/openapi.yaml
https://tudominio.com/api/contracts/notification-service.wsdl
https://tudominio.com/api/contracts/reservation-email.xsd
```

Supabase:

```sql
select * from public.audit_logs order by created_at desc;
select * from public.notifications order by created_at desc;
```

## 10. Actualizar nueva version

Cuando hagas cambios:

```bash
cd /var/www/travelgo
git pull
cd backend
npm install --omit=dev
cd ../frontend/client
npm install
npm run build
pm2 restart travelgo-backend
sudo systemctl reload nginx
```

## 11. Tarjeta de prueba Stripe

Usa en modo test:

```txt
4242 4242 4242 4242
Fecha futura: 12/34
CVC: 123
ZIP: 12345
```

## 12. Problemas comunes

### El frontend carga pero no funcionan APIs

Revisa:

```bash
curl https://tudominio.com/api/health
pm2 logs travelgo-backend
```

### Stripe dice clave invalida

Verifica que:

- `VITE_STRIPE_PUBLIC_KEY` sea `pk_test`.
- `STRIPE_SECRET_KEY` sea `sk_test`.
- Ambas claves sean de la misma cuenta de Stripe.
- Recompilaste frontend despues de editar `.env`.

### No llegan correos

Revisa:

- `EMAIL_USER`.
- `EMAIL_PASS` como App Password de Gmail.
- Tabla `notifications`.
- Logs PM2.

### Error CORS

Agrega tu dominio a `CORS_ORIGIN` en `backend/.env`:

```env
CORS_ORIGIN=https://tudominio.com,http://TU_IP_PUBLICA
```

Luego:

```bash
pm2 restart travelgo-backend
```
