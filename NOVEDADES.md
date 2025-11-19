# 🎉 Singula - Sistema de Control de Indicadores SLA

## ✨ Novedades y Mejoras

### 🆕 Nuevo: Registro Manual de Solicitudes

Además de la carga masiva desde Excel, ahora puedes **registrar solicitudes individuales** directamente desde la interfaz.

#### Características del Formulario Manual:

✅ **Campos Obligatorios**:

- BLOQUE TECH (Rol)
- Tipo de Solicitud (Nuevo Personal / Reemplazo)
- Fecha de Solicitud
- Fecha de Ingreso

✅ **Campos Opcionales**:

- Nombre del Personal
- Área/Departamento
- Observaciones

✅ **Cálculo Automático en Tiempo Real**:

- Días transcurridos
- Cumplimiento de SLA1 (< 35 días)
- Cumplimiento de SLA2 (< 20 días)
- Indicadores visuales (✅/❌)

✅ **Validaciones Inteligentes**:

- Fecha de solicitud no puede ser futura
- Fecha de ingreso debe ser posterior a fecha de solicitud
- Todos los campos requeridos validados

---

## 🚀 Cómo Usar

### Opción 1: Registro Manual (NUEVO)

1. Ve a **"Registrar Solicitud"** en el menú
2. Selecciona la pestaña **"Registro Manual"**
3. Completa el formulario:
   - Selecciona el rol (BLOQUE TECH)
   - Elige el tipo de solicitud
   - Ingresa las fechas
   - (Opcional) Agrega nombre, área y observaciones
4. Observa el cálculo automático en la vista previa
5. Click en **"Guardar Solicitud"**
6. ¡Listo! La solicitud aparecerá inmediatamente en el dashboard

### Opción 2: Carga Masiva desde Excel

1. Ve a **"Registrar Solicitud"** en el menú
2. Selecciona la pestaña **"Carga desde Excel"**
3. Arrastra o selecciona tu archivo .xlsx o .xls
4. El sistema procesará automáticamente todos los registros
5. Verás una confirmación y los datos se actualizarán en el dashboard

---

## 📊 Vistas Principales

### 1️⃣ Dashboard

- **URL**: `/`
- **Descripción**: Visualiza KPIs, gráficos y alertas
- **Funcionalidades**:
  - 3 KPI Cards (SLA1, SLA2, Total Solicitudes)
  - Gráfico de barras comparativo por rol
  - Filtros por fecha y BLOQUE TECH
  - Predicciones y alertas automáticas

### 2️⃣ Registrar Solicitud

- **URL**: `/upload`
- **Descripción**: Registro manual o carga masiva
- **Funcionalidades**:
  - **Pestaña Manual**: Formulario para solicitudes individuales
  - **Pestaña Excel**: Upload masivo de archivos
  - Historial de registros recientes
  - Validaciones en tiempo real

### 3️⃣ Reportes

- **URL**: `/reports`
- **Descripción**: Genera y exporta reportes PDF
- **Funcionalidades**:
  - Filtros personalizables
  - Vista previa de datos
  - Exportación a PDF con un click
  - KPIs y tablas incluidas

---

## 🎨 Interfaz Mejorada

### Sistema de Pestañas (Tabs)

La página de "Registrar Solicitud" ahora tiene dos pestañas:

```
┌─────────────────────────────────────┐
│  [Registro Manual] [Carga Excel]    │
├─────────────────────────────────────┤
│                                     │
│   Contenido según pestaña activa   │
│                                     │
└─────────────────────────────────────┘
```

### Branding Actualizado

- Nombre cambiado de "Sistema SLA" a **"Singula"**
- Título completo: **"Singula - Control de Indicadores SLA"**
- Menú actualizado con nombres más descriptivos

---

## 🔢 Ejemplos de Uso

### Ejemplo 1: Registro Manual de Nuevo Personal

```
BLOQUE TECH: Desarrollador Backend
Tipo: Nuevo Personal
Fecha Solicitud: 01/11/2025
Fecha Ingreso: 25/11/2025

→ Resultado: 24 días transcurridos
→ ✅ Cumple SLA1 (< 35 días)
```

### Ejemplo 2: Registro Manual de Reemplazo

```
BLOQUE TECH: QA Tester
Tipo: Reemplazo
Fecha Solicitud: 05/11/2025
Fecha Ingreso: 22/11/2025

→ Resultado: 17 días transcurridos
→ ✅ Cumple SLA2 (< 20 días)
```

