# Guía de Despliegue - Sistema SLA

## 📦 Build para Producción

### 1. Preparar el proyecto

```bash
# Asegurarse de que todas las dependencias estén instaladas
npm install

# Ejecutar linter para verificar código
npm run lint

# Opcional: ejecutar tests si existen
npm test
```

### 2. Configurar variables de entorno

Crear archivo `.env.production`:

```env
VUE_APP_API_URL=https://api.tu-dominio.com/api
VUE_APP_API_TIMEOUT=30000
VUE_APP_NAME=Sistema SLA
VUE_APP_VERSION=1.0.0
VUE_APP_DEBUG=false
```

### 3. Compilar para producción

```bash
# Build estándar (SPA)
quasar build

# Build con análisis de paquetes (para optimización)
quasar build --analyze
```

Los archivos compilados estarán en `dist/spa/`

## 🚀 Opciones de Despliegue

### Opción 1: Servidor Estático (Nginx)

#### Configuración de Nginx

Crear archivo `/etc/nginx/sites-available/sistema-sla`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    root /var/www/sistema-sla/dist/spa;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    # Cache control
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (opcional)
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Pasos de instalación:

```bash
# Copiar archivos compilados
sudo mkdir -p /var/www/sistema-sla
sudo cp -r dist/spa/* /var/www/sistema-sla/

# Configurar permisos
sudo chown -R www-data:www-data /var/www/sistema-sla

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/sistema-sla /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Opción 2: Apache

#### Configuración de Apache

Crear archivo `/etc/apache2/sites-available/sistema-sla.conf`:

```apache
<VirtualHost *:80>
    ServerName tu-dominio.com
    DocumentRoot /var/www/sistema-sla/dist/spa

    <Directory /var/www/sistema-sla/dist/spa>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
    </IfModule>

    # Cache control
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType text/css "access plus 1 month"
        ExpiresByType application/javascript "access plus 1 month"
    </IfModule>

    ErrorLog ${APACHE_LOG_DIR}/sistema-sla-error.log
    CustomLog ${APACHE_LOG_DIR}/sistema-sla-access.log combined
</VirtualHost>
```

#### Pasos de instalación:

```bash
# Habilitar módulos necesarios
sudo a2enmod rewrite
sudo a2enmod deflate
sudo a2enmod expires

# Copiar archivos
sudo mkdir -p /var/www/sistema-sla
sudo cp -r dist/spa/* /var/www/sistema-sla/

# Habilitar sitio
sudo a2ensite sistema-sla
sudo apache2ctl configtest
sudo systemctl reload apache2
```

### Opción 3: Docker

#### Dockerfile

Crear archivo `Dockerfile` en la raíz del proyecto:

```dockerfile
# Stage 1: Build
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copiar archivos compilados
COPY --from=build /app/dist/spa /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf para Docker

Crear archivo `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### docker-compose.yml (opcional)

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - '80:80'
    environment:
      - VUE_APP_API_URL=http://backend:8000/api
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: tu-backend-image:latest
    ports:
      - '8000:8000'
    restart: unless-stopped
```

#### Comandos Docker:

```bash
# Build imagen
docker build -t sistema-sla-frontend:latest .

# Ejecutar contenedor
docker run -d -p 80:80 --name sistema-sla sistema-sla-frontend:latest

# Con docker-compose
docker-compose up -d
```

### Opción 4: Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Crear archivo `vercel.json`:

```json
{
  "routes": [{ "handle": "filesystem" }, { "src": "/(.*)", "dest": "/index.html" }]
}
```

### Opción 5: Netlify

#### netlify.toml

```toml
[build]
  command = "quasar build"
  publish = "dist/spa"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

```bash
# Deploy con Netlify CLI
npm i -g netlify-cli
netlify deploy --prod
```

## 🔒 SSL/HTTPS

### Con Let's Encrypt (Certbot)

```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado (Nginx)
sudo certbot --nginx -d tu-dominio.com

# Renovación automática
sudo certbot renew --dry-run
```

## 📊 Monitoreo Post-Despliegue

### 1. Verificar que la aplicación cargue

```bash
curl -I https://tu-dominio.com
```

### 2. Verificar conexión con backend

```bash
curl https://tu-dominio.com/api/sla/data
```

### 3. Verificar logs

```bash
# Nginx
sudo tail -f /var/log/nginx/sistema-sla-error.log

# Apache
sudo tail -f /var/log/apache2/sistema-sla-error.log

# Docker
docker logs -f sistema-sla
```

## 🔄 Actualización de la Aplicación

### Script de actualización automática

Crear archivo `deploy.sh`:

```bash
#!/bin/bash

set -e

echo "🚀 Iniciando despliegue..."

# Pull código actualizado
git pull origin main

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Build
echo "🔨 Compilando aplicación..."
quasar build

# Backup de versión anterior
echo "💾 Creando backup..."
sudo mv /var/www/sistema-sla /var/www/sistema-sla.backup.$(date +%Y%m%d_%H%M%S)

# Deploy nueva versión
echo "📤 Desplegando nueva versión..."
sudo mkdir -p /var/www/sistema-sla
sudo cp -r dist/spa/* /var/www/sistema-sla/
sudo chown -R www-data:www-data /var/www/sistema-sla

# Reload servidor
echo "🔄 Recargando servidor..."
sudo systemctl reload nginx

echo "✅ Despliegue completado exitosamente!"
```

Hacer ejecutable:

```bash
chmod +x deploy.sh
./deploy.sh
```

## 📋 Checklist Pre-Despliegue

- [ ] Variables de entorno configuradas correctamente
- [ ] URL del backend actualizada
- [ ] Tests ejecutados sin errores
- [ ] Build compilado sin warnings
- [ ] Archivos .env no incluidos en el build
- [ ] Certificado SSL configurado
- [ ] Dominio apuntando al servidor
- [ ] Backup de versión anterior creado
- [ ] Logs del servidor monitoreados
- [ ] Conexión con backend verificada

## 🆘 Troubleshooting

### Problema: "404 Not Found" al recargar página

**Solución**: Verificar que el servidor esté configurado para servir `index.html` en todas las rutas (SPA routing).

### Problema: "CORS Error"

**Solución**: Configurar CORS en el backend o usar proxy en Nginx/Apache.

### Problema: "White screen" después del deploy

**Solución**:

1. Verificar consola del navegador para errores
2. Comprobar que la URL base sea correcta
3. Revisar que todos los assets se carguen correctamente

### Problema: Archivos no se actualizan

**Solución**: Limpiar caché del navegador o cambiar nombre de archivos en build (hash).

## 📞 Soporte

Para problemas de despliegue, contactar al equipo DevOps o backend.
