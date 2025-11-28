<template>
  <div class="manual-entry-form">
    <q-card flat bordered>
      <q-card-section style="background: linear-gradient(to right, #000000, #2c2c2c); color: white">
        <div class="text-h6">
          <q-icon name="edit" class="q-mr-sm" />
          Registro Manual de Solicitud
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" @submit="onSubmit" @reset="onReset" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- BLOQUE TECH -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="formData.bloqueTech"
                filled
                :options="bloqueTechOptions"
                label="BLOQUE TECH *"
                emit-value
                map-options
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="work" color="black" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.departamento }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Tipo de Solicitud -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="formData.tipoSolicitud"
                filled
                :options="tipoSolicitudOptions"
                label="Tipo de Solicitud *"
                hint="Nuevo Personal o Reemplazo"
                emit-value
                map-options
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="black" />
                </template>
              </q-select>
            </div>

            <!-- Prioridad -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="formData.prioridad"
                filled
                :options="prioridadOptions"
                label="Prioridad *"
                hint="Nivel de prioridad de la solicitud"
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

            <!-- Fecha Solicitud -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.fechaSolicitud"
                filled
                type="date"
                label="Fecha Solicitud *"
                hint="Fecha en que se realizó la solicitud"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="black" />
                </template>
              </q-input>
            </div>

            <!-- Fecha de Ingreso -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.fechaIngreso"
                filled
                type="date"
                label="Fecha de Ingreso *"
                hint="Fecha en que ingresó el personal"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="event_available" color="black" />
                </template>
              </q-input>
            </div>

            <!-- Nombre del Personal (opcional) -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.nombrePersonal"
                filled
                label="Nombre del Personal (Opcional)"
                hint="Nombre completo de la persona contratada"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="black" />
                </template>
              </q-input>
            </div>

            <!-- Observaciones -->
            <div class="col-12">
              <q-input
                v-model="formData.observaciones"
                filled
                type="textarea"
                label="Observaciones (Opcional)"
                hint="Comentarios o notas adicionales"
                rows="3"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="comment" color="black" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Vista previa de cálculos -->
          <q-card
            v-if="formData.fechaSolicitud && formData.fechaIngreso"
            flat
            bordered
            class="bg-grey-2"
            style="border: 2px solid #e0e0e0"
          >
            <q-card-section>
              <div class="text-subtitle2 text-weight-medium q-mb-md text-black">
                <q-icon name="calculate" color="black" class="q-mr-sm" />
                Cálculo Automático
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <div class="text-caption text-grey-7">Días Transcurridos</div>
                  <div class="text-h6 text-black">{{ diasTranscurridos }} días</div>
                </div>

                <div class="col-12 col-md-4" v-if="formData.tipoSolicitud === 'Nuevo Personal'">
                  <div class="text-caption text-grey-7">Cumple SLA1 (35 días)</div>
                  <div class="text-h6" :class="cumpleSla1 ? 'text-positive' : 'text-negative'">
                    <q-icon :name="cumpleSla1 ? 'check_circle' : 'cancel'" />
                    {{ cumpleSla1 ? 'SÍ' : 'NO' }}
                  </div>
                </div>

                <div class="col-12 col-md-4" v-if="formData.tipoSolicitud === 'Reemplazo'">
                  <div class="text-caption text-grey-7">Cumple SLA2 (20 días)</div>
                  <div class="text-h6" :class="cumpleSla2 ? 'text-positive' : 'text-negative'">
                    <q-icon :name="cumpleSla2 ? 'check_circle' : 'cancel'" />
                    {{ cumpleSla2 ? 'SÍ' : 'NO' }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Botones -->
          <div class="row justify-end q-gutter-sm">
            <q-btn flat label="Limpiar" type="reset" color="grey-7" icon="clear" />
            <q-btn
              unelevated
              label="Guardar Solicitud"
              type="submit"
              color="black"
              icon="save"
              :loading="saving"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Instrucciones -->
    <q-card class="q-mt-md" flat bordered>
      <q-card-section>
        <div class="text-subtitle2 text-weight-medium q-mb-md text-black">
          <q-icon name="info" color="grey-8" class="q-mr-sm" />
          Información
        </div>
        <q-list dense>
          <q-item>
            <q-item-section avatar top>
              <q-icon name="check" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label
                ><strong>SLA1 (Nuevo Personal):</strong> Se cumple si el ingreso ocurre en menos de
                35 días desde la solicitud</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar top>
              <q-icon name="check" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label
                ><strong>SLA2 (Reemplazo):</strong> Se cumple si el ingreso ocurre en menos de 20
                días desde la solicitud</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar top>
              <q-icon name="check" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Los campos marcados con * son obligatorios</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useConfigStore } from 'src/stores/configStore'

