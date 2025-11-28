import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// ⚠️ IMPORTANTE: Aquí conectamos con tu Backend .NET
// Asegúrate de que el puerto (7002) sea el mismo que sale en tu navegador cuando corres .NET
const api = axios.create({ baseURL: 'https://localhost:7002/api' })

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
