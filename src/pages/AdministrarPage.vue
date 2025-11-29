<template>
  <q-page class="administrar-page" style="background-color: #fafafa">
    <div class="q-pa-md">
      <!-- Encabezado -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="text-h4 q-my-none text-weight-bold text-black">
            <q-icon name="admin_panel_settings" class="q-mr-sm" />
            Administrar Sistema
          </h4>
          <p class="text-grey-8 q-mt-sm q-mb-none" style="font-weight: 400">
            Gestiona solicitudes de contratación para áreas tecnológicas
          </p>
        </div>
      </div>

      <!-- Tabs para alternar entre registro manual y carga de datos -->
      <q-card class="tata-card">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey-8"
          active-color="black"
          indicator-color="black"
          align="justify"
          narrow-indicator
        >
          <q-tab name="manual" icon="edit" label="Registro Manual" />
          <q-tab name="excel" icon="upload_file" label="Carga desde Excel" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- Panel de Registro Manual -->
          <q-tab-panel name="manual">
            <ManualEntryForm @entry-created="handleManualEntryCreated" />
          </q-tab-panel>

          <!-- Panel de Carga Excel -->
          <q-tab-panel name="excel">
            <div class="q-mb-lg">
              <div class="text-h6 text-black q-mb-sm">Formato del Archivo Excel</div>
              <q-banner class="bg-grey-2 text-black" rounded>
                <template v-slot:avatar>
                  <q-icon name="info" color="black" />
                </template>
                <div class="text-body2">
                  <div class="text-weight-bold q-mb-sm">📋 Formato del archivo Excel:</div>

                  <div class="q-mb-sm">
                    <strong>Campos OBLIGATORIOS:</strong>
                    <ul class="q-my-xs q-pl-md">
                      <li><strong>AREA</strong>: Nombre del área o departamento</li>
                      <li><strong>Fecha Solicitud</strong>: Fecha de la solicitud (DD/MM/YYYY o YYYY-MM-DD)</li>
                      <li><strong>Tipo de Solicitud</strong>: Nuevo Personal, Reemplazo, Transferencia o Promoción</li>
                      <li><strong>Prioridad</strong>: Crítica, Alta, Media o Baja</li>
                      <li><strong>Fecha de Ingreso</strong>: Fecha de ingreso del personal (DD/MM/YYYY o YYYY-MM-DD)</li>
                    </ul>
                  </div>

                  <div class="q-mb-sm">
                    <strong>Campos OPCIONALES:</strong>
                    <ul class="q-my-xs q-pl-md">
                      <li><strong>Nombre Personal</strong>: Nombre completo de la persona</li>
                      <li><strong>Observaciones</strong>: Comentarios o notas adicionales</li>
                    </ul>
                  </div>

                  <div class="q-mt-md q-pa-sm bg-grey-2 rounded-borders">
                    <div class="text-caption text-grey-8">
                      💡 <strong>Nota:</strong> Los 5 primeros campos son obligatorios y deben tener valores. Solo Nombre Personal y Observaciones son opcionales.
                    </div>
                  </div>

                  <div class="q-mt-md text-weight-bold">
                    📥 Descarga la plantilla de ejemplo: <a href="/plantilla_carga_sla.xlsx" download class="text-primary">plantilla_carga_sla.xlsx</a>
                  </div>
                </div>
              </q-banner>
            </div>
            <FileUpload @upload-success="handleUploadSuccess" @upload-error="handleUploadError" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>

      <!-- Historial de registros recientes -->
      <div class="row justify-center q-mt-lg" v-if="registroHistory.length > 0">
        <div class="col-12">
          <q-card class="tata-card">
            <q-card-section
              style="background: linear-gradient(to right, #000000, #2c2c2c); color: white"
            >
              <div class="text-h6">
                <q-icon name="history" class="q-mr-sm" />
                Registros Recientes
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-timeline color="black">
                <q-timeline-entry
                  v-for="(registro, index) in registroHistory"
                  :key="index"
                  :title="registro.titulo"
                  :subtitle="registro.date"
                  :icon="registro.icon"
                  :color="registro.color"
                >
                  <div>
                    {{ registro.message }}
                  </div>
                  <div class="text-caption text-grey-7">
                    {{ registro.detalles }}
                  </div>
                </q-timeline-entry>
              </q-timeline>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useSlaStore } from 'src/stores/slaStore'
