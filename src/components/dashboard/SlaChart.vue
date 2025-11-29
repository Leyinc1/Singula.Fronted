<template>
  <q-card class="sla-chart-card">
    <q-card-section>
      <div class="text-h6">{{ title }}</div>
      <div class="text-caption text-grey-7">{{ subtitle }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner color="primary" size="50px" />
      </div>

      <div
        v-else-if="!chartData || chartData.labels.length === 0"
        class="row justify-center q-pa-xl"
      >
        <div class="text-center text-grey-6">
          <q-icon name="info" size="48px" class="q-mb-md" />
          <div>No hay datos disponibles para mostrar</div>
        </div>
      </div>

      <div v-else class="chart-container">
        <Bar :data="chartData" :options="chartOptions" :height="chartHeight" />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="row justify-center q-gutter-md flex-wrap">
      <div
        v-for="(dataset, index) in chartData.datasets"
        :key="index"
        class="legend-item"
      >
        <span
          class="legend-color"
          :style="{ backgroundColor: dataset.backgroundColor }"
        ></span>
        <span class="text-caption">{{ dataset.label }}</span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Cumplimiento SLA por Rol',
  },
  subtitle: {
    type: String,
    default: 'Porcentaje de cumplimiento por tipo de SLA',
  },
  chartHeight: {
    type: Number,
    default: 300,
  },
})

// Paleta de colores para tipos de solicitud
const colorPalette = [
  { bg: '#42a5f5', border: '#1976d2' }, // Azul
  { bg: '#66bb6a', border: '#388e3c' }, // Verde
  { bg: '#ffa726', border: '#f57c00' }, // Naranja
  { bg: '#ab47bc', border: '#7b1fa2' }, // Púrpura
  { bg: '#ef5350', border: '#c62828' }, // Rojo
  { bg: '#26c6da', border: '#00838f' }, // Cian
  { bg: '#ffca28', border: '#f9a825' }, // Amarillo
  { bg: '#8d6e63', border: '#5d4037' }, // Marrón
]

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: [],
    }
  }

  const labels = props.data.map((item) => item.role)

  // Identificar todos los tipos de solicitud presentes en los datos
  const tiposSet = new Set()
  props.data.forEach(item => {
    Object.keys(item).forEach(key => {
      // Excluir solo el campo 'role' - el resto son tipos de solicitud
      if (key !== 'role' && item[key] !== undefined) {
        tiposSet.add(key)
      }
    })
  })

  const tipos = Array.from(tiposSet)

  // Crear un dataset por cada tipo de solicitud
  const datasets = tipos.map((tipo, index) => {
    const colorIndex = index % colorPalette.length
    const colors = colorPalette[colorIndex]

    return {
      label: tipo,
      data: props.data.map(item => parseFloat(item[tipo] || 0)),
      backgroundColor: colors.bg,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 4,
    }
  })

  return {
    labels,
    datasets,
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Usamos nuestra propia leyenda personalizada
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          label += context.parsed.y.toFixed(2) + '%'
          return label
        },
      },
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: function (value) {
          return value + '%'
        },
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
}))
</script>

<style scoped lang="scss">
.sla-chart-card {
  min-height: 400px;
}

.chart-container {
  position: relative;
  width: 100%;
  min-height: 300px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  display: inline-block;
}
</style>
