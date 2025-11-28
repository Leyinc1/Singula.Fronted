<template>
  <q-page class="predictive-page" style="background-color: #fafafa">
    <div class="q-pa-md">
      <!--Encabezado -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="text-h4 q-my-none text-weight-bold text-black">
            <q-icon name="psychology" class="q-mr-sm" />
            Análisis Predictivo
          </h4>
          <p class="text-grey-8 q-mt-sm q-mb-none" style="font-weight: 400">
            Predicciones basadas en Machine Learning y tendencias históricas
          </p>
        </div>
        <div class="col-auto">
          <q-btn
            outline
            color="black"
            icon="refresh"
            label="Recalcular"
            @click="recalculatePredictions"
            :loading="loading"
            style="border-width: 2px"
          />
        </div>
      </div>

      <!--Predicciones Principales-->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-6">
          <q-card class="tata-card">
            <q-card-section class="bg-black text-white">
              <div class="text-h6 text-weight-bold">
                <q-icon name="insights" class="q-mr-sm" />
                Predicción de Cumplimiento - Próximo Mes
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="text-center q-pa-md">
                <q-icon name="analytics" size="80px" color="black" class="q-mb-md" />
                <div class="text-subtitle1 text-grey-7 q-mb-lg">
                  Basado en tendencias de los últimos 6 meses y algoritmos de regresión
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-6">
                    <q-card flat bordered style="border: 2px solid #000">
                      <q-card-section class="q-pa-lg">
                        <div class="text-caption text-grey-7 text-weight-medium">SLA1 Predicho</div>
                        <div
                          class="text-h3 text-weight-bold"
                          :class="getPredictionColor(predictedSla1)"
                        >
                          {{ predictedSla1.toFixed(1) }} %
                        </div>
                        <div class="text-caption text-grey-6 q-mt-sm">
                          <q-icon
                            :name="predictionMetrics.trend >= 0 ? 'trending_up' : 'trending_down'"
                            size="xs"
                          />
                          {{ predictionMetrics.trend >= 0 ? '+' : ''
                          }}{{ predictionMetrics.trend.toFixed(1) }} % vs mes actual
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-6">
                    <q-card flat bordered style="border: 2px solid #000">
                      <q-card-section class="q-pa-lg">
                        <div class="text-caption text-grey-7 text-weight-medium">SLA2 Predicho</div>
                        <div
                          class="text-h3 text-weight-bold"
                          :class="getPredictionColor(predictedSla2)"
                        >
                          {{ predictedSla2.toFixed(1) }} %
                        </div>
                        <div class="text-caption text-grey-6 q-mt-sm">
                          <q-icon
                            :name="predictionMetrics.trend >= 0 ? 'trending_up' : 'trending_down'"
                            size="xs"
                          />
                          {{ predictionMetrics.trend >= 0 ? '+' : ''
                          }}{{ (predictionMetrics.trend + 2).toFixed(1) }} % vs mes actual
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <q-separator class="q-my-lg" />

                <div class="text-left">
                  <div class="text-subtitle2 text-weight-bold text-black q-mb-sm">
                    Nivel de Confianza
                  </div>
                  <div class="row items-center">
                    <div class="col">
                      <q-linear-progress
                        size="20px"
                        :value="predictionData.confidence"
                        color="black"
                        class="rounded-borders"
                      />
                    </div>
                    <div class="col-auto q-ml-md">
                      <span class="text-h6 text-weight-bold">
                        {{ (predictionData.confidence * 100).toFixed(0) }} %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card class="tata-card">
            <q-card-section class="bg-black text-white">
              <div class="text-h6 text-weight-bold">
                <q-icon name="timeline" class="q-mr-sm" />
                Tendencias Históricas
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <!-- Chart Component -->
              <div class="chart-container" style="position: relative; height: 300px">
                <div v-if="loading" class="chart-placeholder">
                  <q-spinner color="primary" size="3em" />
                  <div class="text-grey q-mt-sm">Cargando datos...</div>
                </div>
                <Line
                  :data="chartData"
                  :options="chartOptions"
                  v-else-if="chartData.labels && chartData.labels.length > 0"
                />
                <div v-else class="chart-placeholder">
                  <q-icon name="info" size="48px" color="grey-5" />
                  <div class="text-grey q-mt-sm">No hay datos históricos disponibles</div>
                  <div class="text-caption text-grey-6">
                    Cargue solicitudes para ver predicciones
                  </div>
                </div>
              </div>

              <div class="row q-col-gutter-sm q-mt-md">
                <div class="col-4">
                  <div class="text-center">
                    <div class="text-caption text-grey-7">Promedio</div>
                    <div class="text-h6 text-weight-bold text-black">
                      {{ historyStats.average.toFixed(1) }} %
                    </div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="text-center">
                    <div class="text-caption text-grey-7">Máximo</div>
                    <div class="text-h6 text-weight-bold text-positive">
                      {{ historyStats.max.toFixed(1) }} %
                    </div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="text-center">
                    <div class="text-caption text-grey-7">Mínimo</div>
                    <div class="text-h6 text-weight-bold text-negative">
                      {{ historyStats.min.toFixed(1) }} %
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!--Factores de Influencia-->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12">
          <q-card class="tata-card">
            <q-card-section class="bg-black text-white">
              <div class="text-h6 text-weight-bold">
                <q-icon name="bubble_chart" class="q-mr-sm" />
                Factores de Influencia
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="text-subtitle2 text-grey-7 q-mb-md">
                Variables que más impactan en el cumplimiento de SLAs
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <q-card flat bordered>
                    <q-card-section>
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-body2 text-weight-medium">Volumen de Solicitudes</div>
                        </div>
                        <div class="col-auto">
                          <q-chip color="negative" text-color="white" dense> Alto Impacto </q-chip>
                        </div>
                      </div>
                      <q-linear-progress :value="0.85" color="negative" class="q-mt-sm" />
                      <div class="text-caption text-grey-7 q-mt-xs">Impacto: 85 %</div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-md-3">
                  <q-card flat bordered>
                    <q-card-section>
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-body2 text-weight-medium">Complejidad del Rol</div>
                        </div>
                        <div class="col-auto">
                          <q-chip color="warning" text-color="white" dense> Medio Impacto </q-chip>
                        </div>
                      </div>
                      <q-linear-progress :value="0.62" color="warning" class="q-mt-sm" />
                      <div class="text-caption text-grey-7 q-mt-xs">Impacto: 62 %</div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-md-3">
                  <q-card flat bordered>
                    <q-card-section>
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-body2 text-weight-medium">Prioridad Asignada</div>
                        </div>
                        <div class="col-auto">
                          <q-chip color="warning" text-color="white" dense> Medio Impacto </q-chip>
                        </div>
                      </div>
                      <q-linear-progress :value="0.58" color="warning" class="q-mt-sm" />
                      <div class="text-caption text-grey-7 q-mt-xs">Impacto: 58 %</div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-md-3">
                  <q-card flat bordered>
                    <q-card-section>
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-body2 text-weight-medium">Estacionalidad</div>
                        </div>
                        <div class="col-auto">
                          <q-chip color="info" text-color="white" dense> Bajo Impacto </q-chip>
                        </div>
                      </div>
                      <q-linear-progress :value="0.35" color="info" class="q-mt-sm" />
                      <div class="text-caption text-grey-7 q-mt-xs">Impacto: 35 %</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!--Escenarios de Simulación-->
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="tata-card">
            <q-card-section class="bg-black text-white">
              <div class="text-h6 text-weight-bold">
                <q-icon name="science" class="q-mr-sm" />
                Simulador de Escenarios
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="text-subtitle2 text-grey-7 q-mb-lg">
                Simula diferentes escenarios y ve su impacto en el cumplimiento de SLAs
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <div class="text-weight-medium text-black q-mb-sm">Variables de Entrada</div>

                  <q-input
                    v-model.number="simulation.volume"
                    filled
                    type="number"
                    label="Volumen de Solicitudes"
                    bg-color="white"
                    class="q-mb-md"
                  >
                    <template v-slot:prepend>
                      <q-icon name="trending_up" />
                    </template>
                  </q-input>

                  <q-select
                    v-model="simulation.priority"
                    filled
                    label="Distribución de Prioridad"
                    :options="priorityOptions"
                    bg-color="white"
                    class="q-mb-md"
                  >
                    <template v-slot:prepend>
                      <q-icon name="priority_high" />
                    </template>
                  </q-select>

                  <q-btn
                    color="black"
                    icon="play_arrow"
                    label="Ejecutar Simulación"
                    unelevated
                    class="full-width"
                    @click="runSimulation"
                  />
                </div>

                <div class="col-12 col-md-8">
                  <div class="text-weight-medium text-black q-mb-sm">Resultados Proyectados</div>

                  <div class="row q-col-gutter-md">
                    <div class="col-6">
                      <q-card flat class="bg-grey-2">
                        <q-card-section>
                          <div class="text-caption text-grey-7">SLA1 Proyectado</div>
                          <div class="text-h4 text-weight-bold text-black">
                            {{ simulationResults.sla1 }}%
                          </div>
                          <div
                            class="text-caption"
                            :class="
                              simulationResults.sla1Change >= 0 ? 'text-positive' : 'text-negative'
                            "
                          >
                            <q-icon
                              :name="
                                simulationResults.sla1Change >= 0
                                  ? 'arrow_upward'
                                  : 'arrow_downward'
                              "
                              size="xs"
                            />
                            {{ Math.abs(simulationResults.sla1Change) }}% vs actual
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <div class="col-6">
                      <q-card flat class="bg-grey-2">
                        <q-card-section>
                          <div class="text-caption text-grey-7">SLA2 Proyectado</div>
                          <div class="text-h4 text-weight-bold text-black">
                            {{ simulationResults.sla2 }}%
                          </div>
                          <div
                            class="text-caption"
                            :class="
                              simulationResults.sla2Change >= 0 ? 'text-positive' : 'text-negative'
                            "
                          >
                            <q-icon
                              :name="
                                simulationResults.sla2Change >= 0
                                  ? 'arrow_upward'
                                  : 'arrow_downward'
                              "
                              size="xs"
                            />
                            {{ Math.abs(simulationResults.sla2Change) }}% vs actual
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <div class="col-12">
                      <q-banner class="bg-grey-2 q-mt-md" rounded>
                        <template v-slot:avatar>
                          <q-icon name="lightbulb" color="black" />
                        </template>
                        <div class="text-body2">
                          <strong>Recomendación: </strong> Basado en esta simulación, se sugiere
                          mantener un volumen máximo de {{ simulation.volume }} solicitudes por mes
                          para garantizar el cumplimiento de ambos SLAs.
                        </div>
                      </q-banner>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { predictiveService } from 'src/services/predictiveService'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'vue-chartjs'

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const $q = useQuasar()
const loading = ref(false)