import FileUpload from 'src/components/ui/FileUpload.vue'
import ManualEntryForm from 'src/components/ui/ManualEntryForm.vue'

const $q = useQuasar()
const slaStore = useSlaStore()

const tab = ref('manual')
const registroHistory = ref([])

async function handleManualEntryCreated(solicitud) {
  try {
    // Llamar al store para crear la solicitud manual
    await slaStore.createManualEntry(solicitud)

    // Agregar al historial
    registroHistory.value.unshift({
      titulo: `${solicitud.bloque_tech} - ${solicitud.tipo_solicitud}`,
      date: new Date().toLocaleString('es-ES'),
      icon: 'edit',
      color: 'secondary',
      message: 'Solicitud creada manualmente',
      detalles: `${solicitud.dias_transcurridos} días transcurridos - ${
        solicitud.tipo_solicitud === 'Nuevo Personal'
          ? solicitud.cumple_sla1
            ? 'Cumple SLA1'
            : 'No cumple SLA1'
          : solicitud.cumple_sla2
            ? 'Cumple SLA2'
            : 'No cumple SLA2'
      }`,
    })

    // Limitar el historial a 10 elementos
    if (registroHistory.value.length > 10) {
      registroHistory.value.pop()
    }

    $q.notify({
      type: 'positive',
      message: 'Solicitud registrada exitosamente',
      caption: 'Los datos se han agregado al dashboard',
      icon: 'check_circle',
      position: 'top',
    })
  } catch (error) {
    console.error('Error al crear solicitud manual:', error)

    registroHistory.value.unshift({
      titulo: 'Error en registro manual',
      date: new Date().toLocaleString('es-ES'),
      icon: 'error',
      color: 'negative',
      message: 'Error al crear la solicitud',
      detalles: error.message || 'Error desconocido',
    })

    $q.notify({
      type: 'negative',
      message: 'Error al crear la solicitud',
      caption: error.message,
      icon: 'error',
      position: 'top',
    })
  }
}

async function handleUploadSuccess(file) {
  try {
    // Llamar al store para procesar el archivo
    await slaStore.uploadExcelFile(file)

    // Agregar al historial
    registroHistory.value.unshift({
      titulo: file.name,
      date: new Date().toLocaleString('es-ES'),
      icon: 'upload_file',
      color: 'positive',
      message: 'Archivo procesado exitosamente',
      detalles: `${slaStore.slaData.length} registros totales en el sistema`,
    })

    // Limitar el historial a 10 elementos
    if (registroHistory.value.length > 10) {
      registroHistory.value.pop()
    }
  } catch (error) {
    console.error('Error al procesar archivo:', error)

    registroHistory.value.unshift({
      titulo: file.name,
      date: new Date().toLocaleString('es-ES'),
      icon: 'error',
      color: 'negative',
      message: 'Error al procesar el archivo',
      detalles: error.message || 'Error desconocido',
    })

    $q.notify({
      type: 'negative',
      message: 'Error al procesar el archivo',
      caption: error.message,
      icon: 'error',
      position: 'top',
    })
  }
}

function handleUploadError(error) {
  console.error('Error en la carga:', error)

  $q.notify({
    type: 'negative',
    message: 'Error al cargar el archivo',
    caption: error.message || 'Ocurrió un error inesperado',
    icon: 'error',
    position: 'top',
  })
}
</script>

<style scoped lang="scss">
.administrar-page {
  background-color: #f5f5f5;
  min-height: calc(100vh - 50px);
}

.bloque-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
</style>
