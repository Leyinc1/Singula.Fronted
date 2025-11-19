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
            Gestiona bloques tecnológicos, prioridades y tipos de solicitud de forma centralizada
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
                    Bloques Tecnológicos
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    dense
                    icon="add"
                    label="Nuevo Bloque"
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
                            :model-value="bloque.activo"
                            @update:model-value="toggleBloque(bloque.id)"
                            color="black"
                            size="sm"
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
                <q-item v-for="prioridad in configStore.prioridades" :key="prioridad.id">
                  <q-item-section avatar>
                    <q-avatar :color="prioridad.color" text-color="white" :icon="prioridad.icon" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ prioridad.nombre }}</q-item-label>
                    <q-item-label caption>{{ prioridad.descripcion }}</q-item-label>
                    <q-item-label caption class="q-mt-xs">
                      Multiplicador SLA: {{ prioridad.slaMultiplier }}x
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row items-center q-gutter-sm">
                      <q-chip dense outline color="black"> Nivel {{ prioridad.nivel }} </q-chip>
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
                    Tipos de Solicitud
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    dense
                    icon="add"
                    label="Nuevo Tipo"
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
                        :model-value="tipo.activo !== false"
                        @update:model-value="toggleTipoSolicitud(tipo.id)"
                        color="black"
                        size="sm"
                      >
                        <q-tooltip>{{
                          tipo.activo !== false ? 'Desactivar' : 'Activar'
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
                        @click="eliminarTipoSolicitud(tipo)"
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
      </div>
    </div>

    <!-- Dialog para Nuevo/Editar Bloque -->
    <q-dialog v-model="dialogNuevoBloque">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-black text-white">
          <div class="text-h6">
            {{ modoEdicion ? 'Editar Bloque' : 'Agregar Nuevo Bloque Tecnológico' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="nuevoBloque.nombre"
            filled
            label="Nombre del Bloque Tecnológico *"
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
            label="Nombre de la Prioridad *"
            bg-color="white"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="label" />
            </template>
          </q-input>

          <q-input
            v-model="nuevaPrioridad.descripcion"
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
              !nuevaPrioridad.nombre || !nuevaPrioridad.nivel || !nuevaPrioridad.slaMultiplier
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
            {{ modoEdicionTipo ? 'Editar Tipo de Solicitud' : 'Agregar Nuevo Tipo de Solicitud' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="nuevoTipo.nombre"
            filled
            label="Nombre del Tipo *"
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
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useConfigStore } from 'src/stores/configStore'

const $q = useQuasar()
const configStore = useConfigStore()

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
  bloqueEnEdicion.value = bloque.id
  nuevoBloque.value = {
    nombre: bloque.nombre,
    descripcion: bloque.descripcion,
    icon: bloque.icon,
    color: bloque.color,
    departamento: bloque.departamento,
  }
  dialogNuevoBloque.value = true
}

function guardarBloque() {
  if (!nuevoBloque.value.nombre) return

  if (modoEdicion.value && bloqueEnEdicion.value) {
    // Editar bloque existente
    configStore.actualizarBloque(bloqueEnEdicion.value, nuevoBloque.value)
    $q.notify({
      type: 'positive',
      message: 'Bloque actualizado exitosamente',
      caption: nuevoBloque.value.nombre,
      position: 'top',
      icon: 'check_circle',
    })
  } else {
    // Agregar nuevo bloque
    configStore.agregarBloque(nuevoBloque.value)
    $q.notify({
      type: 'positive',
      message: 'Bloque agregado exitosamente',
      caption: nuevoBloque.value.nombre,
      position: 'top',
      icon: 'check_circle',
    })
  }

  cerrarDialogBloque()
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

function toggleBloque(id) {
  configStore.toggleBloqueActivo(id)
  const bloque = configStore.bloques.find((b) => b.id === id)
  $q.notify({
    type: bloque?.activo ? 'positive' : 'info',
    message: `Bloque ${bloque?.activo ? 'activado' : 'desactivado'}`,
    caption: bloque?.nombre,
    position: 'top',
  })
}

function eliminarBloque(bloque) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el bloque "${bloque.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const index = configStore.bloques.findIndex((b) => b.id === bloque.id)
    if (index !== -1) {
      configStore.bloques.splice(index, 1)
      $q.notify({
        type: 'positive',
        message: 'Bloque eliminado exitosamente',
        caption: bloque.nombre,
        position: 'top',
        icon: 'check_circle',
      })
    }
  })
}

// ==================== PRIORIDADES ====================

function editarPrioridad(prioridad) {
  modoEdicionPrioridad.value = true
  prioridadEnEdicion.value = prioridad.id
  nuevaPrioridad.value = {
    nombre: prioridad.nombre,
    descripcion: prioridad.descripcion,
    nivel: prioridad.nivel,
    slaMultiplier: prioridad.slaMultiplier,
    icon: prioridad.icon,
    color: prioridad.color,
  }
  dialogNuevaPrioridad.value = true
}

function guardarPrioridad() {
  if (
    !nuevaPrioridad.value.nombre ||
    !nuevaPrioridad.value.nivel ||
    !nuevaPrioridad.value.slaMultiplier
  )
    return

  if (modoEdicionPrioridad.value && prioridadEnEdicion.value) {
    // Editar prioridad existente
    const index = configStore.prioridades.findIndex((p) => p.id === prioridadEnEdicion.value)
    if (index !== -1) {
      configStore.prioridades[index] = {
        ...configStore.prioridades[index],
        ...nuevaPrioridad.value,
      }
    }
    $q.notify({
      type: 'positive',
      message: 'Prioridad actualizada exitosamente',
      caption: nuevaPrioridad.value.nombre,
      position: 'top',
      icon: 'check_circle',
    })
  } else {
    // Agregar nueva prioridad
    configStore.agregarPrioridad({
      id: nuevaPrioridad.value.nombre.toLowerCase().replace(/\s+/g, '_'),
      ...nuevaPrioridad.value,
    })
    $q.notify({
      type: 'positive',
      message: 'Prioridad agregada exitosamente',
      caption: nuevaPrioridad.value.nombre,
      position: 'top',
      icon: 'check_circle',
    })
  }

  cerrarDialogPrioridad()
}

function eliminarPrioridad(prioridad) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar la prioridad "${prioridad.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const index = configStore.prioridades.findIndex((p) => p.id === prioridad.id)
    if (index !== -1) {
      configStore.prioridades.splice(index, 1)
      $q.notify({
        type: 'positive',
        message: 'Prioridad eliminada exitosamente',
        caption: prioridad.nombre,
        position: 'top',
        icon: 'check_circle',
      })
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

function guardarTipoSolicitud() {
  if (!nuevoTipo.value.nombre || !nuevoTipo.value.sla) return

  if (modoEdicionTipo.value && tipoEnEdicion.value) {
    // Editar tipo existente
    const index = configStore.tiposSolicitud.findIndex((t) => t.id === tipoEnEdicion.value)
    if (index !== -1) {
      configStore.tiposSolicitud[index] = {
        ...configStore.tiposSolicitud[index],
        ...nuevoTipo.value,
      }
    }
    $q.notify({
      type: 'positive',
      message: 'Tipo de solicitud actualizado exitosamente',
      caption: nuevoTipo.value.nombre,
      position: 'top',
      icon: 'check_circle',
    })
  } else {
    // Agregar nuevo tipo
    configStore.agregarTipoSolicitud(nuevoTipo.value)
    $q.notify({
      type: 'positive',
      message: 'Tipo de solicitud agregado exitosamente',
      caption: nuevoTipo.value.nombre,
      position: 'top',
      icon: 'check_circle',
    })
  }

  cerrarDialogTipo()
}

function toggleTipoSolicitud(id) {
  const index = configStore.tiposSolicitud.findIndex((t) => t.id === id)
  if (index !== -1) {
    const tipoActual = configStore.tiposSolicitud[index]
    configStore.tiposSolicitud[index] = {
      ...tipoActual,
      activo: tipoActual.activo === false ? true : false,
    }

    const tipo = configStore.tiposSolicitud[index]
    $q.notify({
      type: tipo.activo !== false ? 'positive' : 'info',
      message: `Tipo de solicitud ${tipo.activo !== false ? 'activado' : 'desactivado'}`,
      caption: tipo.nombre,
      position: 'top',
    })
  }
}

function eliminarTipoSolicitud(tipo) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el tipo de solicitud "${tipo.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const index = configStore.tiposSolicitud.findIndex((t) => t.id === tipo.id)
    if (index !== -1) {
      configStore.tiposSolicitud.splice(index, 1)
      $q.notify({
        type: 'positive',
        message: 'Tipo de solicitud eliminado exitosamente',
        caption: tipo.nombre,
        position: 'top',
        icon: 'check_circle',
      })
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
