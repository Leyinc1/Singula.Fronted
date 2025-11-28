import axios from 'axios'
import { useAuthStore } from 'src/stores/authStore'

// URL base del backend - ajustar según el entorno
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api'

// ========== MODO DESARROLLO ==========
const DEV_MODE = true // Cambiar a false para producción
// =====================================

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  // withCredentials: false para evitar conflictos CORS con AllowAnyOrigin
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Attach token from auth store (accessing inside interceptor to avoid SSR issues)
apiClient.interceptors.request.use(
  (config) => {
    try {
      const authStore = useAuthStore()
      const token = authStore?.token || localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      // pinia may not be initialized in some contexts; fallback to localStorage
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        // En modo desarrollo, solo loguear el 401 sin hacer logout automático
        if (DEV_MODE) {
          console.warn('⚠️ [DEV MODE] 401 Unauthorized - endpoint:', error.config?.url)
          // No hacer logout ni redirigir en modo dev
        } else {
          try {
            const authStore = useAuthStore()
            if (authStore?.logout) authStore.logout()
          } catch (err) {
            console.warn('Auth store logout failed', err)
          }
          // redirect to login
          window.location.href = '/#/login'
        }
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor')
    } else {
      console.error('Error al configurar la petición:', error.message)
    }

    if (!error.response) {
      error.message = 'No se recibió respuesta del servidor'
    }

    return Promise.reject(error)
  },
)

export default apiClient
