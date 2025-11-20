<template>
  <div class="file-upload">
    <q-card>
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="cloud_upload" class="q-mr-sm" />
          Cargar Archivo Excel
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-file
          v-model="file"
          filled
          label="Seleccionar archivo Excel"
          accept=".xlsx,.xls"
          max-file-size="10485760"
          @update:model-value="onFileSelected"
          :disable="uploading"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>

          <template v-slot:append>
            <q-icon v-if="file" name="close" class="cursor-pointer" @click.stop="clearFile" />
          </template>

          <template v-slot:hint> Formatos aceptados: .xlsx, .xls (Máximo 10 MB) </template>
        </q-file>

        <div v-if="file" class="q-mt-md">
          <q-list bordered separator>
            <q-item>
              <q-item-section avatar>
                <q-icon name="description" color="primary" />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ file.name }}</q-item-label>
                <q-item-label caption>
                  {{ formatFileSize(file.size) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="clearFile"
                  :disable="uploading"
                >
                  <q-tooltip>Eliminar archivo</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <div v-if="uploading" class="q-mt-md">
          <q-linear-progress indeterminate color="primary" class="q-mb-sm" />
          <div class="text-center text-grey-7">Procesando archivo...</div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          @click="clearFile"
          :disable="uploading || !file"
        />
        <q-btn
          unelevated
          label="Subir Archivo"
          color="primary"
          icon="cloud_upload"
          @click="uploadFile"
          :loading="uploading"
          :disable="!file"
        />
      </q-card-actions>
    </q-card>

    <q-card v-if="uploadResult" class="q-mt-md" :class="uploadResultClass">
      <q-card-section class="row items-center">
        <q-icon
          :name="uploadResult.success ? 'check_circle' : 'error'"
          :color="uploadResult.success ? 'positive' : 'negative'"
          size="32px"
          class="q-mr-md"
        />
        <div>
          <div class="text-subtitle1 text-weight-medium">
            {{ uploadResult.message }}
          </div>
          <div v-if="uploadResult.details" class="text-caption text-grey-7 q-mt-xs">
            {{ uploadResult.details }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-subtitle2 text-weight-medium q-mb-md">
          <q-icon name="info" color="info" class="q-mr-sm" />
          Instrucciones
        </div>
        <q-list dense>
          <q-item>
            <q-item-section avatar top>
              <q-icon name="check" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label><strong>Columnas obligatorias:</strong></q-item-label>
              <q-item-label caption>
                area, rol, tipo_solicitud, prioridad, fecha_solicitud, nombre_personal
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar top>
              <q-icon name="check" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label
                >El campo <strong>area</strong> debe contener bloques tecnológicos: Backend,
                Frontend, QA, Mobile, DevOps, Data</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar top>
              <q-icon name="check" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label
                >El campo <strong>bloque_tech</strong> debe especificar el bloque tecnológico:
                "Backend", "Frontend", "QA", "Mobile", "DevOps", "Data"</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar top>
              <q-icon name="check" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Las fechas deben estar en formato YYYY-MM-DD</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar top>
              <q-icon name="check" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label
                >El tipo de solicitud debe ser "Nuevo Personal" o "Reemplazo"</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar top>
              <q-icon name="check" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>La prioridad debe ser: Crítica, Alta, Media o Baja</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar top>
              <q-icon name="warning" color="warning" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-warning">
                Si el bloque no existe, se te pedirá crearlo antes de importar
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar top>
              <q-icon name="download" color="secondary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                <a href="#" @click.prevent="downloadTemplate" class="text-secondary">
                  Descargar plantilla de ejemplo
                </a>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
    <!-- Dialog para crear bloques faltantes -->
    <!-- Dialog para crear bloques faltantes -->
    <q-dialog v-model="showCreateAreaDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-warning text-white">
          <div class="text-h6">
            <q-icon name="warning" class="q-mr-sm" />
            Bloques No Encontrados
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <p class="text-body1">
            El archivo contiene <strong>{{ missingAreas.length }}</strong> bloque(s) que no existen
            en el sistema:
          </p>
          <q-list bordered separator class="q-mb-md">
            <q-item
              v-for="area in missingAreas"
              :key="area"
              clickable
              @click="seleccionarAreaFaltante(area)"
            >
              <q-item-section avatar>
                <q-icon name="business" color="warning" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ area }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  size="sm"
                  flat
                  round
                  icon="add"
                  color="black"
                  @click="seleccionarAreaFaltante(area)"
                >
                  <q-tooltip>Crear este bloque</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 q-mb-sm">Crear Nuevo Bloque:</div>
          <q-input
            v-model="nuevaArea.nombre"
            label="Nombre del bloque"
            filled
            dense
            class="q-mb-sm"
          />
          <q-input
            v-model="nuevaArea.descripcion"
            label="Descripción"
            filled
            dense
            type="textarea"
            rows="2"
            class="q-mb-sm"
          />
          <q-select
            v-model="nuevaArea.departamento"
            :options="['Tech']"
            label="Departamento"
            filled
            dense
            class="q-mb-sm"
          />
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input v-model="nuevaArea.icon" label="Icono (Material Icons)" filled dense>
                <template v-slot:prepend>
                  <q-icon :name="nuevaArea.icon || 'business'" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input v-model="nuevaArea.color" label="Color" filled dense>
                <template v-slot:append>
                  <q-icon name="colorize" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-color v-model="nuevaArea.color" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" @click="cancelarCreacionArea" />
          <q-btn
            unelevated
            label="Crear Bloque"
            color="black"
            icon="add"
            @click="crearAreaFaltante"
            :disable="!nuevaArea.nombre"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useConfigStore } from 'src/stores/configStore'
import * as ExcelJS from 'exceljs'

const $q = useQuasar()
const configStore = useConfigStore()

const emit = defineEmits(['upload-success', 'upload-error', 'missing-area'])

const file = ref(null)
const uploading = ref(false)
const uploadResult = ref(null)
const showCreateAreaDialog = ref(false)
const missingAreas = ref([])
const parsedData = ref(null)

const nuevaArea = ref({
  nombre: '',
  descripcion: '',
  departamento: 'Tech',
  icon: 'business',
  color: '#0066cc',
})

function onFileSelected(newFile) {
  uploadResult.value = null
  if (newFile && newFile.size > 10485760) {
    $q.notify({
      type: 'negative',
      message: 'El archivo es demasiado grande. Tamaño máximo: 10 MB',
      position: 'top',
    })
    file.value = null
  }
}

function clearFile() {
  file.value = null
  uploadResult.value = null
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

async function uploadFile() {
  if (!file.value) return

  uploading.value = true
  uploadResult.value = null

  try {
    // Leer el archivo Excel
    const data = await readExcelFile(file.value)

    // Validar bloques
    const areasEnArchivo = [...new Set(data.map((row) => row.area).filter(Boolean))]
    const areasExistentes = configStore.bloques.map((b) => b.nombre)
    const areasFaltantes = areasEnArchivo.filter((area) => !areasExistentes.includes(area))

    if (areasFaltantes.length > 0) {
      // Hay bloques que no existen, mostrar diálogo
      missingAreas.value = areasFaltantes
      parsedData.value = data
      showCreateAreaDialog.value = true
      uploading.value = false

      $q.notify({
        type: 'warning',
        message: `Se encontraron ${areasFaltantes.length} bloque(s) no registrado(s)`,
        caption: 'Por favor, crea los bloques faltantes antes de continuar',
        icon: 'warning',
        position: 'top',
        timeout: 3000,
      })
      return
    }

    // Todos los bloques existen, proceder
    emit('upload-success', file.value)

    uploadResult.value = {
      success: true,
      message: '¡Archivo cargado exitosamente!',
      details: `${file.value.name} procesado correctamente`,
    }

    $q.notify({
      type: 'positive',
      message: 'Archivo cargado y procesado exitosamente',
      icon: 'cloud_done',
      position: 'top',
    })

    // Limpiar después de 2 segundos
    setTimeout(() => {
      clearFile()
    }, 2000)
  } catch (error) {
    console.error('Error al subir archivo:', error)

    uploadResult.value = {
      success: false,
      message: 'Error al procesar el archivo',
      details: error.message || 'Error desconocido',
    }

    emit('upload-error', error)

    $q.notify({
      type: 'negative',
      message: 'Error al procesar el archivo',
      caption: error.message,
      icon: 'error',
      position: 'top',
    })
  } finally {
    uploading.value = false
  }
}

async function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const buffer = e.target.result
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(buffer)
        const worksheet = workbook.getWorksheet(1)
        const jsonData = []
        const header = []
        worksheet.getRow(1).eachCell((cell) => {
          header.push(cell.value)
        })

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            const rowData = {}
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
              rowData[header[colNumber - 1]] = cell.value
            })
            jsonData.push(rowData)
          }
        })
        resolve(jsonData)
      } catch (err) {
        reject(new Error('Error al parsear el archivo Excel: ' + err.message))
      }
    }

    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsArrayBuffer(file)
  })
}

