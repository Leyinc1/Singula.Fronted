# 🔧 Sistema de Autenticación - Modo Mock vs Real

## 📋 Estado Actual

Tu sistema de autenticación está completamente funcionando en **MODO MOCK** (desarrollo). Esto significa:

✅ Login funciona  
✅ Registro funciona  
✅ Validaciones funcionan  
✅ Gestión de usuarios funciona  
✅ **PERO**: Los datos NO se guardan en base de datos real (se pierden al recargar)

---

## 🧪 Credenciales de Testing (Modo Mock)

### Admin
- **Email:** `admin@singula.com`
- **Contraseña:** `Admin@123`
- **Rol:** admin (acceso a Gestión de Usuarios)

### Usuario Regular
- **Email:** `user@singula.com`
- **Contraseña:** `User@123`
- **Rol:** user (solo dashboard)

### Registrar Nuevo Usuario
Puedes usar el formulario de registro `/register` para crear nuevos usuarios. Los datos se guardarán en memoria mientras la sesión esté abierta.

---

## 🔄 Cómo Funciona el Mock Automático

El sistema está configurado para:

1. **Intentar conectar al backend** (`http://localhost:5000/api`)
2. **Si falla** → Automáticamente cambia a modo mock
3. **Muestra advertencia en consola:** "⚠️ Backend no disponible. Usando servicio mock..."

### En `api.js` (línea 40-60):
```javascript
// Si es error de conexión y no usamos mock aún
if (!useMock && (!error.response || error.code === 'ECONNREFUSED')) {
  useMock = true
  mockAuthService = await import('./mockAuthService')
  return handleMockRequest(error.config)
}
```

---

## 🚀 Cuando Esté Listo tu Backend

### Paso 1: Implementa los 8 Endpoints

Tu backend debe responder en `http://localhost:5000/api/` con:

```
POST   /auth/login              → { token, user }
POST   /auth/register           → { token, user }
POST   /auth/validate-email     → { exists }
GET    /auth/profile            → { ...user }
PUT    /auth/profile            → { ...user }
POST   /auth/change-password    → { message }
POST   /auth/request-password-reset → { message, resetToken }
POST   /auth/reset-password     → { message }
GET    /users                   → { data: [...users], total }
POST   /users                   → { data: user }
PUT    /users/{id}              → { data: user }
DELETE /users/{id}              → { data: user }
GET    /users/{id}              → { data: user }
```

### Paso 2: Desactivar el Mock

Cuando tu backend esté listo, elimina (o comenta) estas líneas en `api.js`:

```javascript
// ❌ ELIMINA ESTO:
if (!useMock && (!error.response || error.code === 'ECONNREFUSED')) {
  useMock = true
  mockAuthService = await import('./mockAuthService')
  return handleMockRequest(error.config)
}
```

### Paso 3: Verificar CORS

Asegúrate que tu backend tenga configurado CORS:

```javascript
// En tu backend (Node/Express):
app.use(cors({
  origin: 'http://localhost:5173', // O el puerto de tu Quasar
  credentials: true
}))
```

---

## 📁 Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `authService.js` | Servicio real (llama al backend) |
| `mockAuthService.js` | Simulación en memoria (desarrollo) |
| `api.js` | Interceptor que decide qué usar |
| `stores/authStore.js` | Estado global de autenticación |
| `pages/LoginPage.vue` | Página de login |
| `pages/RegisterPage.vue` | Página de registro |
| `pages/UsersPage.vue` | Panel admin de usuarios |

---

## 🔍 Verificar qué Modo Está Activo

Abre la **consola del navegador** (F12) y:

1. **Si ves esto:**
   ```
   ⚠️ Backend no disponible. Usando servicio mock para desarrollo.
   ```
   → **Modo MOCK activo** ✓

2. **Si NO ves ese mensaje:**
   → **Backend conectado** ✓

---

## 🧩 Estructura de Datos Mock

El mock guarda usuarios así:

```javascript
{
  id: 1,
  email: 'admin@singula.com',
  nombre: 'Admin',
  apellido: 'Usuario',
  departamento: 'Administración',
  rol: 'admin',      // 'admin', 'user', 'manager'
  telefono: '+34 123 456 789',
  cargado: true,     // active status
  created_at: '2024-11-28...',
  updated_at: '2024-11-28...'
}
```

---

## ⚠️ Limitaciones del Mock

- ❌ Los datos NO persisten (se pierden al recargar)
- ❌ NO hay base de datos real
- ❌ Contraseñas guardadas en texto plano (SOLO PARA DESARROLLO)
- ❌ NO hay persistencia entre sesiones

**Para producción necesitas el backend real.**

---

## 🎯 Siguiente Paso

👉 Implementa los 8 endpoints en tu backend siguiendo la especificación en `AUTHENTICATION_SYSTEM.md`

Cuando el backend esté listo, el frontend automáticamente usará los datos reales sin cambios en el código.

---

## 💡 Tips

### Para forzar modo real (testing del backend):
Comenta esta línea en `api.js`:
```javascript
// if (!useMock && (!error.response || error.code === 'ECONNREFUSED')) {
```

### Para ver la BD mock en consola:
```javascript
// En consola del navegador:
const { getMockDatabase } = await import('src/services/mockAuthService.js')
console.log(getMockDatabase())
```

### Para depuración:
Todos los métodos del mock tienen `console.error` que muestra detalles.

---

## ✅ Checklist de Transición a Backend Real

- [ ] Endpoints implementados en backend
- [ ] CORS configurado
- [ ] JWT tokens funcionando
- [ ] Contraseñas hasheadas (bcrypt)
- [ ] Base de datos con tabla `usuarios`
- [ ] Validar email en backend
- [ ] Rates limiting implementado
- [ ] Desactivar fallback a mock
- [ ] Testing E2E completado
- [ ] Deploying a producción

