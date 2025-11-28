# 🔐 Sistema Completo de Autenticación y Registro - SINGULA

## 📋 Resumen de Implementación

Se ha implementado un **sistema completo de autenticación, registro y gestión de usuarios** integrado con tu base de datos backend en `http://localhost:5000`.

---

## 📁 Archivos Creados/Modificados

### 1. **Servicio de Autenticación** (`src/services/authService.js`)

Servicio centralizado para todas las operaciones de autenticación:

#### Funciones Principales:

- **`login(email, password)`** - Iniciar sesión
- **`register(userData)`** - Crear nueva cuenta
- **`logout()`** - Cerrar sesión
- **`getCurrentUser()`** - Obtener perfil actual
- **`updateProfile(userData)`** - Actualizar datos del usuario
- **`changePassword(currentPassword, newPassword)`** - Cambiar contraseña

#### Funciones de Administración:

- **`getUsers(filters)`** - Listar usuarios con filtros (solo admin)
- **`createUser(userData)`** - Crear nuevo usuario (admin)
- **`updateUser(userId, userData)`** - Actualizar usuario (admin)
- **`deleteUser(userId)`** - Eliminar usuario (admin)
- **`getUserById(userId)`** - Obtener usuario por ID

#### Funciones Auxiliares:

- **`validateEmail(email)`** - Validar si el email ya existe
- **`requestPasswordReset(email)`** - Solicitar recuperación de contraseña
- **`resetPassword(token, newPassword)`** - Restablecer contraseña

---

### 2. **Página de Registro** (`src/pages/RegisterPage.vue`)

Formulario completo para nuevo registro con:

**Campos:**
- ✅ Nombre *
- ✅ Apellido *
- ✅ Correo Electrónico * (con validación en tiempo real)
- ✅ Departamento * (selector)
- ✅ Teléfono (opcional)
- ✅ Contraseña * (con requisitos)
- ✅ Confirmar Contraseña *
- ✅ Aceptar Términos y Condiciones *

**Características:**
- Validaciones en tiempo real
- Verificación de email duplicado
- Validación de contraseña fuerte (8+ caracteres, mayúscula, minúscula, número)
- Botón "mostrar/ocultar" contraseña
- Link directo a login
- Notificaciones de éxito/error
- Redirección automática al dashboard tras registro

---

### 3. **Página de Login Actualizada** (`src/pages/LoginPage.vue`)

Se actualizó para usar credenciales reales (email + contraseña):

**Cambios:**
- Campo de **email** en lugar de username
- Integración con `authService.login()`
- Notificación de bienvenida personalizada
- Opción "¿Olvidaste tu contraseña?"
- Link directo a registro
- Redirección automática si ya está autenticado

---

### 4. **Store de Autenticación** (`src/stores/authStore.js`)

Store Pinia actualizado con métodos reales:

**Estado:**
- `token` - Token JWT
- `user` - Datos del usuario actual
- `loading` - Estado de carga

**Computados:**
- `isAuthenticated` - ¿Está autenticado?
- `userName` - Nombre del usuario
- `userEmail` - Email del usuario
- `userRole` - Rol del usuario

**Acciones:**
- `login(email, password)` - Llamar a authService.login
- `register(userData)` - Llamar a authService.register
- `logout()` - Limpiar estado y localStorage
- `getCurrentUser()` - Obtener perfil actualizado
- `updateProfile(userData)` - Actualizar perfil
- `changePassword(...)` - Cambiar contraseña

---

### 5. **Módulo de Gestión de Usuarios** (`src/pages/UsersPage.vue`)

Página administrativa completa para gestionar usuarios:

**Funcionalidades:**
- 📊 Tabla de usuarios con información completa
- 🔍 Filtros por nombre, email, departamento y rol
- ➕ Crear nuevos usuarios
- ✏️ Editar usuarios existentes
- 🗑️ Eliminar usuarios
- 🎯 Badges de rol y estado

**Campos para Crear/Editar:**
- Nombre y Apellido
- Email
- Teléfono
- Departamento
- Rol (admin, user, manager)
- Estado (activo/inactivo)
- Contraseña (solo al crear)

**Validaciones:**
- Email único
- Contraseña fuerte (solo al crear)
- Campos obligatorios marcados

---

### 6. **Rutas Actualizadas** (`src/router/routes.js`)

Se agregaron nuevas rutas:

