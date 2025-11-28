/**
 * Servicio de Autenticación
 * Maneja login, registro y operaciones de usuario
 */
import apiClient from './api'

/**
 * Login con email y contraseña
 */
export async function login(email, password) {
  try {
    // FORMATO ACTUALIZADO: Backend ahora usa Correo en lugar de Username
    const loginData = {
      Correo: email,    // ✅ CORRECTO: Correo es el campo requerido
      Password: password
    }

    console.log('🔍 DEBUG FRONTEND vs POSTMAN:')
    console.log('- URL:', 'http://localhost:5000/api/Usuarios/authenticate')
    console.log('- Method: POST')
    console.log('- Headers:', {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
    console.log('- Body:', JSON.stringify(loginData))
    console.log('- Credentials:', { Correo: email, Password: '[HIDDEN]' })
    console.log('- Body size:', new Blob([JSON.stringify(loginData)]).size, 'bytes')
    
    const response = await apiClient.post('/Usuarios/authenticate', loginData)

    console.log('✅ Login exitoso:', response.data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }

    return response.data
  } catch (error) {
    console.error('=== ERROR FRONTEND vs POSTMAN ===')
    console.error('Frontend Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    })
    
    if (error.response?.data?.title) {
      console.error('🔴 Error title:', error.response.data.title)
    }
    
    throw error.response?.data || { message: 'Error al iniciar sesión' }
  }
}

/**
 * Registro de nuevo usuario
 */
export async function register(userData) {
  try {
    const response = await apiClient.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      nombre: userData.nombre,
      apellido: userData.apellido,
      departamento: userData.departamento,
      rol: userData.rol || 'user',
      telefono: userData.telefono || null,
      cargado: userData.cargado || false,
    })

    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }

    return response.data
  } catch (error) {
    console.error('Error en registro:', error)
    throw error.response?.data || { message: 'Error al registrarse' }
  }
}

/**
 * Logout
 */
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  return Promise.resolve()
}

/**
 * Obtener perfil del usuario actual
 */
export async function getCurrentUser() {
  try {
    console.log('🔍 Obteniendo perfil del usuario...')
    const response = await apiClient.get('/Usuarios/profile/me')
    console.log('✅ Perfil obtenido:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error.response?.data || error)
    throw error.response?.data || { message: 'Error al obtener perfil' }
  }
}

/**
 * Actualizar perfil del usuario
 */
export async function updateProfile(userData) {
  try {
    // Formatear datos según el DTO del backend
    const profileData = {
      NombreCompleto: userData.name || userData.NombreCompleto,
      Telefono: userData.phone || userData.Telefono || null,
      Biografia: userData.bio || userData.Biografia || null
    }
    
    console.log('Actualizando perfil:', profileData)
    const response = await apiClient.put('/Usuarios/profile', profileData)
    
    // Actualizar localStorage
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    
    return response.data
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    throw error.response?.data || { message: 'Error al actualizar perfil' }
  }
}

/**
 * Cambiar contraseña
 */
export async function changePassword(currentPassword, newPassword, confirmPassword = null) {
  try {
    // Formatear datos según el DTO del backend
    const passwordData = {
      ContrasenaActual: currentPassword,
      NuevaContrasena: newPassword,
      ConfirmarContrasena: confirmPassword || newPassword
    }
    
    console.log('Cambiando contraseña...')
    const response = await apiClient.post('/Usuarios/password', passwordData)
    return response.data
  } catch (error) {
    console.error('Error cambiando contraseña:', error)
    throw error.response?.data || { message: 'Error al cambiar contraseña' }
  }
}

/**
 * Obtener lista de usuarios (admin)
 */
export async function getUsers(filters = {}) {
  try {
    const params = new URLSearchParams(filters)
    const response = await apiClient.get(`/users?${params}`)
    return response.data
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    throw error.response?.data || { message: 'Error al obtener usuarios' }
  }
}

/**
 * Crear nuevo usuario (admin)
 */
export async function createUser(userData) {
  try {
    const response = await apiClient.post('/users', {
      email: userData.email,
      password: userData.password,
      nombre: userData.nombre,
      apellido: userData.apellido,
      departamento: userData.departamento,
      rol: userData.rol || 'user',
      telefono: userData.telefono || null,
      cargado: userData.cargado || false,
    })
    return response.data
  } catch (error) {
    console.error('Error creando usuario:', error)
    throw error.response?.data || { message: 'Error al crear usuario' }
  }
}

/**
 * Actualizar usuario (admin)
 */
export async function updateUser(userId, userData) {
  try {
    const response = await apiClient.put(`/users/${userId}`, userData)
    return response.data
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    throw error.response?.data || { message: 'Error al actualizar usuario' }
  }
}

/**
 * Eliminar usuario (admin)
 */
export async function deleteUser(userId) {
  try {
    const response = await apiClient.delete(`/users/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    throw error.response?.data || { message: 'Error al eliminar usuario' }
  }
}

/**
 * Obtener un usuario por ID
 */
export async function getUserById(userId) {
  try {
    const response = await apiClient.get(`/users/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    throw error.response?.data || { message: 'Error al obtener usuario' }
  }
}

/**
 * Validar si email existe
 */
export async function validateEmail(email) {
  try {
    const response = await apiClient.post('/auth/validate-email', {
      email,
    })
    return response.data
  } catch (error) {
    console.error('Error validando email:', error)
    throw error.response?.data || { message: 'Error al validar email' }
  }
}

/**
 * Solicitar recuperación de contraseña
 */
export async function requestPasswordReset(email) {
  try {
    const response = await apiClient.post('/auth/request-password-reset', {
      email,
    })
    return response.data
  } catch (error) {
    console.error('Error solicitando reset:', error)
    throw error.response?.data || { message: 'Error al solicitar reset de contraseña' }
  }
}

/**
 * Restablecer contraseña con token
 */
export async function resetPassword(token, newPassword) {
  try {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    })
    return response.data
  } catch (error) {
    console.error('Error restableciendo contraseña:', error)
    throw error.response?.data || { message: 'Error al restablecer contraseña' }
  }
}
