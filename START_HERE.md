# 🎉 ¡Bienvenido al Sistema de Control y Seguimiento de Indicadores SLA!

```
 ____  _       _                            ____  _        _
/ ___|(_)___  | |_ ___ _ __ ___   __ _    / ___|| |      / \
\___ \| / __| | __/ _ \ '_ ` _ \ / _` |   \___ \| |     / _ \
 ___) | \__ \ | ||  __/ | | | | | (_| |    ___) | |___ / ___ \
|____/|_|___/  \__\___|_| |_| |_|\__,_|   |____/|_____/_/   \_\
```

## 🎯 ¿Qué es este proyecto?

Una aplicación web moderna y profesional diseñada para visualizar y analizar el cumplimiento de SLAs (Service Level Agreements) en procesos de contratación de personal.

---

## 🚀 Inicio Rápido

### 1. Primera vez usando el proyecto

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
quasar dev
```

La aplicación estará disponible en: **http://localhost:9000/**

### 2. Ya tienes todo instalado

```bash
# Solo ejecuta
quasar dev
```

---

## 📂 Estructura del Proyecto

```
Singula.Fronted/
│
├── src/
│   ├── components/          # 🧩 Componentes reutilizables
│   │   ├── dashboard/       # KpiCard, SlaChart
│   │   └── ui/              # FileUpload, PdfExportButton
│   │
│   ├── pages/               # 📄 Vistas principales
│   │   ├── DashboardPage.vue    # Dashboard con KPIs
│   │   ├── UploadPage.vue       # Carga de Excel
│   │   └── ReportsPage.vue      # Generación de PDFs
│   │
│   ├── stores/              # 💾 Estado global (Pinia)
│   │   ├── slaStore.js      # Datos SLA
│   │   └── authStore.js     # Autenticación
│   │
│   ├── services/            # 🔌 Comunicación API
│   │   ├── api.js           # Cliente Axios
│   │   └── slaService.js    # Servicios SLA
│   │
│   ├── layouts/             # 🏗️ Layouts
│   │   └── MainLayout.vue   # Layout principal
│   │
│   ├── router/              # 🛣️ Rutas
│   │   └── routes.js
│   │
│   └── css/                 # 🎨 Estilos
│       └── app.scss
│
├── 📚 Documentación/
│   ├── README_SLA_SYSTEM.md         # Documentación completa
│   ├── EXCEL_FORMAT_GUIDE.md        # Guía de Excel
│   ├── DEPLOYMENT_GUIDE.md          # Guía de despliegue
│   ├── PROJECT_SUMMARY.md           # Resumen ejecutivo
│   ├── COMMANDS_REFERENCE.md        # Comandos útiles
│   └── IMPLEMENTATION_CHECKLIST.md  # Checklist ✅
│
└── quasar.config.js         # ⚙️ Configuración Quasar
```

---

## 🎨 Características Principales

### 📊 Dashboard

- **KPIs en tiempo real**: Cumplimiento SLA1 y SLA2
- **Gráficos interactivos**: Visualización por roles
- **Filtros dinámicos**: Por fecha y BLOQUE TECH
- **Alertas automáticas**: Notificaciones cuando SLA < 80%

### 📤 Carga de Datos

- **Upload de Excel**: Archivos .xlsx, .xls
- **Validación automática**: Formato y tamaño
- **Historial**: Timeline de cargas anteriores
- **Instrucciones integradas**: Guía para usuarios

### 📄 Reportes

- **Exportación a PDF**: Un clic para generar
- **Personalizable**: Filtros y título configurable
- **Profesional**: KPIs, tablas y paginación automática

---

## 🛠️ Stack Tecnológico

| Tecnología   | Versión | Propósito              |
| ------------ | ------- | ---------------------- |
| **Vue.js**   | 3.x     | Framework principal    |
| **Quasar**   | 2.x     | UI Framework           |
| **Pinia**    | 2.x     | State Management       |
| **Chart.js** | 4.x     | Visualización de datos |
| **Axios**    | 1.x     | Cliente HTTP           |
| **jsPDF**    | 2.x     | Generación de PDFs     |

---

## 📖 Guías Rápidas

### Para Desarrolladores

1. 📘 Lee `README_SLA_SYSTEM.md` para entender la arquitectura
2. 💻 Revisa `COMMANDS_REFERENCE.md` para comandos útiles
3. 🔍 Explora el código en `src/`

### Para Usuarios

1. 📊 Accede al Dashboard para ver KPIs
2. 📤 Usa la página Upload para cargar datos Excel
3. 📄 Genera reportes desde la página Reports
4. 📋 Lee `EXCEL_FORMAT_GUIDE.md` para formato correcto

### Para DevOps

1. 🚀 Revisa `DEPLOYMENT_GUIDE.md` para deployment
2. 🐳 Usa Docker con el Dockerfile incluido
3. 🔒 Configura SSL según la guía

---

## 🎯 Navegación de la App

```
┌─────────────────────────────────────┐
│         HEADER (MainLayout)         │
│  Sistema de SLA      [Usuario] [⚙] │
├──────────┬──────────────────────────┤
│          │                          │
│  MENÚ    │    CONTENIDO PRINCIPAL   │
│          │                          │
│ 📊 Dash  │  ┌────────────────────┐  │
│ 📤 Upload│  │   KPIs / Gráficos  │  │
│ 📄 Report│  │                    │  │
│          │  │   Filtros / Datos  │  │
│          │  └────────────────────┘  │
└──────────┴──────────────────────────┘
```

### Rutas Principales

- `/` - Dashboard con KPIs y gráficos
- `/upload` - Carga de archivos Excel
- `/reports` - Generación de reportes PDF

---

## 🔑 Conceptos Clave

### SLA1 - Nuevo Personal

```
Criterio: Fecha Ingreso - Fecha Solicitud < 35 días
Tipo: "Nuevo Personal"
Umbral Óptimo: 80% de cumplimiento
```

### SLA2 - Reemplazo

```
Criterio: Fecha Ingreso - Fecha Solicitud < 20 días
Tipo: "Reemplazo"
Umbral Óptimo: 80% de cumplimiento
```

---

## 🆘 ¿Necesitas Ayuda?

### Problemas Comunes

**❓ No se muestra el dashboard**

```bash
# Verifica que el servidor esté corriendo
quasar dev
```

**❓ Error al cargar archivo Excel**

```bash
# Verifica el formato según EXCEL_FORMAT_GUIDE.md
```

**❓ No se genera el PDF**

```bash
# Asegúrate de tener datos cargados primero
```

### Recursos

- 📘 [Documentación Completa](README_SLA_SYSTEM.md)
- 📋 [Guía de Excel](EXCEL_FORMAT_GUIDE.md)
- 🚀 [Guía de Despliegue](DEPLOYMENT_GUIDE.md)
- 💻 [Referencia de Comandos](COMMANDS_REFERENCE.md)

---

## 📊 Datos de Prueba

El sistema incluye datos mock para desarrollo. Puedes:

1. Ver datos de ejemplo en el dashboard
2. Probar filtros sin backend
3. Generar PDFs de prueba

Para datos reales, integra con el backend según `services/api.js`

---

## 🎨 Personalización

### Cambiar Colores

Edita `src/css/quasar.variables.scss`

### Modificar Estilos

Edita `src/css/app.scss`

### Agregar Componentes

Crea en `src/components/`

---

## 🚀 Comandos Esenciales

```bash
# Desarrollo
npm install        # Instalar dependencias
quasar dev        # Iniciar desarrollo