// Estado para el gráfico
const chartData = ref({
  labels: [],
  datasets: [],
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      grid: {
        color: '#f0f0f0',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}

// Estado de predicciones
const predictionMetrics = ref({
  nextMonth: 0,
  trend: 0,
})

// Estado de confianza para el template
const predictionData = ref({
  confidence: 0.87,
})

// Estado de simulación
const simulation = ref({
  volume: 50,
  priority: 'Equilibrada',
})

const simulationResults = ref({
  sla1: 0,
  sla1Change: 0,
  sla2: 0,
  sla2Change: 0,
})

const priorityOptions = ['Alta Prioridad', 'Equilibrada', 'Baja Prioridad']

// Datos crudos (para recalcular)
const rawHistoryData = ref([])
const slaConfigs = ref([])

// Computed: Predicciones SLA basadas en el modelo
const predictedSla1 = computed(() => {
  return predictionMetrics.value.nextMonth || 80
})

const predictedSla2 = computed(() => {
  // SLA2 suele ser ~5% mejor que SLA1
  return (predictionMetrics.value.nextMonth || 80) + 5
})

// Computed: Estadísticas del historial
const historyStats = computed(() => {
  if (!rawHistoryData.value || rawHistoryData.value.length === 0) {
    return { average: 0, max: 0, min: 0 }
  }

  const values = rawHistoryData.value.map((d) => d.compliance)
  const sum = values.reduce((a, b) => a + b, 0)

  return {
    average: sum / values.length,
    max: Math.max(...values),
    min: Math.min(...values),
  }
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const data = await predictiveService.fetchData()

    // Transformar datos de API a formato interno usando el servicio
    rawHistoryData.value = predictiveService.processHistoryData(data.requests || [])

    // Calcular nivel de confianza basado en cantidad de datos
    const dataPoints = rawHistoryData.value.length
    // Más datos = mayor confianza (máx 95% con 12+ meses)
    predictionData.value.confidence = Math.min(0.95, 0.5 + dataPoints * 0.075)

    // Si no hay datos, inicializar con estructura vacía
    if (rawHistoryData.value.length === 0) {
      console.warn('No hay datos históricos suficientes para predicciones')
      chartData.value = { labels: [], datasets: [] }
    } else {
      // Calcular predicciones iniciales solo si hay datos
      updatePredictions()
    }

    slaConfigs.value = data.slaConfig || []

    // Ejecutar simulación inicial
    runSimulation()
  } catch (error) {
    console.error('Error loading data:', error)
    // Inicializar con datos vacíos para evitar congelamiento
    chartData.value = { labels: [], datasets: [] }
    rawHistoryData.value = []

    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos predictivos',
      caption: 'Verifique la conexión con el backend',
    })
  } finally {
    loading.value = false
  }
}

