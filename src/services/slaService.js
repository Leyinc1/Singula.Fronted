/**
 * Servicio para gestionar las operaciones relacionadas con SLA
 * Incluye: obtener datos SLA, subir archivos Excel, obtener predicciones
 */
import apiClient from './api'

// ============================================
// GENERADOR DE DATOS MOCK ESCALABLE
// ============================================
function generateMockData() {
  const bloques = ['Backend', 'Frontend', 'QA', 'Mobile', 'DevOps', 'Data']

  const prioridades = ['Crítica', 'Alta', 'Media', 'Baja']
  const tiposSolicitud = ['Nuevo Personal', 'Reemplazo']
  const nombres = [
    'Juan Pérez',
    'María García',
    'Carlos López',
    'Ana Martínez',
    'Pedro Sánchez',
    'Laura Rodríguez',
    'Roberto González',
    'Sofia Hernández',
    'Diego Ramírez',
    'Valentina Torres',
    'Camila Vargas',
    'Andrés Morales',
    'Isabella Cruz',
    'Santiago Ruiz',
    'Lucía Fernández',
    'Mateo Jiménez',
    'Martina Castro',
    'Sebastián Ortiz',
    'Valeria Romero',
    'Daniel Navarro',
    'Emma Silva',
    'Lucas Medina',
    'Mia Herrera',
    'Gabriel Vega',
    'Victoria Ramos',
  ]

  const mockData = []
  let id = 1

  // Generar 70 registros (5 por cada uno de los 14 bloques)
  for (let i = 0; i < 70; i++) {
    const bloqueAleatorio = bloques[Math.floor(Math.random() * bloques.length)]
    const tipoSolicitud = tiposSolicitud[Math.floor(Math.random() * tiposSolicitud.length)]
    const prioridad = prioridades[Math.floor(Math.random() * prioridades.length)]
    const nombreAleatorio = nombres[Math.floor(Math.random() * nombres.length)]

    // Generar fechas aleatorias en los últimos 4 meses
    const fechaSolicitud = new Date(
      2025,
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 28) + 1,
    )
    const diasTranscurridos = Math.floor(Math.random() * 50) + 5
    const fechaIngreso = new Date(fechaSolicitud)
    fechaIngreso.setDate(fechaIngreso.getDate() + diasTranscurridos)

    // Determinar cumplimiento de SLA basado en tipo y días
    const sla1 = 35 // Nuevo Personal
    const sla2 = 20 // Reemplazo

    const cumple_sla1 = tipoSolicitud === 'Nuevo Personal' ? diasTranscurridos <= sla1 : null
    const cumple_sla2 = tipoSolicitud === 'Reemplazo' ? diasTranscurridos <= sla2 : null

    mockData.push({
      id: id++,
      bloque_tech: bloqueAleatorio, // Bloque tecnológico: "Backend", "Frontend", "QA", etc.
      tipo_solicitud: tipoSolicitud,
      prioridad: prioridad,
      fecha_solicitud: fechaSolicitud.toISOString().split('T')[0],
      fecha_ingreso: fechaIngreso.toISOString().split('T')[0],
      dias_transcurridos: diasTranscurridos,
      cumple_sla1: cumple_sla1,
      cumple_sla2: cumple_sla2,
      nombre_personal: nombreAleatorio,
    })
  }

  return mockData
}

export const slaService = {
  /**
   * Obtener datos SLA con filtros opcionales
   * @param {Object} filters - Filtros para la consulta (startDate, endDate, bloqueTech, etc.)
   * @returns {Promise} - Promesa con los datos SLA
   */
  async getSlaData(filters = {}) {
    try {
      const params = {}

      if (filters.startDate) params.start_date = filters.startDate
      if (filters.endDate) params.end_date = filters.endDate
      if (filters.bloqueTech) params.bloque_tech = filters.bloqueTech
      if (filters.tipoSolicitud) params.tipo_solicitud = filters.tipoSolicitud

      const response = await apiClient.get('/sla/data', { params })
      return response.data
    } catch (error) {
      console.error('Error al obtener datos SLA:', error)

      // Retornar datos mock en caso de error (para desarrollo)
      return {
        data: generateMockData(),
      }
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
}
