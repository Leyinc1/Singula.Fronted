<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page
        class="flex flex-center"
        style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%)"
      >
        <div class="register-container">
          <q-card class="register-card" flat bordered>
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

            <!-- Formulario de Registro -->
            <q-card-section class="q-px-xl q-pb-xl">
              <q-form @submit="handleRegister" class="q-gapx-md">
                <div class="text-h6 text-weight-medium text-black q-mb-md">
                  <q-icon name="person_add" class="q-mr-sm" />
                  Crear Cuenta
                </div>

                <!-- Nombre y Apellido -->
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="registerForm.nombre"
                      filled
                      label="Nombre *"
                      type="text"
                      bg-color="white"
                      :rules="[(val) => !!val || 'Nombre requerido']"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" color="black" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="registerForm.apellido"
                      filled
                      label="Apellido *"
                      type="text"
                      bg-color="white"
                      :rules="[(val) => !!val || 'Apellido requerido']"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" color="black" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <!-- Email -->
                <q-input
                  v-model="registerForm.email"
                  filled
                  label="Correo Electrónico *"
                  type="email"
                  bg-color="white"
                  class="q-mb-md"
                  :rules="emailRules"
                  @blur="validateEmailExists"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" color="black" />
                  </template>
                  <template v-if="emailExists" v-slot:append>
                    <q-icon name="error" color="negative" />
                  </template>
                </q-input>
                <div v-if="emailExists" class="text-negative text-caption q-mt-xs q-ml-md">
                  Este correo ya está registrado
                </div>

                <!-- Departamento -->
                <q-select
                  v-model="registerForm.departamento"
                  :options="departamentos"
                  filled
                  label="Departamento *"
                  bg-color="white"
                  class="q-mb-md"
                  :rules="[(val) => !!val || 'Departamento requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="domain" color="black" />
                  </template>
                </q-select>

                <!-- Teléfono (Opcional) -->
                <q-input
                  v-model="registerForm.telefono"
                  filled
                  label="Teléfono (Opcional)"
                  type="tel"
                  bg-color="white"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" color="black" />
                  </template>
                </q-input>

                <!-- Contraseña -->
                <q-input
                  v-model="registerForm.password"
                  filled
                  label="Contraseña *"
                  :type="showPassword ? 'text' : 'password'"
                  bg-color="white"
                  class="q-mb-md"
                  :rules="passwordRules"
                  hint="Mínimo 8 caracteres, con mayúscula, minúscula y número"
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

                <!-- Confirmar Contraseña -->
                <q-input
                  v-model="registerForm.confirmPassword"
                  filled
                  label="Confirmar Contraseña *"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  bg-color="white"
                  class="q-mb-md"
                  :rules="[(val) => !!val || 'Debe confirmar la contraseña', (val) => val === registerForm.password || 'Las contraseñas no coinciden']"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="black" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showConfirmPassword ? 'visibility' : 'visibility_off'"
                      class="cursor-pointer"
                      @click="showConfirmPassword = !showConfirmPassword"
                    />
                  </template>
                </q-input>

                <!-- Términos y Condiciones -->
                <div class="row items-center q-mb-lg">
                  <q-checkbox
                    v-model="registerForm.acceptTerms"
                    color="black"
                    :rules="[(val) => !!val || 'Debe aceptar los términos']"
                  />
                  <span class="text-caption text-grey-8 q-ml-md">
                    Acepto los
                    <a href="#" class="text-primary text-weight-bold" @click.prevent>
                      términos y condiciones
                    </a>
                  </span>
                </div>

                <!-- Botón Registrarse -->
                <q-btn
                  type="submit"
                  color="black"
                  label="Registrarse"
                  icon="person_add"
                  unelevated
                  size="lg"
                  class="full-width"
                  :loading="loading"
                  :disable="emailExists"
                />

                <!-- Link a Login -->
                <div class="text-center q-mt-md">
                  <span class="text-caption text-grey-8">
                    ¿Ya tienes cuenta?
                    <router-link to="/login" class="text-primary text-weight-bold">
                      Inicia sesión aquí
                    </router-link>
                  </span>
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

const registerForm = ref({
  nombre: '',
  apellido: '',
  email: '',
  departamento: '',
  telefono: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const emailExists = ref(false)

const departamentos = [
  'Recursos Humanos',
  'Tecnología',
  'Finanzas',
  'Administración',
  'Operaciones',
  'Ventas',
  'Marketing',
  'Legal',
  'Otra',
]

const emailRules = [
  (val) => !!val || 'Correo requerido',
  (val) => /.+@.+\..+/.test(val) || 'Correo no válido',
]

const passwordRules = [
  (val) => !!val || 'Contraseña requerida',
  (val) => val?.length >= 8 || 'Mínimo 8 caracteres',
  (val) => /[A-Z]/.test(val) || 'Debe contener mayúscula',
  (val) => /[a-z]/.test(val) || 'Debe contener minúscula',
  (val) => /[0-9]/.test(val) || 'Debe contener número',
]

async function validateEmailExists() {
  if (!registerForm.value.email || !/.+@.+\..+/.test(registerForm.value.email)) {
    emailExists.value = false
    return
  }

  try {
    const result = await authService.validateEmail(registerForm.value.email)
    emailExists.value = result.exists || false
  } catch (error) {
    // Silenciar errores de validación en desarrollo (mock mode)
    console.debug('Email validation:', error.message)
    emailExists.value = false
  }
}

async function handleRegister() {
  loading.value = true

  try {
    // Validar que el email no exista
    if (emailExists.value) {
      throw { message: 'Este correo ya está registrado' }
    }

    // Validar que las contraseñas coincidan
    if (registerForm.value.password !== registerForm.value.confirmPassword) {
      throw { message: 'Las contraseñas no coinciden' }
    }

    // Validar términos
    if (!registerForm.value.acceptTerms) {
      throw { message: 'Debe aceptar los términos y condiciones' }
    }

    // Llamar al servicio de registro
    const result = await authService.register({
      email: registerForm.value.email,
      password: registerForm.value.password,
      nombre: registerForm.value.nombre,
      apellido: registerForm.value.apellido,
      departamento: registerForm.value.departamento,
      telefono: registerForm.value.telefono,
    })

    // Guardar en el store
    await authStore.setToken(result.token)
    await authStore.setUser(result.user)

    // Mostrar notificación de éxito
    $q.notify({
      type: 'positive',
      message: '¡Bienvenido a SINGULA!',
      caption: 'Registro exitoso',
      position: 'top',
      icon: 'check_circle',
    })

    // Redirigir al dashboard
    router.push('/')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al registrarse',
      caption: error.message || 'Por favor, intenta de nuevo',
      position: 'top',
      icon: 'error',
    })
    console.error('Error en registro:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.register-container {
  width: 100%;
  max-width: 550px;
  padding: 20px;
}

.register-card {
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

a {
  text-decoration: none;
}
</style>
