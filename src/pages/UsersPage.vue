<template>
  <q-page class="users-page" style="background-color: #fafafa">
    <div class="q-pa-md">
      <!-- Encabezado -->
      <div class="row items-center justify-between q-mb-lg">
        <div class="col">
          <h4 class="text-h4 q-my-none text-weight-bold text-black">
            <q-icon name="people" class="q-mr-sm" />
            Gestión de Usuarios
          </h4>
          <p class="text-grey-8 q-mt-sm q-mb-none" style="font-weight: 400">
            Crea, edita y administra usuarios del sistema
          </p>
        </div>
        <div class="col-auto">
          <q-btn
            color="black"
            label="Crear Usuario"
            icon="person_add"
            @click="openCreateDialog"
            unelevated
          />
        </div>
      </div>

      <!-- Filtros -->
      <q-card class="tata-card q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="filters.searchText"
                filled
                label="Buscar por nombre o email"
                dense
                @update:model-value="applyFilters"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="filters.departamento"
                :options="departamentos"
                filled
                label="Filtrar por departamento"
                dense
                clearable
                @update:model-value="applyFilters"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="filters.rol"
                :options="['admin', 'user', 'manager']"
                filled
                label="Filtrar por rol"
                dense
                clearable
                @update:model-value="applyFilters"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla de Usuarios -->
      <q-card class="tata-card">
        <q-table
          title="Usuarios del Sistema"
          :rows="filteredUsers"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
          class="tata-table"
        >
          <!-- Nombre Completo -->
          <template v-slot:body-cell-nombre_completo="props">
            <q-td :props="props">
              <div class="flex items-center q-gutter-md">
                <q-avatar
                  :color="getColorByRole(props.row.rol)"
                  text-color="white"
                  size="sm"
                >
                  {{ getInitials(props.row.nombre, props.row.apellido) }}
                </q-avatar>
                <div>
                  <div class="text-weight-bold">{{ props.row.nombre }} {{ props.row.apellido }}</div>
                  <div class="text-caption text-grey-7">{{ props.row.email }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <!-- Rol Badge -->
          <template v-slot:body-cell-rol="props">
            <q-td :props="props">
              <q-badge
                :color="getRolColor(props.row.rol)"
                text-color="white"
                :label="getRolLabel(props.row.rol)"
              />
            </q-td>
          </template>

          <!-- Estado -->
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.cargado ? 'green' : 'orange'"
                text-color="white"
                :label="props.row.cargado ? 'Activo' : 'Inactivo'"
              />
            </q-td>
          </template>

          <!-- Acciones -->
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <div class="flex q-gutter-sm">
                <q-btn
                  flat
                  dense
                  color="primary"
                  icon="edit"
                  size="sm"
                  @click="editUser(props.row)"
                >
                  <q-tooltip>Editar usuario</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deleteUser(props.row.id)"
                >
                  <q-tooltip>Eliminar usuario</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Dialog para Crear/Editar Usuario -->
    <q-dialog v-model="showDialog" @hide="resetForm">
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="saveUser" class="q-gapx-md">
            <!-- Nombre y Apellido -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formData.nombre"
                  filled
                  label="Nombre *"
                  :rules="[(val) => !!val || 'Requerido']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formData.apellido"
                  filled
                  label="Apellido *"
                  :rules="[(val) => !!val || 'Requerido']"
                />
              </div>
            </div>

            <!-- Email -->
            <q-input
              v-model="formData.email"
              filled
              label="Correo Electrónico *"
              type="email"
              :rules="[(val) => !!val || 'Requerido', (val) => /.+@.+\..+/.test(val) || 'Email no válido']"
            />

            <!-- Teléfono -->
            <q-input
              v-model="formData.telefono"
              filled
              label="Teléfono"
              type="tel"
            />

            <!-- Departamento -->
            <q-select
              v-model="formData.departamento"
              :options="departamentos"
              filled
              label="Departamento *"
              :rules="[(val) => !!val || 'Requerido']"
            />

            <!-- Rol -->
            <q-select
              v-model="formData.rol"
              :options="['admin', 'user', 'manager']"
              filled
              label="Rol *"
              :rules="[(val) => !!val || 'Requerido']"
              map-options
              emit-value
            />

            <!-- Estado -->
            <q-checkbox
              v-model="formData.cargado"
              label="Usuario Activo"
              color="black"
            />

            <!-- Password (solo para crear) -->
            <div v-if="!editingUser">
              <q-input
                v-model="formData.password"
                filled
                label="Contraseña *"
                :type="showPassword ? 'text' : 'password'"
                :rules="passwordRules"
                hint="Mínimo 8 caracteres, mayúscula, minúscula y número"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </div>

            <div class="row q-mt-lg q-gutter-md">
              <q-btn
                type="submit"
                color="black"
                label="Guardar"
                unelevated
                class="col"
              />
              <q-btn
                label="Cancelar"
                color="grey-8"
                unelevated
                v-close-popup
                class="col"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import * as authService from 'src/services/authService'

const $q = useQuasar()

const users = ref([])
const loading = ref(false)
const showDialog = ref(false)
const editingUser = ref(null)
const showPassword = ref(false)

const filters = ref({
  searchText: '',
  departamento: null,
  rol: null,
})

const formData = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  departamento: '',
  rol: 'user',
  password: '',
  cargado: true,
})

