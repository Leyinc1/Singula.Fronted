import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// ⚠️ IMPORTANTE: Aquí conectamos con tu Backend
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export { api }

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})
