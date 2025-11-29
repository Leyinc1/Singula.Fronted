<template>
  <q-page class="config-page" style="background-color: #fafafa">
    <div class="q-pa-md">
      <!-- Encabezado -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="text-h4 q-my-none text-weight-bold text-black">
            <q-icon name="settings" class="q-mr-sm" />
            Configuración del Sistema
          </h4>
          <p class="text-grey-8 q-mt-sm q-mb-none" style="font-weight: 400">
            Gestiona áreas, prioridades y tipos de SLA de forma centralizada
          </p>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <!-- Gestión de Bloques/Áreas -->
        <div class="col-12">
          <q-card class="tata-card">
            <q-card-section class="bg-black text-white">
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6 text-weight-bold">
                    <q-icon name="business_center" class="q-mr-sm" />
                    Áreas
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    dense
                    icon="add"
                    label="Nueva Área"
                    @click="abrirDialogNuevoBloque"
                    color="white"
                  />
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="row q-col-gutter-md">
                <div
                  v-for="bloque in configStore.bloques"
                  :key="bloque.id"
                  class="col-12 col-md-6 col-lg-4"
                >
                  <q-card flat bordered :class="bloque.activo ? '' : 'bg-grey-2'">
                    <q-card-section>
                      <div class="row items-center q-mb-sm">
                        <div class="col">
                          <div class="row items-center">
                            <q-icon
                              :name="bloque.icon"
                              :color="bloque.activo ? 'black' : 'grey-5'"
                              size="md"
                              class="q-mr-sm"
                            />
                            <div
                              class="text-h6 text-weight-bold"
                              :class="bloque.activo ? 'text-black' : 'text-grey-6'"
                            >
                              {{ bloque.nombre }}
                            </div>
                          </div>
                        </div>
                        <div class="col-auto">
                          <q-toggle
                            v-model="bloque.activo"
                            @update:model-value="() => toggleBloque(bloque.id)"
                            color="black"
                            size="sm"
                            :disable="!bloque.backendId"
                          />
                        </div>
                      </div>

                      <div class="text-body2 text-grey-7 q-mb-sm">
                        {{ bloque.descripcion }}
                      </div>

                      <div class="row items-center q-mt-md">
                        <div class="col">
                          <q-chip
                            dense
                            outline
                            :color="bloque.activo ? 'positive' : 'grey'"
                            text-color="white"
                            size="sm"
                          >
                            {{ bloque.activo ? 'Activo' : 'Inactivo' }}
                          </q-chip>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            flat
                            dense
                            round
                            icon="edit"
                            size="sm"
                            @click="editarBloque(bloque)"
                            class="q-mr-xs"
                          >
                            <q-tooltip>Editar</q-tooltip>
                          </q-btn>
                          <q-btn
                            flat
                            dense
                            round
                            icon="delete"
                            color="negative"
                            size="sm"
                            @click="eliminarBloque(bloque)"
                          >
                            <q-tooltip>Eliminar</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Configuración de Prioridades -->
        <div class="col-12 col-md-6">
          <q-card class="tata-card">
            <q-card-section class="bg-black text-white">
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6 text-weight-bold">
                    <q-icon name="priority_high" class="q-mr-sm" />
                    Niveles de Prioridad
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    dense
                    icon="add"
                    label="Nueva Prioridad"
                    @click="dialogNuevaPrioridad = true"
                    color="white"
                  />
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-list separator>
                <q-item
                  v-for="prioridad in configStore.prioridades"
                  :key="prioridad.id"
                  :class="prioridad.activo === false ? 'bg-grey-2' : ''"
                >
                  <q-item-section avatar>
                    <q-avatar
                      :color="prioridad.activo ? prioridad.color : 'grey-5'"
                      text-color="white"
                      :icon="prioridad.icon"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label
                      class="text-weight-bold"
                      :class="prioridad.activo ? 'text-black' : 'text-grey-6'"
                    >
                      {{ prioridad.descripcion }}
                    </q-item-label>
                    <q-item-label caption>Código: {{ prioridad.codigo }}</q-item-label>
                    <q-item-label caption class="q-mt-xs">
                      Multiplicador SLA: {{ prioridad.slaMultiplier }}x
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row items-center q-gutter-sm">
                      <q-chip dense outline color="black"> Nivel {{ prioridad.nivel }} </q-chip>
                      <q-toggle
                        v-model="prioridad.activo"
                        @update:model-value="() => togglePrioridad(prioridad.id)"
                        color="black"
                        size="sm"
                        :disable="!prioridad.backendId"
                      >
                        <q-tooltip>{{ prioridad.activo ? 'Desactivar' : 'Activar' }}</q-tooltip>
                      </q-toggle>
                      <q-btn
                        flat
                        dense
                        round
                        icon="edit"
                        size="sm"
                        @click="editarPrioridad(prioridad)"
                      >
                        <q-tooltip>Editar</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        color="negative"
                        size="sm"
                        @click="eliminarPrioridad(prioridad)"
                      >
                        <q-tooltip>Eliminar</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <!-- Tipos de Solicitud -->
        <div class="col-12 col-md-6">
          <q-card class="tata-card">
            <q-card-section class="bg-black text-white">
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6 text-weight-bold">
                    <q-icon name="assignment" class="q-mr-sm" />
                    Tipos de SLA
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    dense
                    icon="add"
                    label="Nuevo Tipo de SLA"
                    @click="dialogNuevoTipo = true"
                    color="white"
                  />
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-list separator>
                <q-item
                  v-for="tipo in configStore.tiposSolicitud"
                  :key="tipo.id"
                  :class="tipo.activo === false ? 'bg-grey-2' : ''"
                >
                  <q-item-section avatar>
                    <q-avatar :color="tipo.color" text-color="white" :icon="tipo.icon" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label
                      class="text-weight-bold"
                      :class="tipo.activo === false ? 'text-grey-6' : ''"
                      >{{ tipo.nombre }}</q-item-label
                    >
                    <q-item-label caption>{{ tipo.descripcion }}</q-item-label>
                    <q-item-label v-if="tipo.activo === false" caption class="text-warning q-mt-xs">
                      <q-icon name="warning" size="xs" /> Inactivo
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row items-center q-gutter-sm">
                      <div class="text-center">
                        <div class="text-caption text-grey-7">SLA</div>
                        <div class="text-h6 text-weight-bold text-black">{{ tipo.sla }} días</div>
                      </div>
                      <q-toggle
                        v-model="tipo.activo"
                        @update:model-value="() => toggleTipoSolicitud(tipo.id)"
                        color="black"
                        size="sm"
                        :disable="!tipo.backendId"
                      >
                        <q-tooltip>{{
                          tipo.activo ? 'Desactivar' : 'Activar'
                        }}</q-tooltip>
                      </q-toggle>
                      <q-btn
                        flat
                        dense
                        round
                        icon="edit"
                        size="sm"
                        @click="editarTipoSolicitud(tipo)"
                      >
                        <q-tooltip>Editar</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        color="negative"
                        size="sm"
                        :disable="!tipo.backendId"
                        @click="eliminarTipoSolicitud(tipo)"
                      >
                        <q-tooltip>{{ tipo.backendId ? 'Eliminar' : 'No sincronizado con backend' }}</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Dialog para Nuevo/Editar Bloque -->
    <q-dialog v-model="dialogNuevoBloque">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-black text-white">
          <div class="text-h6">
            {{ modoEdicion ? 'Editar Área' : 'Agregar Nueva Área' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="nuevoBloque.nombre"
            filled
            label="Nombre del Área *"
            bg-color="white"
            class="q-mb-md"
            hint="Ejemplo: Backend, Frontend, QA, Mobile, etc."
          >
            <template v-slot:prepend>
              <q-icon name="label" />
            </template>
          </q-input>

          <q-input
            v-model="nuevoBloque.descripcion"
            filled
            label="Descripción"
            bg-color="white"
            type="textarea"
            rows="2"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="description" />
            </template>
          </q-input>

          <q-input
            v-model="nuevoBloque.icon"
            filled
            label="Icono (Material Icons)"
            bg-color="white"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon :name="nuevoBloque.icon || 'help_outline'" />
            </template>
          </q-input>

          <q-input v-model="nuevoBloque.color" filled label="Color (hex)" bg-color="white">
            <template v-slot:prepend>
              <q-icon name="palette" />
            </template>
            <template v-slot:append>
              <div
                :style="{
                  backgroundColor: nuevoBloque.color,
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                }"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cerrarDialogBloque" />
          <q-btn
            flat
            :label="modoEdicion ? 'Guardar' : 'Agregar'"
            color="black"
            @click="guardarBloque"
            :disable="!nuevoBloque.nombre"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para Nueva/Editar Prioridad -->
    <q-dialog v-model="dialogNuevaPrioridad">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-black text-white">
          <div class="text-h6">
            {{ modoEdicionPrioridad ? 'Editar Prioridad' : 'Agregar Nueva Prioridad' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="nuevaPrioridad.nombre"
            filled
            label="Código de la Prioridad * (ej: CRITICA, ALTA)"
            bg-color="white"
            class="q-mb-md"
            :disable="modoEdicionPrioridad"
            :hint="modoEdicionPrioridad ? 'No se puede cambiar el código de una prioridad existente' : 'Use mayúsculas sin espacios (CRITICA, ALTA, MEDIA, BAJA)'"
          >
            <template v-slot:prepend>
              <q-icon name="label" />
            </template>
          </q-input>

          <q-input
            v-model="nuevaPrioridad.descripcion"
            filled
            label="Descripción completa *"
            bg-color="white"
            type="textarea"
            rows="2"
            class="q-mb-md"
            hint="Ej: Prioridad Crítica - Requiere atención inmediata"
          >
            <template v-slot:prepend>
              <q-icon name="description" />
            </template>
          </q-input>

          <q-input
            v-model.number="nuevaPrioridad.nivel"
            filled
            type="number"
            label="Nivel (1-4) *"
            bg-color="white"
            class="q-mb-md"
            min="1"
            max="4"
          >
            <template v-slot:prepend>
              <q-icon name="trending_up" />
            </template>
          </q-input>

          <q-input
            v-model.number="nuevaPrioridad.slaMultiplier"
            filled
            type="number"
            step="0.1"
            label="Multiplicador SLA *"
            bg-color="white"
            class="q-mb-md"
            hint="Ejemplo: 0.5 reduce el SLA a la mitad, 1.5 lo aumenta en 50%"
          >
            <template v-slot:prepend>
              <q-icon name="calculate" />
            </template>
          </q-input>

          <q-input
            v-model="nuevaPrioridad.icon"
            filled
            label="Icono (Material Icons)"
            bg-color="white"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon :name="nuevaPrioridad.icon || 'help_outline'" />
            </template>
          </q-input>

          <q-input v-model="nuevaPrioridad.color" filled label="Color (hex)" bg-color="white">
            <template v-slot:prepend>
              <q-icon name="palette" />
            </template>
            <template v-slot:append>
              <div
                :style="{
                  backgroundColor: nuevaPrioridad.color,
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                }"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cerrarDialogPrioridad" />
          <q-btn
            flat
            :label="modoEdicionPrioridad ? 'Guardar' : 'Agregar'"
            color="black"
            @click="guardarPrioridad"
            :disable="
              !nuevaPrioridad.nombre || !nuevaPrioridad.descripcion || !nuevaPrioridad.nivel || !nuevaPrioridad.slaMultiplier
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para Nuevo/Editar Tipo de Solicitud -->
    <q-dialog v-model="dialogNuevoTipo">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-black text-white">
          <div class="text-h6">
            {{ modoEdicionTipo ? 'Editar Tipo de SLA' : 'Agregar Nuevo Tipo de SLA' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="nuevoTipo.nombre"
            filled
            label="Nombre del Tipo de SLA *"
            bg-color="white"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="label" />
            </template>
          </q-input>

          <q-input
            v-model="nuevoTipo.descripcion"
            filled
            label="Descripción"
            bg-color="white"
            type="textarea"
            rows="2"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="description" />
            </template>
          </q-input>

          <q-input
            v-model.number="nuevoTipo.sla"
            filled
            type="number"
            label="SLA (días) *"
            bg-color="white"
            class="q-mb-md"
            min="1"
          >
            <template v-slot:prepend>
              <q-icon name="schedule" />
            </template>
          </q-input>

          <q-input
            v-model="nuevoTipo.icon"
            filled
            label="Icono (Material Icons)"
            bg-color="white"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon :name="nuevoTipo.icon || 'help_outline'" />
            </template>
          </q-input>

          <q-input v-model="nuevoTipo.color" filled label="Color (hex)" bg-color="white">
            <template v-slot:prepend>
              <q-icon name="palette" />
            </template>
            <template v-slot:append>
              <div
                :style="{
                  backgroundColor: nuevoTipo.color,
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                }"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cerrarDialogTipo" />
          <q-btn
            flat
            :label="modoEdicionTipo ? 'Guardar' : 'Agregar'"
            color="black"
            @click="guardarTipoSolicitud"
            :disable="!nuevoTipo.nombre || !nuevoTipo.sla"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useConfigStore } from 'src/stores/configStore'

const $q = useQuasar()
const configStore = useConfigStore()

console.log('🚀🚀🚀 [ConfigPage] VERSIÓN 2.0 - 24 NOV 2025 - 17:30 🚀🚀🚀')
console.log('📊 [ConfigPage] Tipos iniciales:', configStore.tiposSolicitud.length)

// Cargar datos desde el backend al montar el componente
onMounted(async () => {
  console.log('🔄 [ConfigPage] onMounted ejecutado')
  await loadInitialData()
  console.log('✅ [ConfigPage] Datos cargados. Total tipos:', configStore.tiposSolicitud.length)
  console.log('✅ [ConfigPage] Total prioridades:', configStore.prioridades.length)
})

async function loadInitialData() {
  try {
    await Promise.all([
      configStore.loadAreasFromBackend(),
      configStore.loadTiposSolicitudFromBackend(),
      configStore.loadPrioridadesFromBackend() // Cargar prioridades desde backend real
    ])
  } catch (error) {
    console.error('Error cargando datos iniciales:', error)
    $q.notify({
      type: 'warning',
      message: 'Error al cargar configuración',
      caption: 'Usando datos locales',
      position: 'top',
    })
  }
}

// Estados de dialogs
const dialogNuevoBloque = ref(false)
const dialogNuevaPrioridad = ref(false)
const dialogNuevoTipo = ref(false)

// Estados de modo edición
const modoEdicion = ref(false)
const modoEdicionPrioridad = ref(false)
const modoEdicionTipo = ref(false)

// ID del elemento en edición
const bloqueEnEdicion = ref(null)
const prioridadEnEdicion = ref(null)
const tipoEnEdicion = ref(null)

// Formularios
const nuevoBloque = ref({
  nombre: '',
  descripcion: '',
  icon: 'business',
  color: '#000000',
  departamento: 'Tech',
})

const nuevaPrioridad = ref({
  nombre: '',
  descripcion: '',
  nivel: 1,
  slaMultiplier: 1.0,
  icon: 'priority_high',
  color: '#000000',
})

const nuevoTipo = ref({
  nombre: '',
  descripcion: '',
  sla: 30,
  icon: 'assignment',
  color: '#000000',
})

// ==================== BLOQUES ====================

function abrirDialogNuevoBloque() {
  modoEdicion.value = false
  bloqueEnEdicion.value = null
  nuevoBloque.value = {
    nombre: '',
    descripcion: '',
    icon: 'business',
    color: '#000000',
    departamento: 'Tech',
  }
  dialogNuevoBloque.value = true
}

function editarBloque(bloque) {
  modoEdicion.value = true
  bloqueEnEdicion.value = bloque.backendId // Usar backendId en lugar de id
  nuevoBloque.value = {
    nombre: bloque.nombre,
    descripcion: bloque.descripcion,
    icon: bloque.icon,
    color: bloque.color,
    departamento: bloque.departamento,
  }
  dialogNuevoBloque.value = true
}

async function guardarBloque() {
  if (!nuevoBloque.value.nombre) return

  try {
    const nombreGuardado = nuevoBloque.value.nombre

    if (modoEdicion.value && bloqueEnEdicion.value) {
      // Editar bloque existente en backend
      await configStore.updateAreaBackend(bloqueEnEdicion.value, nuevoBloque.value)

      // Cerrar el diálogo primero
      cerrarDialogBloque()

      // Luego mostrar la notificación
      $q.notify({
        type: 'positive',
        message: 'Bloque actualizado exitosamente',
        caption: nombreGuardado,
        position: 'top',
        icon: 'check_circle',
      })
    } else {
      // Agregar nuevo bloque al backend
      await configStore.createAreaBackend(nuevoBloque.value)

      // Cerrar el diálogo primero
      cerrarDialogBloque()

      // Luego mostrar la notificación
      $q.notify({
        type: 'positive',
        message: 'Bloque agregado exitosamente',
        caption: nombreGuardado,
        position: 'top',
        icon: 'check_circle',
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el bloque',
      caption: error.message || 'Intente nuevamente',
      position: 'top',
      icon: 'error',
    })
  }
}

function cerrarDialogBloque() {
  dialogNuevoBloque.value = false
  modoEdicion.value = false
  bloqueEnEdicion.value = null
  nuevoBloque.value = {
    nombre: '',
    descripcion: '',
    icon: 'business',
    color: '#000000',
    departamento: 'Tech',
  }
}

async function toggleBloque(id) {
  const bloque = configStore.bloques.find((b) => b.id === id)
  if (!bloque) return

  // Verificar que tenga un backendId válido antes de intentar actualizar
  if (!bloque.backendId) {
    $q.notify({
      type: 'warning',
      message: 'Este bloque no está sincronizado con el backend',
      caption: 'No se puede actualizar',
      position: 'top',
    })
    // Revertir el cambio del toggle
    bloque.activo = !bloque.activo
    return
  }

  const nuevoEstado = bloque.activo

  try {
    // Actualizar en backend con el campo Activo
    await configStore.updateAreaBackend(bloque.backendId, {
      NombreArea: bloque.nombre,
      Descripcion: bloque.descripcion,
      Activo: nuevoEstado
    })

    $q.notify({
      type: nuevoEstado ? 'positive' : 'info',
      message: `Bloque ${nuevoEstado ? 'activado' : 'desactivado'}`,
      caption: bloque.nombre,
      position: 'top',
    })
  } catch (error) {
    console.error('Error toggling bloque:', error)
    // Revertir el cambio si falló
    bloque.activo = !nuevoEstado
    await configStore.loadAreasFromBackend()
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar estado del bloque',
      position: 'top',
    })
  }
}

async function eliminarBloque(bloque) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el bloque "${bloque.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await configStore.deleteAreaBackend(bloque.id)
      $q.notify({
        type: 'positive',
        message: 'Bloque eliminado exitosamente',
        caption: bloque.nombre,
        position: 'top',
        icon: 'check_circle',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el bloque',
        caption: error.message || 'Intente nuevamente',
        position: 'top',
        icon: 'error',
      })
    }
  })
}

