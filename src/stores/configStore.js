import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Store de configuración y utilidades relacionadas con alertas.
 * - Gestiona: bloques tech (desde backend), prioridades (local), tipos de solicitud y estados (desde backend).
 * - Expone métodos para consultar y operar alertas en el backend.
 *
 * Nota: la gestión del token se hace en otra rama. Aquí se acepta un tokenProvider opcional.
 * Para Vite use VITE_API_BASE_URL en .env; si no existe, pasar baseUrl al init.
 */
export const useConfigStore = defineStore('config', () => {
  // Base URL y proveedor de token (inicializar con init)
  let _baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  let _tokenProvider = null // () => string | null

  function init(options = {}) {
    if (options.baseUrl) _baseUrl = options.baseUrl
    if (options.tokenProvider) _tokenProvider = options.tokenProvider
  }

  function _headers() {
    const headers = { 'Content-Type': 'application/json' }
    try {
      const token = _tokenProvider?.()
      if (token) headers['Authorization'] = `Bearer ${token}`
    } catch {
      // tokenProvider puede lanzar si no está lista; ignorar
    }
    return headers
  }

  async function _fetch(path, opts = {}) {
    const url = (_baseUrl || '').replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '')
    const options = {
      headers: { ...(opts.headers || {}), ..._headers() },
      ...opts,
    }
    const res = await fetch(url, options)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const err = new Error(`HTTP ${res.status} ${res.statusText} ${text}`)
      err.status = res.status
      throw err
    }
    // no content
    if (res.status === 204) return null
    return res.json().catch(() => null)
  }

  // Estado reactivo
  const bloques = ref([]) // { id, nombre, descripcion, departamento, icon, color, activo }
  const prioridades = ref([]) // { nombre, nivel, icon, color, slaMultiplier }
  const tiposSolicitud = ref([]) // { id, nombre, descripcion, sla? }
  const estados = ref([]) // { id, codigo, nombre, descripcion, icon?, color? }

  // ============================================
  // FETCHERS (backend)
  // ============================================
  async function fetchBloquesTech() {
    // Endpoint: GET /api/RolRegistro
    try {
      const data = await _fetch('api/RolRegistro', { method: 'GET' })
      // Mapear a forma del frontend
      bloques.value = (data || []).map((r) => ({
        id: r.idRolRegistro ?? r.id,
        nombre: r.nombreRol ?? r.nombre,
        descripcion: r.descripcion ?? '',
        departamento: r.bloqueTech ?? 'General',
        icon: r.icon ?? null,
        color: r.color ?? null,
        activo: r.esActivo ?? true,
      }))
      return bloques.value
    } catch (error) {
      // Si falla (401 sin autenticación), dejar vacío pero no fallar
      console.warn('No se pudieron cargar bloques tecnológicos:', error.message)
      return []
    }
  }

  async function fetchTiposSolicitud() {
    // Endpoint: GET /api/TipoSolicitudCatalogo
    try {
      const data = await _fetch('api/TipoSolicitudCatalogo', { method: 'GET' })
      tiposSolicitud.value = (data || []).map((t) => ({
        id: t.idTipoSolicitud ?? t.id,
        nombre: t.codigo ?? t.descripcion ?? 'Sin nombre',
        descripcion: t.descripcion ?? '',
        sla: t.sla ?? null, // si el backend expone SLA en otro endpoint, enriquecer después
      }))
      return tiposSolicitud.value
    } catch (error) {
      // Si falla (401 sin autenticación), dejar vacío pero no fallar
      console.warn('No se pudieron cargar tipos de solicitud:', error.message)
      return []
    }
  }

  async function fetchEstados() {
    // Endpoint: GET /api/EstadoSolicitudCatalogo
    try {
      const data = await _fetch('api/EstadoSolicitudCatalogo', { method: 'GET' })
      estados.value = (data || []).map((e) => ({
        id: e.idEstadoSolicitud ?? e.id,
        codigo: e.codigo ?? '',
        nombre: e.descripcion ?? e.codigo ?? 'Estado',
        descripcion: e.descripcion ?? '',
        icon: e.icon ?? null,
        color: e.color ?? null,
      }))
      return estados.value
    } catch (error) {
      // Si falla (401 sin autenticación), dejar vacío pero no fallar
      console.warn('No se pudieron cargar estados:', error.message)
      return []
    }
  }

  async function fetchAllConfig() {
    // Obtener datos del backend
    // Nota: Requiere autenticación. Los endpoints deben ser públicos o tener un token válido
    await Promise.allSettled([fetchBloquesTech(), fetchTiposSolicitud(), fetchEstados()])

    return {
      bloques: bloques.value,
      prioridades: prioridades.value,
      tiposSolicitud: tiposSolicitud.value,
      estados: estados.value,
    }
  }

  // ============================================
  // ALERT API (endpoints para Android/Frontend)
  // ============================================
  // GET /api/alertum/user/{userId}?onlyUnread=&page=&pageSize=
  async function fetchAlertsForUser(userId, { onlyUnread = false, page = 1, pageSize = 20 } = {}) {
    const qs = new URLSearchParams({
      onlyUnread: String(onlyUnread),
      page: String(page),
      pageSize: String(pageSize),
    })
    const data = await _fetch(`api/alertum/user/${userId}?${qs.toString()}`, { method: 'GET' })
    return data || []
  }

  // GET /api/alertum/user/{userId}/unread/count
  async function fetchUnreadCount(userId) {
    const data = await _fetch(`api/alertum/user/${userId}/unread/count`, { method: 'GET' })
    return data?.Unread ?? 0
  }

  // POST /api/alertum/{id}/mark-read?userId=
  async function markAlertAsRead(alertId, userId) {
    await _fetch(`api/alertum/${alertId}/mark-read?userId=${encodeURIComponent(userId)}`, {
      method: 'POST',
    })
    return true
  }

  // POST /api/alertum  (crear alerta)
  async function createAlert(payload) {
    // payload debe seguir AlertumDto (idSolicitud, idTipoAlerta, idEstadoAlerta, nivel, mensaje, enviadoEmail)
    const created = await _fetch('api/alertum', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return created
  }

  // ============================================
  // COMPUTED y UTILIDADES
  // ============================================
  const departamentos = computed(() => {
    const deps = [...new Set(bloques.value.map((b) => b.departamento || 'General'))]
    return deps.sort()
  })

  const bloquesActivos = computed(() => bloques.value.filter((b) => b.activo))

  const bloquesPorDepartamento = computed(() => {
    const grouped = {}
    bloquesActivos.value.forEach((bloque) => {
      const dep = bloque.departamento || 'General'
      if (!grouped[dep]) grouped[dep] = []
      grouped[dep].push(bloque)
    })
    return grouped
  })

  const bloquesOptions = computed(() =>
    bloquesActivos.value.map((b) => ({
      label: b.nombre,
      value: b.nombre,
      icon: b.icon,
      color: b.color,
      departamento: b.departamento,
      id: b.id,
    })),
  )

  const prioridadesOptions = computed(() =>
    prioridades.value.map((p) => ({
      label: p.nombre,
      value: p.nombre,
      icon: p.icon,
      color: p.color,
    })),
  )

  const tiposSolicitudOptions = computed(() =>
    tiposSolicitud.value.map((t) => ({
      label: t.nombre,
      value: t.nombre,
      id: t.id,
    })),
  )

  const estadosOptions = computed(() =>
    estados.value.map((e) => ({
      label: e.nombre,
      value: e.id,
      icon: e.icon,
      color: e.color,
    })),
  )

  // ============================================
  // Búsquedas y utilidades
  // ============================================
  function getBloqueByNombre(nombre) {
    return bloques.value.find((b) => b.nombre === nombre)
  }

  function getPrioridadByNombre(nombre) {
    return prioridades.value.find((p) => p.nombre === nombre)
  }

  function getTipoSolicitudByNombre(nombre) {
    return tiposSolicitud.value.find((t) => t.nombre === nombre)
  }

  function getEstadoById(id) {
    return estados.value.find((e) => e.id === id)
  }

  // Gestión de arrays en runtime (UI / admin)
  function agregarBloque(bloque) {
    bloques.value.push({
      id: bloque.id || (bloque.nombre || '').toLowerCase().replace(/\s+/g, '_'),
      ...bloque,
      activo: true,
    })
  }

  function actualizarBloque(id, datos) {
    const index = bloques.value.findIndex((b) => b.id === id)
    if (index !== -1) bloques.value[index] = { ...bloques.value[index], ...datos }
  }

  function toggleBloqueActivo(id) {
    const bloque = bloques.value.find((b) => b.id === id)
    if (bloque) bloque.activo = !bloque.activo
  }

  function agregarPrioridad(prioridad) {
    prioridades.value.push(prioridad)
    prioridades.value.sort((a, b) => b.nivel - a.nivel)
  }

  function agregarTipoSolicitud(tipo) {
    tiposSolicitud.value.push({
      id: tipo.id || (tipo.nombre || '').toLowerCase().replace(/\s+/g, '_'),
      ...tipo,
    })
  }

  // CONFIGURACIÓN DE SLA
  function calcularSLA(tipoSolicitud, prioridad) {
    const tipo = getTipoSolicitudByNombre(tipoSolicitud)
    const prio = getPrioridadByNombre(prioridad)
    if (!tipo) return null
    const slaBase = tipo.sla ?? 0
    const multiplier = prio?.slaMultiplier ?? 1.0
    return Math.round(slaBase * multiplier)
  }

  // Export
  return {
    // init
    init,

    // estado
    bloques,
    prioridades,
    tiposSolicitud,
    estados,

    // computed
    departamentos,
    bloquesActivos,
    bloquesPorDepartamento,
    bloquesOptions,
    prioridadesOptions,
    tiposSolicitudOptions,
    estadosOptions,

    // fetchers
    fetchBloquesTech,
    fetchTiposSolicitud,
    fetchEstados,
    fetchAllConfig,

    // alert API
    fetchAlertsForUser,
    fetchUnreadCount,
    markAlertAsRead,
    createAlert,

    // búsquedas y gestión
    getBloqueByNombre,
    getPrioridadByNombre,
    getTipoSolicitudByNombre,
    getEstadoById,
    agregarBloque,
    actualizarBloque,
    toggleBloqueActivo,
    agregarPrioridad,
    agregarTipoSolicitud,

    // util
    calcularSLA,
  }
})
