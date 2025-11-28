# 📋 Requisitos del Backend para Singula Frontend

## Estado de la Integración Frontend-Backend

El frontend está **100% listo** para comunicarse con el backend. Los siguientes endpoints son necesarios para que funcione correctamente.

---

## 🔧 Endpoints Requeridos

### 1. **Catálogos (DEBEN SER PÚBLICOS - sin `[Authorize]`)**

#### GET `/api/RolRegistro`

**Descripción:** Obtener lista de bloques tecnológicos/roles de registro

**Respuesta esperada:**

```json
[
  {
    "idRolRegistro": 1,
    "nombreRol": "Backend",
    "descripcion": "Desarrollo de servicios",
    "bloqueTech": "Tech",
    "icon": "dns",
    "color": "#0066cc",
    "esActivo": true
  },
  {
    "idRolRegistro": 2,
    "nombreRol": "Frontend",
    "descripcion": "Desarrollo de interfaces",
    "bloqueTech": "Tech",
    "icon": "web",
    "color": "#ff6600",
    "esActivo": true
  }
]
```

**Campos mapeados en frontend:**

- `idRolRegistro` → `id`
- `nombreRol` → `nombre`
- `bloqueTech` → `departamento`
- `esActivo` → `activo`

---

#### GET `/api/TipoSolicitudCatalogo`

**Descripción:** Obtener tipos de solicitud disponibles

**Respuesta esperada:**

```json
[
  {
    "idTipoSolicitud": 1,
    "codigo": "NUEVO_PERSONAL",
    "descripcion": "Nuevo Personal",
    "sla": 35
  },
  {
    "idTipoSolicitud": 2,
    "codigo": "REEMPLAZO",
    "descripcion": "Reemplazo",
    "sla": 20
  }
]
```

**Campos mapeados en frontend:**

- `idTipoSolicitud` → `id`
- `codigo` o `descripcion` → `nombre`
- `sla` → `sla`

---

#### GET `/api/EstadoSolicitudCatalogo`

**Descripción:** Obtener estados disponibles para solicitudes

**Respuesta esperada:**

```json
[
  {
    "idEstadoSolicitud": 1,
    "codigo": "PENDIENTE",
    "descripcion": "Pendiente",
    "icon": "hourglass_empty",
    "color": "orange"
  },
  {
    "idEstadoSolicitud": 2,
    "codigo": "EN_PROCESO",
    "descripcion": "En Proceso",
    "icon": "hourglass_bottom",
    "color": "blue"
  }
]
```

**Campos mapeados en frontend:**

- `idEstadoSolicitud` → `id`
- `codigo` → `codigo`
- `descripcion` → `nombre`
- `icon` → `icon`
- `color` → `color`

---

### 2. **Operaciones de SLA (Requieren Autenticación)**

#### POST `/api/sla/upload`

**Descripción:** Subir archivo Excel con datos de SLA

**Content-Type:** `multipart/form-data`

**Parámetros:**

- `file` (FormData) - Archivo Excel (.xlsx o .xls)

**Respuesta esperada:**

```json
{
  "fileName": "solicitudes_2025.xlsx",
  "path": "/uploads/sla/solicitudes_2025_20251127_143022.xlsx",
  "recordsProcessed": 45,
  "message": "Archivo procesado exitosamente"
}
```

**Validaciones recomendadas en backend:**

- Máximo 10 MB
- Solo .xlsx y .xls
- Validar estructura de columnas esperadas

---

#### POST `/api/sla/manual`

**Descripción:** Crear una solicitud SLA manualmente

**Content-Type:** `application/json`

**Parámetros esperados:**

```json
{
  "bloqueTech": "Backend",
  "tipoSolicitud": "Nuevo Personal",
  "prioridad": "Alta",
  "fechaSolicitud": "2025-01-15",
  "fechaIngreso": "2025-02-10",
  "nombrePersonal": "Juan Pérez",
  "observaciones": "Contratación urgente"
}
```

**Respuesta esperada:**

```json
{
  "id": 12345,
  "bloqueTech": "Backend",
  "tipoSolicitud": "Nuevo Personal",
  "prioridad": "Alta",
  "fechaSolicitud": "2025-01-15",
  "fechaIngreso": "2025-02-10",
  "diasTranscurridos": 26,
  "cumpleSla1": true,
  "cumpleSla2": false,
  "nombrePersonal": "Juan Pérez",
  "observaciones": "Contratación urgente",
  "message": "Solicitud creada exitosamente"
}
```

---

#### GET `/api/sla/data`

**Descripción:** Obtener datos SLA con filtros opcionales

**Query Parameters (todos opcionales):**

