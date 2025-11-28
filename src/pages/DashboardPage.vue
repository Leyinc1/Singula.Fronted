<template>
  <q-page class="dashboard-page" style="background-color: #fafafa">
    <div class="q-pa-md">
      <!-- Encabezado -->
      <div class="row items-center q-mb-lg q-col-gutter-md">
        <div class="col-12 col-md-8">
          <h4 class="text-h4 q-my-none text-weight-bold text-black">
            <q-icon name="dashboard" class="q-mr-sm" />
            Dashboard de Indicadores
          </h4>
          <p class="text-grey-8 q-mt-sm q-mb-none" style="font-weight: 400">
            Visualización y análisis del cumplimiento de SLAs de contratación para áreas
            tecnológicas
          </p>
        </div>
        <div class="col-12 col-md-4 text-right">
          <q-btn
            outline
            color="black"
            icon="refresh"
            label="Actualizar"
            @click="refreshData"
            :loading="loading"
            style="border-width: 2px"
            class="full-width-xs"
          />
        </div>
      </div>

      <!-- Filtros -->
      <q-card class="q-mb-lg tata-card">
        <q-card-section>
          <div class="row q-col-gutter-md items-end">
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <q-input
                v-model="localFilters.startDate"
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

            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <q-input
                v-model="localFilters.endDate"
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

            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <q-select
                v-model="localFilters.area"
                filled
                label="ÁREAS"
                :options="bloquesOptions"
                multiple
                use-chips
                clearable
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

            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <q-select
                v-model="localFilters.tipoSolicitud"
                filled
                label="Tipo de SLA"
                :options="tipoSolicitudOptions"
                multiple
                use-chips
                clearable
                emit-value
                map-options
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="assignment" color="black" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.icon" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <q-select
                v-model="localFilters.prioridad"
                filled
                label="Prioridad"
                :options="prioridadOptions"
                multiple
                use-chips
                clearable
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

            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <q-select
                v-model="localFilters.cumpleSla"
                filled
                label="Cumplimiento"
                :options="cumplimientoOptions"
                clearable
                emit-value
                map-options
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="check_circle" color="black" />
                </template>
              </q-select>
            </div>

            <div class="col-12">
              <div class="row q-gutter-sm justify-end">
                <q-btn
                  color="black"
                  icon="filter_alt"
                  label="Aplicar Filtros"
                  @click="applyFilters"
                  :loading="loading"
                  unelevated
                  style="min-width: 150px"
                />
                <q-btn
                  outline
                  color="black"
                  icon="clear"
                  label="Limpiar"
                  @click="resetFilters"
                  :disable="loading"
                  style="border-width: 2px"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- KPIs Dinámicos -->
      <div class="row q-col-gutter-md q-mb-lg">
        <!-- KPIs por Tipo de SLA (Dinámico) -->
        <div
          v-for="(kpi, tipo) in kpisPorTipo"
          :key="tipo"
          class="col-12 col-sm-6 col-md-6 col-lg-3"
        >
          <KpiCard
            :title="`Cumplimiento ${tipo}`"
            :value="kpi.porcentaje"
            :subtitle="`${tipo} (${kpi.diasUmbral} días)`"
            :description="`${kpi.cumplidos} de ${kpi.total} solicitudes cumplen el SLA`"
            :icon="tipo === 'Nuevo Personal' ? 'trending_up' : 'swap_horiz'"
            icon-color="grey-7"
            :threshold="80"
          />
        </div>

        <!-- KPI de Eficacia Global -->
        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
          <KpiCard
            title="Eficacia Global"
            :value="kpiEficacia"
            subtitle="Cumplimiento general"
            description="Porcentaje total de solicitudes que cumplen su SLA correspondiente"
            icon="check_circle_outline"
            icon-color="grey-9"
            :threshold="85"
          />
        </div>

        <!-- Total de Solicitudes -->
        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
          <KpiCard
            title="Total Solicitudes"
            :value="totalSolicitudes"
            subtitle="Período seleccionado"
            description="Total de solicitudes procesadas"
            icon="description"
            icon-color="grey-6"
            suffix=""
            :show-progress="false"
            :is-integer="true"
          />
        </div>
      </div>

      <!-- Gráfico Principal -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-lg-6">
          <SlaChart :data="chartDataByRole" :loading="loading" title="Cumplimiento SLA por Área" />
        </div>
        <div class="col-12 col-lg-6">
          <PriorityChart :data="chartDataByPriority" :loading="loading" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSlaStore } from 'src/stores/slaStore'