function crearAreaFaltante() {
  if (!nuevaArea.value.nombre) {
    $q.notify({
      type: 'negative',
      message: 'Ingresa el nombre del bloque',
      position: 'top',
    })
    return
  }

  configStore.agregarBloque({
    nombre: nuevaArea.value.nombre,
    descripcion: nuevaArea.value.descripcion,
    departamento: nuevaArea.value.departamento,
    icon: nuevaArea.value.icon,
    color: nuevaArea.value.color,
  })

  $q.notify({
    type: 'positive',
    message: `Bloque "${nuevaArea.value.nombre}" creado`,
    icon: 'check_circle',
    position: 'top',
  })

  // Quitar de la lista de faltantes
  missingAreas.value = missingAreas.value.filter((a) => a !== nuevaArea.value.nombre)

  // Resetear formulario
  nuevaArea.value = {
    nombre: '',
    descripcion: '',
    departamento: 'Tech',
    icon: 'business',
    color: '#0066cc',
  }

  // Si ya no hay bloques faltantes, procesar archivo
  if (missingAreas.value.length === 0) {
    showCreateAreaDialog.value = false
    emit('upload-success', file.value)

    uploadResult.value = {
      success: true,
      message: '¡Archivo cargado exitosamente!',
      details: 'Todos los bloques fueron creados y el archivo procesado',
    }

    $q.notify({
      type: 'positive',
      message: 'Archivo procesado exitosamente',
      icon: 'cloud_done',
      position: 'top',
    })

    setTimeout(() => {
      clearFile()
    }, 2000)
  }
}

