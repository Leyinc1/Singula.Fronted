/**
 * Servicio para obtener catálogos dinámicos desde el backend
 * (SLA types, prioridades, etc.)
 */
import apiClient from './api'

/**
 * Obtiene los tipos de SLA configurados (config_sla)
 * @returns {Promise<Array>} Lista de configuraciones SLA: { idSla, descripcion, diasUmbral, idTipoSolicitud }
 */
export async function getSlaTypes() {
  try {
    const response = await apiClient.get('/ConfigSla')
    const data = response.data || []
    
    // Mapear a formato consistente para el frontend
    return data.map(sla => ({
      idSla: sla.idSla || sla.id_sla,
      codigoSla: sla.codigoSla || sla.codigo_sla,
      descripcion: sla.descripcion,
      diasUmbral: sla.diasUmbral || sla.dias_umbral,
      idTipoSolicitud: sla.idTipoSolicitud || sla.id_tipo_solicitud,
      esActivo: sla.esActivo !== undefined ? sla.esActivo : sla.es_activo,
      // Pre-formatear label para dropdown
      label: `${sla.codigoSla || sla.codigo_sla} - ${sla.descripcion}`,
      value: sla.codigoSla || sla.codigo_sla
    }))
  } catch (error) {
    console.error('Error al obtener tipos SLA:', error)
    throw new Error('No se pudieron cargar los tipos de SLA desde el servidor')
  }
}

/**
 * Obtiene tipos de solicitud desde el catálogo
 * @returns {Promise<Array>} Lista de tipos: { idTipoSolicitud, nombreTipo }
 */
export async function getTiposSolicitud() {
  try {
    const response = await apiClient.get('/TipoSolicitudCatalogo')
    const data = response.data || []
    
    return data.map(tipo => ({
      idTipoSolicitud: tipo.idTipoSolicitud || tipo.id_tipo_solicitud,
      nombreTipo: tipo.nombreTipo || tipo.nombre_tipo || tipo.nombre
    }))
  } catch (error) {
    console.error('Error al obtener tipos de solicitud:', error)
    // Fallback con tipos comunes si falla
    return [
      { idTipoSolicitud: 1, nombreTipo: 'Nuevo Personal' },
      { idTipoSolicitud: 2, nombreTipo: 'Reemplazo' }
    ]
  }
}

/**
 * Obtiene valores únicos de prioridad desde solicitudes (si backend provee endpoint)
 * Si no existe endpoint, retorna valores estáticos típicos
 * @returns {Promise<Array<string>>} Lista de prioridades: ['Alta', 'Media', 'Baja', ...]
 */
export async function getPrioridades() {
  try {
    // Intenta obtener del backend (endpoint custom si existe)
    // Si el backend no tiene endpoint específico, se puede obtener desde /Solicitud y extraer valores únicos
    const response = await apiClient.get('/Solicitud')
    const solicitudes = response.data || []
    
    // Extraer valores únicos de prioridad
    const prioridades = [...new Set(
      solicitudes
        .map(s => s.prioridad)
        .filter(p => p != null && p !== '')
    )].sort()
    
    // Si no hay datos, retornar valores por defecto
    if (prioridades.length === 0) {
      return ['Alta', 'Media', 'Baja', 'Crítica']
    }
    
    return prioridades
  } catch (error) {
    console.warn('No se pudieron obtener prioridades dinámicas, usando valores por defecto:', error)
    // Fallback a valores comunes
    return ['Alta', 'Media', 'Baja', 'Crítica']
  }
}

export default {
  getSlaTypes,
  getTiposSolicitud,
  getPrioridades,
}