import { useConfigStore } from 'src/stores/configStore'
import KpiCard from 'src/components/dashboard/KpiCard.vue'
import SlaChart from 'src/components/dashboard/SlaChart.vue'
import PriorityChart from 'src/components/dashboard/PriorityChart.vue'

const slaStore = useSlaStore()
const configStore = useConfigStore()
const { loading, kpisPorTipo, kpiEficacia, chartDataByRole } = storeToRefs(slaStore)

const localFilters = ref({
  startDate: null,
  endDate: null,
  area: [],
  tipoSolicitud: [],
  prioridad: [],
  cumpleSla: null,
})

// Usar filteredData directamente del store
const filteredSlaData = computed(() => slaStore.filteredData)

// Usar opciones del configStore
const bloquesOptions = computed(() => configStore.bloquesOptions)
const tipoSolicitudOptions = computed(() => configStore.tiposSolicitudOptions)
const prioridadOptions = computed(() => configStore.prioridadesOptions)

const cumplimientoOptions = [
  { label: 'Cumple SLA', value: 'cumple' },
  { label: 'No Cumple SLA', value: 'no_cumple' },
]

const totalSolicitudes = computed(() => {
  return filteredSlaData.value?.length || 0
})

const chartDataByPriority = computed(() => {
  // Proteger contra datos no cargados
  if (!prioridadOptions.value || prioridadOptions.value.length === 0) return []
  if (!filteredSlaData.value || filteredSlaData.value.length === 0) return []

  // Usar prioridades del backend (solo activas)
  const priorities = prioridadOptions.value.map((p) => p.value)
  const priorityData = []

  priorities.forEach((prioridad) => {
    const solicitudesPrioridad = filteredSlaData.value.filter(
      (item) => item.prioridad === prioridad,
    )
    const total = solicitudesPrioridad.length

    if (total > 0) {
      const cumplidas = solicitudesPrioridad.filter((item) => {
        if (item.tipoSolicitud === 'Nuevo Personal') {
          return item.cumpleSla1 === true
        } else if (item.tipoSolicitud === 'Reemplazo') {
          return item.cumpleSla2 === true
        }
        return false
      }).length

      const percentage = (cumplidas / total) * 100

      priorityData.push({
        prioridad,
        cumplimientoPercentage: percentage.toFixed(2),
        total,
        cumplidas,
      })
    }
  })

  return priorityData
})

onMounted(async () => {
  await Promise.all([
    configStore.loadPrioridadesFromBackend(),
    configStore.loadAreasFromBackend(),
    configStore.loadTiposSolicitudFromBackend(),
  ])
  slaStore.fetchSlaData()
})

function applyFilters() {
  slaStore.setFilters({
    startDate: localFilters.value.startDate,
    endDate: localFilters.value.endDate,
    area: localFilters.value.area,
    tipoSolicitud: localFilters.value.tipoSolicitud,
    prioridad: localFilters.value.prioridad,
    cumpleSla: localFilters.value.cumpleSla,
  })
}

function resetFilters() {
  localFilters.value = {
    startDate: null,
    endDate: null,
    area: [],
    tipoSolicitud: [],
    prioridad: [],
    cumpleSla: null,
  }
  slaStore.resetFilters()
}

function refreshData() {
  slaStore.fetchSlaData()
}
</script>

<style scoped lang="scss">
.dashboard-page {
  background-color: #f5f5f5;
}

.tata-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Responsividad para pantallas pequeñas */
@media (max-width: 599px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }

  .full-width-xs {
    width: 100%;
  }

  .text-right {
    text-align: left !important;
  }
}

/* Tablets */
@media (min-width: 600px) and (max-width: 1023px) {
  .q-page {
    padding: 0 8px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .q-page {
    max-width: 1400px;
    margin: 0 auto;
  }
}
</style>
