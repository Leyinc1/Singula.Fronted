/**
 * Servicio para gestionar reportes
 */
import apiClient from './api'

export const reporteService = {
  /**
   * Obtiene datos del dashboard para reportes
   * @param {Object} filters - Filtros (startDate, endDate, tipoSolicitud)
   * @returns {Promise} - Promesa con los datos del dashboard
   */
  async getDashboardData(filters = {}) {
    try {
      const params = {}

      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.tipoSolicitud) params.tipoSolicitud = filters.tipoSolicitud

      const response = await apiClient.get('/Reporte/dashboard-data', { params })
      return response.data
    } catch (error) {
      console.error('Error al obtener datos de dashboard:', error)
      throw new Error(`No se pudieron cargar los datos: ${error.message}`)
    }
  },

  /**
   * Crea un nuevo reporte en el historial
   * @param {Object} reporte - Datos del reporte
   * @returns {Promise} - Promesa con el reporte creado
   */
  async createReporte(reporte) {
    try {
      const response = await apiClient.post('/Reporte', reporte)
      return response.data
    } catch (error) {
      console.error('Error al crear reporte:', error)
      throw new Error(`No se pudo crear el reporte: ${error.message}`)
    }
  },

  /**
   * Obtiene el historial de reportes
   * @returns {Promise} - Promesa con la lista de reportes
   */
  async getHistorial() {
    try {
      const response = await apiClient.get('/Reporte')
      return response.data
    } catch (error) {
      console.error('Error al obtener historial de reportes:', error)
      throw new Error(`No se pudo cargar el historial: ${error.message}`)
    }
  },

  /**
   * Obtiene un reporte por ID
   * @param {number} id - ID del reporte
   * @returns {Promise} - Promesa con el reporte
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/Reporte/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener reporte ${id}:`, error)
      throw new Error(`No se pudo cargar el reporte: ${error.message}`)
    }
  },

  /**
   * Elimina un reporte
   * @param {number} id - ID del reporte
   * @returns {Promise} - Promesa con la confirmación
   */
  async deleteReporte(id) {
    try {
      await apiClient.delete(`/Reporte/${id}`)
      return { success: true }
    } catch (error) {
      console.error(`Error al eliminar reporte ${id}:`, error)
      throw new Error(`No se pudo eliminar el reporte: ${error.message}`)
    }
  },

  /**
   * Sube un archivo PDF
   * @param {File} file - Archivo PDF
   * @returns {Promise} - Promesa con la ruta del archivo
   */
  async uploadFile(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/Reporte/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Error al subir archivo:', error)
      throw new Error(`No se pudo subir el archivo: ${error.message}`)
    }
  },
}

export default reporteService
