<template>
  <q-page class="notifications-page" style="background-color: #fafafa">
    <div class="q-pa-md">
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="text-h4 q-my-none text-weight-bold text-black">
            <q-icon name="notifications" class="q-mr-sm" />
            Notificaciones
          </h4>
          <p class="text-grey-8 q-mt-sm q-mb-none" style="font-weight: 400">
            Alertas inteligentes para mejorar el cumplimiento de SLAs
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
        <div class="col-12 col-md-8">
          <template v-if="primaryView === 'incumplimiento'">
            <q-card class="tata-card q-mb-md">
              <q-card-section class="bg-negative text-white">
                <div class="text-h6 text-weight-bold">
                  <q-icon name="error" class="q-mr-sm" />
                  Incumplimiento De SLA
                  <q-badge color="white" text-color="negative" class="q-ml-sm">
                    {{ criticalAlerts.length }}
                  </q-badge>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section v-if="criticalAlerts.length === 0" class="text-center q-pa-lg">
                <q-icon name="check_circle" size="64px" color="positive" class="q-mb-md" />
                <div class="text-h6 text-grey-7">No hay Incumplimiento De SLA</div>
              </q-card-section>

              <q-list v-else separator>
                <q-item
                  v-for="alert in criticalAlerts"
                  :key="alert.id"
                  clickable
                  v-ripple
                  class="q-py-md"
                  @click="viewAlertDetails(alert)"
                >
                  <q-item-section avatar top>
                    <q-avatar
                      color="red-1"
                      text-color="negative"
                      icon="cancel"
                      font-size="24px"
                      size="40px"
                    />
                  </q-item-section>

                  <q-item-section>
                    <div class="row items-center justify-between q-mb-xs">
                      <div class="text-subtitle1 text-weight-bold text-negative">
                        {{ alert.title }}
                      </div>
                      <q-badge
                        rounded
                        color="negative"
                        :label="`${alert.daysOverdue} días`"
                        class="q-py-xs q-px-sm text-caption text-weight-bold"
                      />
                    </div>

                    <div class="column q-gutter-y-xs q-mb-sm">
                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="person" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Rol:</span> {{ alert.role }}
                      </div>
                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="event" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Fecha solicitud:</span>
                        {{ alert.requestDate }}
                      </div>
                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="schedule" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Límite:</span> {{ alert.limit }}
                      </div>
                    </div>

                    <q-item-label caption class="text-grey-6">
                      {{ alert.description }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side top>
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

            <q-card class="tata-card">
              <q-card-section class="bg-warning text-white">
                <div class="text-h6 text-weight-bold">
                  <q-icon name="warning" class="q-mr-sm" />
                  Riesgo
                  <q-badge color="white" text-color="warning" class="q-ml-sm">
                    {{ warnings.length }}
                  </q-badge>
                </div>
              </q-card-section>

              <q-separator />

              <q-list separator>
                <q-item
                  v-for="warning in warnings"
                  :key="warning.id"
                  clickable
                  v-ripple
                  class="q-py-md"
                >
                  <q-item-section avatar top>
                    <q-avatar
                      color="orange-1"
                      text-color="warning"
                      :icon="warning.icon"
                      font-size="24px"
                      size="40px"
                    />
                  </q-item-section>

                  <q-item-section>
                    <div class="row items-center justify-between q-mb-xs">
                      <div class="text-subtitle1 text-weight-bold text-warning-9">
                        {{ warning.title }}
                      </div>

                      <q-badge
                        rounded
                        :color="warning.daysRemaining <= 2 ? 'deep-orange' : 'warning'"
                        text-color="white"
                        class="q-py-xs q-px-sm text-caption text-weight-bold"
                      >
                        <q-icon name="timer" class="q-mr-xs" />
                        -{{ warning.daysRemaining }} días
                      </q-badge>
                    </div>

                    <div class="column q-gutter-y-xs q-mb-sm">
                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="person" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Rol:</span> {{ warning.role }}
                      </div>

                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="event_available" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Fecha solicitud:</span>
                        {{ warning.requestDate }}
                      </div>

                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="timelapse" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Límite de días:</span>
                        {{ warning.limit }}
                      </div>

                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="hourglass_empty" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Días restantes:</span>
                        <span
                          :class="
                            warning.daysRemaining <= 2 ? 'text-negative text-weight-bold' : ''
                          "
                        >
                          {{ warning.daysRemaining }} días
                        </span>
                      </div>
                    </div>

                    <q-item-label caption class="text-grey-7">
                      {{ warning.description }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </template>

          <template v-else>
            <q-card class="tata-card q-mb-md">
              <q-card-section class="bg-warning text-white">
                <div class="text-h6 text-weight-bold">
                  <q-icon name="warning" class="q-mr-sm" />
                  Riesgo
                  <q-badge color="white" text-color="warning" class="q-ml-sm">
                    {{ warnings.length }}
                  </q-badge>
                </div>
              </q-card-section>

              <q-separator />

              <q-list separator>
                <q-item
                  v-for="warning in warnings"
                  :key="warning.id"
                  clickable
                  v-ripple
                  class="q-py-md"
                >
                  <q-item-section avatar top>
                    <q-avatar
                      color="orange-1"
                      text-color="warning"
                      :icon="warning.icon"
                      font-size="24px"
                      size="40px"
                    />
                  </q-item-section>

                  <q-item-section>
                    <div class="row items-center justify-between q-mb-xs">
                      <div class="text-subtitle1 text-weight-bold text-warning-9">
                        {{ warning.title }}
                      </div>

                      <q-badge
                        rounded
                        :color="warning.daysRemaining <= 2 ? 'deep-orange' : 'warning'"
                        text-color="white"
                        class="q-py-xs q-px-sm text-caption text-weight-bold"
                      >
                        <q-icon name="timer" class="q-mr-xs" />
                        -{{ warning.daysRemaining }} días
                      </q-badge>
                    </div>

                    <div class="column q-gutter-y-xs q-mb-sm">
                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="person" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Rol:</span> {{ warning.role }}
                      </div>

                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="event_available" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Fecha solicitud:</span>
                        {{ warning.requestDate }}
                      </div>

                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="timelapse" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Límite de días:</span>
                        {{ warning.limit }}
                      </div>

                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="hourglass_empty" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Días restantes:</span>
                        <span
                          :class="
                            warning.daysRemaining <= 2 ? 'text-negative text-weight-bold' : ''
                          "
                        >
                          {{ warning.daysRemaining }} días
                        </span>
                      </div>
                    </div>

                    <q-item-label caption class="text-grey-7">
                      {{ warning.description }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>

            <q-card class="tata-card q-mb-md">
              <q-card-section class="bg-negative text-white">
                <div class="text-h6 text-weight-bold">
                  <q-icon name="error" class="q-mr-sm" />
                  Incumplimiento De SLA
                  <q-badge color="white" text-color="negative" class="q-ml-sm">
                    {{ criticalAlerts.length }}
                  </q-badge>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section v-if="criticalAlerts.length === 0" class="text-center q-pa-lg">
                <q-icon name="check_circle" size="64px" color="positive" class="q-mb-md" />
                <div class="text-h6 text-grey-7">No hay Incumplimiento De SLA</div>
              </q-card-section>

              <q-list v-else separator>
                <q-item
                  v-for="alert in criticalAlerts"
                  :key="alert.id"
                  clickable
                  v-ripple
                  class="q-py-md"
                  @click="viewAlertDetails(alert)"
                >
                  <q-item-section avatar top>
                    <q-avatar
                      color="red-1"
                      text-color="negative"
                      icon="cancel"
                      font-size="24px"
                      size="40px"
                    />
                  </q-item-section>

                  <q-item-section>
                    <div class="row items-center justify-between q-mb-xs">
                      <div class="text-subtitle1 text-weight-bold text-negative">
                        {{ alert.title }}
                      </div>
                      <q-badge
                        rounded
                        color="negative"
                        :label="`${alert.daysOverdue} días`"
                        class="q-py-xs q-px-sm text-caption text-weight-bold"
                      />
                    </div>

                    <div class="column q-gutter-y-xs q-mb-sm">
                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="person" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Rol:</span> {{ alert.role }}
                      </div>
                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="event" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Fecha solicitud:</span>
                        {{ alert.requestDate }}
                      </div>
                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="schedule" size="16px" class="q-mr-xs text-grey-6" />
                        <span class="text-weight-bold q-mr-xs">Límite:</span> {{ alert.limit }}
                      </div>
                    </div>

                    <q-item-label caption class="text-grey-6">
                      {{ alert.description }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side top>
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
          </template>
        </div>

        <div class="col-12 col-md-4">
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
                <div
                  class="row items-center justify-between q-mb-sm summary-row"
                  @click="primaryView = 'incumplimiento'"
                  :class="{ active: primaryView === 'incumplimiento' }"
                >
                  <span class="text-body2 text-grey-8">Incumplimiento De SLA</span>
                  <span class="text-h6 text-weight-bold text-negative">{{
                    criticalAlerts.length
                  }}</span>
                </div>
                <q-linear-progress :value="criticalAlerts.length / 10" color="negative" />
              </div>

              <div class="q-mb-lg">
                <div
                  class="row items-center justify-between q-mb-sm summary-row"
                  @click="primaryView = 'riesgo'"
                  :class="{ active: primaryView === 'riesgo' }"
                >
                  <span class="text-body2 text-grey-8">Riesgo</span>
                  <span class="text-h6 text-weight-bold text-warning">{{ warnings.length }}</span>
                </div>
                <q-linear-progress :value="warnings.length / 10" color="warning" />
              </div>

              <q-separator class="q-my-md" />

              <div class="text-center">
                <div class="text-caption text-grey-7">Última actualización</div>
                <div class="text-body2 text-weight-medium text-black">{{ lastUpdate }}</div>
              </div>
            </q-card-section>
          </q-card>

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
                class="full-width q-mb-sm"
                style="border-width: 2px"
                @click="$router.push('/reports')"
              />

              <q-btn
                outline
                color="black"
                icon="send"
                label="Notificar"
                class="full-width"
                style="border-width: 2px"
                @click="triggerNotificationAction"
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

// INCUMPLIMIENTO (Sin cambios)
const criticalAlerts = ref([
  {
    id: 1,
    title: 'Incumplimiento de SLA1',
    role: 'Product Owner',
    requestDate: '2025-07-23',
    limit: '35 días',
    daysOverdue: 108,
    description: 'Incumplimiento de SLA1 para Product Owner: 108 días acumulados de retraso.',
    icon: 'error',
    color: 'negative',
  },
  {
    id: 2,
    title: 'Incumplimiento de SLA2',
    role: 'Analista de Datos',
    requestDate: '2025-07-19',
    limit: '20 días',
    daysOverdue: 112,
    description: 'Incumplimiento de SLA2 para Analista de Datos: 112 días acumulados de retraso.',
    icon: 'error',
    color: 'negative',
  },
])

// RIESGO (DATOS ACTUALIZADOS: SLA3, SLA4, SLA5)
const warnings = ref([
  {
    id: 1,
    title: 'Riesgo SLA3',
    role: 'Product Owner',
    requestDate: '2025-11-14',
    limit: '15 días',
    daysRemaining: 2, // Crítico (< 5)
    description: 'La definición de criterios de aceptación para el Sprint 45 está incompleta.',
    icon: 'trending_down',
    severity: 'high',
  },
  {
    id: 2,
    title: 'Riesgo SLA4',
    role: 'DevOps Engineer',
    requestDate: '2025-11-18',
    limit: '7 días',
    daysRemaining: 3,
    description: 'El despliegue automatizado a QA presenta latencia superior a lo esperado.',
    icon: 'dns',
    severity: 'medium',
  },
  {
    id: 3,
    title: 'Riesgo SLA5',
    role: 'UX/UI Designer',
    requestDate: '2025-11-12',
    limit: '12 días',
    daysRemaining: 4,
    description: 'La validación de prototipos de alta fidelidad no ha sido firmada por el cliente.',
    icon: 'design_services',
    severity: 'medium',
  },
])

// SE ELIMINÓ LA VARIABLE 'settings' YA QUE NO SE USA

const lastUpdate = computed(() => {
  const now = new Date()
  return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
})

// Orden principal de visualización .
const primaryView = ref('incumplimiento')

function dismissAlert(id) {
  const index = criticalAlerts.value.findIndex((alert) => alert.id === id)
  if (index !== -1) {
    criticalAlerts.value.splice(index, 1)
    $q.notify({
      type: 'info',
      message: 'Notificación descartada',
      position: 'top',
    })
  }
}

function markAllAsRead() {
  criticalAlerts.value = []
  $q.notify({
    type: 'positive',
    message: 'Todas las notificaciones marcadas como leídas',
    position: 'top',
    icon: 'check_circle',
  })
}

function viewAlertDetails(alert) {
  $q.dialog({
    title: alert.title,
    message: `
        <div>
            <strong>Rol:</strong> ${alert.role}<br>
            <strong>Fecha:</strong> ${alert.requestDate}<br>
            <strong>Retraso:</strong> ${alert.daysOverdue} días<br><br>
            ${alert.description}
        </div>
    `,
    html: true,
    ok: {
      label: 'Entendido',
      color: 'black',
      flat: true,
    },
  })
}

// SE ELIMINÓ LA FUNCIÓN 'saveSettings'

// NUEVA FUNCIÓN PARA EL BOTÓN "NOTIFICAR"
function triggerNotificationAction() {
  $q.notify({
    type: 'info',
    message: 'Acción de notificar iniciada...',
    position: 'top',
    icon: 'send',
  })
  // Aquí iría la lógica real para abrir un modal de notificación o enviar una alerta
}
</script>

<style scoped lang="scss">
.notifications-page {
  background-color: #f5f5f5;
}

.summary-row {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
}

.summary-row.active {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
