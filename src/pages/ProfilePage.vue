<template>
  <q-page class="profile-page" style="background-color: #fafafa">
    <!-- Loading Spinner -->
    <q-inner-loading :showing="loading" label="Cargando perfil..." label-style="font-size: 1.1em" />
    
    <div class="q-pa-md">
      <!-- Encabezado -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="text-h4 q-my-none text-weight-bold text-black">
            <q-icon name="person" class="q-mr-sm" />
            Mi Perfil
          </h4>
          <p class="text-grey-8 q-mt-sm q-mb-none" style="font-weight: 400">
            Gestiona tu información personal y configuración de la cuenta
          </p>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <!-- Columna Izquierda: Info del Usuario -->
        <div class="col-12 col-md-4">
          <!-- Card de Avatar y Datos Básicos -->
          <q-card class="tata-card q-mb-md">
            <q-card-section class="text-center">
              <q-avatar size="120px" color="black" text-color="white" class="q-mb-md">
                <div class="text-h3">{{ userInitials }}</div>
              </q-avatar>

              <div class="text-h5 text-weight-bold text-black">{{ user.nombreCompleto || user.name || 'Usuario' }}</div>
              <div class="text-body2 text-grey-7 q-mt-xs">{{ user.correo || user.email || 'No definido' }}</div>

              <q-separator class="q-my-md" />

              <div class="row items-center justify-center q-mb-xs">
                <q-icon name="badge" class="q-mr-sm" color="black" size="sm" />
                <span class="text-body2 text-weight-medium">{{
                  user.rol === 'admin' || user.role === 'admin' ? 'Administrador' : 'Usuario'
                }}</span>
              </div>

              <div class="row items-center justify-center">
                <q-icon name="calendar_today" class="q-mr-sm" color="grey-7" size="sm" />
                <span class="text-caption text-grey-7">Miembro desde {{ memberSince }}</span>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-btn
                outline
                color="black"
                icon="camera_alt"
                label="Cambiar Foto"
                class="full-width"
                style="border-width: 2px"
              />
            </q-card-section>
          </q-card>

          <!-- Card de Estadísticas -->
          <q-card class="tata-card">
            <q-card-section>
              <div class="text-h6 text-weight-bold text-black q-mb-md">
                <q-icon name="bar_chart" class="q-mr-sm" />
                Actividad
              </div>

              <div class="q-mb-md">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-body2 text-grey-8">Solicitudes Creadas</span>
                  <span class="text-h6 text-weight-bold text-black">{{
                    stats.solicitudesCreadas
                  }}</span>
                </div>
                <q-linear-progress
                  :value="stats.solicitudesCreadas / 100"
                  color="black"
                  class="q-mt-xs"
                />
              </div>

              <div class="q-mb-md">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-body2 text-grey-8">Reportes Generados</span>
                  <span class="text-h6 text-weight-bold text-black">{{
                    stats.reportesGenerados
                  }}</span>
                </div>
                <q-linear-progress
                  :value="stats.reportesGenerados / 50"
                  color="grey-7"
                  class="q-mt-xs"
                />
              </div>

              <div>
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-body2 text-grey-8">Archivos Subidos</span>
                  <span class="text-h6 text-weight-bold text-black">{{
                    stats.archivosSubidos
                  }}</span>
                </div>
                <q-linear-progress
                  :value="stats.archivosSubidos / 30"
                  color="grey-5"
                  class="q-mt-xs"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Columna Derecha: Formulario de Edición -->
        <div class="col-12 col-md-8">
          <q-card class="tata-card">
            <q-card-section>
              <div class="text-h6 text-weight-bold text-black q-mb-md">
                <q-icon name="edit" class="q-mr-sm" />
                Información Personal
              </div>

              <q-form @submit="saveProfile" class="q-gapx-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="editForm.nombres"
                      filled
                      label="Nombres"
                      bg-color="white"
                      :rules="[(val) => !!val || 'Nombres requeridos']"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" color="black" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="editForm.apellidos"
                      filled
                      label="Apellidos"
                      bg-color="white"
                      :rules="[(val) => !!val || 'Apellidos requeridos']"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person_outline" color="black" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="user.correo"
                      filled
                      label="Correo Electrónico"
                      type="email"
                      bg-color="white"
                      readonly
                      disable
                    >
                      <template v-slot:prepend>
                        <q-icon name="email" color="black" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="editForm.documento"
                      filled
                      label="Documento de Identidad"
                      bg-color="white"
                    >
                      <template v-slot:prepend>
                        <q-icon name="badge" color="black" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input v-model="editForm.telefono" filled label="Teléfono" bg-color="white">
                      <template v-slot:prepend>
                        <q-icon name="phone" color="black" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12">
                    <q-input
                      v-model="editForm.biografia"
                      filled
                      type="textarea"
                      label="Biografía"
                      bg-color="white"
                      rows="3"
                    >
                      <template v-slot:prepend>
                        <q-icon name="description" color="black" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <div class="row q-gutter-sm q-mt-md justify-end">
                  <q-btn
                    outline
                    color="grey-8"
                    label="Cancelar"
                    @click="resetForm"
                    style="border-width: 2px"
                  />
                  <q-btn
                    type="submit"
                    color="black"
                    label="Guardar Cambios"
                    icon="save"
                    unelevated
                    :loading="saving"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>

          <!-- Card de Cambio de Contraseña -->
          <q-card class="tata-card q-mt-md">
            <q-card-section>
              <div class="text-h6 text-weight-bold text-black q-mb-md">
                <q-icon name="lock" class="q-mr-sm" />
                Cambiar Contraseña
              </div>

              <q-form @submit="changePassword">
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-input
                      v-model="passwordForm.currentPassword"
                      filled
                      label="Contraseña Actual"
                      :type="showCurrentPassword ? 'text' : 'password'"
                      bg-color="white"
                      :rules="[(val) => !!val || 'Contraseña actual requerida']"
                    >
                      <template v-slot:prepend>
                        <q-icon name="lock_open" color="black" />
                      </template>
                      <template v-slot:append>
                        <q-icon
                          :name="showCurrentPassword ? 'visibility' : 'visibility_off'"
                          class="cursor-pointer"
                          @click="showCurrentPassword = !showCurrentPassword"
                        />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="passwordForm.newPassword"
                      filled
                      label="Nueva Contraseña"
                      :type="showNewPassword ? 'text' : 'password'"
                      bg-color="white"
                      :rules="[
                        (val) => !!val || 'Nueva contraseña requerida',
                        (val) => val.length >= 6 || 'Mínimo 6 caracteres',
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon name="lock" color="black" />
                      </template>
                      <template v-slot:append>
                        <q-icon
                          :name="showNewPassword ? 'visibility' : 'visibility_off'"
                          class="cursor-pointer"
                          @click="showNewPassword = !showNewPassword"
                        />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="passwordForm.confirmPassword"
                      filled
                      label="Confirmar Contraseña"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      bg-color="white"
                      :rules="[
                        (val) => !!val || 'Confirmar contraseña requerida',
                        (val) => val === passwordForm.newPassword || 'Las contraseñas no coinciden',
                      ]"
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
                  </div>
                </div>

                <div class="row q-mt-md justify-end">
                  <q-btn
                    type="submit"
                    color="black"
                    label="Actualizar Contraseña"
                    icon="vpn_key"
                    unelevated
                    :loading="changingPassword"
                  />
                </div>
              </q-form>
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
import { useAuthStore } from 'src/stores/authStore'

