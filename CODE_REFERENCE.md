# 💻 Referencia de Código - Sistema de Autenticación

## 🚀 Cómo Usar en Tus Componentes

### 1. **Verificar si el usuario está autenticado**

```vue
<script setup>
import { useAuthStore } from 'src/stores/authStore'

const authStore = useAuthStore()
</script>

<template>
  <div v-if="authStore.isAuthenticated">
    ¡Hola {{ authStore.userName }}!
  </div>
  <div v-else>
    Por favor inicia sesión
  </div>
</template>
```

### 2. **Obtener datos del usuario actual**

```vue
<script setup>
import { useAuthStore } from 'src/stores/authStore'

const authStore = useAuthStore()

// Acceder a datos
const email = authStore.userEmail
const rol = authStore.userRole
const nombre = authStore.user?.nombre
const departamento = authStore.user?.departamento
</script>

<template>
  <p>Email: {{ email }}</p>
  <p>Rol: {{ rol }}</p>
  <p>Nombre: {{ nombre }}</p>
</template>
```

### 3. **Hacer logout programáticamente**

```vue
<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <button @click="handleLogout">Cerrar Sesión</button>
</template>
```

### 4. **Verificar si es admin**

```vue
<script setup>
import { useAuthStore } from 'src/stores/authStore'
import { computed } from 'vue'

const authStore = useAuthStore()

const isAdmin = computed(() => authStore.userRole === 'admin')
</script>

<template>
  <div v-if="isAdmin">
    <a href="/#/users">Gestión de Usuarios</a>
  </div>
</template>
```

### 5. **Usar el servicio de autenticación**

```vue
<script setup>
import * as authService from 'src/services/authService'
import { useAuthStore } from 'src/stores/authStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = useAuthStore()

// Cambiar contraseña
async function changePassword() {
  try {
    await authService.changePassword('old_password', 'new_password')
    $q.notify({
      type: 'positive',
      message: 'Contraseña actualizada'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error: ' + error.message
    })
  }
}

// Actualizar perfil
async function updateMyProfile() {
  try {
    const updated = await authService.updateProfile({
      nombre: 'Nuevo Nombre',
      departamento: 'Finance'
    })
    authStore.setUser(updated)
    $q.notify({
      type: 'positive',
      message: 'Perfil actualizado'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error: ' + error.message
    })
  }
}
</script>

<template>
  <button @click="changePassword">Cambiar Contraseña</button>
  <button @click="updateMyProfile">Actualizar Perfil</button>
</template>
```

---

## 👥 Gestionar Usuarios (Solo Admin)

### 1. **Obtener lista de usuarios**

```vue
<script setup>
import * as authService from 'src/services/authService'
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(false)

async function loadUsers() {
  loading.value = true
  try {
    // Sin filtros
    const result = await authService.getUsers()
    users.value = result

    // Con filtros
    const filtered = await authService.getUsers({
      departamento: 'Tech',
      rol: 'admin'
    })
    users.value = filtered
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <div v-for="user in users" :key="user.id">
    {{ user.nombre }} - {{ user.email }}
  </div>
</template>
```

### 2. **Crear nuevo usuario**

```vue
<script setup>
import * as authService from 'src/services/authService'
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const formData = ref({
  nombre: 'Carlos',
  apellido: 'López',
  email: 'carlos@example.com',
  password: 'Contraseña123',
  departamento: 'Tech',
  rol: 'user'
})

async function createNewUser() {
  try {
    const newUser = await authService.createUser(formData.value)
    $q.notify({
      type: 'positive',
      message: 'Usuario creado: ' + newUser.email
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error: ' + error.message
    })
  }
}
</script>

<template>
  <button @click="createNewUser">Crear Usuario</button>
</template>
```

### 3. **Actualizar usuario**

```vue
<script setup>
import * as authService from 'src/services/authService'
import { ref } from 'vue'

const userId = 123
const userData = ref({
  nombre: 'Carlos Updated',
  departamento: 'Finance',
  rol: 'manager',
  cargado: true
})

async function updateUser() {
  try {
    const updated = await authService.updateUser(userId, userData.value)
    console.log('Usuario actualizado:', updated)
  } catch (error) {
    console.error('Error:', error)
  }
}
</script>

<template>
  <button @click="updateUser">Actualizar</button>
</template>
```

