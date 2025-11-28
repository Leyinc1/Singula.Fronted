<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="q-my-none text-h4">📧 Configuración de Notificaciones por Email</h4>
          <p class="text-grey-7 q-mt-sm">Configura cómo y cuándo deseas recibir notificaciones por correo electrónico</p>
        </div>
      </div>

      <!-- Card de Configuración -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="settings" class="q-mr-sm" />
            Configuración General
          </div>

          <q-form @submit="guardarConfiguracion" class="q-gutter-md">
            <!-- Email -->
            <q-input
              v-model="config.email"
              label="Correo Electrónico"
              type="email"
              outlined
              :rules="[val => !!val || 'El email es requerido', val => /.+@.+\..+/.test(val) || 'Email inválido']"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <!-- Switches de Notificaciones -->
            <div class="q-gutter-md">
              <q-toggle
                v-model="config.notificarIncumplimientos"
                label="Notificar Incumplimientos de SLA"
                color="red"
                left-label
              >
                <q-tooltip>Recibe un email inmediato cuando se detecte un incumplimiento de SLA</q-tooltip>
              </q-toggle>

              <q-toggle
                v-model="config.notificarPorVencer"
                label="Notificar Alertas Por Vencer (2 días)"
                color="orange"
                left-label
              >
                <q-tooltip>Recibe un email cuando una solicitud esté por vencer en 2 días o menos</q-tooltip>
              </q-toggle>

              <q-toggle
                v-model="config.enviarResumenDiario"
                label="Enviar Resumen Diario"
                color="primary"
                left-label
              >
                <q-tooltip>Recibe un resumen diario con todas las alertas pendientes</q-tooltip>
              </q-toggle>
            </div>

            <!-- Hora del Resumen Diario -->
            <q-input
              v-if="config.enviarResumenDiario"
              v-model="horaResumen"
              label="Hora del Resumen Diario"
              outlined
              type="time"
            >
              <template v-slot:prepend>
                <q-icon name="schedule" />
              </template>
            </q-input>

            <!-- Botones -->
            <div class="row q-gutter-sm">
              <q-btn
                type="submit"
                label="Guardar Configuración"
                color="primary"
                icon="save"
                :loading="loading"
              />

              <q-btn
                label="Enviar Email de Prueba"
                color="secondary"
                icon="send"
                outline
                @click="enviarEmailPrueba"
                :loading="loadingTest"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Card de Estadísticas -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="insights" class="q-mr-sm" />
            Historial de Notificaciones
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h4 text-primary">{{ stats.emailsEnviados }}</div>
                  <div class="text-grey-7">Emails Enviados (Total)</div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h4 text-orange">{{ stats.emailsHoy }}</div>
                  <div class="text-grey-7">Emails Hoy</div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h4 text-green">{{ config.activo ? 'Activo' : 'Inactivo' }}</div>
                  <div class="text-grey-7">Estado</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import api from 'src/services/api'

const $q = useQuasar()

// Estado
const config = ref({
  idConfiguracion: null,
  idUsuario: 1, // TODO: Obtener del usuario logueado
  email: '',
  notificarIncumplimientos: true,
  notificarPorVencer: true,
  enviarResumenDiario: false,
  horaResumenDiario: '08:00:00',
  activo: true
})

const loading = ref(false)
const loadingTest = ref(false)
const stats = ref({
  emailsEnviados: 0,
  emailsHoy: 0
})

// Computed para hora en formato HH:mm
const horaResumen = computed({
  get: () => {
    if (config.value.horaResumenDiario) {
      return config.value.horaResumenDiario.substring(0, 5)
    }
    return '08:00'
  },
  set: (val) => {
    config.value.horaResumenDiario = val + ':00'
  }
})

// Cargar configuración del usuario
const cargarConfiguracion = async () => {
  try {
    const response = await api.get(`/notificacionemail/${config.value.idUsuario}`)
    if (response.data) {
      config.value = {
        ...response.data,
        horaResumenDiario: response.data.horaResumenDiario || '08:00:00'
      }
    }
  } catch (error) {
    console.error('Error al cargar configuración:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la configuración de notificaciones',
      position: 'top'
    })
  }
}

// Guardar configuración
const guardarConfiguracion = async () => {
  loading.value = true
  try {
    const payload = {
      idUsuario: config.value.idUsuario,
      email: config.value.email,
      notificarIncumplimientos: config.value.notificarIncumplimientos,
      notificarPorVencer: config.value.notificarPorVencer,
      enviarResumenDiario: config.value.enviarResumenDiario,
      horaResumenDiario: config.value.horaResumenDiario
    }

    if (config.value.idConfiguracion) {
      // Actualizar
      await api.put(`/notificacionemail/${config.value.idConfiguracion}`, payload)
      $q.notify({
        type: 'positive',
        message: 'Configuración actualizada exitosamente',
        icon: 'check_circle',
        position: 'top'
      })
    } else {
      // Crear
      const response = await api.post('/notificacionemail', payload)
      config.value.idConfiguracion = response.data.idConfiguracion
      $q.notify({
        type: 'positive',
        message: 'Configuración creada exitosamente',
        icon: 'check_circle',
        position: 'top'
      })
    }

    await cargarConfiguracion()
  } catch (error) {
    console.error('Error al guardar configuración:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al guardar la configuración',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

// Enviar email de prueba
const enviarEmailPrueba = async () => {
  if (!config.value.email) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, ingresa un email primero',
      position: 'top'
    })
    return
  }

  loadingTest.value = true
  try {
    await api.post('/notificacionemail/test-email', {
      email: config.value.email,
      nombre: 'Usuario'
    })

    $q.notify({
      type: 'positive',
      message: `Email de prueba enviado a ${config.value.email}`,
      icon: 'email',
      position: 'top'
    })
  } catch (error) {
    console.error('Error al enviar email de prueba:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar el email de prueba',
      position: 'top'
    })
  } finally {
    loadingTest.value = false
  }
}

onMounted(() => {
  cargarConfiguracion()
})
</script>

<style scoped>
.q-toggle {
  font-size: 16px;
}
</style>
