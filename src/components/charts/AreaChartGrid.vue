<template>
  <div class="area-chart-grid">
    <!-- Si no hay filtro de área, mostrar todos los gráficos -->
    <div v-if="!selectedArea" class="row q-col-gutter-md">
      <div v-for="(data, area) in chartsDataByArea" :key="area" class="col-12 col-md-6">
        <q-card class="tata-card">
          <q-card-section
            :style="{
              background: `linear-gradient(to right, ${getAreaColor(area)}, #2c2c2c)`,
              color: 'white',
            }"
          >
            <div class="row items-center">
              <q-icon :name="getAreaIcon(area)" size="sm" class="q-mr-sm" />
              <div class="text-h6">{{ area }}</div>
              <q-space />
              <q-chip dense color="white" text-color="black" size="sm">
                {{ data.total }} solicitudes
              </q-chip>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <!-- Mini KPIs por área -->
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <div class="text-caption text-grey-7">Cumplimiento SLA</div>
                <div class="text-h6 text-black">{{ data.cumplimiento }}%</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-7">Promedio días</div>
                <div class="text-h6 text-black">{{ data.promedioDias }}</div>
              </div>
            </div>

            <!-- Mini gráfico por área -->
            <SlaChart :chart-data="data.chartData" :height="150" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Si hay filtro de área, mostrar solo ese gráfico -->
    <div v-else>
      <q-card class="tata-card">
        <q-card-section
          :style="{
            background: `linear-gradient(to right, ${getAreaColor(selectedArea)}, #2c2c2c)`,
            color: 'white',
          }"
        >
          <div class="row items-center">
            <q-icon :name="getAreaIcon(selectedArea)" size="md" class="q-mr-sm" />
            <div class="text-h5">{{ selectedArea }}</div>
            <q-space />
            <q-chip dense color="white" text-color="black">
              {{ chartsDataByArea[selectedArea]?.total || 0 }} solicitudes
            </q-chip>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <!-- KPIs completos por área -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-4">
              <div class="text-caption text-grey-7">Cumplimiento SLA</div>
              <div class="text-h5 text-black">
                {{ chartsDataByArea[selectedArea]?.cumplimiento }}%
              </div>
            </div>
            <div class="col-4">
              <div class="text-caption text-grey-7">Promedio días</div>
              <div class="text-h5 text-black">
                {{ chartsDataByArea[selectedArea]?.promedioDias }}
              </div>
            </div>
            <div class="col-4">
              <div class="text-caption text-grey-7">En proceso</div>
              <div class="text-h5 text-black">{{ chartsDataByArea[selectedArea]?.enProceso }}</div>
            </div>
          </div>

          <!-- Gráfico completo -->
          <SlaChart :chart-data="chartsDataByArea[selectedArea]?.chartData" :height="300" />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useConfigStore } from 'src/stores/configStore'
import SlaChart from 'src/components/dashboard/SlaChart.vue'

const props = defineProps({
  slaData: {
    type: Array,
    default: () => [],
  },
  selectedArea: {
    type: String,
    default: null,
  },
})

const configStore = useConfigStore()

// Agrupar datos por área
const chartsDataByArea = computed(() => {
  const grouped = {}

  // Validar que slaData exista y sea un array
  if (!props.slaData || !Array.isArray(props.slaData)) {
    return grouped
  }

  // Obtener todas las áreas activas
  const areas = configStore.bloquesActivos.map((b) => b.nombre)

  areas.forEach((area) => {
    // Filtrar datos por área
    const dataArea = props.slaData.filter((item) => item.area === area)

    if (dataArea.length === 0) {
      grouped[area] = {
        total: 0,
        cumplimiento: 0,
        promedioDias: 0,
        enProceso: 0,
        chartData: {
          labels: [],
          datasets: [],
        },
      }
      return
    }

    // Calcular métricas
    const total = dataArea.length
    const cumplidas = dataArea.filter(
      (d) => d.cumple_sla1 === true || d.cumple_sla2 === true,
    ).length
    const cumplimiento = ((cumplidas / total) * 100).toFixed(1)
    const promedioDias = (
      dataArea.reduce((sum, d) => sum + d.dias_transcurridos, 0) / total
    ).toFixed(1)
    const enProceso = dataArea.filter((d) => d.dias_transcurridos > 0).length

    // Preparar datos para gráfico
    const labels = dataArea.map((d) => d.fecha_solicitud)
    const dias = dataArea.map((d) => d.dias_transcurridos)

    grouped[area] = {
      total,
      cumplimiento,
      promedioDias,
      enProceso,
      chartData: {
        labels,
        datasets: [
          {
            label: 'Días transcurridos',
            data: dias,
            backgroundColor: getAreaColor(area),
            borderColor: getAreaColor(area),
            borderWidth: 2,
            fill: false,
          },
        ],
      },
    }
  })

  return grouped
})

function getAreaColor(areaName) {
  const bloque = configStore.getBloqueByNombre(areaName)
  return bloque?.color || '#000000'
}

function getAreaIcon(areaName) {
  const bloque = configStore.getBloqueByNombre(areaName)
  return bloque?.icon || 'business'
}
</script>

<style scoped lang="scss">
.area-chart-grid {
  width: 100%;
}
</style>
