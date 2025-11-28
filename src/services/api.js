import axios from 'axios'
import { useAuthStore } from 'src/stores/authStore'

// URL base del backend - ajustar según el entorno
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api'


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