### 4. **Eliminar usuario**

```vue
<script setup>
import * as authService from 'src/services/authService'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const userId = 123

async function deleteUserConfirm() {
  $q.dialog({
    title: 'Eliminar Usuario',
    message: '¿Estás seguro?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await authService.deleteUser(userId)
      $q.notify({
        type: 'positive',
        message: 'Usuario eliminado'
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error: ' + error.message
      })
    }
  })
}
</script>

<template>
  <button @click="deleteUserConfirm">Eliminar</button>
</template>
```

### 5. **Obtener usuario por ID**

```vue
<script setup>
import * as authService from 'src/services/authService'
import { ref } from 'vue'

const userId = 123
const user = ref(null)

async function getUserDetails() {
  try {
    user.value = await authService.getUserById(userId)
  } catch (error) {
    console.error('Error:', error)
  }
}
</script>

<template>
  <button @click="getUserDetails">Cargar Usuario</button>
  <div v-if="user">
    <p>Nombre: {{ user.nombre }}</p>
    <p>Email: {{ user.email }}</p>
  </div>
</template>
```

---

## 🔐 Redireccionamiento por Rol

### 1. **Redirigir si no es admin**

```vue
<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { onMounted } from 'vue'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.userRole !== 'admin') {
    router.push('/')
  }
})
</script>
```

### 2. **Mostrar componente condicionalmente por rol**

```vue
<script setup>
import { useAuthStore } from 'src/stores/authStore'
import { computed } from 'vue'

const authStore = useAuthStore()

const canDeleteUsers = computed(() => authStore.userRole === 'admin')
const canViewReports = computed(() => 
  authStore.userRole === 'admin' || authStore.userRole === 'manager'
)
</script>

<template>
  <button v-if="canDeleteUsers" @click="deleteUser">
    Eliminar Usuario
  </button>

  <section v-if="canViewReports">
    <!-- Reportes -->
  </section>
</template>
```

---

## 🛡️ Proteger API Calls

### 1. **Token en headers automáticamente**

```javascript
// El interceptor de api.js agrega el token automáticamente
// No necesitas hacer nada especial!

// Esto:
const response = await apiClient.get('/users')

// Es equivalente a:
// GET /users
// Header: Authorization: Bearer <token>
```

### 2. **Manejar errores 401 (token expirado)**

```javascript
// El interceptor en api.js maneja automáticamente:
// - Si recibe 401 → hace logout
// - Redirige a /login
// - Limpia localStorage

// En caso que quieras manejo personalizado:
try {
  await apiClient.get('/users')
} catch (error) {
  if (error.response?.status === 401) {
    // Token expirado
    authStore.logout()
    router.push('/login')
  }
}
```

---

## 📝 Ejemplos Completos

### Ejemplo 1: Página de Perfil Editable

```vue
<template>
  <q-card>
    <q-card-section>
      <h5>Mi Perfil</h5>
      
      <q-form @submit="updateProfile">
        <q-input
          v-model="form.nombre"
          label="Nombre"
          filled
          outlined
        />
        
        <q-input
          v-model="form.apellido"
          label="Apellido"
          filled
          outlined
        />
        
        <q-input
          v-model="form.telefono"
          label="Teléfono"
          filled
          outlined
        />
        
        <q-btn
          type="submit"
          color="primary"
          label="Guardar"
          :loading="saving"
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useAuthStore } from 'src/stores/authStore'
import * as authService from 'src/services/authService'
import { useQuasar } from 'quasar'
import { ref, reactive } from 'vue'

const authStore = useAuthStore()
const $q = useQuasar()
const saving = ref(false)

const form = reactive({
  nombre: authStore.user?.nombre || '',
  apellido: authStore.user?.apellido || '',
  telefono: authStore.user?.telefono || ''
})

async function updateProfile() {
  saving.value = true
  try {
    await authService.updateProfile(form)
    $q.notify({
      type: 'positive',
      message: 'Perfil actualizado'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message
    })
  } finally {
    saving.value = false
  }
}
</script>
```