const $q = useQuasar()
const configStore = useConfigStore()

onMounted(async () => {
  // Cargar configuración desde el backend
  console.log('Cargando datos de configuración desde el backend...')
  if (typeof configStore.fetchAllConfig === 'function') {
    try {
      await configStore.fetchAllConfig()
      console.log('Datos de configuración cargados exitosamente')
    } catch (error) {
      console.error('Error al cargar datos de configuración:', error)
    }
  }
})

const emit = defineEmits(['entry-created'])

const formRef = ref(null)
const saving = ref(false)

const formData = ref({
  bloqueTech: null,
  tipoSolicitud: null,
  prioridad: null,
  fechaSolicitud: null,
  fechaIngreso: null,
  nombrePersonal: '',
  observaciones: '',
})

// Usar opciones del configStore (escalable)
const bloqueTechOptions = computed(() => configStore.bloquesOptions)

const tipoSolicitudOptions = computed(() => configStore.tiposSolicitudOptions)
const prioridadOptions = computed(() => configStore.prioridadesOptions)

const diasTranscurridos = computed(() => {
  if (!formData.value.fechaSolicitud || !formData.value.fechaIngreso) return 0

  const fechaSol = new Date(formData.value.fechaSolicitud)
  const fechaIng = new Date(formData.value.fechaIngreso)
  const diffTime = Math.abs(fechaIng - fechaSol)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
})

const cumpleSla1 = computed(() => {
  return diasTranscurridos.value < 35
})

const cumpleSla2 = computed(() => {
  return diasTranscurridos.value < 20
})

async function onSubmit() {
  saving.value = true

  try {
    // Guardar valores en variables temporales antes de resetear
    const bloqueTechGuardado = formData.value.bloqueTech
    const tipoSolicitudGuardado = formData.value.tipoSolicitud

    // Crear objeto de solicitud
    const solicitud = {
      bloque_tech: formData.value.bloqueTech,
      tipo_solicitud: formData.value.tipoSolicitud,
      prioridad: formData.value.prioridad,
      fecha_solicitud: formData.value.fechaSolicitud,
      fecha_ingreso: formData.value.fechaIngreso,
      dias_transcurridos: diasTranscurridos.value,
      cumple_sla1: formData.value.tipoSolicitud === 'Nuevo Personal' ? cumpleSla1.value : null,
      cumple_sla2: formData.value.tipoSolicitud === 'Reemplazo' ? cumpleSla2.value : null,
      nombre_personal: formData.value.nombrePersonal || null,
      observaciones: formData.value.observaciones || null,
      creado_manualmente: true,
      fecha_creacion: new Date().toISOString(),
    }

    // Emitir evento al componente padre
    emit('entry-created', solicitud)

    // Resetear formulario primero
    onReset()

    // Luego mostrar la notificación con los valores guardados
    $q.notify({
      type: 'positive',
      message: 'Solicitud guardada exitosamente',
      caption: `${tipoSolicitudGuardado} - ${bloqueTechGuardado}`,
      icon: 'check_circle',
      position: 'top',
    })
  } catch (error) {
    console.error('Error al guardar solicitud:', error)

    $q.notify({
      type: 'negative',
      message: 'Error al guardar la solicitud',
      caption: error.message,
      icon: 'error',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

function onReset() {
  formData.value = {
    bloqueTech: null,
    tipoSolicitud: null,
    prioridad: null,
    fechaSolicitud: null,
    fechaIngreso: null,
    nombrePersonal: '',
    observaciones: '',
  }

  // Limpiar las validaciones del formulario
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}
</script>

<style scoped lang="scss">
.manual-entry-form {
  max-width: 900px;
  margin: 0 auto;
}
</style>
