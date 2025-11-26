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
                <div class="text-h6 text-weight-medium text-black q-mb-md">
                  <q-icon name="login" class="q-mr-sm" />
                  Iniciar Sesión
                </div>

                <q-input
                  v-model="loginForm.username"
                  filled
                  label="Usuario"
                  type="text"
                  bg-color="white"
                  class="q-mb-md"
                  :rules="[(val) => !!val || 'Usuario requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="black" />
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
                  <q-btn flat dense color="grey-8" label="¿Olvidaste tu contraseña?" size="sm" />
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

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false,
})

const showPassword = ref(false)
const loading = ref(false)

async function handleLogin() {
  loading.value = true

  try {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Llamar al backend para autenticar
    await authStore.login({
      username: loginForm.value.username,
      password: loginForm.value.password,
      rememberMe: loginForm.value.rememberMe,
    })

    $q.notify({
      type: 'positive',
      message: '¡Bienvenido a SINGULA!',
      caption: 'Inicio de sesión exitoso',
      position: 'top',
      icon: 'check_circle',
    })

    // Redirigir al dashboard
    router.push('/')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al iniciar sesión',
      caption: error.message || 'Credenciales inválidas',
      position: 'top',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
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
