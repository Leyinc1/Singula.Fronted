<template>
  <q-page class="reports-page" style="background-color: #fafafa">
    <div class="q-pa-md">
      <!-- Encabezado -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="text-h4 q-my-none text-weight-bold text-black">
            <q-icon name="assessment" class="q-mr-sm" />
            Reportes
          </h4>
          <p class="text-grey-8 q-mt-sm q-mb-none" style="font-weight: 400">
            Genera y exporta reportes de cumplimiento SLA en formato PDF
          </p>
        </div>
      </div>

      <!-- Filtros para el reporte -->
      <q-card class="q-mb-lg tata-card">
        <q-card-section
          style="background: linear-gradient(to right, #000000, #2c2c2c); color: white"
        >
          <div class="text-h6">
            <q-icon name="filter_alt" class="q-mr-sm" />
            Configuración del Reporte
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="reportFilters.startDate"
                filled
                type="date"
                label="Fecha Inicio"
                stack-label
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="black" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model="reportFilters.endDate"
                filled
                type="date"
                label="Fecha Fin"
                stack-label
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="black" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-4">
              <q-select
                v-model="reportFilters.bloqueTech"
                filled
                label="BLOQUE TECH (Opcional)"
                :options="rolesOptions"
                clearable
                emit-value
                map-options
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="work" color="black" />
                </template>
              </q-select>
            </div>
          </div>

          <div class="row q-mt-md">
            <div class="col-12">
              <q-input
                v-model="reportTitle"
                filled
                label="Título del Reporte"
                placeholder="Reporte de SLA - Mes de..."
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="title" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Limpiar Filtros" color="grey-7" icon="clear" @click="clearFilters" />
          <q-btn
            unelevated
            label="Aplicar Filtros"
            color="primary"
            icon="filter_alt"
            @click="applyFilters"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>

      <!-- Vista previa del reporte -->
      <div class="row q-col-gutter-md">
        <!-- KPIs Preview -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section class="bg-grey-3">
              <div class="text-h6">
                <q-icon name="pie_chart" class="q-mr-sm" />
                Resumen de KPIs
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-card flat bordered>
                    <q-card-section class="text-center">
                      <div class="text-caption text-grey-7">SLA1</div>
                      <div class="text-h4 text-primary">{{ kpiSla1 }}%</div>
                      <div class="text-caption">Nuevo Personal</div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-6">
                  <q-card flat bordered>
                    <q-card-section class="text-center">
                      <div class="text-caption text-grey-7">SLA2</div>
                      <div class="text-h4 text-positive">{{ kpiSla2 }}%</div>
                      <div class="text-caption">Reemplazo</div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12">
                  <q-card flat bordered>
                    <q-card-section class="text-center">
                      <div class="text-caption text-grey-7">Total Solicitudes</div>
                      <div class="text-h4 text-grey-8">{{ totalSolicitudes }}</div>
                      <div class="text-caption">Período seleccionado</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Tabla Preview -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section class="bg-grey-3">
              <div class="text-h6">
                <q-icon name="table_chart" class="q-mr-sm" />
                Detalle por Rol
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-markup-table flat bordered dense>
                <thead>
                  <tr class="bg-primary text-white">
                    <th class="text-left">BLOQUE TECH</th>
                    <th class="text-center">SLA1 (%)</th>
                    <th class="text-center">SLA2 (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in chartDataByRole" :key="item.role">
                    <td>{{ item.role }}</td>
                    <td class="text-center">
                      <q-badge
                        :color="getSla1Color(item.sla1Percentage)"
                        :label="item.sla1Percentage + '%'"
                      />
                    </td>
                    <td class="text-center">
                      <q-badge
                        :color="getSla2Color(item.sla2Percentage)"
                        :label="item.sla2Percentage + '%'"
                      />
                    </td>
                  </tr>
                  <tr v-if="chartDataByRole.length === 0">
                    <td colspan="3" class="text-center text-grey-6">No hay datos disponibles</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Botón de exportación -->
      <div class="row justify-center q-mt-lg">
        <div class="col-12 col-md-6 text-center">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Exportar Reporte</div>
              <PdfExportButton
                :data="chartDataByRole"
                :kpi-data="{ sla1: kpiSla1, sla2: kpiSla2 }"
                :title="reportTitle"
                :filename="generateFilename()"
                button-label="Generar PDF"
                button-color="primary"
                :disabled="chartDataByRole.length === 0"
                tooltip="Exportar reporte en formato PDF"
                class="q-mb-sm"
              />
              <div class="text-caption text-grey-7">
                El reporte incluirá todos los datos filtrados y KPIs calculados
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSlaStore } from 'src/stores/slaStore'
import PdfExportButton from 'src/components/ui/PdfExportButton.vue'

const slaStore = useSlaStore()
const { loading, kpiSla1, kpiSla2, chartDataByRole, slaData } = storeToRefs(slaStore)

const reportFilters = ref({
  startDate: null,
  endDate: null,
  bloqueTech: null,
})

const reportTitle = ref('Reporte de Cumplimiento SLA')

const rolesOptions = computed(() => {
  const roles = [...new Set(slaData.value.map((item) => item.bloque_tech))]
  return roles.map((role) => ({ label: role, value: role }))
})

const totalSolicitudes = computed(() => {
  return slaData.value.length
})

function applyFilters() {
  slaStore.updateFilters(reportFilters.value)
  slaStore.fetchSlaData()
}

function clearFilters() {
  reportFilters.value = {
    startDate: null,
    endDate: null,
    bloqueTech: null,
  }
  reportTitle.value = 'Reporte de Cumplimiento SLA'
  slaStore.resetFilters()
  slaStore.fetchSlaData()
}

function generateFilename() {
  const date = new Date().toISOString().split('T')[0]
  return `reporte-sla-${date}.pdf`
}

function getSla1Color(percentage) {
  const value = parseFloat(percentage)
  if (value >= 80) return 'positive'
  if (value >= 70) return 'warning'
  return 'negative'
}

function getSla2Color(percentage) {
  const value = parseFloat(percentage)
  if (value >= 80) return 'positive'
  if (value >= 70) return 'warning'
  return 'negative'
}
</script>

<style scoped lang="scss">
.reports-page {
  background-color: #f5f5f5;
}
</style>
