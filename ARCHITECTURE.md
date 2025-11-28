# 🏗️ Arquitectura Frontend-Backend Singula SLA

## Flujo de Datos Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vue 3 + Quasar)                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    AdministrarPage.vue                   │  │
│  │  ┌─────────────────┐              ┌─────────────────┐   │  │
│  │  │  FileUpload.vue │              │ManualEntryForm  │   │  │
│  │  │                 │              │    .vue         │   │  │
│  │  │ Carga Excel     │              │                 │   │  │
│  │  └────────┬────────┘              │ Ingresa datos   │   │  │
│  │           │                       │ manualmente     │   │  │
│  │           │ POST /api/sla/upload  └────────┬────────┘   │  │
│  │           │                                 │             │  │
│  │  ┌────────▼─────────────────────────────────▼──────────┐ │  │
│  │  │           slaStore (Pinia)                         │ │  │
│  │  │  - uploadExcelFile(file)                          │ │  │
│  │  │  - createManualEntry(data)                        │ │  │
│  │  │  - fetchSlaData()                                 │ │  │
│  │  └────────┬──────────────────────────────────────────┘ │  │
│  │           │                                             │  │
│  │  ┌────────▼─────────────────────────────────────────┐ │  │
│  │  │        configStore (Pinia)                      │ │  │
│  │  │  - fetchAllConfig()                             │ │  │
│  │  │  - fetchBloquesTech()                           │ │  │
│  │  │  - fetchTiposSolicitud()                        │ │  │
│  │  │  - fetchEstados()                               │ │  │
│  │  └────────┬──────────────────────────────────────┘ │  │
│  │           │                                         │  │
│  │  ┌────────▼──────────────────────────────────────┐ │  │
│  │  │      slaService.js                           │ │  │
│  │  │  - getSlaData(filters)   GET /api/sla/data  │ │  │
│  │  │  - uploadExcel(file)    POST /api/sla/upload│ │  │
│  │  │  - createManualEntry()  POST /api/sla/manual│ │  │
│  │  └────────┬──────────────────────────────────┘ │  │
│  │           │                                     │  │
│  │  ┌────────▼────────────────────────────────────┐│  │
│  │  │       api.js (Axios instance)              ││  │
│  │  │ Base URL: https://localhost:7002           ││  │
│  │  │ Interceptores: Token, CORS, Errores        ││  │
│  │  └────────┬─────────────────────────────────┬─┘│  │
│  │           │                                 │   │  │
│  └───────────┼─────────────────────────────────┼───┘  │
│              │ HTTP                             │      │
└──────────────┼─────────────────────────────────┼──────┘
               │                                 │
               │ CORS validated                  │
               │ multipart/form-data             │ application/json
               │                                 │
        ┌──────▼─────────────────────────────────▼─────────┐
        │           BACKEND (.NET 6+)                      │
        │                                                  │
        │  ┌─────────────────────────────────────────┐   │
        │  │   Public Endpoints (Sin [Authorize])    │   │
        │  │                                         │   │
        │  │  • GET /api/RolRegistro                 │   │
        │  │    Retorna: { IdRolRegistro, NombreRol,│   │
        │  │             Descripcion, BloqueTech ... │   │
        │  │                                         │   │
        │  │  • GET /api/TipoSolicitudCatalogo      │   │
        │  │    Retorna: { IdTipoSolicitud, Codigo,│   │
        │  │             Descripcion, Sla }         │   │
        │  │                                         │   │
        │  │  • GET /api/EstadoSolicitudCatalogo    │   │
        │  │    Retorna: { IdEstadoSolicitud, Codigo│   │
        │  │             Descripcion, Icon, Color } │   │
        │  └─────────────────────────────────────────┘   │
        │                                                  │
        │  ┌─────────────────────────────────────────┐   │
        │  │   Protected Endpoints ([Authorize])     │   │
        │  │                                         │   │
        │  │  • POST /api/sla/upload                 │   │
        │  │    Entrada: multipart/form-data {file} │   │
        │  │    Proceso: Validar → Guardar en       │   │
        │  │             wwwroot/uploads/sla/ →    │   │
        │  │             Procesar Excel              │   │
        │  │    Salida: {fileName, path,             │   │
        │  │            recordsProcessed}            │   │
        │  │                                         │   │
        │  │  • POST /api/sla/manual                 │   │
        │  │    Entrada: {bloqueTech, tipo,          │   │
        │  │             prioridad, fechas, ...}    │   │
        │  │    Proceso: Validar → Calcular SLA →  │   │
        │  │             Guardar en BD              │   │
        │  │    Salida: Solicitud {id, ...}         │   │
        │  │                                         │   │
        │  │  • GET /api/sla/data                    │   │
        │  │    Query: ?start_date, ?end_date,      │   │
        │  │           ?bloque_tech, ?tipo_solicitud│   │
        │  │    Proceso: Filtrar de BD               │   │
        │  │    Salida: {data: [Solicitudes]}        │   │
        │  └─────────────────────────────────────────┘   │
        │                                                  │
        │  ┌─────────────────────────────────────────┐   │
        │  │        Base de Datos (PostgreSQL)       │   │
        │  │                                         │   │
        │  │  • RolRegistro                          │   │
        │  │  • TipoSolicitudCatalogo                │   │
        │  │  • EstadoSolicitudCatalogo              │   │
        │  │  • Solicitud (SLA)                      │   │
        │  │                                         │   │
        │  └─────────────────────────────────────────┘   │
        │                                                  │
        │  ┌─────────────────────────────────────────┐   │
        │  │       Sistema de Archivos               │   │
        │  │       wwwroot/uploads/sla/              │   │
        │  │       (Almacena Excel subidos)          │   │
        │  └─────────────────────────────────────────┘   │
        │                                                  │
        └──────────────────────────────────────────────────┘
```

---

## 📊 Mapeo de Datos

### Catálogo: RolRegistro

```
Backend Response          Frontend Storage       UI (Combobox)
┌──────────────────┐     ┌──────────────────┐  ┌──────────────────┐
│ IdRolRegistro: 1 │────▶│ id: 1            │──│ Backend          │
│ NombreRol: "Bak" │────▶│ nombre: "Backend"│  │ (Tech)           │
│ Descripcion: "S" │────▶│ descripcion: "S" │  │                  │
│ BloqueTech: "T"  │────▶│ departamento: "T"│  │ ✓ Seleccionable │
│ Icon: "dns"      │────▶│ icon: "dns"      │  └──────────────────┘
│ Color: "#0066cc" │────▶│ color: "#0066cc" │
│ EsActivo: true   │────▶│ activo: true     │
└──────────────────┘     └──────────────────┘
```

### Operación: Upload Excel

```
Frontend                  Backend Process              Database
┌────────────────┐       ┌────────────────────┐       ┌────────────┐
│ file: .xlsx    │──────▶│ 1. Validar         │──────▶│ BD-Solicitud
│ FileUpload.vue │       │    - Tipo OK?      │       │ INSERT     │
│                │       │    - Tamaño OK?    │       │            │
└────────────────┘       │ 2. Guardar         │       └────────────┘
                         │    wwwroot/uploads/│  ▲
                         │    sla/UNIQUE.xlsx │  │
                         │ 3. Procesar Excel  │  │
                         │    Leer filas      │  └─ Retornar
                         │    Validar datos   │     metadata
                         │ 4. Insertar en BD  │
                         └────────────────────┘
```

### Operación: Manual Entry

```
Frontend               Backend               Database
┌─────────────────┐   ┌──────────────────┐  ┌──────────────┐
│ bloqueTech:"Bak"│──▶│ 1. Validar datos │─▶│ Solicitud    │
│ tipo: "Nuevo P" │   │    ModelState OK?│  │ INSERT       │
│ prioridad: "Alta"   │ 2. Calcular SLA  │  │              │
│ fecha_s: "01-15"│   │    - SLA1: 35d   │  │ diasTrans: 26│
│ fecha_i: "02-10"│   │    - SLA2: 20d   │  │ cumpleSla1:✓ │
└─────────────────┘   │ 3. Guardar en BD │  │ cumpleSla2:✗ │
                      └──────────────────┘  └──────────────┘
                             ▲
                             │
                        Retornar ID
                        + datos guardados
```

---

## 🔄 Flujos de Uso

### 1. Cargar Catálogos Iniciales

```
App Mounted
    ↓
configStore.fetchAllConfig()
    ├─ fetchBloquesTech()     → GET /api/RolRegistro
    ├─ fetchTiposSolicitud()  → GET /api/TipoSolicitudCatalogo
    ├─ fetchEstados()         → GET /api/EstadoSolicitudCatalogo
    └─ respuestas → populan combobox
```

### 2. Subir Archivo Excel

```
Usuario selecciona archivo
    ↓
FileUpload.vue emite "file-selected"
    ↓
AdministrarPage.vue → slaStore.uploadExcelFile(file)
    ↓
slaService.uploadExcel(file)
    ↓
axios.post('/api/sla/upload', FormData {file})
    ↓
Backend: Validar → Guardar → Procesar
    ↓
Retorna: {fileName, path, recordsProcessed}
    ↓
slaStore.fetchSlaData() → Recargar datos
    ↓
Dashboard se actualiza automáticamente
```

### 3. Registro Manual

```
Usuario llena formulario
    ↓
ManualEntryForm.vue → onSubmit()
    ↓
slaStore.createManualEntry(formData)
    ↓
slaService.createManualEntry(solicitud)
    ↓
axios.post('/api/sla/manual', JSON)
    ↓
Backend: Validar → Calcular SLA → Insertar en BD
    ↓
Retorna: Solicitud completa con ID
    ↓
slaStore.fetchSlaData() → Recargar datos
    ↓
Dashboard se actualiza automáticamente
```

### 4. Ver Dashboard

```
DashboardPage.vue mounted
    ↓
slaStore.fetchSlaData()
    ↓
slaService.getSlaData(filters)
    ↓
axios.get('/api/sla/data?...filters')
    ↓
Backend: Filtrar de BD
    ↓
Retorna: Array de solicitudes
    ↓
Store calcula KPIs:
    ├─ kpiSla1: % cumplimiento SLA1
    ├─ kpiSla2: % cumplimiento SLA2
    ├─ chartDataByRole: Agrupado por bloque
    ├─ chartDataByPriority: Agrupado por prioridad
    └─ filteredData: Datos filtrados
    ↓
Componentes visualizan:
    ├─ KpiCard: Porcentajes
    ├─ SlaChart: Gráfico por rol
    └─ PriorityChart: Gráfico por prioridad
```

---

## 🔐 Autenticación

### Token Flow

```
[En rama feat/auth - No implementado aún]

1. Login
   User → frontend → POST /api/auth/login → Backend
   ← Token JWT

2. Almacenar
   Frontend: authStore.setToken(jwt)
   localStorage: sla_token

3. Usar Token
   axios interceptor:
   config.headers.Authorization = `Bearer ${token}`

4. En operaciones protegidas
   frontend → POST /api/sla/upload
   headers: { Authorization: "Bearer eyJhbc..." }
   ← 200 OK ✓ o 401 Unauthorized ✗
```

---

## 📋 Variables de Entorno

### Frontend (.env)

```
VITE_API_BASE_URL=https://localhost:7002
VUE_APP_API_URL=https://localhost:7002
VUE_APP_API_TIMEOUT=30000
VUE_APP_MAX_FILE_SIZE=10485760
VUE_APP_ALLOWED_FILE_TYPES=.xlsx,.xls
```

### Backend (appsettings.json)

```json
{
  "Jwt": {
    "Key": "tu-clave-secreta-muy-larga",
    "Issuer": "SingulaApp",
    "Audience": "SingulaUsers"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=singula..."
  }
}
```

---

## ✅ Estado Actual

| Componente           | Estado         | Notas                                     |
| -------------------- | -------------- | ----------------------------------------- |
| Frontend             | ✅ Completo    | 100% listo, espera backend                |
| Catálogos (públicos) | ⏳ Esperando   | Endpoints no implementados                |
| SLA Upload           | ⏳ Esperando   | Endpoint `/api/sla/upload` no existe      |
| SLA Manual           | ⏳ Esperando   | Endpoint `/api/sla/manual` no existe      |
| SLA Dashboard        | ✅ Completo    | Mostrará datos una vez backend esté listo |
| Autenticación        | ⏳ Otra rama   | Implementar en feat/auth                  |
| CORS                 | ✅ Configurado | Listo en backend                          |

---

## 🚀 Para Que Funcione

1. **Backend implementa los 6 endpoints** descritos arriba
2. **Endpoints públicos sin `[Authorize]`** para catálogos
3. **CORS habilitado y configurado correctamente**
4. **Carpeta `wwwroot/uploads/sla/`** creada
5. **Backend reiniciado**

**Eso es todo. Frontend está 100% listo.**
