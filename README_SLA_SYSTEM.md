# Sistema de Control y Seguimiento de Indicadores SLA

Aplicación Web (SPA) para visualizar y analizar el cumplimiento de SLAs de contratación de personal.

## 🚀 Stack Tecnológico

- **Framework**: Vue.js 3 (Composition API)
- **UI Framework**: Quasar Framework v2
- **Visualización**: Chart.js + vue-chartjs
- **Routing**: vue-router (gestionado por Quasar)
- **Gestión de Estado**: Pinia
- **Exportación PDF**: jsPDF + jspdf-autotable
- **HTTP Client**: Axios

## 📋 Características Principales

### 1. Dashboard Principal

- **KPIs Clave**:
  - % Cumplimiento General SLA1 (Nuevo Personal - 35 días)
  - % Cumplimiento General SLA2 (Reemplazo - 20 días)
  - Total de solicitudes procesadas
- **Gráficos Interactivos**:
  - Gráfico de barras comparativo por BLOQUE TECH (Rol)
  - Visualización de cumplimiento SLA1 vs SLA2
- **Filtros Dinámicos**:
  - Filtro por rango de fechas
  - Filtro por BLOQUE TECH
- **Predicciones**:
  - Predicción de cumplimiento para el próximo mes
  - Alertas automáticas cuando el SLA está por debajo del 80%

### 2. Carga de Datos

- Subida de archivos Excel (.xlsx, .xls)
- Validación de formato y tamaño (máximo 10 MB)
- Procesamiento automático de datos
- Historial de cargas con estados
- Feedback visual del progreso

### 3. Reportes

- Configuración personalizada de reportes
- Vista previa de datos antes de exportar
- Exportación a PDF con:
  - KPIs principales
  - Tabla detallada por rol
  - Fecha de generación
  - Paginación automática

## 🏗️ Estructura del Proyecto

```
src/
├── assets/                     # Imágenes, fuentes, etc.
├── boot/
│   ├── axios.js               # Configuración de Axios
│   └── chartjs.js             # Configuración de Chart.js
├── components/
│   ├── dashboard/
│   │   ├── KpiCard.vue        # Tarjeta de KPI reutilizable
│   │   └── SlaChart.vue       # Componente de gráfico de barras
│   └── ui/
│       ├── FileUpload.vue     # Componente de carga de Excel
│       └── PdfExportButton.vue # Botón de exportación a PDF
├── css/
│   ├── app.scss               # Estilos globales personalizados
│   └── quasar.variables.scss  # Variables de Quasar
├── layouts/
│   └── MainLayout.vue         # Layout principal con header y menú
├── pages/
│   ├── DashboardPage.vue      # Página principal con KPIs y gráficos
│   ├── UploadPage.vue         # Página de carga de Excel
│   ├── ReportsPage.vue        # Página de generación de reportes
│   └── ErrorNotFound.vue      # Página 404
├── router/
│   ├── routes.js              # Definición de rutas
│   └── index.js               # Configuración del router
├── services/
│   ├── api.js                 # Instancia central de Axios
│   └── slaService.js          # Funciones de API para SLA
├── stores/
│   ├── slaStore.js            # Store de datos SLA
│   └── authStore.js           # Store de autenticación
└── App.vue                    # Componente raíz
```

## 🔧 Instalación

### Prerrequisitos

- Node.js 16+
- npm o yarn

### Pasos de instalación

1. Clonar el repositorio:

```bash
git clone <repository-url>
cd Singula.Fronted
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno (opcional):
   Crear archivo `.env` en la raíz:

```env
VUE_APP_API_URL=http://localhost:8000/api
```

4. Iniciar servidor de desarrollo:

```bash
quasar dev
# o
npm run dev
```

La aplicación estará disponible en `http://localhost:9000/`

## 📊 Lógica de Negocio SLA

### SLA1 - Nuevo Personal

- **Criterio**: Fecha de Ingreso - Fecha Solicitud < 35 días
- **Tipo de Solicitud**: "Nuevo Personal"
- **Umbral de Cumplimiento**: 80%

### SLA2 - Reemplazo

- **Criterio**: Fecha de Ingreso - Fecha Solicitud < 20 días
- **Tipo de Solicitud**: "Reemplazo"
- **Umbral de Cumplimiento**: 80%

## 📁 Formato del Archivo Excel

El archivo Excel debe contener las siguientes columnas:

| Columna           | Descripción                    | Formato                 |
| ----------------- | ------------------------------ | ----------------------- |
| BLOQUE TECH       | Rol o posición                 | Texto                   |
| Tipo de Solicitud | "Nuevo Personal" o "Reemplazo" | Texto                   |
| Fecha Solicitud   | Fecha de la solicitud          | DD/MM/YYYY o YYYY-MM-DD |
| Fecha de Ingreso  | Fecha de ingreso del personal  | DD/MM/YYYY o YYYY-MM-DD |

## 🎨 Componentes Principales

### KpiCard.vue

Tarjeta reutilizable para mostrar KPIs con:

- Valor principal
- Barra de progreso
- Indicador visual de estado (verde/amarillo/rojo)
- Icono personalizable

**Props**:

