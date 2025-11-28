import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Conectamos con el Backend .NET
// Usa variable de entorno o el puerto por defecto (7002)
const baseURL = process.env.VUE_APP_API_URL || 'https://localhost:7002/api'

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

// Exportar api para que otros módulos puedan importarlo
export { api }
