/**
 * Servicio para gestionar las operaciones relacionadas con SLA
 * Incluye: obtener datos SLA, subir archivos Excel, obtener predicciones
 */
import apiClient from './api'

// Nota: se removió el generador de datos mock para evitar uso accidental en producción.

export const slaService = {
  /**
   * Obtener datos SLA con filtros opcionales
   * @param {Object} filters - Filtros para la consulta (startDate, endDate, bloqueTech, etc.)
   * @returns {Promise} - Promesa con los datos SLA
   */
  async getSlaData(filters = {}) {
    try {
      const params = {}

      // El backend (DashboardController) espera parámetros en camelCase: startDate, endDate, tipoSolicitud, prioridad, cumpleSla
      // NOTA: bloqueTech se filtra localmente en el store (no se envía al backend) para permitir selección múltiple
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      // NO enviar bloqueTech al backend - se filtra localmente
      // if (filters.bloqueTech) params.bloqueTech = filters.bloqueTech
      if (filters.tipoSolicitud) params.tipoSolicitud = filters.tipoSolicitud
      if (filters.prioridad) params.prioridad = filters.prioridad
      if (typeof filters.cumpleSla !== 'undefined' && filters.cumpleSla !== null) {
        // cumples: 'cumple' => true, 'no_cumple' => false
        if (filters.cumpleSla === 'cumple') params.cumpleSla = true
        else if (filters.cumpleSla === 'no_cumple') params.cumpleSla = false
      }

      const response = await apiClient.get('/dashboard/sla/data', { params })
      return response.data
    } catch (error) {
      console.error('Error al obtener datos SLA del servidor:', error)
      // NO usar datos mock: lanzar el error para que el usuario lo vea
      throw new Error(`No se pudieron cargar los datos de la base de datos: ${error.message}. Por favor, verifica que el servidor está en ejecución.`)
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
      const response = await apiClient.post('/sla/manual', solicitud)
      return response.data
    } catch (error) {
      console.error('Error al crear solicitud manual:', error)

      // Para desarrollo, simular creación exitosa
      return {
        success: true,
        data: {
          id: Date.now(),
          ...solicitud,
        },
        message: 'Solicitud creada exitosamente (mock)',
      }
    }
  },

  /**
   * Obtener predicción de cumplimiento SLA
   * @returns {Promise} - Promesa con datos de predicción
   */
  async getPrediction() {
    try {
      const response = await apiClient.get('/sla/prediction')
      return response.data
    } catch (error) {
      console.error('Error al obtener predicción:', error)

      // Retornar datos mock en caso de error
      return {
        data: {
          sla1_prediction: 78.5,
          sla2_prediction: 85.3,
          trend: 'mejorando',
          confidence: 0.87,
        },
      }
    }
  },

  /**
   * Obtener estadísticas generales
   * @returns {Promise} - Promesa con estadísticas
   */
  async getStatistics() {
    try {
      const response = await apiClient.get('/sla/statistics')
      return response.data
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)

      // Retornar datos mock
      return {
        data: {
          total_solicitudes: 156,
          cumplimiento_sla1: 82.5,
          cumplimiento_sla2: 88.7,
          promedio_dias_sla1: 28.3,
          promedio_dias_sla2: 16.8,
        },
      }
    }
  },

  /**
   * Obtener datos de dashboard específicos para reportes
   * Filtra por fecha de INGRESO y permite múltiples bloques tech (filtrado en frontend)
   * @param {Object} filters - Filtros para reportes (startDate, endDate, tipoSolicitud)
   * @returns {Promise} - Promesa con los datos SLA
   */
  async getDashboardDataForReports(filters = {}) {
    try {
      const params = {}

      // Enviar fechas y tipo de solicitud al backend
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.tipoSolicitud) params.tipoSolicitud = filters.tipoSolicitud

      // NO enviar bloqueTech - se filtra en frontend para permitir múltiples selecciones
      const response = await apiClient.get('/Reporte/dashboard-data', { params })
      return response.data
    } catch (error) {
      console.error('Error al obtener datos de dashboard para reportes:', error)
      throw new Error(`No se pudieron cargar los datos: ${error.message}`)
    }
  },
}
