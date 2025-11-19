# 🔧 Cambios Recientes - Singula

## Fecha: 17 de Noviembre de 2025

### ✅ Cambios Implementados

#### 1️⃣ **Bug Fix: Menú de Navegación**

**Problema:** El item "Dashboard" en el menú lateral permanecía siempre seleccionado, incluso al navegar a otras páginas.

**Solución:** Se agregó la propiedad `exact` al componente `q-item` en `MainLayout.vue` para que solo se active cuando la ruta coincide exactamente.

**Archivo modificado:**

- `src/layouts/MainLayout.vue`

**Código modificado:**

```vue
<q-item
  v-for="link in menuLinks"
  :key="link.title"
  :to="link.link"
  clickable
  v-ripple
  exact  <!-- ✅ Nueva propiedad -->
  active-class="bg-black text-white"
  class="q-mb-xs rounded-borders"
  style="margin: 4px 8px"
>
```

**Comportamiento anterior:**

- ❌ Dashboard siempre aparecía seleccionado
- ❌ Múltiples items podían verse activos simultáneamente

**Comportamiento nuevo:**

- ✅ Solo el item correspondiente a la ruta actual se marca como activo
- ✅ La navegación es clara y precisa

---

#### 2️⃣ **Nueva Funcionalidad: Campo de Prioridad/Urgencia**

**Descripción:** Se agregó un nuevo campo obligatorio para clasificar la prioridad o urgencia de cada solicitud de personal.

**Archivo modificado:**

- `src/components/ui/ManualEntryForm.vue`

**Cambios implementados:**

##### a) Nuevo campo en el formulario

```vue
<!-- Prioridad/Urgencia -->
<div class="col-12 col-md-6">
  <q-select
    v-model="formData.prioridad"
    filled
    :options="prioridadOptions"
    label="Prioridad/Urgencia *"
    hint="Nivel de urgencia de la solicitud"
    :rules="[(val) => !!val || 'Campo requerido']"
    emit-value
    map-options
    bg-color="white"
  >
    <template v-slot:prepend>
      <q-icon name="priority_high" color="black" />
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section avatar>
          <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</div>
```

##### b) Opciones de prioridad

```javascript
const prioridadOptions = [
  {
    label: 'Crítica',
    value: 'Crítica',
    icon: 'emergency',
    color: 'red-8',
  },
  {
    label: 'Alta',
    value: 'Alta',
    icon: 'arrow_upward',
    color: 'orange-8',
  },
  {
    label: 'Media',
    value: 'Media',
    icon: 'remove',
    color: 'amber-8',
  },
  {
    label: 'Baja',
    value: 'Baja',
    icon: 'arrow_downward',
    color: 'green-8',
  },
]
```

##### c) Actualización del modelo de datos

**formData:**

```javascript
const formData = ref({
  bloqueTech: null,
  tipoSolicitud: null,
  prioridad: null, // ✅ Nuevo campo
  fechaSolicitud: null,
  fechaIngreso: null,
  nombrePersonal: '',
  area: '',
  observaciones: '',
})
```

**Objeto de solicitud enviado:**

```javascript
const solicitud = {
  bloque_tech: formData.value.bloqueTech,
  tipo_solicitud: formData.value.tipoSolicitud,
  prioridad: formData.value.prioridad, // ✅ Nuevo campo
  fecha_solicitud: formData.value.fechaSolicitud,
  fecha_ingreso: formData.value.fechaIngreso,
  // ... resto de campos
}
```

**Función de reset actualizada:**

```javascript
function onReset() {
  formData.value = {
    bloqueTech: null,
    tipoSolicitud: null,
    prioridad: null, // ✅ Nuevo campo
    fechaSolicitud: null,
    fechaIngreso: null,
    nombrePersonal: '',
    area: '',
    observaciones: '',
  }
}
```

---

### 🎨 Niveles de Prioridad

| Prioridad   | Icono               | Color        | Descripción                                  |
| ----------- | ------------------- | ------------ | -------------------------------------------- |
| **Crítica** | 🚨 `emergency`      | Rojo intenso | Urgencia máxima, requiere atención inmediata |
| **Alta**    | ⬆️ `arrow_upward`   | Naranja      | Importante, debe atenderse pronto            |
| **Media**   | ➖ `remove`         | Ámbar        | Prioridad estándar                           |
| **Baja**    | ⬇️ `arrow_downward` | Verde        | Puede esperar, no urgente                    |

