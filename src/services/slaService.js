/**
 * Servicio para gestionar las operaciones relacionadas con SLA
 * Incluye: obtener datos SLA, subir archivos Excel, obtener predicciones
 */
import apiClient from './api'

export const slaService = {
  /**
   * Obtener datos SLA con filtros opcionales
   * @param {Object} filters - Filtros para la consulta (startDate, endDate, bloqueTech, etc.)
   * @returns {Promise} - Promesa con los datos SLA
   */
  async getSlaData(filters = {}) {
    try {
      const params = {}

      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.bloqueTech) params.bloqueTech = filters.bloqueTech
      if (filters.tipoSolicitud) params.tipoSolicitud = filters.tipoSolicitud
      if (filters.prioridad) params.prioridad = filters.prioridad
      if (filters.cumpleSla !== undefined) params.cumpleSla = filters.cumpleSla

      const response = await apiClient.get('/dashboard/sla/data', { params })
      return response.data
    } catch (error) {
      console.error('Error al obtener datos SLA:', error)
      throw error
    }
  },

  /**
   * Subir archivo Excel con datos SLA
   * @param {File} file - Archivo Excel a subir
   * @returns {Promise} - Promesa con la respuesta del servidor
   */
  async uploadExcel(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/api/sla/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      console.error('Error al subir archivo Excel:', error)
      throw error
    }
  },

  /**
   * Crear solicitud manual de SLA
   * @param {Object} solicitud - Datos de la solicitud
   * @returns {Promise} - Promesa con la respuesta del servidor
   */
  async createManualEntry(solicitud) {
    try {
      const response = await apiClient.post('/api/sla/manual', solicitud)
      return response.data
    } catch (error) {
      console.error('Error al crear solicitud manual:', error)
      throw error
    }
  },

  /**
   * Obtener predicción de cumplimiento SLA (Calculado en cliente)
   * @returns {Promise} - Promesa con datos de predicción
   */
  async getPrediction() {
    try {
      // 1. Obtener datos históricos (últimos 6 meses)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 6)

      const response = await this.getSlaData({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })

      const data = response.data || []

      if (data.length === 0) {
        return {
          sla1_prediction: 0,
          sla2_prediction: 0,
          trend: 'neutral',
          confidence: 0,
          history: [],
        }
      }

      // 2. Calcular cumplimiento mensual
      const monthlyStats = {}

      data.forEach((item) => {
        const date = new Date(item.fechaSolicitud)
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`

        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = {
            total: 0,
            sla1_ok: 0,
            sla2_ok: 0,
          }
        }

        monthlyStats[monthKey].total++
        if (item.cumpleSla1) monthlyStats[monthKey].sla1_ok++
        if (item.cumpleSla2) monthlyStats[monthKey].sla2_ok++
      })

      // 3. Preparar datos para regresión
      const months = Object.keys(monthlyStats).sort()
      const x = months.map((_, i) => i) // 0, 1, 2...
      const y1 = months.map((m) => (monthlyStats[m].sla1_ok / monthlyStats[m].total) * 100)
      const y2 = months.map((m) => (monthlyStats[m].sla2_ok / monthlyStats[m].total) * 100)

      // 4. Regresión Lineal Simple
      const predictNext = (xValues, yValues) => {
        const n = xValues.length
        if (n < 2) return yValues[n - 1] || 0

        const sumX = xValues.reduce((a, b) => a + b, 0)
        const sumY = yValues.reduce((a, b) => a + b, 0)
        const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0)
        const sumXX = xValues.reduce((a, b) => a + b * b, 0)

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
        const intercept = (sumY - slope * sumX) / n

        return slope * n + intercept // Predicción para el siguiente mes (x = n)
      }

      const predSla1 = predictNext(x, y1)
      const predSla2 = predictNext(x, y2)

      // Calcular tendencia general (pendiente de SLA1)
      const n = x.length
      const sumX = x.reduce((a, b) => a + b, 0)
      const sumY = y1.reduce((a, b) => a + b, 0)
      const sumXY = x.reduce((a, b, i) => a + b * y1[i], 0)
      const sumXX = x.reduce((a, b) => a + b * b, 0)
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)

      let trend = 'estable'
      if (slope > 1) trend = 'mejorando'
      if (slope < -1) trend = 'empeorando'

      return {
        sla1_prediction: Math.min(100, Math.max(0, predSla1)),
        sla2_prediction: Math.min(100, Math.max(0, predSla2)),
        trend: trend,
        confidence: Math.min(0.95, 0.5 + data.length / 200), // Confianza basada en volumen de datos
        history: months.map((m, i) => ({
          month: m,
          sla1: y1[i],
          sla2: y2[i],
        })),
      }
    } catch (error) {
      console.error('Error al obtener predicción:', error)
      throw error
    }
  },

  /**
   * Obtener estadísticas generales
   * @returns {Promise} - Promesa con estadísticas
   */
  async getStatistics() {
    try {
      const response = await apiClient.get('/dashboard/sla/statistics')
      return response.data
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      throw error
    }
  },
}
