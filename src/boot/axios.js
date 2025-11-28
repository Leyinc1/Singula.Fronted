import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Configuración de URL:
// Usamos la variable de entorno si existe.
// Si no, usamos localhost:5000 que coincide con el puerto HTTP definido en Program.cs
const BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api'

// Instancia de axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // Nota: No usamos 'withCredentials: true' porque el backend usa JWT Bearer y CORS AllowAnyOrigin,
  // lo cual suele ser incompatible con credenciales (cookies) en navegadores modernos.
})

// Interceptor para inyectar el Token JWT
// Necesario para que funcione con el 'AddJwtBearer' del backend
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Evitar errores si localStorage no es accesible
    }

    return config
  },
  (error) => Promise.reject(error),
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

// Exportar api para uso en otros módulos
export { api }