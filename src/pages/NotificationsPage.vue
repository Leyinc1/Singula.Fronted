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
            label="Marcar Incumplimientos Leídos"
            @click="markAllIncumplimientos"
            style="border-width: 2px"
            :disable="criticalAlerts.length === 0"
          >
            <q-tooltip>Limpia solo la lista roja</q-tooltip>
          </q-btn>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-8 column q-gutter-y-md">
          <div v-if="loading" class="row justify-center q-py-lg" style="order: 0">
            <q-spinner color="primary" size="3em" />
            <div class="text-grey q-ml-sm self-center">Cargando alertas...</div>
          </div>

          <div
            v-if="!loading && criticalAlerts.length === 0 && warnings.length === 0"
            class="text-center q-pa-xl full-width"
            style="order: 0"
          >
            <q-icon name="check_circle" size="80px" color="positive" />
            <div class="text-h5 q-mt-md text-grey-8">¡Todo al día!</div>
            <div class="text-grey-6">No tienes alertas pendientes.</div>
          </div>

          <div
            v-if="criticalAlerts.length > 0"
            :style="{ order: primaryView === 'incumplimiento' ? 1 : 2 }"
            class="transition-order"
          >
            <q-card class="tata-card">
              <q-card-section class="bg-negative text-white">
                <div class="text-h6 text-weight-bold">
                  <q-icon name="error" class="q-mr-sm" />
                  Incumplimiento de SLA
                  <q-badge color="white" text-color="negative" class="q-ml-sm">
                    {{ criticalAlerts.length }}
                  </q-badge>
                </div>
              </q-card-section>
              <q-separator />
              <q-list separator>
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
                        <q-icon name="person" size="16px" class="q-mr-xs text-grey-6" /><span
                          class="text-weight-bold q-mr-xs"
                          >Rol:</span
                        >
                        {{ alert.role }}
                      </div>
                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="event" size="16px" class="q-mr-xs text-grey-6" /><span
                          class="text-weight-bold q-mr-xs"
                          >Fecha solicitud:</span
                        >
                        {{ alert.requestDate }}
                      </div>
                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="event_note" size="16px" class="q-mr-xs text-grey-6" /><span
                          class="text-weight-bold q-mr-xs"
                          >Creación de SLA:</span
                        >
                        {{ alert.creationDateSla }}
                      </div>
                      <div class="row items-center text-grey-9 text-caption">
                        <q-icon name="schedule" size="16px" class="q-mr-xs text-grey-6" /><span
                          class="text-weight-bold q-mr-xs"
                          >Límite:</span
                        >
                        {{ alert.limit }}
                      </div>
                    </div>
                    <q-item-label caption class="text-grey-6">{{ alert.description }}</q-item-label>
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
                      <q-tooltip>Marcar como leído</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>

          <div
            v-if="warnings.length > 0"
            :style="{ order: primaryView === 'riesgo' ? 1 : 2 }"
            class="transition-order"
          >
            <q-card class="tata-card">
              <q-card-section class="text-white" style="background-color: #f57c00">
                <div class="text-h6 text-weight-bold">
                  <q-icon name="warning" class="q-mr-sm" />
                  Riesgo
                  <q-badge color="white" text-color="orange-9" class="q-ml-sm">
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
                  @click="viewAlertDetails(warning)"
                >
                  <q-item-section avatar top>
                    <q-avatar
                      color="orange-1"
                      text-color="orange-9"
                      icon="trending_down"
                      font-size="24px"
                      size="40px"
                    />
                  </q-item-section>
                  <q-item-section>
                    <div class="row items-start justify-between q-mb-sm">
                      <div class="text-subtitle1 text-weight-bold text-black col">
                        {{ warning.title }}
                      </div>
                      <div class="col-auto">
                        <q-badge
                          rounded
                          style="background-color: #ef6c00"
                          class="q-py-xs q-px-sm text-caption text-weight-bold text-white"
                        >
                          <q-icon name="schedule" class="q-mr-xs" /> -{{ warning.daysRemaining }}
                          días
                        </q-badge>
                      </div>
                    </div>
                    <div class="column q-gutter-y-xs q-mb-sm">
                      <div class="row items-center text-grey-8 text-caption">
                        <q-icon name="person" size="16px" class="q-mr-xs text-grey-6" /><span
                          class="text-weight-bold q-mr-xs"
                          >Rol:</span
                        >
                        {{ warning.role }}
                      </div>
                      <div class="row items-center text-grey-8 text-caption">
                        <q-icon
                          name="event_available"
                          size="16px"
                          class="q-mr-xs text-grey-6"
                        /><span class="text-weight-bold q-mr-xs">Fecha solicitud:</span>
                        {{ warning.requestDate }}
                      </div>
                      <div class="row items-center text-grey-8 text-caption">
                        <q-icon name="timelapse" size="16px" class="q-mr-xs text-grey-6" /><span
                          class="text-weight-bold q-mr-xs"
                          >Límite de días:</span
                        >
                        {{ warning.limit }}
                      </div>
                      <div class="row items-center text-grey-8 text-caption">
                        <q-icon
                          name="hourglass_empty"
                          size="16px"
                          class="q-mr-xs text-grey-6"
                        /><span class="text-weight-bold q-mr-xs">Días restantes:</span>
                        {{ warning.daysRemaining }} días
                      </div>
                    </div>
                    <q-item-label caption class="text-grey-7 q-mt-xs">{{
                      warning.description
                    }}</q-item-label>
                  </q-item-section>

                  <q-item-section side top>
                    <q-btn
                      flat
                      round
                      dense
                      icon="close"
                      color="grey-7"
                      @click.stop="dismissAlert(warning.id)"
                    >
                      <q-tooltip>Marcar como leído</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="tata-card q-mb-md">
            <q-card-section class="bg-black text-white">
              <div class="text-h6 text-weight-bold">
                <q-icon name="bar_chart" class="q-mr-sm" /> Resumen
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
                <q-icon name="flash_on" class="q-mr-sm" /> Acciones Rápidas
              </div>
            </q-card-section>
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
                label="Informes"
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
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useNotificationStore } from 'stores/notification-store'

