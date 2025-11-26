import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Base URL configurable via env, por defecto al backend local
const BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:5192/api'

// Instancia compartida de axios para la app
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Interceptor simple para agregar Authorization desde localStorage (token)
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // noop - evitar `no-unused-vars`
    }

    return config
  },
  (error) => Promise.reject(error),
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
