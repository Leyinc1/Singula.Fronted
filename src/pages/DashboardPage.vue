<template>
  <q-page class="dashboard-page" style="background-color: #fafafa">
    <div class="q-pa-md">
      <!-- Encabezado -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="text-h4 q-my-none text-weight-bold text-black">
            <q-icon name="dashboard" class="q-mr-sm" />
            Dashboard de Indicadores
          </h4>
          <p class="text-grey-8 q-mt-sm q-mb-none" style="font-weight: 400">
            Visualización y análisis del cumplimiento de SLAs de contratación para áreas
            tecnológicas
          </p>
        </div>
        <div class="col-auto">
          <q-btn
            outline
            color="black"
            icon="refresh"
            label="Actualizar"
            @click="refreshData"
            :loading="loading"
            style="border-width: 2px"
          />
        </div>
      </div>

      <!-- Filtros -->
      <q-card class="q-mb-lg tata-card">
        <q-card-section>
          <div class="row q-col-gutter-md items-end">
            <div class="col-12 col-md-2">
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

            <div class="col-12 col-md-2">
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

            <div class="col-12 col-md-2">
              <q-select
                v-model="localFilters.bloqueTech"
                filled
                label="BLOQUE TECH"
                :options="bloquesOptions"
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

            <div class="col-12 col-md-2">
              <q-select
                v-model="localFilters.tipoSolicitud"
                filled
                label="Tipo Solicitud"
                :options="tipoSolicitudOptions"
                clearable
                emit-value
                map-options
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="assignment" color="black" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-2">
              <q-select
                v-model="localFilters.prioridad"
                filled
                label="Prioridad"
                :options="prioridadOptions"
                clearable
                emit-value
                map-options
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="priority_high" color="black" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-2">
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

      <!-- KPIs -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-3">
          <KpiCard
            title="Cumplimiento SLA1"
            :value="kpiSla1"
            subtitle="Nuevo Personal (35 días)"
            description="Porcentaje de solicitudes que cumplen el SLA1"
            icon="trending_up"
            icon-color="grey-7"
            :threshold="80"
          />
        </div>

        <div class="col-12 col-md-3">
          <KpiCard
            title="Cumplimiento SLA2"
            :value="kpiSla2"
            subtitle="Reemplazo (20 días)"
            description="Porcentaje de solicitudes que cumplen el SLA2"
            icon="swap_horiz"
            icon-color="grey-8"
            :threshold="80"
          />
        </div>

        <div class="col-12 col-md-3">
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

        <div class="col-12 col-md-3">
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
        <div class="col-12 col-md-6">
          <SlaChart :data="chartDataByRole" :loading="loading" title="Cumplimiento SLA por Rol" />
        </div>
        <div class="col-12 col-md-6">
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
const { loading, kpiSla1, kpiSla2, kpiEficacia, chartDataByRole } = storeToRefs(slaStore)

const localFilters = ref({
  startDate: null,
  endDate: null,
  bloqueTech: null,
  tipoSolicitud: null,
  prioridad: null,
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
  return filteredSlaData.value.length
})

const chartDataByPriority = computed(() => {
  const priorities = ['Crítica', 'Alta', 'Media', 'Baja']
  const priorityData = []

  priorities.forEach((prioridad) => {
    const solicitudesPrioridad = filteredSlaData.value.filter(
      (item) => item.prioridad === prioridad,
    )
    const total = solicitudesPrioridad.length

    if (total > 0) {
      const cumplidas = solicitudesPrioridad.filter((item) => {
        if (item.tipo_solicitud === 'Nuevo Personal') {
          return item.cumple_sla1 === true
        } else if (item.tipo_solicitud === 'Reemplazo') {
          return item.cumple_sla2 === true
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

onMounted(() => {
  slaStore.fetchSlaData()
})

function applyFilters() {
  slaStore.setFilters({
    startDate: localFilters.value.startDate,
    endDate: localFilters.value.endDate,
    bloqueTech: localFilters.value.bloqueTech,
    tipoSolicitud: localFilters.value.tipoSolicitud,
    prioridad: localFilters.value.prioridad,
    cumpleSla: localFilters.value.cumpleSla,
  })
}

function resetFilters() {
  localFilters.value = {
    startDate: null,
    endDate: null,
    bloqueTech: null,
    tipoSolicitud: null,
    prioridad: null,
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
</style>