function cancelarCreacionArea() {
  showCreateAreaDialog.value = false
  missingAreas.value = []
  parsedData.value = null
  clearFile()
}

function seleccionarAreaFaltante(area) {
  nuevaArea.value.nombre = area
}

async function downloadTemplate() {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Plantilla')

    // Definir columnas
    worksheet.columns = [
      { header: 'bloque_tech', key: 'bloque_tech', width: 15 },
      { header: 'tipo_solicitud', key: 'tipo_solicitud', width: 20 },
      { header: 'prioridad', key: 'prioridad', width: 15 },
      { header: 'fecha_solicitud', key: 'fecha_solicitud', width: 20 },
      { header: 'nombre_personal', key: 'nombre_personal', width: 25 },
    ]

    // Agregar datos de ejemplo
    const templateData = [
      {
        bloque_tech: 'Backend',
        tipo_solicitud: 'Nuevo Personal',
        prioridad: 'Alta',
        fecha_solicitud: '2025-11-01',
        nombre_personal: 'Juan Pérez',
      },
      {
        bloque_tech: 'Frontend',
        tipo_solicitud: 'Reemplazo',
        prioridad: 'Media',
        fecha_solicitud: '2025-11-05',
        nombre_personal: 'María García',
      },
    ]

    worksheet.addRows(templateData)

    // Estilizar encabezado
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDDDDDD' },
      }
    })

    // Generar buffer y descargar
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'plantilla_sla_singula.xlsx')
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    $q.notify({
      type: 'info',
      message: 'Plantilla descargada',
      caption: 'Puedes usar este archivo como ejemplo',
      icon: 'download',
      position: 'top',
    })
  } catch (error) {
    console.error('Error al generar la plantilla:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar la plantilla',
      caption: error.message,
      icon: 'error',
      position: 'top',
    })
  }
}

const uploadResultClass = computed(() => {
  if (!uploadResult.value) return ''
  return uploadResult.value.success ? 'bg-positive-1' : 'bg-negative-1'
})
</script>

<style scoped lang="scss">
.file-upload {
  max-width: 800px;
  margin: 0 auto;
}
</style>
