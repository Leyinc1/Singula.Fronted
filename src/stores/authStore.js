/**
 * Store de Pinia para gestionar la autenticación
 * Maneja: token de usuario, estado de autenticación, datos del usuario
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from 'src/services/api'
import { useSlaStore } from './slaStore'

// ========== MODO DESARROLLO - MOCK ==========
const DEV_MODE = true // Cambiar a false para usar autenticación real

const MOCK_USER = {
  id: 1,
  name: 'Administrador',
  email: 'admin@singula.com',
  role: 'Admin',
  username: 'admin',
}

// Token JWT mock válido (estructura real pero datos ficticios)
const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJlbWFpbCI6ImFkbWluQHNpbmd1bGEuY29tIiwicm9sZSI6IkFkbWluIiwiZXhwIjoxNzY0NTAwMDAwfQ.mock_signature_for_dev'
// =============================================

export const useAuthStore = defineStore('auth', () => {
  // Estado reactivo
  // Si en localStorage existe un token mock (generado por versiones antiguas), lo eliminamos
  const storedToken = localStorage.getItem('token') || null
  if (storedToken && storedToken.startsWith && storedToken.startsWith('mock-jwt-token-')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
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
  async function login(credentials) {
    // ========== MODO DESARROLLO - MOCK LOGIN ==========
    if (DEV_MODE) {
      console.log('🔓 [DEV MODE] Login mock activado')
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Aceptar cualquier credencial en modo dev
      setToken(MOCK_TOKEN)
      setUser(MOCK_USER)

      console.log('✅ [DEV MODE] Usuario autenticado:', MOCK_USER.name)
      return { token: MOCK_TOKEN, user: MOCK_USER }
    }
    // ==================================================

    // credentials: { username, password, rememberMe }
    const payload = {
      Username: credentials.username,
      Password: credentials.password,
    }

    try {
      const resp = await apiClient.post('/usuarios/authenticate', payload)
      const serverToken = resp.data?.token
      if (!serverToken) throw new Error('No se recibió token del servidor')

      // Guardar token en store y localStorage
      setToken(serverToken)

      // Intentar decodificar JWT para obtener datos del usuario
      let parsedUser = null
      try {
        const parts = serverToken.split('.')
        if (parts.length === 3) {
          const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
          const claims = JSON.parse(payloadJson)

          console.log('JWT Claims decodificados:', claims)

          // Intentar extraer ID de múltiples posibles ubicaciones
          const possibleIds = [
            claims.UserId,
            claims.userId,
            claims.sub,
            claims.User_Id,
            claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
          ]

          const extractedId = possibleIds.find((id) => id != null && id !== undefined)
          const parsedId = extractedId ? parseInt(extractedId, 10) : null

          console.log('ID extraído del JWT:', parsedId)

          parsedUser = {
            id: parsedId,
            name:
              claims.name ||
              claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
              claims.unique_name ||
              null,
            email:
              claims.email ||
              claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
              null,
            role:
              claims.role ||
              claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
              null,
          }
        }
      } catch (err) {
        console.warn('No se pudo decodificar JWT para extraer usuario:', err)
      }

      // Si obtuvimos id, solicitar al backend el usuario completo
      if (parsedUser?.id) {
        try {
          const userResp = await apiClient.get(`/usuarios/${parsedUser.id}`)
          setUser(userResp.data)
          return { token: serverToken, user: userResp.data }
        } catch (fetchErr) {
          console.warn('No se pudo obtener usuario por id:', fetchErr)
          // si falla, conservar los datos parseados
          setUser(parsedUser)
          return { token: serverToken, user: parsedUser }
        }
      }

      // Si no hay id, simplemente guardar lo parseado (o request adicional si hace falta)
      if (parsedUser) setUser(parsedUser)

      return { token: serverToken, user: parsedUser }
    } catch (err) {
      // Propagar mensaje amigable
      const message = err.response?.data?.message || err.message || 'Error al autenticar'
      throw new Error(message)
    }
  }

  function logout() {
    token.value = null
    user.value = null

    // Limpiar localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Resetear estado de reportes al cerrar sesión
    const slaStore = useSlaStore()
    slaStore.resetReportsInitialization()
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
