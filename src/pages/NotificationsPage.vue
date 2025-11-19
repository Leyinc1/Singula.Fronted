<template>
  <q-page class="notifications-page" style="background-color: #fafafa">
    <div class="q-pa-md">
      <!-- Encabezado -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="text-h4 q-my-none text-weight-bold text-black">
            <q-icon name="notifications" class="q-mr-sm" />
            Notificaciones y Recomendaciones
          </h4>
          <p class="text-grey-8 q-mt-sm q-mb-none" style="font-weight: 400">
            Alertas inteligentes y recomendaciones para mejorar el cumplimiento de SLAs
          </p>
        </div>
        <div class="col-auto">
          <q-btn
            outline
            color="black"
            icon="mark_email_read"
            label="Marcar Todo como Leído"
            @click="markAllAsRead"
            style="border-width: 2px"
          />
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <!-- Columna Izquierda: Alertas Críticas y Recomendaciones -->
        <div class="col-12 col-md-8">
          <!-- Alertas Críticas -->
          <q-card class="tata-card q-mb-md">
            <q-card-section class="bg-negative text-white">
              <div class="text-h6 text-weight-bold">
                <q-icon name="error" class="q-mr-sm" />
                Alertas Críticas
                <q-badge color="white" text-color="negative" class="q-ml-sm">
                  {{ criticalAlerts.length }}
                </q-badge>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section v-if="criticalAlerts.length === 0" class="text-center q-pa-lg">
              <q-icon name="check_circle" size="64px" color="positive" class="q-mb-md" />
              <div class="text-h6 text-grey-7">No hay alertas críticas</div>
              <div class="text-caption text-grey-6">
                Todos los indicadores están dentro del rango aceptable
              </div>
            </q-card-section>

            <q-list v-else separator>
              <q-item
                v-for="alert in criticalAlerts"
                :key="alert.id"
                clickable
                v-ripple
                @click="viewAlertDetails(alert)"
              >
                <q-item-section avatar>
                  <q-avatar :color="alert.color" text-color="white" :icon="alert.icon" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ alert.title }}</q-item-label>
                  <q-item-label caption class="text-grey-8">
                    {{ alert.description }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6 q-mt-xs">
                    <q-icon name="access_time" size="xs" />
                    {{ alert.time }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    color="grey-7"
                    @click.stop="dismissAlert(alert.id)"
                  >
                    <q-tooltip>Descartar</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>

          <!-- Recomendaciones Inteligentes -->
          <q-card class="tata-card q-mb-md">
            <q-card-section class="bg-black text-white">
              <div class="text-h6 text-weight-bold">
                <q-icon name="auto_awesome" class="q-mr-sm" />
                Recomendaciones Inteligentes
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-timeline color="black">
                <q-timeline-entry
                  v-for="recommendation in recommendations"
                  :key="recommendation.id"
                  :title="recommendation.title"
                  :subtitle="recommendation.subtitle"
                  :icon="recommendation.icon"
                >
                  <div class="text-body2 q-mb-md">
                    {{ recommendation.description }}
                  </div>

                  <div class="row q-gutter-sm">
                    <q-chip
                      v-for="tag in recommendation.tags"
                      :key="tag"
                      dense
                      outline
                      color="black"
                      size="sm"
                    >
                      {{ tag }}
                    </q-chip>
                  </div>

                  <q-separator class="q-my-md" />

                  <div class="row q-gutter-sm">
                    <q-btn
                      flat
                      dense
                      color="black"
                      icon="info"
                      label="Más información"
                      size="sm"
                      @click="showRecommendationDetails(recommendation)"
                    />
                    <q-btn
                      flat
                      dense
                      color="positive"
                      icon="check"
                      label="Aplicar"
                      size="sm"
                      @click="applyRecommendation(recommendation)"
                    />
                  </div>
                </q-timeline-entry>
              </q-timeline>
            </q-card-section>
          </q-card>

          <!-- Advertencias -->
          <q-card class="tata-card">
            <q-card-section class="bg-warning text-white">
              <div class="text-h6 text-weight-bold">
                <q-icon name="warning" class="q-mr-sm" />
                Advertencias
                <q-badge color="white" text-color="warning" class="q-ml-sm">
                  {{ warnings.length }}
                </q-badge>
              </div>
            </q-card-section>

            <q-separator />

            <q-list separator>
              <q-item v-for="warning in warnings" :key="warning.id" clickable v-ripple>
                <q-item-section avatar>
                  <q-icon :name="warning.icon" color="warning" size="md" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ warning.title }}</q-item-label>
                  <q-item-label caption class="text-grey-8">
                    {{ warning.description }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-badge
                    :color="warning.severity === 'high' ? 'warning' : 'grey-6'"
                    text-color="white"
                  >
                    {{ warning.severity === 'high' ? 'Alta' : 'Media' }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <!-- Columna Derecha: Resumen y Configuración -->
        <div class="col-12 col-md-4">
          <!-- Resumen de Notificaciones -->
          <q-card class="tata-card q-mb-md">
            <q-card-section class="bg-black text-white">
              <div class="text-h6 text-weight-bold">
                <q-icon name="bar_chart" class="q-mr-sm" />
                Resumen
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="q-mb-lg">
                <div class="row items-center justify-between q-mb-sm">
                  <span class="text-body2 text-grey-8">Críticas</span>
                  <span class="text-h6 text-weight-bold text-negative">{{
                    criticalAlerts.length
                  }}</span>
                </div>
                <q-linear-progress :value="criticalAlerts.length / 10" color="negative" />
              </div>

              <div class="q-mb-lg">
                <div class="row items-center justify-between q-mb-sm">
                  <span class="text-body2 text-grey-8">Advertencias</span>
                  <span class="text-h6 text-weight-bold text-warning">{{ warnings.length }}</span>
                </div>
                <q-linear-progress :value="warnings.length / 10" color="warning" />
              </div>

              <div class="q-mb-lg">
                <div class="row items-center justify-between q-mb-sm">
                  <span class="text-body2 text-grey-8">Recomendaciones</span>
                  <span class="text-h6 text-weight-bold text-black">{{
                    recommendations.length
                  }}</span>
                </div>
                <q-linear-progress :value="recommendations.length / 10" color="black" />
              </div>

              <q-separator class="q-my-md" />

              <div class="text-center">
                <div class="text-caption text-grey-7">Última actualización</div>
                <div class="text-body2 text-weight-medium text-black">{{ lastUpdate }}</div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Configuración de Notificaciones -->
          <q-card class="tata-card q-mb-md">
            <q-card-section class="bg-black text-white">
              <div class="text-h6 text-weight-bold">
                <q-icon name="settings" class="q-mr-sm" />
                Configuración
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="text-subtitle2 text-weight-medium text-black q-mb-md">
                Preferencias de Alertas
              </div>

              <q-list>
                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>Notificaciones Email</q-item-label>
                    <q-item-label caption>Recibir alertas por correo</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="settings.emailNotifications" color="black" />
                  </q-item-section>
                </q-item>

                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>Alertas en Tiempo Real</q-item-label>
                    <q-item-label caption>Notificaciones push</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="settings.pushNotifications" color="black" />
                  </q-item-section>
                </q-item>

                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>Solo Críticas</q-item-label>
                    <q-item-label caption>Filtrar advertencias menores</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="settings.criticalOnly" color="black" />
                  </q-item-section>
                </q-item>
              </q-list>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 text-weight-medium text-black q-mb-md">
                Umbral de Alertas
              </div>

              <q-slider
                v-model="settings.threshold"
                :min="60"
                :max="95"
                :step="5"
                label
                label-always
                color="black"
                class="q-mb-md"
              />
              <div class="text-caption text-grey-7 text-center">
                Alertar cuando el SLA caiga por debajo del {{ settings.threshold }}%
              </div>

              <q-btn
                color="black"
                label="Guardar Configuración"
                icon="save"
                unelevated
                class="full-width q-mt-md"
                @click="saveSettings"
              />
            </q-card-section>
          </q-card>

          <!-- Acciones Rápidas -->
          <q-card class="tata-card">
            <q-card-section class="bg-black text-white">
              <div class="text-h6 text-weight-bold">
                <q-icon name="flash_on" class="q-mr-sm" />
                Acciones Rápidas
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-btn
                outline
                color="black"
                icon="analytics"
                label="Ver Dashboard"
                class="full-width q-mb-sm"
                style="border-width: 2px"
                @click="$router.push('/')"
              />

              <q-btn
                outline
                color="black"
                icon="psychology"
                label="Análisis Predictivo"
                class="full-width q-mb-sm"
                style="border-width: 2px"
                @click="$router.push('/predictive')"
              />

              <q-btn
                outline
                color="black"
                icon="assessment"
                label="Generar Reporte"
                class="full-width"
                style="border-width: 2px"
                @click="$router.push('/reports')"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const criticalAlerts = ref([
  {
    id: 1,
    title: 'SLA1 por debajo del umbral crítico',
    description:
      'El cumplimiento del SLA1 (Nuevo Personal) está en 76.2%, por debajo del objetivo del 80%',
    time: 'Hace 15 minutos',
    icon: 'error',
    color: 'negative',
  },
  {
    id: 2,
    title: 'Incremento en solicitudes de prioridad crítica',
    description:
      'Se detectó un aumento del 45% en solicitudes con prioridad crítica en las últimas 48 horas',
    time: 'Hace 1 hora',
    icon: 'priority_high',
    color: 'negative',
  },
])

const warnings = ref([
  {
    id: 1,
    title: 'Tendencia a la baja en SLA2',
    description: 'El SLA2 muestra una tendencia descendente en los últimos 7 días',
    icon: 'trending_down',
    severity: 'high',
  },
  {
    id: 2,
    title: 'Carga de trabajo desbalanceada',
    description: 'El equipo de Backend tiene 60% más solicitudes que otros equipos',
    icon: 'balance',
    severity: 'medium',
  },
  {
    id: 3,
    title: 'Retrasos en solicitudes antiguas',
    description: '8 solicitudes llevan más de 30 días sin resolución',
    icon: 'schedule',
    severity: 'high',
  },
])

const recommendations = ref([
  {
    id: 1,
    title: 'Optimizar proceso de reclutamiento',
    subtitle: 'Recomendación basada en análisis de datos',
    description:
      'Se recomienda reducir el tiempo de revisión de CVs en un 30% para mejorar el SLA1. Considera implementar filtros automáticos.',
    icon: 'lightbulb',
    tags: ['Eficiencia', 'Automatización', 'SLA1'],
  },
  {
    id: 2,
    title: 'Redistribuir carga de trabajo',
    subtitle: 'Acción sugerida',
    description:
      'Reasignar 15 solicitudes del equipo Backend a Frontend para balancear la carga y mejorar tiempos de respuesta.',
    icon: 'swap_horiz',
    tags: ['Balance', 'Recursos', 'Urgente'],
  },
  {
    id: 3,
    title: 'Priorizar solicitudes antiguas',
    subtitle: 'Mejora del servicio',
    description:
      'Crear un sprint dedicado para resolver las 8 solicitudes que exceden los 30 días de antigüedad.',
    icon: 'flag',
    tags: ['Deuda Técnica', 'SLA', 'Planificación'],
  },
])

const settings = ref({
  emailNotifications: true,
  pushNotifications: true,
  criticalOnly: false,
  threshold: 80,
})

const lastUpdate = computed(() => {
  const now = new Date()
  return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
})

function dismissAlert(id) {
  const index = criticalAlerts.value.findIndex((alert) => alert.id === id)
  if (index !== -1) {
    criticalAlerts.value.splice(index, 1)
    $q.notify({
      type: 'info',
      message: 'Alerta descartada',
      position: 'top',
    })
  }
}

function markAllAsRead() {
  criticalAlerts.value = []
  $q.notify({
    type: 'positive',
    message: 'Todas las alertas marcadas como leídas',
    position: 'top',
    icon: 'check_circle',
  })
}

function viewAlertDetails(alert) {
  $q.dialog({
    title: alert.title,
    message: alert.description,
    html: true,
    ok: {
      label: 'Entendido',
      color: 'black',
      flat: true,
    },
  })
}

function showRecommendationDetails(recommendation) {
  $q.dialog({
    title: recommendation.title,
    message: recommendation.description,
    html: true,
    ok: {
      label: 'Cerrar',
      color: 'black',
      flat: true,
    },
  })
}

function applyRecommendation(recommendation) {
  $q.notify({
    type: 'positive',
    message: 'Recomendación aplicada',
    caption: `La acción "${recommendation.title}" ha sido programada`,
    position: 'top',
    icon: 'check_circle',
  })
}

function saveSettings() {
  $q.notify({
    type: 'positive',
    message: 'Configuración guardada',
    caption: 'Tus preferencias han sido actualizadas',
    position: 'top',
    icon: 'save',
  })
}
</script>

<style scoped lang="scss">
.notifications-page {
  background-color: #f5f5f5;
}
</style>