```javascript
// Pública - Registro
{
  path: '/register',
  name: 'register',
  component: () => import('pages/RegisterPage.vue'),
}

// Protegida - Gestión de Usuarios (solo admin)
{
  path: 'users',
  name: 'users',
  component: () => import('pages/UsersPage.vue'),
  meta: { requiresAdmin: true },
}
```

---

### 7. **Protección de Rutas** (`src/router/index.js`)

Sistema de protección de rutas:

```javascript
// Rutas públicas
- /login
- /register

// Rutas protegidas (requieren autenticación)
- / (dashboard)
- /administrar
- /reports
- /predictive
- /notifications
- /profile
- /users (solo admin)
- /config (solo admin)
```

**Flujo de protección:**
1. Si no autenticado → redirect a /login
2. Si requiere admin y no es admin → redirect a /
3. Si autenticado y va a /login → redirect a /

---

### 8. **Layout Principal Actualizado** (`src/layouts/MainLayout.vue`)

Se agregó opción en el menú:

```
MENÚ (solo visible si es admin):
├─ Gestión de Usuarios
│  └─ Crear y administrar usuarios
└─ Configuración
   └─ Gestionar bloques y opciones
```

---

### 9. **Configuración de API** (`src/services/api.js`)

URL base actualizada a tu backend:

```javascript
const API_BASE_URL = 'http://localhost:5000/api'
```

---

## 🔗 Endpoints Esperados del Backend

Tu backend debe proporcionar los siguientes endpoints en `http://localhost:5000/api`:

### Autenticación

```
POST /auth/login
{
  "email": "usuario@example.com",
  "password": "Contraseña123"
}
Respuesta:
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "departamento": "Tech",
    "rol": "admin",
    "telefono": "123456789",
    "cargado": true
  }
}
```

```
POST /auth/register
{
  "email": "nuevo@example.com",
  "password": "Contraseña123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "departamento": "Tech",
  "rol": "user",
  "telefono": "123456789"
}
Respuesta: (igual a login)
```

```
POST /auth/validate-email
{
  "email": "usuario@example.com"
}
Respuesta:
{
  "exists": false
}
```

### Gestión de Usuarios (Admin)

```
GET /users?departamento=Tech&rol=admin&page=1&pageSize=10
Respuesta:
[
  {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "departamento": "Tech",
    "rol": "admin",
    "telefono": "123456789",
    "cargado": true
  }
]
```

```
POST /users
{
  "nombre": "Carlos",
  "apellido": "López",
  "email": "carlos@example.com",
  "password": "Contraseña123",
  "departamento": "Finance",
  "rol": "user"
}
```

```
PUT /users/{id}
{
  "nombre": "Carlos",
  "apellido": "López",
  "departamento": "Operations",
  "rol": "manager",
  "cargado": true
}
```

```
DELETE /users/{id}
```

---

## 🎯 Flujos de Usuario

### Flujo de Registro

```
1. Usuario accede a /register
2. Completa formulario:
   - Nombre, Apellido, Email
   - Departamento, Teléfono (opt)
   - Contraseña (8+ chars, mayúscula, minúscula, número)
   - Confirma contraseña
   - Acepta términos
3. Sistema valida:
   - Email no duplicado ✓
   - Contraseñas coinciden ✓
   - Datos requeridos ✓
4. Se envía POST /auth/register
5. Respuesta exitosa:
   - Token guardado en localStorage
   - Usuario guardado en store y localStorage
   - Notificación "¡Registro exitoso!"
   - Redirect a dashboard (/)
6. Si error:
   - Notificación de error
   - Mantiene en página
```

### Flujo de Login

```
1. Usuario accede a /login
2. Ingresa:
   - Email
   - Contraseña
3. Se envía POST /auth/login
4. Respuesta exitosa:
   - Token guardado
   - Usuario guardado en store
   - Notificación personalizada
   - Redirect a dashboard
5. Si error:
   - Notificación "Credenciales inválidas"
```

### Flujo de Gestión de Usuarios (Admin)

```
1. Admin accede a /users
2. Ve tabla de usuarios actuales
3. Puede:
   a) Crear usuario → Click "+ Crear Usuario"
      - Llena formulario
      - Requiere contraseña nueva
      - POST /users
   b) Editar usuario → Click icono editar
      - Edita datos (sin contraseña)
      - PUT /users/{id}
   c) Eliminar usuario → Click icono delete
      - Confirmación
      - DELETE /users/{id}
4. Filtros disponibles:
   - Buscar por nombre/email
   - Por departamento
   - Por rol
```

---

## 📊 Atributos de Usuario

La tabla `usuarios` debe tener estos campos:

```sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  departamento VARCHAR(100),
  rol VARCHAR(20) DEFAULT 'user', -- admin, user, manager
  telefono VARCHAR(20),
  cargado BOOLEAN DEFAULT 1, -- 1 = activo, 0 = inactivo
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔐 Seguridad

**Implementado en Frontend:**
- ✅ Validación de contraseña fuerte
- ✅ Protección de rutas por autenticación
- ✅ Protección de rutas por rol (admin)
- ✅ Token guardado en localStorage
- ✅ Interceptor axios para agregar token automáticamente
- ✅ Manejo de errores 401 (token expirado)

**Recomendaciones Backend:**
- Usar HTTPS en producción
- Hash de contraseñas con bcrypt o similar
- JWT con expiración (ej: 24 horas)
- Refresh tokens
- CORS configurado correctamente
- Rate limiting en endpoints de auth

---

## 🚀 Próximos Pasos

### Para que funcione completamente:

1. **Implementa endpoints en backend** según la especificación anterior
2. **Asegura CORS** permitiendo `http://localhost:9000` o `http://localhost:3000`
3. **Prueba con Postman/Insomnia:**
   - POST `/auth/login` con credenciales
   - POST `/auth/register` con datos nuevos
   - GET `/users` con token

### Mejoras Futuras:

- [ ] OAuth2 (Google, GitHub)
- [ ] 2FA (Two-Factor Authentication)
- [ ] Recuperación de contraseña por email
- [ ] Cambio de rol/permisos dinámicos
- [ ] Auditoría de acciones de usuarios
- [ ] Suspensión temporal de cuentas

---

## 📱 Rutas Disponibles

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Público | Iniciar sesión |
| `/register` | Público | Crear nueva cuenta |
| `/` | Autenticado | Dashboard principal |
| `/administrar` | Autenticado | Gestión de bloques |
| `/reports` | Autenticado | Generar reportes |
| `/predictive` | Autenticado | Análisis predictivo |
| `/notifications` | Autenticado | Ver notificaciones |
| `/profile` | Autenticado | Mi perfil |
| `/users` | Admin | Gestión de usuarios |
| `/config` | Admin | Configuración |

---

## 🧪 Pruebas Rápidas

```bash
# 1. Inicia el frontend
quasar dev

# 2. Accede a http://localhost:9000/#/register
# 3. Crea una cuenta nueva
# 4. Se debería redirigir a dashboard
# 5. Intenta crear otra cuenta con el mismo email → Error
# 6. Logout y vuelve a login
```

---

## 📚 Variables Importantes

### authStore (Pinia)
```javascript
import { useAuthStore } from 'src/stores/authStore'

const authStore = useAuthStore()

// Acceder a estado
authStore.token
authStore.user
authStore.isAuthenticated
authStore.userName
authStore.userEmail
authStore.userRole

// Llamar acciones
await authStore.login(email, password)
await authStore.register(userData)
await authStore.logout()
```

### Services
```javascript
import * as authService from 'src/services/authService'

await authService.login(email, password)
await authService.register(userData)
await authService.getCurrentUser()
await authService.getUsers(filters)
await authService.createUser(userData)
```

---

## ❌ Errores Comunes

**"No se puede conectar al backend"**
- Verifica que `http://localhost:5000` está corriendo
- Revisa CORS en backend
- Abre DevTools (F12) → Network → revisa respuestas

**"Email ya registrado"**
- Usa otro email o delete el usuario de la BD
- El frontend valida en tiempo real

**"Token expirado"**
- Haz logout y login de nuevo
- El interceptor axios maneja automáticamente

**"Acceso denegado (403)"**
- Asegúrate de que eres admin para /users
- Revisa el rol en localStorage

---

## ✅ Checklist de Implementación

- [x] Servicio de autenticación completo
- [x] Página de login actualizada
- [x] Página de registro nueva
- [x] Store de autenticación mejorado
- [x] Módulo de gestión de usuarios
- [x] Protección de rutas
- [x] Menú dinámico por rol
- [x] Validaciones completas
- [x] Notificaciones visuales
- [ ] Backend endpoints (tu responsabilidad)
- [ ] Testing E2E (próxima fase)

---

## 📞 Soporte

Para preguntas o errores:
1. Revisa los logs en DevTools (F12)
2. Verifica que el backend está corriendo
3. Revisa la especificación de endpoints
4. Consulta el código comentado en authService.js

---

**Desarrollado por:** GitHub Copilot
**Fecha:** 28 de Noviembre de 2025
**Versión:** 1.0.0
**Status:** ✅ Listo para Testing