# Producción
quasar build      # Compilar para producción

# Mantenimiento
npm run lint      # Verificar código
quasar info       # Ver información del proyecto
```

---

## 📈 Próximos Pasos

1. ✅ **Ya hecho**: Arquitectura base completa
2. 🔄 **Siguiente**: Integrar con backend real
3. 🧪 **Futuro**: Agregar tests unitarios y E2E
4. 🚀 **Deploy**: Seguir DEPLOYMENT_GUIDE.md

---

## 🤝 Contribuir

### Antes de hacer cambios

1. Lee la documentación completa
2. Entiende la arquitectura
3. Sigue las convenciones del código

### Al agregar funcionalidades

1. Crea componentes reutilizables
2. Usa el store para estado global
3. Documenta tus cambios

---

## ✨ Tips Finales

💡 **Tip 1**: Usa `quasar dev` para desarrollo con hot-reload  
💡 **Tip 2**: Revisa la consola del navegador para errores  
💡 **Tip 3**: Los datos mock te permiten desarrollar sin backend  
💡 **Tip 4**: Todos los archivos de documentación están en la raíz  
💡 **Tip 5**: El código está comentado para facilitar el entendimiento

---

## 🎉 ¡Listo para Empezar!

```bash
# Ejecuta este comando y comienza a desarrollar
quasar dev
```

**¡Abre tu navegador en http://localhost:9000/ y disfruta! 🚀**

---

**Desarrollado con ❤️ usando Vue.js 3 + Quasar Framework**

_Si tienes dudas, revisa la documentación en los archivos .md de la raíz del proyecto._