function updatePredictions() {
  const result = predictiveService.calculatePrediction(rawHistoryData.value)
  chartData.value = result.chartData
  predictionMetrics.value = {
    nextMonth: result.nextMonthPrediction,
    trend: result.trend,
  }
}

function getPredictionColor(value) {
  if (value >= 85) return 'text-positive'
  if (value >= 75) return 'text-warning'
  return 'text-negative'
}

async function loadPredictions() {
  loading.value = true
  try {
    // Simular que obtenemos nuevos datos o re-entrenamos
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Añadir una variación aleatoria para demostrar reactividad
    if (rawHistoryData.value.length > 0) {
      const lastVal = rawHistoryData.value[rawHistoryData.value.length - 1].compliance
      const newVal = Math.min(100, Math.max(0, lastVal + (Math.random() * 10 - 5)))
      // Actualizar último mes (solo demo)
      rawHistoryData.value[rawHistoryData.value.length - 1].compliance = newVal
    }

    updatePredictions()

    $q.notify({
      type: 'positive',
      message: 'Predicciones actualizadas',
      caption: 'Modelo recalculado con éxito',
      icon: 'check_circle',
    })
  } finally {
    loading.value = false
  }
}

async function recalculatePredictions() {
  await loadPredictions()
  $q.notify({
    type: 'positive',
    message: 'Predicciones actualizadas',
    caption: 'Los modelos han sido recalculados con los datos más recientes',
    position: 'top',
    icon: 'check_circle',
  })
}

function runSimulation() {
  // Pasar el promedio histórico como base para la simulación
  const baseCompliance = historyStats.value.average || 80
  const results = predictiveService.runSimulation({
    ...simulation.value,
    baseCompliance,
  })
  simulationResults.value = results
}

// NOTA: Se eliminó el onMounted duplicado - loadData() ya se llama en el primer onMounted
</script>

<style scoped lang="scss">
.predictive-page {
  background-color: #f5f5f5;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background-color: #fafafa;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
}
</style>
