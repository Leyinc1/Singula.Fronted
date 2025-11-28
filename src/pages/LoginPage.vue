<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page
        class="flex flex-center login-page"
      >
        <!-- Animación de burbujas -->
        <div class="bubbles">
          <div class="bubble"></div>
          <div class="bubble"></div>
          <div class="bubble"></div>
          <div class="bubble"></div>
          <div class="bubble"></div>
          <div class="bubble"></div>
          <div class="bubble"></div>
          <div class="bubble"></div>
          <div class="bubble"></div>
          <div class="bubble"></div>
        </div>
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
  email: '',
  password: '',
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
      position: 'center',
      icon: 'check_circle',
      timeout: 500
    })

    // Redirigir al dashboard
    router.push('/')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Credenciales incorrectas',
      caption: 'Por favor verifica tu correo y contraseña e inténtalo de nuevo',
      position: 'center',
      icon: 'error',
      timeout: 1000
    })
    console.error('Error en login:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  background: #000000;
  position: relative;
  overflow: hidden;
}

.login-container {
  width: 100%;
  max-width: 480px;
  padding: 20px;
  position: relative;
  z-index: 10;
}

.login-card {
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  box-shadow: 0 10px 40px rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

// Animaciones de burbujas
.bubbles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.bubble {
  position: absolute;
  bottom: -100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: rise 10s infinite ease-in;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.bubble:nth-child(1) {
  width: 40px;
  height: 40px;
  left: 10%;
  animation-duration: 8s;
  animation-delay: 0s;
}

.bubble:nth-child(2) {
  width: 20px;
  height: 20px;
  left: 20%;
  animation-duration: 5s;
  animation-delay: 1s;
}

.bubble:nth-child(3) {
  width: 50px;
  height: 50px;
  left: 35%;
  animation-duration: 7s;
  animation-delay: 2s;
}

.bubble:nth-child(4) {
  width: 80px;
  height: 80px;
  left: 50%;
  animation-duration: 11s;
  animation-delay: 0s;
}

.bubble:nth-child(5) {
  width: 35px;
  height: 35px;
  left: 55%;
  animation-duration: 6s;
  animation-delay: 1s;
}

.bubble:nth-child(6) {
  width: 45px;
  height: 45px;
  left: 65%;
  animation-duration: 8s;
  animation-delay: 3s;
}

.bubble:nth-child(7) {
  width: 90px;
  height: 90px;
  left: 70%;
  animation-duration: 12s;
  animation-delay: 2s;
}

.bubble:nth-child(8) {
  width: 25px;
  height: 25px;
  left: 80%;
  animation-duration: 6s;
  animation-delay: 2s;
}

.bubble:nth-child(9) {
  width: 15px;
  height: 15px;
  left: 85%;
  animation-duration: 5s;
  animation-delay: 1s;
}

.bubble:nth-child(10) {
  width: 60px;
  height: 60px;
  left: 90%;
  animation-duration: 9s;
  animation-delay: 0s;
}

@keyframes rise {
  0% {
    bottom: -100px;
    transform: translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    bottom: 100vh;
    transform: translateX(-200px);
    opacity: 0;
  }
}
</style>