const $q = useQuasar()
const authStore = useAuthStore()

const user = computed(() => authStore.user || {})
const userInitials = computed(() => {
  const name = user.value.nombreCompleto || user.value.name || 'User'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const memberSince = computed(() => {
  // En producción, calcular desde user.fechaCreacion o user.createdAt
  return user.value.fechaCreacion 
    ? new Date(user.value.fechaCreacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
    : 'Nov 2025'
})

const stats = ref({
  solicitudesCreadas: 45,
  reportesGenerados: 12,
  archivosSubidos: 8,
})

const editForm = ref({
  nombres: '',
  apellidos: '',
  documento: '',
  telefono: '',
  biografia: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const saving = ref(false)
const changingPassword = ref(false)
const loading = ref(false)

onMounted(async () => {
  await loadUserProfile()
})

async function loadUserProfile() {
  loading.value = true
  try {
    // Cargar perfil completo desde la API
    await authStore.getCurrentUser()
    
    // Poblar formulario con datos actuales
    editForm.value = {
      nombres: user.value.nombres || '',
      apellidos: user.value.apellidos || '',
      documento: user.value.documento || '',
      telefono: user.value.telefono || '',
      biografia: user.value.biografia || '',
    }
  } catch (error) {
    console.error('Error cargando perfil:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar perfil',
      caption: error.message || 'No se pudo cargar la información del perfil',
      position: 'center',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

function resetForm() {
  editForm.value = {
    nombres: user.value.nombres || '',
    apellidos: user.value.apellidos || '',
    documento: user.value.documento || '',
    telefono: user.value.telefono || '',
    biografia: user.value.biografia || '',
  }
}

async function saveProfile() {
  saving.value = true

  try {
    // Llamar al authStore para actualizar perfil
    await authStore.updateProfile({
      nombres: editForm.value.nombres,
      apellidos: editForm.value.apellidos,
      documento: editForm.value.documento,
      telefono: editForm.value.telefono,
      biografia: editForm.value.biografia
    })

    $q.notify({
      type: 'positive',
      message: 'Perfil actualizado',
      caption: 'Los cambios se han guardado exitosamente',
      position: 'center',
      icon: 'check_circle',
    })
  } catch (error) {
    console.error('Error guardando perfil:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar',
      caption: error.message || error.title || 'No se pudo actualizar el perfil',
      position: 'center',
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  changingPassword.value = true

  try {
    // Validar que las contraseñas coincidan
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      throw new Error('Las contraseñas no coinciden')
    }

    // Llamar al authStore para cambiar contraseña
    await authStore.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword,
      passwordForm.value.confirmPassword
    )

    $q.notify({
      type: 'positive',
      message: 'Contraseña actualizada',
      caption: 'Tu contraseña ha sido cambiada exitosamente',
      position: 'center',
      icon: 'check_circle',
    })

    // Limpiar formulario
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  } catch (error) {
    console.error('Error cambiando contraseña:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar contraseña',
      caption: error.message || error.title || 'No se pudo actualizar la contraseña',
      position: 'center',
      icon: 'error',
    })
  } finally {
    changingPassword.value = false
  }
}
</script>

<style scoped lang="scss">
.profile-page {
  background-color: #f5f5f5;
}
</style>
