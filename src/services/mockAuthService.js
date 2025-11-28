/**
 * Servicio Mock de Autenticación
 * ⚠️ ESTE ARCHIVO ES PARA DESARROLLO/TESTING SOLAMENTE
 * Reemplaza este archivo con llamadas reales cuando el backend esté listo
 * 
 * Para usar este mock:
 * 1. Importa desde './mockAuthService' en lugar de './authService'
 * 2. O habilita el mock en api.js mediante interceptor
 */

// Base de datos en memoria (simulate)
let mockDatabase = {
  users: [
    {
      id: 1,
      email: 'admin@singula.com',
      password: 'Admin@123',
      nombre: 'Admin',
      apellido: 'Usuario',
      departamento: 'Administración',
      rol: 'admin',
      telefono: '+34 123 456 789',
      cargado: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      email: 'user@singula.com',
      password: 'User@123',
      nombre: 'Usuario',
      apellido: 'Regular',
      departamento: 'Tecnología',
      rol: 'user',
      telefono: '+34 987 654 321',
      cargado: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  nextId: 3,
}

/**
 * Simular delay de red
 */
function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Login con email y contraseña (MOCK)
 */
export async function login(email, password) {
  await delay(800)

  const user = mockDatabase.users.find(
    (u) => u.email === email && u.password === password,
  )

  if (!user) {
    const error = new Error('Credenciales inválidas')
    error.response = {
      status: 401,
      data: { message: 'Credenciales inválidas' },
    }
    throw error
  }

  // Generar token mock
  const token = btoa(
    JSON.stringify({
      id: user.id,
      email: user.email,
      rol: user.rol,
      timestamp: Date.now(),
    }),
  )

  // eslint-disable-next-line no-unused-vars
  const { password: _, ...userWithoutPassword } = user

  return {
    token,
    user: userWithoutPassword,
  }
}

/**
 * Registro de nuevo usuario (MOCK)
 */
export async function register(userData) {
  await delay(800)

  // Validar que el email no exista
  if (mockDatabase.users.some((u) => u.email === userData.email)) {
    const error = new Error('El email ya está registrado')
    error.response = {
      status: 400,
      data: { message: 'El email ya está registrado' },
    }
    throw error
  }

  // Crear nuevo usuario
  const newUser = {
    id: mockDatabase.nextId++,
    email: userData.email,
    password: userData.password,
    nombre: userData.nombre,
    apellido: userData.apellido,
    departamento: userData.departamento,
    rol: userData.rol || 'user',
    telefono: userData.telefono || null,
    cargado: userData.cargado !== false,
    created_at: new Date(),
    updated_at: new Date(),
  }

  mockDatabase.users.push(newUser)

  // Generar token mock
  const token = btoa(
    JSON.stringify({
      id: newUser.id,
      email: newUser.email,
      rol: newUser.rol,
      timestamp: Date.now(),
    }),
  )

  // eslint-disable-next-line no-unused-vars
  const { password: _, ...userWithoutPassword } = newUser

  return {
    token,
    user: userWithoutPassword,
  }
}

/**
 * Logout (MOCK)
 */
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  return Promise.resolve()
}

/**
 * Obtener perfil del usuario actual (MOCK)
 */
export async function getCurrentUser() {
  await delay(300)

  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No authenticated')
  }

  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

/**
 * Actualizar perfil del usuario (MOCK)
 */
export async function updateProfile(userData) {
  await delay(500)

  const userStr = localStorage.getItem('user')
  if (!userStr) throw new Error('No authenticated')

  const user = JSON.parse(userStr)
  const updated = { ...user, ...userData, updated_at: new Date() }

  // Actualizar en la BD mock
  const index = mockDatabase.users.findIndex((u) => u.id === user.id)
  if (index !== -1) {
    mockDatabase.users[index] = { ...mockDatabase.users[index], ...updated }
  }

  localStorage.setItem('user', JSON.stringify(updated))
  return updated
}

/**
 * Cambiar contraseña (MOCK)
 */
export async function changePassword(currentPassword, newPassword) {
  await delay(500)

  const userStr = localStorage.getItem('user')
  if (!userStr) throw new Error('No authenticated')

  const user = JSON.parse(userStr)
  const dbUser = mockDatabase.users.find((u) => u.id === user.id)

  if (!dbUser || dbUser.password !== currentPassword) {
    const error = new Error('Contraseña actual incorrecta')
    error.response = {
      status: 401,
      data: { message: 'Contraseña actual incorrecta' },
    }
    throw error
  }

  dbUser.password = newPassword
  dbUser.updated_at = new Date()

  return { message: 'Contraseña actualizada correctamente' }
}

/**
 * Obtener lista de usuarios (admin) (MOCK)
 */
export async function getUsers(filters = {}) {
  await delay(300)

  // eslint-disable-next-line no-unused-vars
  let users = mockDatabase.users.map(({ password, ...user }) => user)

  // Aplicar filtros
  if (filters.search) {
    const search = filters.search.toLowerCase()
    users = users.filter(
      (u) =>
        u.email.toLowerCase().includes(search) ||
        u.nombre.toLowerCase().includes(search) ||
        u.apellido.toLowerCase().includes(search),
    )
  }

  if (filters.departamento) {
    users = users.filter((u) => u.departamento === filters.departamento)
  }

  if (filters.rol) {
    users = users.filter((u) => u.rol === filters.rol)
  }

  return {
    data: users,
    total: users.length,
  }
}

/**
 * Crear nuevo usuario (admin) (MOCK)
 */
export async function createUser(userData) {
  await delay(500)

  if (mockDatabase.users.some((u) => u.email === userData.email)) {
    throw new Error('El email ya existe')
  }

  const newUser = {
    id: mockDatabase.nextId++,
    ...userData,
    created_at: new Date(),
    updated_at: new Date(),
  }

  mockDatabase.users.push(newUser)

  // eslint-disable-next-line no-unused-vars
  const { password, ...userWithoutPassword } = newUser

  return {
    data: userWithoutPassword,
  }
}

/**
 * Actualizar usuario (admin) (MOCK)
 */
export async function updateUser(userId, userData) {
  await delay(500)

  const index = mockDatabase.users.findIndex((u) => u.id === userId)

  if (index === -1) {
    throw new Error('Usuario no encontrado')
  }

  mockDatabase.users[index] = {
    ...mockDatabase.users[index],
    ...userData,
    updated_at: new Date(),
  }

  // eslint-disable-next-line no-unused-vars
  const { password, ...userWithoutPassword } = mockDatabase.users[index]

  return {
    data: userWithoutPassword,
  }
}

/**
 * Eliminar usuario (admin) (MOCK)
 */
export async function deleteUser(userId) {
  await delay(500)

  const index = mockDatabase.users.findIndex((u) => u.id === userId)

  if (index === -1) {
    throw new Error('Usuario no encontrado')
  }

  const deleted = mockDatabase.users.splice(index, 1)[0]
  // eslint-disable-next-line no-unused-vars
  const { password, ...userWithoutPassword } = deleted

  return {
    data: userWithoutPassword,
  }
}

/**
 * Obtener un usuario por ID (MOCK)
 */
export async function getUserById(userId) {
  await delay(300)

  const user = mockDatabase.users.find((u) => u.id === userId)

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  // eslint-disable-next-line no-unused-vars
  const { password, ...userWithoutPassword } = user

  return {
    data: userWithoutPassword,
  }
}

/**
 * Validar si email existe (MOCK)
 */
export async function validateEmail(email) {
  await delay(300)

  const exists = mockDatabase.users.some((u) => u.email === email)

  return {
    exists,
  }
}

/**
 * Solicitar recuperación de contraseña (MOCK)
 */
export async function requestPasswordReset(email) {
  await delay(800)

  const user = mockDatabase.users.find((u) => u.email === email)

  if (!user) {
    throw new Error('Email no encontrado')
  }

  return {
    message: 'Correo de recuperación enviado',
    resetToken: btoa(email + Date.now()),
  }
}

/**
 * Restablecer contraseña con token (MOCK)
 */
// eslint-disable-next-line no-unused-vars
export async function resetPassword(token, newPassword) {
  await delay(500)

  if (!token) {
    throw new Error('Token inválido')
  }

  return {
    message: 'Contraseña restablecida correctamente',
  }
}

/**
 * Obtener datos de la BD mock (SOLO PARA TESTING)
 */
export function getMockDatabase() {
  return {
    // eslint-disable-next-line no-unused-vars
    users: mockDatabase.users.map(({ password, ...user }) => user),
  }
}
