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

    <q-card-section class="row justify-center">
      <div class="legend-item q-mr-lg">
        <span class="legend-color" style="background-color: #42a5f5"></span>
        <span class="text-caption">SLA1 (Nuevo Personal - 35 días)</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #66bb6a"></span>
        <span class="text-caption">SLA2 (Reemplazo - 20 días)</span>
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
    default: 'Porcentaje de cumplimiento por tipo de solicitud',
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

  const labels = props.data.map((item) => item.role)
  const sla1Data = props.data.map((item) => parseFloat(item.sla1Percentage))
  const sla2Data = props.data.map((item) => parseFloat(item.sla2Percentage))

  return {
    labels,
    datasets: [
      {
        label: 'SLA1 (Nuevo Personal)',
        data: sla1Data,
        backgroundColor: '#42a5f5',
        borderColor: '#1976d2',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'SLA2 (Reemplazo)',
        data: sla2Data,
        backgroundColor: '#66bb6a',
        borderColor: '#388e3c',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
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
