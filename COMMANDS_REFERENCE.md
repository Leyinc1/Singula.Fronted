# 🛠️ Comandos Útiles - Sistema SLA

## 📦 Gestión de Dependencias

```bash
# Instalar todas las dependencias
npm install

# Instalar dependencia específica
npm install nombre-paquete

# Instalar dependencia de desarrollo
npm install -D nombre-paquete

# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit

# Arreglar vulnerabilidades automáticamente
npm audit fix

# Limpiar caché de npm
npm cache clean --force

# Reinstalar todo desde cero
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
quasar dev
# o
npm run dev

# Iniciar en modo PWA
quasar dev -m pwa

# Iniciar en puerto específico
quasar dev --port 3000

# Iniciar con host específico
quasar dev --host 0.0.0.0

# Modo de desarrollo con análisis
quasar dev --analyze
```

## 🏗️ Build

```bash
# Build para producción (SPA)
quasar build

# Build con análisis de bundle
quasar build --analyze

# Build en modo PWA
quasar build -m pwa

# Build con modo de depuración
quasar build --debug

# Limpiar build anterior
rm -rf dist
```

## 🧪 Testing y Calidad

```bash
# Ejecutar linter
npm run lint

# Ejecutar linter y auto-fix
npm run lint -- --fix

# Formatear código con Prettier
npm run format

# Verificar tipos (si se usa TypeScript)
npm run type-check

# Ejecutar tests (cuando estén configurados)
npm test
npm run test:unit
npm run test:e2e
```

## 📊 Información del Proyecto

```bash
# Ver información del proyecto Quasar
quasar info

# Ver versión de Quasar CLI
quasar -v

# Ver todas las versiones
npm list --depth=0

# Ver dependencias desactualizadas
npm outdated

# Ver tamaño de node_modules
du -sh node_modules

# Ver estructura de dependencias
npm ls nombre-paquete
```

## 🔍 Debugging

```bash
# Ejecutar con logs detallados
quasar dev --debug

# Ver variables de entorno
quasar inspect

# Limpiar caché de Quasar
rm -rf .quasar

# Reiniciar desde cero
rm -rf .quasar node_modules
npm install
quasar dev
```

## 🌐 Git

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "Descripción del cambio"

# Push
git push origin master

# Pull
git pull origin master

# Ver historial
git log --oneline --graph

# Crear rama
git checkout -b nombre-rama

# Cambiar de rama
git checkout master

# Merge
git merge nombre-rama

# Ver diferencias
git diff
```

## 📁 Archivos y Carpetas

```bash
# Listar estructura del proyecto
tree -L 3 -I 'node_modules|dist'

# Ver tamaño de directorios
du -sh src/*

# Buscar archivos
find src -name "*.vue"

# Contar líneas de código
find src -name "*.vue" -o -name "*.js" | xargs wc -l

# Buscar texto en archivos
grep -r "texto-a-buscar" src/
```

## 🚀 Despliegue

```bash
# Build para producción
npm run build

# Verificar build
cd dist/spa
ls -la

# Servir build localmente (requiere serve)
npm install -g serve
serve -s dist/spa -p 3000

# Comprimir build para transferir
tar -czf build.tar.gz dist/spa

# Descomprimir en servidor
tar -xzf build.tar.gz
```

## 🐳 Docker

```bash
# Build imagen Docker
docker build -t sistema-sla:latest .

# Ejecutar contenedor
docker run -d -p 80:80 --name sistema-sla sistema-sla:latest

# Ver logs del contenedor
docker logs -f sistema-sla

# Detener contenedor
docker stop sistema-sla

# Eliminar contenedor
docker rm sistema-sla

# Ver contenedores activos
docker ps

# Ver todas las imágenes
docker images

# Limpiar recursos no usados
docker system prune -a
```

## 🔧 Mantenimiento

```bash
# Actualizar Quasar CLI
npm install -g @quasar/cli@latest

# Actualizar Quasar App
quasar upgrade

# Verificar plugins de Quasar
quasar ext

# Agregar plugin de Quasar
quasar ext add nombre-plugin

# Remover plugin de Quasar
quasar ext remove nombre-plugin
```

## 📝 Generación de Código

```bash
# Crear nuevo componente
# (Crear manualmente en src/components/)

# Crear nueva página
# (Crear manualmente en src/pages/)

# Crear nuevo store
# (Crear manualmente en src/stores/)
```

## 🎨 Estilos

```bash
# Compilar SCSS manualmente (si es necesario)
sass src/css/app.scss dist/css/app.css

# Watch de archivos SCSS
sass --watch src/css:dist/css
```

## 🌍 Variables de Entorno

```bash
# Ver variables de entorno actuales
printenv | grep VUE_APP

# Usar archivo .env específico
cp .env.production .env

# Verificar configuración
cat .env
```

## 📊 Análisis de Performance

```bash
# Analizar bundle size
npm run build -- --analyze

# Lighthouse (requiere Chrome)
lighthouse http://localhost:9000 --view

# Webpack bundle analyzer (si está configurado)
npm run analyze
```

## 🔒 Seguridad

```bash
# Auditoría de seguridad
npm audit

# Arreglar vulnerabilidades
npm audit fix

# Arreglar incluso breaking changes
npm audit fix --force

# Ver reporte detallado
npm audit --json
```

## 📦 Backup y Restore

```bash
# Backup de node_modules (no recomendado)
tar -czf node_modules-backup.tar.gz node_modules

# Backup solo de package files
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup

# Backup del código fuente
tar -czf src-backup-$(date +%Y%m%d).tar.gz src/

# Restore
tar -xzf src-backup-20251117.tar.gz
```

## 🆘 Troubleshooting

```bash
# Problema: Módulos no encontrados
rm -rf node_modules package-lock.json
npm install

# Problema: Puerto en uso
lsof -ti:9000 | xargs kill -9

# Problema: Caché corrupto
npm cache clean --force
rm -rf .quasar

# Problema: Build fallido
rm -rf dist .quasar
npm run build

# Problema: ESLint errors
npm run lint -- --fix
```

## 📚 Documentación

```bash
# Abrir documentación de Quasar
open https://quasar.dev

# Abrir documentación de Vue
open https://vuejs.org

# Abrir documentación de Pinia
open https://pinia.vuejs.org

# Abrir documentación de Chart.js
open https://www.chartjs.org
```

## 💡 Tips Útiles

```bash
# Alias útiles para .bashrc o .zshrc
alias qdev="quasar dev"
alias qbuild="quasar build"
alias qlint="npm run lint"
alias qclean="rm -rf .quasar node_modules dist"

# Crear script de desarrollo rápido
echo '#!/bin/bash
npm install
quasar dev' > start.sh
chmod +x start.sh
./start.sh
```

## 🔄 Scripts Personalizados

Agregar a `package.json`:

```json
{
  "scripts": {
    "dev": "quasar dev",
    "build": "quasar build",
    "lint": "eslint --ext .js,.vue ./",
    "lint:fix": "eslint --ext .js,.vue ./ --fix",
    "format": "prettier --write \"**/*.{js,vue,scss,html,md,json}\"",
    "clean": "rm -rf dist .quasar node_modules",
    "fresh": "npm run clean && npm install && quasar dev",
    "analyze": "quasar build --analyze",
    "serve": "serve -s dist/spa -p 3000"
  }
}
```

Uso:

```bash
npm run dev
npm run build
npm run lint:fix
npm run format
npm run clean
npm run fresh
npm run analyze
npm run serve
```

---

**Tip**: Guarda este archivo como referencia rápida durante el desarrollo.
