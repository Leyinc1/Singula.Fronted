# Guía de Escalabilidad - Sistema SINGULA

## 📋 Tabla de Contenidos

- [Configuración Centralizada](#configuración-centralizada)
- [Agregar Nuevos Bloques/Áreas](#agregar-nuevos-bloquesáreas)
- [Modificar Prioridades](#modificar-prioridades)
- [Agregar Tipos de Solicitud](#agregar-tipos-de-solicitud)
- [Personalización Avanzada](#personalización-avanzada)

---

## 🎯 Configuración Centralizada

Todo el sistema está diseñado para ser **completamente escalable** desde un solo lugar: `src/stores/configStore.js`

### Ventajas

✅ **Un solo archivo** para gestionar toda la configuración  
✅ **Cambios automáticos** en todos los componentes  
✅ **Interfaz de administración** para usuarios no técnicos  
✅ **Sin código duplicado** - DRY principle

---

## 🏢 Agregar Nuevos Bloques/Áreas

### Opción 1: Interfaz de Usuario (Recomendada)

1. Inicia sesión como **administrador**
2. Ve a **Configuración** en el menú lateral
3. Click en **"Nuevo Bloque"**
4. Completa el formulario:
   - **Nombre**: Backend, Frontend, Mobile, etc.
   - **Descripción**: Breve descripción del área
   - **Icono**: Nombre del icono de Material Icons
   - **Color**: Color en formato hexadecimal (#0066cc)
5. Click en **"Agregar"**

### Opción 2: Código (Para Desarrolladores)

Edita `src/stores/configStore.js`:

```javascript
const bloques = ref([
  // ... bloques existentes ...
  {
    id: 'security', // ID único (slug)
    nombre: 'Security', // Nombre visible
    descripcion: 'Ciberseguridad', // Descripción
    color: '#e91e63', // Color hex
    icon: 'security', // Material Icon
    activo: true, // Estado activo/inactivo
  },
])
```

### Iconos Disponibles

Usa iconos de **Material Design Icons**: https://fonts.google.com/icons

Ejemplos populares:

- `dns` - Backend
- `web` - Frontend
- `phone_android` - Mobile
- `bug_report` - QA
- `settings_applications` - DevOps
- `analytics` - Data
- `security` - Seguridad
- `cloud` - Cloud
- `api` - APIs

---

## 🎯 Modificar Prioridades

### Estructura de Prioridad

```javascript
{
  id: 'critica',                       // ID único
  nombre: 'Crítica',                   // Nombre visible
  descripcion: 'Atención inmediata',   // Descripción
  color: '#d32f2f',                    // Color hex
  icon: 'emergency',                   // Material Icon
  nivel: 4,                            // Nivel (1-4)
  slaMultiplier: 0.5,                  // Multiplicador de SLA
}
```

### Multiplicador SLA

El `slaMultiplier` modifica el tiempo de SLA:

- `0.5` = Reduce el SLA a la mitad (más urgente)
- `1.0` = SLA normal
- `1.5` = Aumenta el SLA en 50% (menos urgente)

**Ejemplo:**

- SLA base: 35 días (Nuevo Personal)
- Prioridad Crítica (0.5x): 17.5 días
- Prioridad Alta (0.75x): 26.25 días
- Prioridad Media (1.0x): 35 días
- Prioridad Baja (1.5x): 52.5 días

### Cómo Agregar una Nueva Prioridad

```javascript
// En src/stores/configStore.js
configStore.agregarPrioridad({
  id: 'urgente',
  nombre: 'Urgente',
  descripcion: 'Requiere atención en menos de 24 horas',
  color: '#ff1744',
  icon: 'flash_on',
  nivel: 5,
  slaMultiplier: 0.25, // Reduce el SLA a 1/4
})
```

---

## 📝 Agregar Tipos de Solicitud

### Estructura de Tipo de Solicitud

```javascript
{
  id: 'consultoria',                   // ID único
  nombre: 'Consultoría',               // Nombre visible
  descripcion: 'Servicios de consultoría',
  sla: 15,                             // Días de SLA
  icon: 'lightbulb',                   // Material Icon
  color: '#9c27b0',                    // Color hex
}
```

### Ejemplo: Agregar Tipo de Solicitud

```javascript
// En src/stores/configStore.js
const tiposSolicitud = ref([
  // ... tipos existentes ...
  {
    id: 'freelance',
    nombre: 'Freelancer',
    descripcion: 'Contratación de freelancers',
    sla: 10, // 10 días
    icon: 'person_pin',
    color: '#00bcd4',
  },
])
```

---

## ⚙️ Personalización Avanzada

### Cálculo Dinámico de SLA

El sistema calcula automáticamente el SLA considerando:

```javascript
// Ejemplo de uso
const slaCalculado = configStore.calcularSLA('Nuevo Personal', 'Crítica')
// Resultado: 17.5 días (35 días × 0.5)
```

### Activar/Desactivar Bloques

Los bloques se pueden desactivar temporalmente sin eliminarlos:

```javascript
// Por código
configStore.toggleBloqueActivo('backend')

// O desde la interfaz de administración
```

### Obtener Opciones para Selects

Los stores proporcionan automáticamente las opciones formateadas para los selects:

```javascript
// En cualquier componente
import { useConfigStore } from 'src/stores/configStore'

const configStore = useConfigStore()

// Opciones para q-select
const bloques = configStore.bloquesOptions
const prioridades = configStore.prioridadesOptions
const tipos = configStore.tiposSolicitudOptions
```

### Filtrar Solo Bloques Activos

```javascript
const bloquesActivos = configStore.bloquesActivos
// Solo retorna bloques con activo: true
```

---

## 🔄 Flujo de Datos

```
configStore.js (Fuente única de verdad)
    ↓
    ├─→ Dashboard (filtros, gráficos)
    ├─→ Formularios (opciones de selects)
    ├─→ Reportes (categorías)
    ├─→ Análisis Predictivo (segmentación)
    └─→ Configuración (gestión UI)
```

---

## 📊 Datos Mock Escalables

Los datos mock se generan automáticamente basándose en la configuración:

```javascript
// src/services/slaService.js
// Se actualizan automáticamente cuando agregas bloques
function generateMockData() {
  const bloques = [
    { nombre: 'Backend', roles: ['Dev Backend', 'Arquitecto Backend'] },
    { nombre: 'Frontend', roles: ['Dev Frontend', 'Dev React'] },
    // Agrega aquí más bloques y se generarán datos automáticamente
  ]
}
```

---

## 🎨 Personalización de Colores

### Paleta Recomendada

```javascript
// Colores corporativos Tata
const colors = {
  primary: '#000000', // Negro
  secondary: '#ffffff', // Blanco

  // Bloques (variaciones)
  backend: '#0066cc', // Azul
  frontend: '#ff6600', // Naranja
  mobile: '#9c27b0', // Morado
  qa: '#4caf50', // Verde
  devops: '#ff9800', // Naranja oscuro
  data: '#00bcd4', // Cyan
}
```

---

## 🚀 Mejores Prácticas

### ✅ DO (Hacer)

- Usa la interfaz de administración para cambios rápidos
- Mantén los IDs en minúsculas con guiones bajos
- Usa colores consistentes con tu marca
- Prueba en desarrollo antes de producción
- Documenta bloques personalizados

### ❌ DON'T (No Hacer)

- No elimines bloques con datos asociados
- No uses IDs duplicados
- No modifiques directamente los datos mock
- No cambies estructuras sin actualizar componentes

---

## 🔧 Solución de Problemas

### Problema: Los cambios no se reflejan

**Solución:**

1. Verifica que el bloque esté `activo: true`
2. Recarga la página (Ctrl/Cmd + R)
3. Limpia el localStorage
4. Verifica la consola del navegador

### Problema: El filtro no muestra el nuevo bloque

**Solución:**
Los filtros se actualizan automáticamente desde `configStore`. Si no aparece:

1. Verifica que el bloque esté activo
2. Asegúrate de que hay datos con ese bloque
3. Revisa que el nombre coincida exactamente

---

## 📞 Soporte

Para más información o problemas, contacta al equipo de desarrollo.

**Desarrollado con ❤️ por Tata Consultancy Services**
