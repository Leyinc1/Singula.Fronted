/**
 * Servicio para gestionar la configuración del sistema
 * Maneja: áreas/bloques, tipos de solicitud, configuración SLA
 */
import api from './api'

export const configService = {
  // ==================== ÁREAS / BLOQUES TECNOLÓGICOS ====================

  /**
   * Obtener todas las áreas/bloques tecnológicos
   */
  async getAllAreas() {
    return await api.get('/areas')
  },

  /**
   * Obtener un área por ID
   */
  async getAreaById(id) {
    return await api.get(`/areas/${id}`)
  },

  /**
   * Crear una nueva área/bloque
   */
  async createArea(areaDto) {
    return await api.post('/areas', areaDto)
  },

  /**
   * Actualizar un área existente
   */
  async updateArea(id, areaDto) {
    return await api.put(`/areas/${id}`, areaDto)
  },

  /**
   * Eliminar un área
   */
  async deleteArea(id) {
    return await api.delete(`/areas/${id}`)
  },

  // ==================== TIPOS DE SOLICITUD ====================

  /**
   * Obtener todos los tipos de solicitud
   */
  async getAllTiposSolicitud() {
    return await api.get('/tiposolicitudcatalogo')
  },

  /**
   * Obtener un tipo de solicitud por ID
   */
  async getTipoSolicitudById(id) {
    return await api.get(`/tiposolicitudcatalogo/${id}`)
  },

  /**
   * Crear un nuevo tipo de solicitud
   */
  async createTipoSolicitud(tipoDto) {
    return await api.post('/tiposolicitudcatalogo', tipoDto)
  },

  /**
   * Actualizar un tipo de solicitud existente
   */
  async updateTipoSolicitud(id, tipoDto) {
    return await api.put(`/tiposolicitudcatalogo/${id}`, tipoDto)
  },

  /**
   * Eliminar un tipo de solicitud
   */
  async deleteTipoSolicitud(id) {
    return await api.delete(`/tiposolicitudcatalogo/${id}`)
  },

  // ==================== CONFIGURACIÓN SLA ====================

  /**
   * Obtener todas las configuraciones de SLA
   */
  async getAllConfigSla() {
    return await api.get('/configsla')
  },

  /**
   * Obtener una configuración SLA por ID
   */
  async getConfigSlaById(id) {
    return await api.get(`/configsla/${id}`)
  },

  /**
   * Crear una nueva configuración SLA
   */
  async createConfigSla(configDto) {
    return await api.post('/configsla', configDto)
  },

  /**
   * Actualizar una configuración SLA existente
   */
  async updateConfigSla(id, configDto) {
    return await api.put(`/configsla/${id}`, configDto)
  },

  /**
   * Eliminar una configuración SLA
   */
  async deleteConfigSla(id) {
    return await api.delete(`/configsla/${id}`)
  },

  // ==================== PRIORIDADES ====================

  /**
   * Obtener todas las prioridades
   */
  async getAllPrioridades() {
    return await api.get('/prioridadcatalogo')
  },

  /**
   * Obtener una prioridad por ID
   */
  async getPrioridadById(id) {
    return await api.get(`/prioridadcatalogo/${id}`)
  },

  /**
   * Crear una nueva prioridad
   */
  async createPrioridad(prioridadDto) {
    return await api.post('/prioridadcatalogo', prioridadDto)
  },

  /**
   * Actualizar una prioridad existente
   */
  async updatePrioridad(id, prioridadDto) {
    return await api.put(`/prioridadcatalogo/${id}`, prioridadDto)
  },

  /**
   * Eliminar una prioridad
   */
  async deletePrioridad(id) {
    return await api.delete(`/prioridadcatalogo/${id}`)
  },
}
