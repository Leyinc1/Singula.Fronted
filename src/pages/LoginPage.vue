<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page
        class="flex flex-center"
        style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%)"
      >
        <div class="login-container">
          <q-card class="login-card" flat bordered>
            <!-- Logo y Header -->
            <q-card-section class="text-center q-pt-xl">
              <div class="text-h3 text-weight-bold text-black" style="letter-spacing: 2px">
                SINGULA
              </div>
              <div class="text-subtitle2 text-grey-7 q-mt-sm">
                Sistema de Gestión de Indicadores SLA
              </div>
              <q-separator
                class="q-mt-lg"
                style="max-width: 60px; margin: 20px auto; height: 3px; background-color: black"
              />
            </q-card-section>

            <!-- Formulario de Login -->
            <q-card-section class="q-px-xl q-pb-xl">
              <q-form @submit="handleLogin" class="q-gapx-md">

                <q-input
                  v-model="loginForm.email"
                  filled
                  label="Correo Electrónico"
                  type="email"
                  bg-color="white"
                  class="q-mb-md"
                  :rules="[(val) => !!val || 'Correo requerido', (val) => /.+@.+\..+/.test(val) || 'Correo no válido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" color="black" />
                  </template>
                </q-input>

                <q-input
                  v-model="loginForm.password"
                  filled
                  label="Contraseña"
                  :type="showPassword ? 'text' : 'password'"
                  bg-color="white"
                  class="q-mb-md"
                  :rules="[(val) => !!val || 'Contraseña requerida']"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="black" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showPassword ? 'visibility' : 'visibility_off'"
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>

                <div class="row items-center q-mb-lg">
                  <q-checkbox v-model="loginForm.rememberMe" label="Recordarme" color="black" />
                </div>

                <q-btn
                  type="submit"
                  color="black"
                  label="Iniciar Sesión"
                  icon="login"
                  unelevated
                  size="lg"
                  class="full-width"
                  :loading="loading"
                />

                <div class="text-center q-mt-md">
                  <q-btn
                    flat
                    dense
                    color="grey-8"
                    label="¿Olvidaste tu contraseña?"
                    size="sm"
                    @click="handleForgotPassword"
                  />
                </div>
              </q-form>
            </q-card-section>

            <!-- Footer de Tata -->
            <q-separator />
            <q-card-section class="text-center q-py-md bg-grey-1">
              <div class="text-caption text-grey-7">Desarrollado por</div>
              <div class="text-body2 text-weight-bold text-black">Tata Consultancy Services</div>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import * as authService from 'src/services/authService'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false,
})

const showPassword = ref(false)
const loading = ref(false)

async function handleLogin() {
  loading.value = true

  try {
    // Crear objeto de credenciales con el formato correcto
    const credentials = {
      correo: loginForm.value.email,     // mapear email a correo
      password: loginForm.value.password
    }

    // Llamar al authStore con las credenciales
    const result = await authStore.login(credentials)

    $q.notify({
      type: 'positive',
      message: '¡Inicio de sesión exitoso!',
      caption: `Bienvenido ${result.user?.nombre || 'Usuario'}`,
      position: 'top',
      icon: 'check_circle',
    })

    // Redirigir al dashboard
    router.push('/')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al iniciar sesión',
      caption: error.message || error.title || 'Credenciales inválidas',
      position: 'top',
      icon: 'error',
    })
    console.error('Error en login:', error)
  } finally {
    loading.value = false
  }
}

function handleForgotPassword() {
  $q.dialog({
    title: 'Recuperar Contraseña',
    message: 'Ingresa tu correo electrónico para recibir instrucciones de recuperación',
    prompt: {
      model: '',
      type: 'email',
      filled: true,
      label: 'Correo Electrónico',
    },
    cancel: true,
    persistent: true,
  }).onOk(async (email) => {
    try {
      await authService.requestPasswordReset(email)
      $q.notify({
        type: 'positive',
        message: 'Correo enviado',
        caption: 'Revisa tu bandeja de entrada para las instrucciones de recuperación',
        position: 'top',
        icon: 'mail',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error',
        caption: error.message || 'No pudimos enviar el correo',
        position: 'top',
        icon: 'error',
      })
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  width: 100%;
  max-width: 480px;
  padding: 20px;
}

.login-card {
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}
</style>
