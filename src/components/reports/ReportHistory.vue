<template>
  <div>
    <q-dialog v-model="visible" persistent>
      <q-card style="min-width: 700px; max-width: 1100px">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="text-h6">Historial de Reportes</div>
              <div class="text-caption text-grey-6">Listado de reportes generados y guardados en el sistema</div>
            </div>
            <div class="col-auto">
              <q-btn dense flat icon="refresh" @click="fetchReports" />
              <q-btn dense flat icon="close" @click="close" />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-table
            :rows="reports"
            :columns="columns"
            row-key="idReporte"
            flat
            dense
            class="shadow-0"
          >
            <template v-slot:body-cell-rutaArchivo="props">
              <q-td :props="props">
                <div v-if="props.row.rutaArchivo">
                  <a :href="props.row.rutaArchivo" target="_blank">Descargar</a>
                </div>
                <div v-else class="text-grey-6">—</div>
              </q-td>
            </template>

            <template v-slot:body-cell-fechaGeneracion="props">
              <q-td :props="props">
                {{ formatDate(props.row.fechaGeneracion) }}
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn dense flat icon="file_download" @click="download(props.row)" />
                <q-btn dense flat color="negative" icon="delete" @click="remove(props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" @click="close" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)

watch(() => props.modelValue, (v) => (visible.value = v))
watch(visible, (v) => emit('update:modelValue', v))

const reports = ref([])

const columns = [
  { name: 'idReporte', label: 'ID', field: 'idReporte', align: 'left' },
  { name: 'tipoReporte', label: 'Título', field: 'tipoReporte' },
  { name: 'formato', label: 'Formato', field: 'formato' },
  { name: 'fechaGeneracion', label: 'Fecha', field: 'fechaGeneracion' },
  { name: 'generadoPor', label: 'Generado Por', field: 'generadoPor' },
  { name: 'rutaArchivo', label: 'Archivo', field: 'rutaArchivo' },
  { name: 'acciones', label: 'Acciones', field: 'acciones' },
]

function formatDate(val) {
  if (!val) return '—'
  try {
    const d = new Date(val)
    return d.toLocaleString()
  } catch {
    return val
  }
}

async function fetchReports() {
  try {
    const resp = await api.get('/Reporte')
    reports.value = resp.data || []
  } catch (err) {
    console.error('Error fetching reports:', err)
    $q.notify({ type: 'negative', message: 'Error al obtener historial de reportes' })
  }
}

function close() {
  visible.value = false
}

function download(row) {
  if (!row.rutaArchivo) {
    $q.notify({ type: 'warning', message: 'Reporte sin archivo asociado' })
    return
  }

  // Abrir en nueva pestaña; si se requiere protección, backend debe servir el archivo con validación
  window.open(row.rutaArchivo, '_blank')
}

async function remove(row) {
  try {
    await api.delete(`/Reporte/${row.idReporte}`)
    $q.notify({ type: 'positive', message: 'Registro eliminado' })
    fetchReports()
  } catch (err) {
    console.error('Error eliminando reporte:', err)
    $q.notify({ type: 'negative', message: 'Error al eliminar registro' })
  }
}

// Fetch when opened
watch(visible, (v) => {
  if (v) fetchReports()
})
</script>

<style scoped>
.q-table .q-td {
  vertical-align: middle;
}
</style>