### Ejemplo 2: Admin Dashboard con Usuarios

```vue
<template>
  <q-page>
    <q-table
      title="Usuarios"
      :rows="users"
      :columns="columns"
      row-key="id"
      :loading="loading"
    >
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn
            flat
            size="sm"
            color="primary"
            icon="edit"
            @click="editUser(props.row)"
          />
          <q-btn
            flat
            size="sm"
            color="negative"
            icon="delete"
            @click="deleteUser(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

    <q-btn
      color="primary"
      label="Crear Usuario"
      @click="openDialog"
    />

    <q-dialog v-model="showDialog">
      <q-card>
        <q-card-section>
          <q-form @submit="saveUser">
            <q-input
              v-model="formData.nombre"
              label="Nombre"
              filled
            />
            <q-input
              v-model="formData.email"
              label="Email"
              filled
              type="email"
            />
            <q-input
              v-model="formData.password"
              label="Contraseña"
              filled
              type="password"
              v-if="!editingId"
            />
            
            <q-btn type="submit" label="Guardar" />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as authService from 'src/services/authService'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const users = ref([])
const loading = ref(false)
const showDialog = ref(false)
const editingId = ref(null)

const formData = ref({
  nombre: '',
  email: '',
  password: ''
})

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre' },
  { name: 'email', label: 'Email', field: 'email' },
  { name: 'acciones', label: 'Acciones', field: 'acciones' }
]

async function loadUsers() {
  loading.value = true
  try {
    users.value = await authService.getUsers()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    loading.value = false
  }
}

function openDialog() {
  editingId.value = null
  formData.value = { nombre: '', email: '', password: '' }
  showDialog.value = true
}

function editUser(user) {
  editingId.value = user.id
  formData.value = { 
    nombre: user.nombre,
    email: user.email,
    password: ''
  }
  showDialog.value = true
}

async function saveUser() {
  try {
    if (editingId.value) {
      await authService.updateUser(editingId.value, formData.value)
    } else {
      await authService.createUser(formData.value)
    }
    showDialog.value = false
    await loadUsers()
    $q.notify({
      type: 'positive',
      message: 'Guardado exitoso'
    })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  }
}

async function deleteUser(userId) {
  $q.dialog({
    title: 'Eliminar',
    message: '¿Seguro?',
    cancel: true
  }).onOk(async () => {
    try {
      await authService.deleteUser(userId)
      await loadUsers()
    } catch (error) {
      $q.notify({ type: 'negative', message: error.message })
    }
  })
}

onMounted(loadUsers)
</script>
```

---

## 🔍 Depuración

### Ver datos en consola

```javascript
// En cualquier componente o en DevTools console:

import { useAuthStore } from 'src/stores/authStore'
const authStore = useAuthStore()

console.log('Token:', authStore.token)
console.log('User:', authStore.user)
console.log('Is Auth:', authStore.isAuthenticated)
console.log('Role:', authStore.userRole)
```

### Ver localStorage

```javascript
// En DevTools console:

console.log(localStorage.getItem('token'))
console.log(JSON.parse(localStorage.getItem('user')))
```

### Ver requests en Network

```
F12 → Network tab → filtrar por XHR
Busca requests a:
- /auth/login
- /auth/register
- /users
```

---

## 📚 Importes Comunes

```javascript
// Para componentes Vue:
import { useAuthStore } from 'src/stores/authStore'
import * as authService from 'src/services/authService'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { ref, computed, onMounted } from 'vue'

// Uso:
const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()
```

---

## ❓ Preguntas Frecuentes

**¿Cómo cambio el rol de un usuario?**
```javascript
await authService.updateUser(userId, { rol: 'admin' })
```

**¿Cómo verifico si el usuario actual es admin?**
```javascript
const authStore = useAuthStore()
if (authStore.userRole === 'admin') { ... }
```

**¿Dónde se guarda el token?**
```
En localStorage con la clave "token"
En sessionStorage también (opcional en backend)
```

**¿Qué pasa si expira el token?**
```
El interceptor detecta 401
Hace logout automáticamente
Redirige a /login
```

---

**Versión:** 1.0.0
**Última actualización:** 28 Noviembre 2025
