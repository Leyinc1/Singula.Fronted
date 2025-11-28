# 🚀 Guía Rápida - Sistema de Login y Registro

## ¿Qué se ha creado?

Un **sistema completo de autenticación, registro y gestión de usuarios** listo para funcionar con tu backend en `http://localhost:5000`.

---

## 📍 Rutas Principales

### Públicas (sin login)
- **`http://localhost:9000/#/login`** - Iniciar sesión
- **`http://localhost:9000/#/register`** - Crear nueva cuenta

### Protegidas (requieren login)
- **`http://localhost:9000/#/`** - Dashboard
- **`http://localhost:9000/#/users`** - Gestión de usuarios (solo admin)

---

## 🎯 Cómo Funciona

### 1️⃣ **Registro**
```
Usuario va a /register
↓
Completa: Nombre, Email, Contraseña, Departamento
↓
Sistema valida:
- Email no duplicado ✓
- Contraseña fuerte ✓
- Campos requeridos ✓
↓
POST /auth/register al backend
↓
Si OK → Guarda token y datos
       → Va al Dashboard
Si ERROR → Muestra error
```

### 2️⃣ **Login**
```
Usuario va a /login
↓
Ingresa: Email y Contraseña
↓
POST /auth/login al backend
↓
Si OK → Guarda token y datos
       → Va al Dashboard
Si ERROR → Muestra "Credenciales inválidas"
```

### 3️⃣ **Gestión de Usuarios (Admin)**
```
Admin va a /users
↓
Ve tabla de todos los usuarios
↓
Puede:
  - ➕ Crear nuevo usuario
  - ✏️ Editar usuario
  - 🗑️ Eliminar usuario
  - 🔍 Filtrar por nombre/email/departamento/rol
```

---

## 📦 Archivos Creados/Modificados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `src/services/authService.js` | ✅ Nuevo | Servicio con métodos de auth |
| `src/pages/RegisterPage.vue` | ✅ Nuevo | Página de registro |
| `src/pages/UsersPage.vue` | ✅ Nuevo | Gestión de usuarios |
| `src/pages/LoginPage.vue` | 🔄 Modificado | Actualizado con email |
| `src/stores/authStore.js` | 🔄 Modificado | Integrado con backend |
| `src/router/routes.js` | 🔄 Modificado | Agregadas rutas nuevas |
| `src/router/index.js` | 🔄 Modificado | Protección de rutas |
| `src/layouts/MainLayout.vue` | 🔄 Modificado | Agregado menú usuarios |
| `src/services/api.js` | 🔄 Modificado | URL a tu backend |
| `AUTHENTICATION_SYSTEM.md` | ✅ Nuevo | Documentación completa |

---

## 🔧 Backend - Endpoints Requeridos

Tu backend en `http://localhost:5000/api` debe tener:

### 🔐 Autenticación (públicas)
```
POST /auth/login
{
  "email": "usuario@example.com",
  "password": "password123"
}
→ Retorna: { token, user }

POST /auth/register
{
  "email": "nuevo@example.com",
  "password": "password123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "departamento": "Tech",
  "rol": "user"
}
→ Retorna: { token, user }

POST /auth/validate-email
{ "email": "test@example.com" }
→ Retorna: { exists: true/false }
```

### 👥 Usuarios (requieren token + admin)
```
GET /users?departamento=Tech&rol=admin
→ Retorna: [{ id, nombre, email, ... }]

POST /users
{ "nombre": "Carlos", "email": "carlos@example.com", ... }
→ Retorna: { id, ... }

PUT /users/{id}
{ "nombre": "Carlos actualizado", ... }
→ Retorna: { id, ... }

DELETE /users/{id}
→ Retorna: { message: "Deleted" }
```

---

## 💾 Estructura de Usuario (BD)

```sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  departamento VARCHAR(100),
  rol VARCHAR(20) DEFAULT 'user',  -- admin, user, manager
  telefono VARCHAR(20),
  cargado BOOLEAN DEFAULT 1,       -- 1 = activo, 0 = inactivo
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🧪 Pruebas Rápidas

### Test 1: Registro
```
1. Abre http://localhost:9000/#/register
2. Llena el formulario
3. Haz click "Registrarse"
4. Deberías ir a Dashboard
5. Verifica en localStorage (F12 → Application)
```

### Test 2: Login
```
1. Haz logout (arriba a la derecha)
2. Abre http://localhost:9000/#/login
3. Ingresa email y contraseña
4. Haz click "Iniciar Sesión"
5. Deberías ir a Dashboard
```

### Test 3: Gestión de Usuarios (si eres admin)
```
1. En Dashboard, menú izquierdo
2. Click en "Gestión de Usuarios"
3. Deberías ver tabla de usuarios
4. Prueba: Crear, Editar, Eliminar
```

---

## 🔑 Variables de Entorno

En `src/boot/axios.js` ya está configurado:
```javascript
baseURL: 'http://localhost:5000/api'
```

Si necesitas cambiar:
```
Edita: src/boot/axios.js
const api = axios.create({ 
  baseURL: 'http://tu-backend:puerto/api' 
})
```

---

## ⚠️ Errores Comunes

### Error: "No se puede conectar"
✅ Solución:
- Verifica que tu backend está en `http://localhost:5000`
- Abre DevTools (F12) → Network → ve qué responde
- Comprueba CORS en tu backend

### Error: "Email ya registrado"
✅ Solución:
- El frontend valida que no exista en BD
- Usa otro email o borra el usuario de la BD

### Error: "No tienes permisos"
✅ Solución:
- Solo admin puede ver `/users`
- Tu rol debe ser `"admin"` en la BD
- Comprueba en localStorage (F12 → Application → user.rol)

---

## 🎨 Formularios Incluidos

### Registro
- ✅ Nombre (requerido)
- ✅ Apellido (requerido)
- ✅ Email (requerido, validado)
- ✅ Departamento (requerido, selector)
- ✅ Teléfono (opcional)
- ✅ Contraseña (requerido, 8+ chars, mayúscula, número)
- ✅ Confirmar Contraseña (debe coincidir)

### Crear Usuario (Admin)
- ✅ Todos los del registro
- ✅ Plus: Rol (admin, user, manager)
- ✅ Plus: Estado (activo/inactivo)

---

## 📊 Validaciones

- ✅ Email único
- ✅ Contraseña fuerte (8+ caracteres, mayúscula, minúscula, número)
- ✅ Campos requeridos
- ✅ Coincidencia de contraseñas
- ✅ Formato de email

---

## 🔒 Seguridad

Implementado en Frontend:
- ✅ Token guardado en localStorage
- ✅ Protección de rutas (privadas/públicas)
- ✅ Validación de rol (admin)
- ✅ Interceptor axios automático

**IMPORTANTE en Backend:**
- Usa HTTPS en producción
- Hash bcrypt para contraseñas
- JWT con expiración
- CORS configurado

---

## 📚 Código Importante

### Usar el Store
```javascript
import { useAuthStore } from 'src/stores/authStore'

const authStore = useAuthStore()

// Acceder
authStore.token
authStore.user
authStore.userName
authStore.isAuthenticated

// Hacer login
await authStore.login(email, password)

// Hacer logout
await authStore.logout()
```

### Usar el Servicio
```javascript
import * as authService from 'src/services/authService'

// Login
const result = await authService.login(email, password)

// Registro
const result = await authService.register(userData)

// Usuarios (admin)
const users = await authService.getUsers()
const user = await authService.createUser(userData)
```

---

## ✅ Checklist

Antes de usar:
- [ ] Backend está corriendo en `http://localhost:5000`
- [ ] CORS está configurado
- [ ] Endpoints `/auth/login` y `/auth/register` existen
- [ ] Tabla `usuarios` está creada
- [ ] Frontend está corriendo `quasar dev`

---

## 🎯 Próximos Pasos

1. **Implementa endpoints** en tu backend
2. **Prueba el registro** desde `/register`
3. **Prueba el login** desde `/login`
4. **Prueba usuarios** desde `/users` (si admin)
5. **Implementa recuperación** de contraseña (opcional)

---

## 💬 Preguntas Frecuentes

**¿Dónde se guarda el token?**
→ En localStorage bajo la clave `token`

**¿Cómo hago logout?**
→ Click en icono usuario → ícono logout (arriba a la derecha)

**¿Puedo ver los datos del usuario?**
→ Sí, F12 → Application → localStorage → `user`

**¿Qué pasa si me olvido la contraseña?**
→ Será implementado en siguiente fase (formulario en login)

**¿Cómo agrego más departamentos?**
→ En `RegisterPage.vue` y `UsersPage.vue`, edita el array `departamentos`

---

## 📞 Contacto/Soporte

- **Documentación completa:** `AUTHENTICATION_SYSTEM.md`
- **Archivos modificados:** Ver listado arriba
- **Errores:** Revisa DevTools (F12 → Console/Network)

---

**Versión:** 1.0.0
**Estado:** ✅ Listo para usar
**Última actualización:** 28 de Noviembre 2025