- `start_date` - Fecha de inicio (YYYY-MM-DD)
- `end_date` - Fecha fin (YYYY-MM-DD)
- `bloque_tech` - Filtrar por bloque tecnológico
- `tipo_solicitud` - Filtrar por tipo de solicitud

**Respuesta esperada:**

```json
{
  "data": [
    {
      "id": 1,
      "bloque_tech": "Backend",
      "tipo_solicitud": "Nuevo Personal",
      "prioridad": "Alta",
      "fecha_solicitud": "2025-01-15",
      "fecha_ingreso": "2025-02-10",
      "dias_transcurridos": 26,
      "cumple_sla1": true,
      "cumple_sla2": false,
      "nombre_personal": "Juan Pérez"
    }
  ]
}
```

---

## 🔐 Configuración de CORS

El backend ya tiene CORS configurado en `Program.cs`, pero **VERIFICA EL ORDEN**:

```csharp
var app = builder.Build();

// ✅ CORS DEBE IR AQUÍ - PRIMERO
app.UseCors("AllowFrontend");

// Después las demás middleware
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

**Política CORS configurada:**

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:9000",      // Vite dev server
            "http://localhost:3000",      // Alternativo
            "http://frontend:9000",       // Docker
            "http://frontend:3000"        // Docker alternativo
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

---

## 📁 Estructura de Carpetas Sugerida (Backend)

```
Controllers/
├── RolRegistroController.cs          ✅ GET /api/RolRegistro
├── TipoSolicitudCatalogoController.cs ✅ GET /api/TipoSolicitudCatalogo
├── EstadoSolicitudCatalogoController.cs ✅ GET /api/EstadoSolicitudCatalogo
└── SlaController.cs                  ✅ POST /api/sla/upload
                                      ✅ POST /api/sla/manual
                                      ✅ GET /api/sla/data

wwwroot/
├── uploads/
│   └── sla/                          📁 Carpeta para guardar Excel

Services/
└── SlaExcelProcessor.cs              📄 Para procesar archivos Excel
```

---

## 🚀 Variables de Entorno Frontend

`.env` ya está configurado:

```env
VITE_API_BASE_URL=https://localhost:7002
VUE_APP_API_URL=https://localhost:7002
VUE_APP_API_TIMEOUT=30000
VUE_APP_MAX_FILE_SIZE=10485760        # 10 MB
VUE_APP_ALLOWED_FILE_TYPES=.xlsx,.xls
```

---

## ✅ Checklist de Implementación

### Catálogos (Públicos)

- [ ] Crear controlador `RolRegistroController`
  - [ ] GET `/api/RolRegistro` (público, sin `[Authorize]`)
  - [ ] Retorna lista de roles con estructura esperada
- [ ] Crear controlador `TipoSolicitudCatalogoController`
  - [ ] GET `/api/TipoSolicitudCatalogo` (público)
  - [ ] Retorna lista de tipos de solicitud
- [ ] Crear controlador `EstadoSolicitudCatalogoController`
  - [ ] GET `/api/EstadoSolicitudCatalogo` (público)
  - [ ] Retorna lista de estados

### Operaciones SLA

- [ ] Crear controlador `SlaController`
  - [ ] POST `/api/sla/upload` (autenticado)
    - [ ] Validar archivo (tipo, tamaño)
    - [ ] Procesar Excel
    - [ ] Guardar en wwwroot/uploads/sla/
    - [ ] Retornar metadata del archivo
  - [ ] POST `/api/sla/manual` (autenticado)
    - [ ] Validar datos
    - [ ] Guardar en BD
    - [ ] Calcular SLA
    - [ ] Retornar solicitud creada
  - [ ] GET `/api/sla/data` (autenticado)
    - [ ] Aplicar filtros
    - [ ] Retornar datos con estructura esperada

### Configuración

- [ ] Verificar CORS está habilitado
- [ ] Verificar `app.UseCors()` está antes de autenticación
- [ ] Crear carpeta `wwwroot/uploads/sla/`
- [ ] (Opcional) Habilitar `app.UseStaticFiles()` para servir archivos

---

## 🧪 Pruebas con Postman

### 1. GET `/api/RolRegistro` (Sin auth)

```
GET https://localhost:7002/api/RolRegistro
```

### 2. POST `/api/sla/upload` (Con auth)

```
POST https://localhost:7002/api/sla/upload
Content-Type: multipart/form-data
Authorization: Bearer <TOKEN>

file: [archivo.xlsx]
```

### 3. GET `/api/sla/data` (Con auth)

```
GET https://localhost:7002/api/sla/data?start_date=2025-01-01&end_date=2025-12-31
Authorization: Bearer <TOKEN>
```

---

## 📞 Contacto

Frontend completamente listo. Espera implementación de endpoints en backend.

**Rama Frontend:** `feat/AdministrarSistema`
**Rama Backend:** [Tu rama aquí]
