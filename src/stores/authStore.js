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
  const userName = computed(() => user.value?.nombreCompleto || user.value?.nombre || user.value?.name || 'Usuario')
  const userEmail = computed(() => user.value?.correo || user.value?.email || '')
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

  async function updateProfile(userData) {
    loading.value = true
    try {
      const result = await authService.updateProfile(userData)
      user.value = { ...user.value, ...result }
      localStorage.setItem('user', JSON.stringify(user.value))
      return result
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      const result = await authService.changePassword(currentPassword, newPassword, confirmPassword)
      return result
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
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
    updateProfile,
    changePassword,
    setToken,
    setUser,
  }
})
