import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

<<<<<<< HEAD
// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
=======
// ⚠️ IMPORTANTE: Aquí conectamos con tu Backend .NET
// Asegúrate de que el puerto (7002) sea el mismo que sale en tu navegador cuando corres .NET
const api = axios.create({ baseURL: 'https://localhost:7002/api' })
>>>>>>> notificacionesMejora/incumplimiento-riesgo

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})
