/**
 * Store de Pinia para gestionar la autenticación
 * Maneja: token de usuario, estado de autenticación, datos del usuario
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Estado reactivo
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)

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
  const userName = computed(() => user.value?.name || 'Usuario')

  // Acciones
  function login(credentials) {
    // Simulación de login (en producción, llamar al backend)
    // Por ahora, guardamos datos mock
    const mockToken = 'mock-jwt-token-' + Date.now()
    const mockUser = {
      id: 1,
      name: credentials.username || 'Admin',
      email: credentials.email || 'admin@tcs.com',
      role: 'admin',
    }

    token.value = mockToken
    user.value = mockUser

    // Guardar en localStorage
    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))

    return Promise.resolve({ token: mockToken, user: mockUser })
  }

  function logout() {
    token.value = null
    user.value = null

    // Limpiar localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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

    // Computados
    isAuthenticated,
    userName,

    // Acciones
    login,
    logout,
    setToken,
    setUser,
  }
})