// ==================== PRIORIDADES ====================

async function togglePrioridad(id) {
  const prioridad = configStore.prioridades.find((p) => p.id === id)
  if (!prioridad) return

  // Verificar que tenga un backendId válido antes de intentar actualizar
  if (!prioridad.backendId) {
    $q.notify({
      type: 'warning',
      message: 'Esta prioridad no está sincronizada con el backend',
      caption: 'No se puede actualizar',
      position: 'top',
    })
    // Revertir el cambio del toggle
    prioridad.activo = !prioridad.activo
    return
  }

  const nuevoEstado = prioridad.activo

  try {
    // Actualizar en backend con el campo Activo
    await configStore.updatePrioridadBackend(prioridad.backendId, {
      Codigo: prioridad.codigo || prioridad.nombre.toUpperCase().replace(/\s+/g, '_'),
      Descripcion: prioridad.nombre,
      Nivel: prioridad.nivel,
      SlaMultiplier: prioridad.slaMultiplier,
      Icon: prioridad.icon,
      Color: prioridad.color,
      Activo: nuevoEstado
    })

    $q.notify({
      type: nuevoEstado ? 'positive' : 'info',
      message: `Prioridad ${nuevoEstado ? 'activada' : 'desactivada'}`,
      caption: prioridad.nombre,
      position: 'top',
      icon: 'check_circle',
    })
  } catch (error) {
    console.error('Error en togglePrioridad:', error)
    // Revertir el cambio en caso de error
    prioridad.activo = !nuevoEstado
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar el estado',
      caption: error.message || 'Intente nuevamente',
      position: 'top',
      icon: 'error',
    })
  }
}