const departamentos = [
  'Recursos Humanos',
  'Tecnología',
  'Finanzas',
  'Administración',
  'Operaciones',
  'Ventas',
  'Marketing',
  'Legal',
]

const columns = [
  {
    name: 'nombre_completo',
    label: 'Usuario',
    field: 'nombre',
    align: 'left',
  },
  {
    name: 'departamento',
    label: 'Departamento',
    field: 'departamento',
    align: 'left',
  },
  {
    name: 'rol',
    label: 'Rol',
    field: 'rol',
    align: 'center',
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'cargado',
    align: 'center',
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center',
  },
]

const passwordRules = [
  (val) => !!val || 'Contraseña requerida',
  (val) => val?.length >= 8 || 'Mínimo 8 caracteres',
  (val) => /[A-Z]/.test(val) || 'Debe contener mayúscula',
  (val) => /[a-z]/.test(val) || 'Debe contener minúscula',
  (val) => /[0-9]/.test(val) || 'Debe contener número',
]

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const searchLower = filters.value.searchText.toLowerCase()
    const matchesSearch =
      !filters.value.searchText ||
      user.nombre.toLowerCase().includes(searchLower) ||
      user.apellido.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)

    const matchesDept =
      !filters.value.departamento || user.departamento === filters.value.departamento

    const matchesRol = !filters.value.rol || user.rol === filters.value.rol

    return matchesSearch && matchesDept && matchesRol
  })
})

function getInitials(nombre, apellido) {
  return (nombre?.[0] || '') + (apellido?.[0] || '')
}

function getColorByRole(rol) {
  const colors = {
    admin: 'red',
    manager: 'orange',
    user: 'blue',
  }
  return colors[rol] || 'grey'
}

function getRolColor(rol) {
  const colors = {
    admin: 'negative',
    manager: 'warning',
    user: 'primary',
  }
  return colors[rol] || 'grey'
}

function getRolLabel(rol) {
  const labels = {
    admin: 'Administrador',
    manager: 'Gerente',
    user: 'Usuario',
  }
  return labels[rol] || rol
}

function applyFilters() {
  // Filtros se aplican automáticamente mediante el computed
}

async function fetchUsers() {
  loading.value = true
  try {
    const result = await authService.getUsers()
    users.value = Array.isArray(result) ? result : result.data || []
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Error',
      caption: 'No se pudieron cargar los usuarios',
    })
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  editingUser.value = null
  resetForm()
  showDialog.value = true
}

function editUser(user) {
  editingUser.value = user
  formData.value = {
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    telefono: user.telefono || '',
    departamento: user.departamento,
    rol: user.rol,
    password: '',
    cargado: user.cargado,
  }
  showDialog.value = true
}

async function saveUser() {
  try {
    if (editingUser.value) {
      // Actualizar usuario
      const updateData = {
        nombre: formData.value.nombre,
        apellido: formData.value.apellido,
        email: formData.value.email,
        telefono: formData.value.telefono,
        departamento: formData.value.departamento,
        rol: formData.value.rol,
        cargado: formData.value.cargado,
      }
      await authService.updateUser(editingUser.value.id, updateData)
      $q.notify({
        type: 'positive',
        message: 'Usuario actualizado correctamente',
      })
    } else {
      // Crear nuevo usuario
      await authService.createUser(formData.value)
      $q.notify({
        type: 'positive',
        message: 'Usuario creado correctamente',
      })
    }
    showDialog.value = false
    await fetchUsers()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error',
      caption: error.message || 'No se pudo guardar el usuario',
    })
  }
}

async function deleteUser(userId) {
  $q.dialog({
    title: 'Eliminar Usuario',
    message: '¿Estás seguro de que deseas eliminar este usuario?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await authService.deleteUser(userId)
      $q.notify({
        type: 'positive',
        message: 'Usuario eliminado correctamente',
      })
      await fetchUsers()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error',
        caption: error.message || 'No se pudo eliminar el usuario',
      })
    }
  })
}

function resetForm() {
  formData.value = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    departamento: '',
    rol: 'user',
    password: '',
    cargado: true,
  }
  showPassword.value = false
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped lang="scss">
.users-page {
  background-color: #fafafa;
}

.tata-card {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.tata-table {
  :deep(.q-table__card) {
    box-shadow: none;
  }
}
</style>
