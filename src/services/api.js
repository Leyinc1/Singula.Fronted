/**
 * Instancia central de Axios
 * Configura interceptores y base URL para todas las peticiones API
 */
import axios from 'axios'
import { useAuthStore } from 'src/stores/authStore'

// URL base del backend - FORZAR http://localhost:5000/api
const API_BASE_URL = 'http://localhost:5000/api'

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Interceptor para agregar el token a cada petición
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()

    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejar errores comunes
    if (error.response) {
      switch (error.response.status) {
        case 401: {
          // Solo redirigir si NO es una petición de login
          const isLoginRequest = error.config?.url?.includes('/authenticate')
          
          if (!isLoginRequest) {
            // Token expirado o inválido (pero NO durante login)
            const authStore = useAuthStore()
            authStore.logout()
            window.location.href = '/#/login'
          }
          // Si es login request, dejar que el error llegue al componente
          break
        }
        case 403:
          console.error('Acceso prohibido')
          break
        case 404:
          console.error('Recurso no encontrado')
          break
        case 500:
          console.error('Error interno del servidor')
          break
        default:
          console.error('Error en la petición:', error.response.status)
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor')
    } else {
      console.error('Error al configurar la petición:', error.message)
    }

    return Promise.reject(error)
  },
)

export default apiClient