function editarPrioridad(prioridad) {
  modoEdicionPrioridad.value = true
  prioridadEnEdicion.value = prioridad.backendId || prioridad.id // Usar backendId
  nuevaPrioridad.value = {
    nombre: prioridad.nombre,
    codigo: prioridad.codigo, // Guardar código original
    descripcion: prioridad.descripcion || `Prioridad ${prioridad.nombre}`,
    nivel: prioridad.nivel || 2,
    slaMultiplier: prioridad.slaMultiplier || 1.0,
    icon: prioridad.icon || 'label',
    color: prioridad.color || '#607d8b',
  }
  dialogNuevaPrioridad.value = true
}

async function guardarPrioridad() {
  // Validación básica
  if (!nuevaPrioridad.value.nombre || !nuevaPrioridad.value.descripcion || !nuevaPrioridad.value.nivel || !nuevaPrioridad.value.slaMultiplier) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete todos los campos obligatorios (Código, Descripción, Nivel, Multiplicador)',
      position: 'top',
    })
    return
  }

  // Validar nivel (1-4)
  if (nuevaPrioridad.value.nivel < 1 || nuevaPrioridad.value.nivel > 4) {
    $q.notify({
      type: 'warning',
      message: 'El nivel debe estar entre 1 y 4',
      position: 'top',
    })
    return
  }

  try {
    if (modoEdicionPrioridad.value && prioridadEnEdicion.value) {
      // Editar prioridad existente - mantener código original
      const prioridadDto = {
        Codigo: nuevaPrioridad.value.nombre, // nombre contiene el código (CRITICA, ALTA, etc.)
        Descripcion: nuevaPrioridad.value.descripcion,
        Nivel: parseInt(nuevaPrioridad.value.nivel),
        SlaMultiplier: parseFloat(nuevaPrioridad.value.slaMultiplier),
        Icon: nuevaPrioridad.value.icon || 'label',
        Color: nuevaPrioridad.value.color || '#607d8b',
        Activo: true,
      }

      await configStore.updatePrioridadBackend(prioridadEnEdicion.value, prioridadDto)

      // Cerrar el diálogo primero
      cerrarDialogPrioridad()

      // Luego mostrar la notificación
      $q.notify({
        type: 'positive',
        message: 'Prioridad actualizada exitosamente',
        caption: nuevaPrioridad.value.nombre,
        position: 'top',
        icon: 'check_circle',
      })
    } else {
      // Agregar nueva prioridad
      const prioridadDto = {
        codigo: nuevaPrioridad.value.nombre, // nombre contiene el código (CRITICA, ALTA, etc.)
        nombre: nuevaPrioridad.value.nombre,
        descripcion: nuevaPrioridad.value.descripcion,
        nivel: parseInt(nuevaPrioridad.value.nivel),
        slaMultiplier: parseFloat(nuevaPrioridad.value.slaMultiplier),
        icon: nuevaPrioridad.value.icon || 'label',
        color: nuevaPrioridad.value.color || '#607d8b',
      }

      const nombreGuardado = nuevaPrioridad.value.nombre

      await configStore.createPrioridadBackend(prioridadDto)

      // Cerrar el diálogo primero
      cerrarDialogPrioridad()

      // Luego mostrar la notificación
      $q.notify({
        type: 'positive',
        message: 'Prioridad agregada exitosamente',
        caption: nombreGuardado,
        position: 'top',
        icon: 'check_circle',
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar la prioridad',
      caption: error.message || 'Intente nuevamente',
      position: 'top',
      icon: 'error',
    })
  }
}

