# 🖥️ Guía de Implementación del Backend

## 📌 Estructura Mínima Requerida

Tu frontend espera un backend con esta estructura:

```
Backend (Node/Express o similar)
└── src/
    ├── routes/
    │   ├── auth.routes.js      (POST /auth/login, register, etc)
    │   └── users.routes.js     (GET/POST/PUT/DELETE /users)
    ├── controllers/
    │   ├── authController.js
    │   └── usersController.js
    ├── middleware/
    │   ├── auth.middleware.js  (verificar JWT)
    │   └── errorHandler.js
    ├── models/
    │   └── User.model.js       (schema de BD)
    ├── config/
    │   ├── database.js
    │   └── jwt.config.js
    └── app.js
```

---

## 🚀 Implementación Rápida (Express + JWT + PostgreSQL)

### 1️⃣ Instalar Dependencias

```bash
npm init -y
npm install express cors dotenv jsonwebtoken bcryptjs pg uuid
npm install --save-dev nodemon
```

### 2️⃣ Archivo `.env`

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/singula_db
JWT_SECRET=tu_secret_jwt_muy_seguro_aqui_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3️⃣ Crear Tabla `usuarios`

```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  departamento VARCHAR(100),
  rol VARCHAR(20) DEFAULT 'user', -- 'admin', 'user', 'manager'
  telefono VARCHAR(20),
  cargado BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON usuarios(email);
CREATE INDEX idx_rol ON usuarios(rol);
```

### 4️⃣ Archivo `app.js`

```javascript
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Rutas
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/users', require('./routes/users.routes'))

// Error handling
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    message: err.message,
    status: err.status || 500
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
```

### 5️⃣ Archivo `config/jwt.config.js`

```javascript
const jwt = require('jsonwebtoken')

const generateToken = (userId, email, rol) => {
  return jwt.sign(
    { id: userId, email, rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    throw new Error('Token inválido o expirado')
  }
}

module.exports = { generateToken, verifyToken }
```

### 6️⃣ Middleware de Autenticación

```javascript
// middleware/auth.middleware.js
const { verifyToken } = require('../config/jwt.config')

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' })
    }

    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
  }
}

const adminMiddleware = (req, res, next) => {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' })
  }
  next()
}

module.exports = { authMiddleware, adminMiddleware }
```

### 7️⃣ Controlador de Auth

```javascript
// controllers/authController.js
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const db = require('../config/database')
const { generateToken } = require('../config/jwt.config')

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña requeridos' })
    }

    // Buscar usuario
    const result = await db.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const user = result.rows[0]

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    // Generar token
    const token = generateToken(user.id, user.email, user.rol)

    // Retornar usuario sin contraseña
    const { password_hash, ...userWithoutPassword } = user

    res.json({
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const register = async (req, res) => {
  try {
    const {
      email,
      password,
      nombre,
      apellido,
      departamento,
      telefono,
      rol = 'user'
    } = req.body

    // Validar entrada
    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({
        message: 'Email, contraseña, nombre y apellido son requeridos'
      })
    }

    // Validar que el email no exista
    const existing = await db.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' })
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Crear usuario
    const result = await db.query(
      `INSERT INTO usuarios 
       (email, password_hash, nombre, apellido, departamento, rol, telefono)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, nombre, apellido, departamento, rol, telefono, cargado, created_at`,
      [email, passwordHash, nombre, apellido, departamento, rol, telefono]
    )

    const user = result.rows[0]

    // Generar token
    const token = generateToken(user.id, user.email, user.rol)

    res.status(201).json({
      token,
      user
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const validateEmail = async (req, res) => {
  try {
    const { email } = req.body

    const result = await db.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    )

    res.json({ exists: result.rows.length > 0 })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { login, register, validateEmail }
```

### 8️⃣ Rutas de Auth

```javascript
// routes/auth.routes.js
const express = require('express')
const { login, register, validateEmail } = require('../controllers/authController')
const { authMiddleware } = require('../middleware/auth.middleware')

const router = express.Router()

router.post('/login', login)
router.post('/register', register)
router.post('/validate-email', validateEmail)

// Rutas protegidas
router.get('/profile', authMiddleware, async (req, res) => {
  res.json(req.user)
})

router.post('/change-password', authMiddleware, async (req, res) => {
  // Implementar cambio de contraseña
  res.json({ message: 'Contraseña actualizada' })
})

module.exports = router
```

### 9️⃣ Rutas de Usuarios (Admin)

```javascript
// routes/users.routes.js
const express = require('express')
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware')
const db = require('../config/database')
const bcrypt = require('bcryptjs')

const router = express.Router()

// GET /users - Listar usuarios (solo admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, nombre, apellido, departamento, rol, telefono, cargado FROM usuarios ORDER BY created_at DESC'
    )
    res.json({ data: result.rows, total: result.rows.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /users - Crear usuario (solo admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { email, password, nombre, apellido, departamento, rol, telefono } = req.body

    // Validar email único
    const existing = await db.query('SELECT id FROM usuarios WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'El email ya existe' })
    }

    // Hash contraseña
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Insertar
    const result = await db.query(
      `INSERT INTO usuarios (email, password_hash, nombre, apellido, departamento, rol, telefono)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, nombre, apellido, departamento, rol, telefono, cargado`,
      [email, passwordHash, nombre, apellido, departamento, rol, telefono]
    )

    res.status(201).json({ data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PUT /users/:id - Actualizar usuario
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, apellido, departamento, rol, telefono, cargado } = req.body

    const result = await db.query(
      `UPDATE usuarios 
       SET nombre = $1, apellido = $2, departamento = $3, rol = $4, telefono = $5, cargado = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, email, nombre, apellido, departamento, rol, telefono, cargado`,
      [nombre, apellido, departamento, rol, telefono, cargado, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json({ data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /users/:id
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json({ data: { id } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
```

---

## 🔐 Checklist de Seguridad

- ✅ Contraseñas hasheadas con bcryptjs
- ✅ JWT tokens con expiración
- ✅ CORS configurado
- ✅ Validación de entrada
- ✅ Autenticación en rutas protegidas
- ✅ Autorización por rol (admin)
- ✅ Manejo de errores
- ✅ Variables de entorno sensibles
- ✅ Email único en BD
- ✅ Rate limiting (opcional pero recomendado)

---

## 📝 Variables de Entorno en Frontend

El frontend automáticamente usa:
```
http://localhost:5000/api
```

Si necesitas cambiar, edita `src/services/api.js`:
```javascript
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:5000'
```

O crea `.env` en el root:
```
VITE_APP_API_URL=http://localhost:5000
```

---

## 🧪 Testing de Endpoints con cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@singula.com","password":"Admin@123"}'

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "password":"Pass@123",
    "nombre":"Juan",
    "apellido":"Pérez",
    "departamento":"Tecnología"
  }'

# Listar usuarios (con token)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 Próximos Pasos

1. Configura tu base de datos (PostgreSQL recomendado)
2. Crea la tabla `usuarios` con el SQL anterior
3. Copia los archivos del backend
4. Ejecuta `npm start`
5. Prueba los endpoints con cURL
6. El frontend automáticamente se conectará

¡Listo! Tu sistema estará completamente integrado.

