<template>
  <q-card class="priority-chart-card tata-card">
    <q-card-section style="background: linear-gradient(to right, #000000, #2c2c2c); color: white">
      <div class="text-h6">{{ title }}</div>
      <div class="text-caption" style="color: #e0e0e0">{{ subtitle }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner color="black" size="50px" />
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

    <q-card-section class="row justify-center q-gutter-sm">
      <div class="legend-item">
        <span class="legend-color" style="background-color: #c62828"></span>
        <span class="text-caption">Crítica</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #f57c00"></span>
        <span class="text-caption">Alta</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #fbc02d"></span>
        <span class="text-caption">Media</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #2e7d32"></span>
        <span class="text-caption">Baja</span>
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
    default: 'Cumplimiento SLA por Prioridad',
  },
  subtitle: {
    type: String,
    default: 'Porcentaje de cumplimiento según nivel de prioridad',
  },
  chartHeight: {
    type: Number,
    default: 300,
  },
})

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: [],
    }
  }

  const priorities = ['Crítica', 'Alta', 'Media', 'Baja']
  const colors = ['#c62828', '#f57c00', '#fbc02d', '#2e7d32']
  const borderColors = ['#b71c1c', '#e65100', '#f9a825', '#1b5e20']

  const labels = props.data.map((item) => item.prioridad)
  const cumplimientoData = props.data.map((item) => parseFloat(item.cumplimientoPercentage))
  const backgroundColors = labels.map((label) => colors[priorities.indexOf(label)] || '#757575')
  const borderColorsData = labels.map(
    (label) => borderColors[priorities.indexOf(label)] || '#616161',
  )

  return {
    labels,
    datasets: [
      {
        label: 'Cumplimiento SLA',
        data: cumplimientoData,
        backgroundColor: backgroundColors,
        borderColor: borderColorsData,
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return 'Cumplimiento: ' + context.parsed.y.toFixed(2) + '%'
        },
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#e0e0e0',
      borderWidth: 1,
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
        font: {
          size: 12,
        },
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.06)',
        drawBorder: false,
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 12,
          weight: 'bold',
        },
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
.priority-chart-card {
  min-height: 400px;
}

.chart-container {
  position: relative;
  width: 100%;
  min-height: 300px;
  padding: 16px 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
