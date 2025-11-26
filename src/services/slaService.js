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

      const response = await apiClient.post('/sla/upload', formData, {
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
      const response = await apiClient.post('/solicitud', solicitud)
      return response.data
    } catch (error) {
      console.error('Error al crear solicitud manual:', error)
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

  /**
   * Obtener filtros disponibles dinámicamente
   * @returns {Promise} - Promesa con filtros disponibles
   */
  async getAvailableFilters() {
    try {
      const response = await apiClient.get('/dashboard/filters')
      return response.data
    } catch (error) {
      console.error('Error al obtener filtros disponibles:', error)
      throw error
    }
  },
}