const $q = useQuasar()
const store = useNotificationStore()

const criticalAlerts = computed(() => store.criticalAlerts)
const warnings = computed(() => store.warnings)
const loading = computed(() => store.loading)

const primaryView = ref('incumplimiento')

onMounted(() => {
  store.fetchAlerts()
})

const lastUpdate = computed(() => {
  const now = new Date()
  return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
})

async function dismissAlert(id) {
  const success = await store.markAsRead(id)
  if (success) {
    $q.notify({ type: 'positive', message: 'Alerta archivada', position: 'top', timeout: 1000 })
  } else {
    $q.notify({ type: 'negative', message: 'Error al archivar', position: 'top' })
  }
}

// --- FUNCIÓN DEL BOTÓN "MARCAR INCUMPLIMIENTOS" ---
async function markAllIncumplimientos() {
  const success = await store.markAllIncumplimientosRead()
  if (success) {
    $q.notify({
      type: 'positive',
      message: 'Incumplimientos marcados como leídos',
      position: 'top',
      icon: 'check_circle',
    })
  } else {
    $q.notify({ type: 'negative', message: 'No se pudo completar la acción', position: 'top' })
  }
}

function viewAlertDetails(alert) {
  $q.dialog({
    title: alert.title,
    message: `Rol: ${alert.role} <br> Fecha: ${alert.requestDate}`,
    html: true,
    ok: { label: 'Cerrar', color: 'black', flat: true },
  })
}
</script>

<style scoped lang="scss">
.notifications-page {
  background-color: #f5f5f5;
}
.tata-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.summary-row {
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}
.summary-row:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
.summary-row.active {
  background-color: #e3f2fd;
  border-color: #2196f3;
}
.transition-order {
  transition: order 0.5s ease;
}
</style>
