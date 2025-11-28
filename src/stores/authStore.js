/**
 * Store de Pinia para gestionar la autenticación
 * Maneja: token de usuario, estado de autenticación, datos del usuario
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authService from 'src/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // Estado reactivo
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)
  const loading = ref(false)

  // Inicializar user desde localStorage si existe
  try {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  } catch (e) {
    console.error('Error parsing user from localStorage:', e)
    localStorage.removeItem('user')
  }

  // Computados
  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => {
    if (user.value?.nombreCompleto) return user.value.nombreCompleto
    if (user.value?.nombres && user.value?.apellidos) return `${user.value.nombres} ${user.value.apellidos}`
    if (user.value?.username) return user.value.username
    return 'Usuario'
  })
  const userEmail = computed(() => user.value?.correo || '')
  const userRole = computed(() => user.value?.rol || 'user')

  // Acciones
  async function login(credentials) {
    loading.value = true
    try {
      // Asegurar que las credenciales tengan el formato correcto
      const email = credentials.correo || credentials.email
      const password = credentials.password
      
      if (!email || !password) {
        throw new Error('Correo y contraseña son requeridos')
      }

      const result = await authService.login(email, password)
      token.value = result.token
      user.value = result.user
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      return result
    } catch (error) {
      // No hacer logout automático en errores de credenciales
      if (error.status !== 401) {
        logout()
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    try {
      const result = await authService.register(userData)
      token.value = result.token
      user.value = result.user
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      return result
    } catch (error) {
      logout()
      throw error
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await authService.logout()
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      loading.value = false
    }
  }

  async function getCurrentUser() {
    loading.value = true
    try {
      const result = await authService.getCurrentUser()
      user.value = result
      localStorage.setItem('user', JSON.stringify(result))
      return result
    } catch (error) {
      console.error('Error getting current user:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateUserProfile(userData) {
    loading.value = true
    try {
      console.log('📝 Actualizando perfil en BD:', userData)
      const result = await authService.updateProfile(userData)
      console.log('✅ Perfil actualizado en BD:', result)
      
      // Actualizar el user completo manteniendo los datos existentes
      user.value = { 
        ...user.value, 
        ...result,
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        correo: userData.correo,
        documento: userData.documento,
        nombreCompleto: `${userData.nombres || ''} ${userData.apellidos || ''}`.trim()
      }
      localStorage.setItem('user', JSON.stringify(user.value))
      console.log('💾 Usuario actualizado en localStorage:', user.value)
      return result
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function changeUserPassword(currentPassword, newPassword, confirmPassword) {
    loading.value = true
    try {
      console.log('🔐 Cambiando contraseña en BD...')
      const result = await authService.changePassword(currentPassword, newPassword, confirmPassword)
      console.log('✅ Contraseña actualizada en BD')
      return result
    } catch (error) {
      console.error('❌ Error changing password:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function loadUserProfile() {
    loading.value = true
    try {
      const result = await authService.getCurrentUser()
      user.value = result
      localStorage.setItem('user', JSON.stringify(result))
      return result
    } catch (error) {
      console.error('Error loading profile:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUser(newUser) {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  return {
    // Estado
    token,
    user,
    loading,

    // Computados
    isAuthenticated,
    userName,
    userEmail,
    userRole,

    // Acciones
    login,
    register,
    logout,
    getCurrentUser,
    updateUserProfile,
    changeUserPassword,
    loadUserProfile,
    setToken,
    setUser,
  }
})