---

### 📋 Orden de Campos en el Formulario

1. **BLOQUE TECH (Rol)** \* - Rol o posición
2. **Tipo de Solicitud** \* - Nuevo Personal / Reemplazo
3. **Prioridad/Urgencia** \* - 🆕 Nivel de urgencia (Crítica/Alta/Media/Baja)
4. **Fecha Solicitud** \* - Fecha de la solicitud
5. **Fecha de Ingreso** \* - Fecha de ingreso del personal
6. **Nombre del Personal** - Opcional
7. **Área/Departamento** - Opcional
8. **Observaciones** - Opcional

_\* Campos obligatorios_

---

### 🎯 Casos de Uso del Campo Prioridad

#### Ejemplo 1: Reemplazo Crítico

```
Tipo: Reemplazo
Prioridad: Crítica 🚨
Motivo: Personal clave que renunció inesperadamente
```

#### Ejemplo 2: Nueva Posición de Bajo Impacto

```
Tipo: Nuevo Personal
Prioridad: Baja ⬇️
Motivo: Expansión planificada del equipo para próximo trimestre
```

#### Ejemplo 3: Proyecto Urgente

```
Tipo: Nuevo Personal
Prioridad: Alta ⬆️
Motivo: Proyecto con cliente importante que comienza en 2 semanas
```

---

### 🔄 Flujo de Datos Actualizado

```
Usuario completa formulario
    ↓
Selecciona prioridad (Crítica/Alta/Media/Baja) ✅ NUEVO
    ↓
Validaciones en tiempo real
    ↓
Cálculo automático de SLA
    ↓
Usuario guarda
    ↓
ManualEntryForm emite evento con prioridad ✅
    ↓
UploadPage captura evento
    ↓
slaStore.createManualEntry() (incluye prioridad) ✅
    ↓
slaService.createManualEntry() (API)
    ↓
Dashboard se actualiza
```

---

### 🧪 Testing Recomendado

#### Test 1: Navegación del Menú

- [ ] Navegar a Dashboard → verificar que está seleccionado
- [ ] Navegar a Registrar Solicitud → verificar que solo este está seleccionado
- [ ] Navegar a Reportes → verificar que solo este está seleccionado
- [ ] Volver a Dashboard → verificar comportamiento correcto

#### Test 2: Campo de Prioridad

- [ ] Intentar guardar sin seleccionar prioridad → debe mostrar error
- [ ] Seleccionar cada nivel de prioridad → verificar iconos correctos
- [ ] Guardar solicitud con prioridad Crítica → verificar en consola
- [ ] Resetear formulario → verificar que prioridad se limpia
- [ ] Validar que la prioridad se incluye en el objeto enviado

---

### 📝 Notas Importantes

1. **Campo Obligatorio:** La prioridad es ahora un campo obligatorio. No se puede guardar una solicitud sin seleccionarla.

2. **Visualización:** El campo tiene iconos y colores para facilitar la identificación rápida de cada nivel.

3. **Backend:** Asegúrate de que el backend esté preparado para recibir el campo `prioridad` en las solicitudes manuales.

4. **Historial:** Las solicitudes guardadas ahora incluirán información de prioridad para futuras consultas y reportes.

5. **Navegación:** El bug del menú estaba causado por la falta de coincidencia exacta en las rutas. La propiedad `exact` resuelve esto completamente.

---

### 🚀 Próximos Pasos Sugeridos

1. **Dashboard:** Agregar filtro por prioridad en el dashboard
2. **Visualización:** Mostrar badges de prioridad en las tablas
3. **Reportes:** Incluir prioridad en los reportes PDF
4. **Alertas:** Configurar notificaciones para solicitudes críticas
5. **Métricas:** Agregar KPI de tiempo de respuesta por prioridad
6. **Excel Upload:** Actualizar importación de Excel para incluir columna de prioridad

---

### 🌐 Servidor de Desarrollo

El servidor está corriendo en: **http://localhost:9002/**

Para iniciar:

```bash
quasar dev
```

---

**Desarrollado con ❤️ para Singula - Tata Consultancy Services**