- `title`: Título del KPI
- `value`: Valor numérico o texto
- `suffix`: Sufijo (%, etc.)
- `threshold`: Umbral para colores (default: 80)
- `icon`: Icono de Material Icons

### SlaChart.vue

Gráfico de barras comparativo con:

- Datos agrupados por rol
- Comparación SLA1 vs SLA2
- Tooltips informativos
- Leyenda personalizada

**Props**:

- `data`: Array de objetos con datos del gráfico
- `loading`: Estado de carga
- `title`: Título del gráfico
- `chartHeight`: Altura del gráfico

### FileUpload.vue

Componente de carga de archivos con:

- Validación de formato y tamaño
- Feedback visual de progreso
- Instrucciones de uso
- Historial de cargas

**Events**:

- `upload-success`: Emitido al cargar exitosamente
- `upload-error`: Emitido en caso de error

### PdfExportButton.vue

Botón de exportación a PDF con:

- Generación automática de tablas
- Inclusión de KPIs
- Paginación automática
- Personalización de título y nombre de archivo

**Props**:

- `data`: Datos para exportar
- `kpiData`: KPIs a incluir
- `title`: Título del reporte
- `filename`: Nombre del archivo PDF

## 🗃️ Stores (Pinia)

### slaStore.js

Gestiona el estado global de los datos SLA:

**State**:

- `slaData`: Array con datos SLA
- `loading`: Estado de carga
- `error`: Mensajes de error
- `filters`: Filtros activos

**Getters**:

- `kpiSla1`: Porcentaje de cumplimiento SLA1
- `kpiSla2`: Porcentaje de cumplimiento SLA2
- `chartDataByRole`: Datos agrupados por rol para gráficos
- `filteredData`: Datos filtrados

**Actions**:

- `fetchSlaData()`: Obtener datos del backend
- `uploadExcelFile(file)`: Subir archivo Excel
- `updateFilters(filters)`: Actualizar filtros
- `resetFilters()`: Resetear filtros

### authStore.js

Gestiona la autenticación (mock):

**State**:

- `token`: Token de autenticación
- `user`: Datos del usuario

**Getters**:

- `isAuthenticated`: Estado de autenticación
- `userName`: Nombre del usuario

**Actions**:

- `login(credentials)`: Iniciar sesión
- `logout()`: Cerrar sesión

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
quasar dev          # Iniciar servidor de desarrollo
npm run dev         # Alias de quasar dev

# Build
quasar build        # Compilar para producción
npm run build       # Alias de quasar build

# Linting
npm run lint        # Ejecutar ESLint

# Testing (si se configura)
npm run test:unit   # Ejecutar tests unitarios
```

## 🌐 API Backend (Integración)

La aplicación espera los siguientes endpoints del backend:

### GET `/api/sla/data`

Obtener datos SLA con filtros opcionales

**Query Parameters**:

- `start_date`: Fecha inicio (opcional)
- `end_date`: Fecha fin (opcional)
- `bloque_tech`: Rol específico (opcional)
- `tipo_solicitud`: Tipo de solicitud (opcional)

**Response**:

```json
{
  "data": [
    {
      "id": 1,
      "bloque_tech": "Desarrollador Backend",
      "tipo_solicitud": "Nuevo Personal",
      "fecha_solicitud": "2025-01-15",
      "fecha_ingreso": "2025-02-10",
      "dias_transcurridos": 26,
      "cumple_sla1": true,
      "cumple_sla2": false
    }
  ]
}
```

### POST `/api/sla/upload`

Subir archivo Excel

**Body**: FormData con el archivo Excel

**Response**:

```json
{
  "success": true,
  "message": "Archivo procesado exitosamente",
  "records": 156
}
```

### GET `/api/sla/prediction`

Obtener predicción de cumplimiento

**Response**:

```json
{
  "data": {
    "sla1_prediction": 78.5,
    "sla2_prediction": 85.3,
    "trend": "mejorando",
    "confidence": 0.87
  }
}
```

## 🎨 Personalización

### Colores y Temas

Modificar `src/css/quasar.variables.scss` para cambiar los colores principales:

```scss
$primary: #1976d2;
$secondary: #26a69a;
$accent: #9c27b0;
$positive: #21ba45;
$negative: #c10015;
$info: #31ccec;
$warning: #f2c037;
```

### Estilos Globales

Editar `src/css/app.scss` para modificar estilos globales de la aplicación.

## 📝 Notas de Desarrollo

### Datos Mock

Durante el desarrollo, si el backend no está disponible, `slaService.js` retorna datos mock automáticamente en caso de error de conexión.

### Autenticación

La autenticación actual es simulada (mock). Para implementar autenticación real:

1. Modificar `authStore.js` con llamadas reales al backend
2. Agregar guards de navegación en el router
3. Implementar refresh token si es necesario

## 🚧 Próximas Mejoras

- [ ] Autenticación real con JWT
- [ ] Tests unitarios con Vitest
- [ ] Tests E2E con Cypress
- [ ] Modo offline con Service Workers
- [ ] Exportación a Excel
- [ ] Gráficos adicionales (líneas, donas)
- [ ] Notificaciones en tiempo real
- [ ] Tema oscuro completo
- [ ] Internacionalización (i18n)

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Contacto

Para dudas o soporte, contactar al equipo de desarrollo.