async function eliminarPrioridad(prioridad) {
  const backendId = prioridad.backendId || prioridad.id

  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar la prioridad "${prioridad.nombre}"?`,
    html: true,
    ok: {
      label: 'Eliminar',
      color: 'negative',
      flat: false,
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey',
      flat: true,
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await configStore.deletePrioridadBackend(backendId)

      $q.notify({
        type: 'positive',
        message: 'Prioridad eliminada exitosamente',
        caption: prioridad.nombre,
        position: 'top',
        icon: 'check_circle',
      })
    } catch (error) {
      console.error('Error eliminando prioridad:', error)

      // Verificar si es error de clave foránea
      if (
        error.response?.data?.error === 'FOREIGN_KEY_CONSTRAINT' ||
        error.message?.includes('foreign key') ||
        error.message?.includes('FOREIGN KEY')
      ) {
        // Mostrar diálogo pidiendo desactivar en su lugar
        $q.dialog({
          title: 'No se puede eliminar',
          message: `
            <p>La prioridad <strong>"${prioridad.nombre}"</strong> no puede ser eliminada porque está siendo utilizada en el sistema.</p>
            <p>¿Deseas <strong>desactivarla</strong> en su lugar?</p>
          `,
          html: true,
          ok: {
            label: 'Desactivar',
            color: 'primary',
            flat: false,
          },
          cancel: {
            label: 'Cancelar',
            color: 'grey',
            flat: true,
          },
          persistent: true,
        }).onOk(async () => {
          try {
            // Desactivar la prioridad
            const prioridadDto = {
              Codigo: prioridad.codigo || prioridad.nombre.toUpperCase().replace(/\s+/g, '_'),
              Descripcion: prioridad.nombre,
              Nivel: prioridad.nivel,
              SlaMultiplier: prioridad.slaMultiplier,
              Icon: prioridad.icon || 'label',
              Color: prioridad.color || '#607d8b',
              Activo: false,
            }

            await configStore.updatePrioridadBackend(backendId, prioridadDto)

            $q.notify({
              type: 'info',
              message: 'Prioridad desactivada exitosamente',
              caption: prioridad.nombre,
              position: 'top',
              icon: 'check_circle',
            })
          } catch (deactivateError) {
            $q.notify({
              type: 'negative',
              message: 'Error al desactivar la prioridad',
              caption: deactivateError.message || 'Intente nuevamente',
              position: 'top',
              icon: 'error',
            })
          }
        })
      } else {
        // Otro tipo de error
        $q.notify({
          type: 'negative',
          message: 'Error al eliminar la prioridad',
          caption: error.message || 'Intente nuevamente',
          position: 'top',
          icon: 'error',
        })
      }
    }
  })
}

function cerrarDialogPrioridad() {
  dialogNuevaPrioridad.value = false
  modoEdicionPrioridad.value = false
  prioridadEnEdicion.value = null
  nuevaPrioridad.value = {
    nombre: '',
    descripcion: '',
    nivel: 1,
    slaMultiplier: 1.0,
    icon: 'priority_high',
    color: '#000000',
  }
}

// ==================== TIPOS DE SOLICITUD ====================

function editarTipoSolicitud(tipo) {
  modoEdicionTipo.value = true
  tipoEnEdicion.value = tipo.id
  nuevoTipo.value = {
    nombre: tipo.nombre,
    descripcion: tipo.descripcion,
    sla: tipo.sla,
    icon: tipo.icon,
    color: tipo.color,
  }
  dialogNuevoTipo.value = true
}

async function guardarTipoSolicitud() {
  if (!nuevoTipo.value.nombre || !nuevoTipo.value.sla) return

  try {
    const nombreGuardado = nuevoTipo.value.nombre

    if (modoEdicionTipo.value && tipoEnEdicion.value) {
      // Editar tipo existente en backend
      // Para editar, necesitamos actualizar ConfigSla (que tiene los días de umbral)
      // Buscar el configSla correspondiente al tipo en edición
      const tipo = configStore.tiposSolicitud.find(t => t.id === tipoEnEdicion.value)

      if (tipo && tipo.configSlaId) {
        // Actualizar ConfigSla existente
        await configStore.updateConfigSlaBackend(tipo.configSlaId, {
          codigoSla: nuevoTipo.value.nombre.toUpperCase().replace(/\s+/g, '_'),
          descripcion: nuevoTipo.value.descripcion || nuevoTipo.value.nombre,
          idTipoSolicitud: tipo.backendId,
          diasUmbral: nuevoTipo.value.sla,
          esActivo: true
        })
      } else {
        // Si no tiene configSla, solo actualizar el tipo de solicitud
        await configStore.updateTipoSolicitudBackend(tipoEnEdicion.value, nuevoTipo.value)
      }

      // Recargar datos
      await configStore.loadTiposSolicitudFromBackend()

      // Cerrar el diálogo primero
      cerrarDialogTipo()

      // Luego mostrar la notificación
      $q.notify({
        type: 'positive',
        message: 'Tipo de SLA actualizado exitosamente',
        caption: nombreGuardado,
        position: 'top',
        icon: 'check_circle',
      })
    } else {
      // Agregar nuevo tipo al backend
      // 1. Primero crear el TipoSolicitudCatalogo
      const tipoCreado = await configStore.createTipoSolicitudBackend(nuevoTipo.value)

      // 2. Luego crear el ConfigSla con los días de umbral
      await configStore.createConfigSlaBackend({
        codigoSla: nuevoTipo.value.nombre.toUpperCase().replace(/\s+/g, '_'),
        descripcion: nuevoTipo.value.descripcion || nuevoTipo.value.nombre,
        idTipoSolicitud: tipoCreado.idTipoSolicitud,
        diasUmbral: nuevoTipo.value.sla,
        esActivo: true
      })

      // Recargar datos
      await configStore.loadTiposSolicitudFromBackend()

      // Cerrar el diálogo primero
      cerrarDialogTipo()

      // Luego mostrar la notificación
      $q.notify({
        type: 'positive',
        message: 'Tipo de SLA agregado exitosamente',
        caption: nombreGuardado,
        position: 'top',
        icon: 'check_circle',
      })
    }
  } catch (error) {
    console.error('Error al guardar tipo de SLA:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el tipo de SLA',
      caption: error.response?.data?.message || error.message || 'Intente nuevamente',
      position: 'top',
      icon: 'error',
    })
  }
}

async function toggleTipoSolicitud(id) {
  const tipo = configStore.tiposSolicitud.find((t) => t.id === id)
  if (!tipo) return

  console.log('🔄 [toggleTipoSolicitud] ANTES - Tipo:', tipo, 'Nuevo estado:', tipo.activo)

  // Verificar que tenga un backendId válido
  if (!tipo.backendId) {
    $q.notify({
      type: 'warning',
      message: 'Este tipo no está sincronizado con el backend',
      caption: 'No se puede actualizar',
      position: 'top',
    })
    // Revertir el cambio del toggle
    tipo.activo = !tipo.activo
    return
  }

  const nuevoEstado = tipo.activo

  try {
    console.log('📡 [toggleTipoSolicitud] Llamando backend con:', {
      Codigo: tipo.nombre.toUpperCase().replace(/\s+/g, '_'),
      Descripcion: tipo.nombre,
      Activo: nuevoEstado
    })

    await configStore.updateTipoSolicitudBackend(tipo.backendId, {
      Codigo: tipo.nombre.toUpperCase().replace(/\s+/g, '_'),
      Descripcion: tipo.nombre,
      Activo: nuevoEstado
    })

    console.log('✅ [toggleTipoSolicitud] Backend actualizado correctamente')
    console.log('📊 [toggleTipoSolicitud] tiposSolicitud después de actualizar:', configStore.tiposSolicitud)

    $q.notify({
      type: nuevoEstado ? 'positive' : 'info',
      message: `Tipo de solicitud ${nuevoEstado ? 'activado' : 'desactivado'}`,
      caption: tipo.nombre,
      position: 'top',
    })
  } catch (error) {
    console.error('❌ [toggleTipoSolicitud] Error toggling tipo solicitud:', error)
    // Revertir el cambio si falló
    tipo.activo = !nuevoEstado
    await configStore.loadTiposSolicitudFromBackend()
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar estado del tipo de solicitud',
      position: 'top',
    })
  }
}

async function eliminarTipoSolicitud(tipo) {
  console.log('🚨 [eliminarTipoSolicitud] FUNCIÓN LLAMADA - Tipo:', tipo)

  $q.dialog({
    title: 'Confirmar eliminación física',
    message: `¿Estás seguro de eliminar permanentemente el tipo de solicitud "${tipo.nombre}"?`,
    html: true,
    ok: {
      label: 'Eliminar',
      color: 'negative',
      flat: false,
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey',
      flat: true,
    },
    persistent: true,
  }).onOk(async () => {
    try {
      console.log('🗑️ [eliminarTipoSolicitud] Eliminando tipo:', tipo.nombre, 'ID:', tipo.backendId)

      // Verificar que tenga backendId
      if (!tipo.backendId) {
        $q.notify({
          type: 'warning',
          message: 'Este tipo no está sincronizado con el backend',
          caption: 'No se puede eliminar',
          position: 'top',
        })
        return
      }

      await configStore.deleteTipoSolicitudBackend(tipo.backendId)

      console.log('✅ [eliminarTipoSolicitud] Tipo eliminado exitosamente')

      $q.notify({
        type: 'positive',
        message: 'Tipo de solicitud eliminado exitosamente',
        caption: tipo.nombre,
        position: 'top',
        icon: 'check_circle',
      })
    } catch (error) {
      console.error('❌ [eliminarTipoSolicitud] Error:', error)

      // Verificar si es un error de foreign key
      if (error.response?.data?.error === 'FOREIGN_KEY_CONSTRAINT') {
        $q.notify({
          type: 'warning',
          message: 'No se puede eliminar este tipo de solicitud',
          caption: error.response.data.message || 'Existen solicitudes asociadas a este tipo',
          position: 'top',
          icon: 'warning',
          timeout: 5000,
          actions: [
            {
              label: 'Desactivar en su lugar',
              color: 'white',
              handler: async () => {
                // Desactivar en lugar de eliminar
                try {
                  await configStore.updateTipoSolicitudBackend(tipo.backendId, {
                    Codigo: tipo.nombre.toUpperCase().replace(/\s+/g, '_'),
                    Descripcion: tipo.nombre,
                    Activo: false
                  })
                  $q.notify({
                    type: 'info',
                    message: 'Tipo de solicitud desactivado',
                    caption: tipo.nombre,
                    position: 'top',
                  })
                } catch (e) {
                  console.error('Error desactivando:', e)
                }
              }
            }
          ]
        })
      } else {
        // Otros errores
        $q.notify({
          type: 'negative',
          message: 'Error al eliminar el tipo de solicitud',
          caption: error.response?.data?.message || error.message || 'Intente nuevamente',
          position: 'top',
          icon: 'error',
          timeout: 4000,
        })
      }
    }
  })
}

function cerrarDialogTipo() {
  dialogNuevoTipo.value = false
  modoEdicionTipo.value = false
  tipoEnEdicion.value = null
  nuevoTipo.value = {
    nombre: '',
    descripcion: '',
    sla: 30,
    icon: 'assignment',
    color: '#000000',
  }
}
</script>

<style scoped lang="scss">
.config-page {
  background-color: #f5f5f5;
}
</style>