### Ejemplo 3: Caso que NO cumple SLA

```
BLOQUE TECH: DevOps Engineer
Tipo: Nuevo Personal
Fecha Solicitud: 01/10/2025
Fecha Ingreso: 10/11/2025

→ Resultado: 40 días transcurridos
→ ❌ No cumple SLA1 (≥ 35 días)
```

---

## 🛠️ Componentes Nuevos

### ManualEntryForm.vue

**Ubicación**: `src/components/ui/ManualEntryForm.vue`

**Características**:

- Formulario reactivo con validaciones
- Cálculo automático de días y cumplimiento SLA
- Vista previa de resultados antes de guardar
- Opciones de campos adicionales (nombre, área, observaciones)
- Integración con Quasar Notify para feedback

**Props**: Ninguno (usa emits)

**Events**:

- `entry-created`: Emitido cuando se crea una solicitud exitosamente

---

## 🔄 Flujo de Datos

### Registro Manual

```
Usuario completa formulario
    ↓
Validaciones en tiempo real
    ↓
Cálculo automático de SLA
    ↓
Usuario guarda
    ↓
ManualEntryForm emite evento
    ↓
UploadPage captura evento
    ↓
slaStore.createManualEntry()
    ↓
slaService.createManualEntry() (API)
    ↓
Datos agregados a slaData
    ↓
Dashboard se actualiza automáticamente
```

### Carga desde Excel

```
Usuario sube archivo
    ↓
FileUpload valida formato
    ↓
UploadPage captura archivo
    ↓
slaStore.uploadExcelFile()
    ↓
slaService.uploadExcel() (API)
    ↓
Backend procesa Excel
    ↓
slaStore.fetchSlaData()
    ↓
Dashboard se actualiza
```

---

## 📱 Responsive Design

Ambas pestañas (Manual y Excel) son completamente responsive:

- **Mobile**: Formulario en una sola columna
- **Tablet**: 2 columnas para campos
- **Desktop**: Layout optimizado con 2-3 columnas

---

## 🎯 Ventajas del Registro Manual

1. ✅ **Rapidez**: Registra una solicitud en menos de 1 minuto
2. ✅ **Flexibilidad**: No necesitas crear un Excel para un solo registro
3. ✅ **Validación Inmediata**: Verifica errores antes de guardar
4. ✅ **Vista Previa**: Sabes si cumple SLA antes de guardar
5. ✅ **Campos Adicionales**: Agrega información extra opcional
6. ✅ **Sin Errores de Formato**: No hay problemas con formatos de fecha de Excel

---

## 📋 Validaciones Implementadas

### Validación de Fechas

- ❌ Fecha de solicitud no puede ser futura
- ❌ Fecha de ingreso no puede ser anterior a fecha de solicitud
- ✅ Ambas fechas deben estar en formato correcto

### Validación de Campos

- ❌ BLOQUE TECH es obligatorio
- ❌ Tipo de Solicitud es obligatorio
- ❌ Ambas fechas son obligatorias
- ✅ Nombre, Área y Observaciones son opcionales

### Cálculo Automático

- Días transcurridos se calcula automáticamente
- SLA1/SLA2 se evalúa según el tipo de solicitud
- Indicadores visuales muestran cumplimiento en tiempo real

---

## 🚀 Comandos

```bash
# Desarrollo
quasar dev

# Build
quasar build

# Lint
npm run lint
```

---

## 📞 Soporte

Para más información, consulta:

- `README_SLA_SYSTEM.md` - Documentación técnica completa
- `EXCEL_FORMAT_GUIDE.md` - Guía para archivos Excel
- `COMMANDS_REFERENCE.md` - Comandos útiles

---

## ✨ Resumen de Cambios

| Antes                  | Ahora                    |
| ---------------------- | ------------------------ |
| Solo carga desde Excel | ✅ Manual + Excel        |
| Una sola opción        | ✅ Sistema de Pestañas   |
| "Sistema SLA"          | ✅ "Singula"             |
| "Carga de Datos"       | ✅ "Registrar Solicitud" |

---

**¡Empieza a usar Singula ahora!**

```bash
quasar dev
# Abre http://localhost:9000/
```

**Desarrollado con ❤️ para Singula**
