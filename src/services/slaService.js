/**
 * Servicio para gestionar las operaciones relacionadas con SLA
 * Incluye: obtener datos SLA, subir archivos Excel, obtener predicciones
 */
import apiClient from './api'
import reporteService from './reporteService'

// ==================== DATOS MOCKEADOS ====================
// Conservados de master porque createManualEntry los utiliza
// TODO: Remover cuando la autenticación esté implementada
const MOCK_AREAS = [
  { idArea: 1, nombreArea: 'Backend', descripcion: 'Desarrollo Backend', activo: true },
  { idArea: 2, nombreArea: 'Frontend', descripcion: 'Desarrollo Frontend', activo: true },
  { idArea: 3, nombreArea: 'QA', descripcion: 'Quality Assurance', activo: true },
  { idArea: 4, nombreArea: 'Mobile', descripcion: 'Desarrollo Móvil', activo: true },
  { idArea: 5, nombreArea: 'DevOps', descripcion: 'DevOps e Infraestructura', activo: true },
  { idArea: 6, nombreArea: 'Data', descripcion: 'Data Science', activo: true },
]

const MOCK_ROLES = [
  { idRolRegistro: 1, bloqueTech: 'Backend', nombreRol: 'Desarrollador Backend' },
  { idRolRegistro: 2, bloqueTech: 'Frontend', nombreRol: 'Desarrollador Frontend' },
  { idRolRegistro: 3, bloqueTech: 'QA', nombreRol: 'QA Engineer' },
  { idRolRegistro: 4, bloqueTech: 'Mobile', nombreRol: 'Desarrollador Mobile' },
  { idRolRegistro: 5, bloqueTech: 'DevOps', nombreRol: 'DevOps Engineer' },
  { idRolRegistro: 6, bloqueTech: 'Data', nombreRol: 'Data Scientist' },
]

const MOCK_SLAS = [
  { idSla: 1, codigoSla: 'SLA-NUEVO-001', descripcion: 'SLA Nuevo Personal', diasMaximo: 30 },
  { idSla: 2, codigoSla: 'SLA-REEMPLAZO-001', descripcion: 'SLA Reemplazo', diasMaximo: 15 },
]
// ==================== FIN DATOS MOCKEADOS ====================

export const slaService = {
  /**
   * Obtener datos SLA con filtros opcionales
   * @param {Object} filters - Filtros para la consulta (startDate, endDate, bloqueTech, etc.)
   * @returns {Promise} - Promesa con los datos SLA
   */
  async getSlaData(filters = {}) {
    try {
      const params = {}

      // Lógica de feat/Reportes: camelCase y manejo específico de filtros
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate

      // NOTA: area se filtra localmente en el store (no se envía al backend) para permitir selección múltiple
      // if (filters.area) params.area = filters.area

      if (filters.tipoSolicitud) params.tipoSolicitud = filters.tipoSolicitud
      if (filters.prioridad) params.prioridad = filters.prioridad

      if (typeof filters.cumpleSla !== 'undefined' && filters.cumpleSla !== null) {
        // Conversión explícita para el backend: 'cumple' => true, 'no_cumple' => false
        if (filters.cumpleSla === 'cumple') params.cumpleSla = true
        else if (filters.cumpleSla === 'no_cumple') params.cumpleSla = false
      }

      const response = await apiClient.get('/dashboard/sla/data', { params })
      return response.data
    } catch (error) {
      console.error('Error al obtener datos SLA del servidor:', error)
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
   * @param {Object} solicitud - Datos de la solicitud (formato frontend)
   * @returns {Promise} - Promesa con la respuesta del servidor
   */
  async createManualEntry(solicitud) {
    try {
      // TODO: Cuando la autenticación esté lista, descomentar las llamadas a la API
      // Por ahora usamos datos mock directamente para evitar 401
      const areas = MOCK_AREAS
      const roles = MOCK_ROLES
      const slas = MOCK_SLAS

      console.log('Usando datos MOCK - Areas:', areas)
      console.log('Usando datos MOCK - Roles:', roles)
      console.log('Usando datos MOCK - SLAs:', slas)
      console.log('Solicitud frontend:', solicitud)

      // Buscar el área por nombre (bloque_tech) - manejar diferentes variaciones
      const bloqueTechLower = (solicitud.bloque_tech || '').toLowerCase()
      const area = areas.find((a) => {
        const nombreArea = (a.nombreArea || a.NombreArea || a.nombre_area || '').toLowerCase()
        return nombreArea === bloqueTechLower
      })

      // Buscar el rol por bloque_tech
      const rol = roles.find((r) => {
        const bloqueTech = (r.bloqueTech || r.BloqueTech || r.bloque_tech || '').toLowerCase()
        return bloqueTech === bloqueTechLower
      })

      // Buscar el SLA por tipo de solicitud
      const tipoSolicitudLower = (solicitud.tipo_solicitud || '').toLowerCase()
      const sla = slas.find((s) => {
        const codigo = (s.codigoSla || s.CodigoSla || s.codigo_sla || '').toLowerCase()
        if (tipoSolicitudLower.includes('nuevo') && codigo.includes('nuevo')) return true
        if (tipoSolicitudLower.includes('reemplazo') && codigo.includes('reemplazo')) return true
        return false
      })

      console.log('Lookup - Area:', area, 'Rol:', rol, 'SLA:', sla)

      // Construir DTO para el backend
      const backendDto = {
        IdPersonal: 1, // Personal genérico por ahora
        IdRolRegistro: rol?.idRolRegistro || rol?.IdRolRegistro || 1,
        IdSla: sla?.idSla || sla?.IdSla || 1,
        IdArea: area?.idArea || area?.IdArea || 1,
        IdEstadoSolicitud: 1, // Pendiente
        FechaSolicitud: solicitud.fecha_solicitud,
        FechaIngreso: solicitud.fecha_ingreso,
        NumDiasSla: solicitud.dias_transcurridos,
        ResumenSla:
          solicitud.observaciones || `${solicitud.tipo_solicitud} - ${solicitud.bloque_tech}`,
        OrigenDato: 'manual',
        Prioridad: solicitud.prioridad,
      }

      console.log('DTO a enviar:', backendDto)

      const response = await apiClient.post('/solicitud', backendDto)
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

  /**
   * Obtener datos de dashboard específicos para reportes
   * Filtra por fecha de INGRESO y permite múltiples bloques tech (filtrado en frontend)
   * @param {Object} filters - Filtros para reportes (startDate, endDate, tipoSolicitud)
   * @returns {Promise} - Promesa con los datos SLA
   */
  async getDashboardDataForReports(filters = {}) {
    try {
      // Delegar al servicio de reportes
      return await reporteService.getDashboardData(filters)
    } catch (error) {
      console.error('Error al obtener datos de dashboard para reportes:', error)
      throw new Error(`No se pudieron cargar los datos: ${error.message}`)
    }
  },
}
