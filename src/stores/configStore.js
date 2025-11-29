import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { configService } from 'src/services/configService'

/**
 * Store de configuración y utilidades relacionadas con alertas.
 * - Gestiona: bloques tech (desde backend), prioridades (local), tipos de solicitud y estados (desde backend).
 * - Expone métodos para consultar y operar alertas en el backend.
 *
 * Nota: la gestión del token se hace en otra rama. Aquí se acepta un tokenProvider opcional.
 * Para Vite use VITE_API_BASE_URL en .env; si no existe, pasar baseUrl al init.
 */
export const useConfigStore = defineStore('config', () => {
  // ============================================
  // CONFIGURACIÓN DE BLOQUES TECNOLÓGICOS
  // ============================================
  // Los bloques se cargan desde el backend
  const bloques = ref([])

  // ============================================
  // CONFIGURACIÓN DE PRIORIDADES
  // ============================================
  // Las prioridades se obtienen desde el backend (datos reales de solicitudes)
  const prioridades = ref([])

  // ============================================
  // FETCHERS (backend)
  // ============================================
  // Los tipos de solicitud se cargan desde el backend
  const tiposSolicitud = ref([])

  // ============================================
  // ALERT API (endpoints para Android/Frontend)
  // ============================================
  // Los estados se obtienen desde el backend (datos reales)
  const estados = ref([])

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
    prioridades.value
      .filter((p) => p.activo)
      .map((p) => ({
        label: p.nombre,
        value: p.nombre,
        icon: p.icon,
        color: p.color,
      })),
  )

  const tiposSolicitudOptions = computed(() =>
    tiposSolicitud.value
      .filter((t) => t.activo)
      .map((t) => ({
        label: t.nombre,
        value: t.nombre,
        icon: t.icon,
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

  // ============================================
  // NOTA: Todos los datos ahora provienen del backend
  // No hay datos mockeados ni hardcodeados
  // ============================================

  // ============================================
  // INTEGRACIÓN CON BACKEND - ÁREAS/BLOQUES
  // ============================================

  const loading = ref(false)
  const areasBackend = ref([])

  /**
   * Cargar áreas/bloques desde el backend
   */
  async function loadAreasFromBackend() {
    loading.value = true
    try {
      const response = await configService.getAllAreas()
      areasBackend.value = response.data

      // Sincronizar con bloques locales
      if (response.data && response.data.length > 0) {
        response.data.forEach((area) => {
          // Buscar por backendId en lugar de nombre para manejar cambios de nombre
          const existing = bloques.value.find((b) => b.backendId === area.idArea)
          if (!existing) {
            // Crear nuevo bloque si no existe
            bloques.value.push({
              id: area.idArea,
              nombre: area.nombreArea,
              descripcion: area.descripcion || `Área ${area.nombreArea}`,
              departamento: area.nombreArea, // Usar el nombre del área como departamento
              color: '#' + Math.floor(Math.random() * 16777215).toString(16),
              icon: 'business',
              activo: area.activo !== undefined ? area.activo : true,
              backendId: area.idArea,
            })
          } else {
            // Actualizar TODOS los datos del bloque existente
            existing.nombre = area.nombreArea // ⬅️ IMPORTANTE: actualizar el nombre
            existing.descripcion = area.descripcion || existing.descripcion
            existing.activo = area.activo !== undefined ? area.activo : true
            existing.backendId = area.idArea
            existing.id = area.idArea
            existing.departamento = area.nombreArea // También actualizar departamento
          }
        })
      }
    } catch (error) {
      console.error('Error cargando áreas desde backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear área/bloque en el backend
   */
  async function createAreaBackend(bloqueData) {
    loading.value = true
    try {
      const areaDto = {
        NombreArea: bloqueData.nombre,
        Descripcion: bloqueData.descripcion || '',
      }
      const response = await configService.createArea(areaDto)

      // Agregar a bloques locales con backendId
      bloques.value.push({
        ...bloqueData,
        id: response.data.idArea,
        backendId: response.data.idArea,
        activo: true,
      })

      return response.data
    } catch (error) {
      console.error('Error creando área en backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar área/bloque en el backend
   */
  async function updateAreaBackend(bloqueId, bloqueData) {
    loading.value = true
    try {
      const bloque = bloques.value.find((b) => b.id === bloqueId || b.backendId === bloqueId)
      const backendId = bloque?.backendId || bloqueId

      const areaDto = {
        NombreArea: bloqueData.NombreArea || bloqueData.nombre || bloque?.nombre || '',
        Descripcion: bloqueData.Descripcion || bloqueData.descripcion || bloque?.descripcion || '',
        Activo:
          bloqueData.Activo !== undefined
            ? bloqueData.Activo
            : bloque?.activo !== undefined
              ? bloque.activo
              : true,
      }

      const response = await configService.updateArea(backendId, areaDto)

      // Recargar áreas para sincronizar estado
      await loadAreasFromBackend()

      return response.data
    } catch (error) {
      console.error('Error actualizando área en backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar área/bloque del backend
   */
  async function deleteAreaBackend(bloqueId) {
    loading.value = true
    try {
      const bloque = bloques.value.find((b) => b.id === bloqueId || b.backendId === bloqueId)
      const backendId = bloque?.backendId || bloqueId

      await configService.deleteArea(backendId)

      // Eliminar de bloques locales
      const index = bloques.value.findIndex((b) => b.id === bloqueId || b.backendId === bloqueId)
      if (index !== -1) {
        bloques.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Error eliminando área del backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // INTEGRACIÓN CON BACKEND - TIPOS DE SOLICITUD
  // ============================================

  const tiposSolicitudBackend = ref([])

  /**
   * Cargar tipos de solicitud desde el backend
   */
  async function loadTiposSolicitudFromBackend() {
    loading.value = true
    try {
      // Cargar tipos de solicitud
      const tiposResponse = await configService.getAllTiposSolicitud()
      tiposSolicitudBackend.value = tiposResponse.data

      // Cargar configuraciones SLA
      const slaResponse = await configService.getAllConfigSla()
      const configSlas = slaResponse.data || []

      console.log('🔍 [loadTiposSolicitudFromBackend] Tipos del backend:', tiposResponse.data)
      console.log('🔍 [loadTiposSolicitudFromBackend] ConfigSlas del backend:', configSlas)

      // Crear un mapa de idTipoSolicitud -> ConfigSla para búsqueda rápida
      const slaMap = {}
      configSlas.forEach(sla => {
        slaMap[sla.idTipoSolicitud] = sla
      })

      // Sincronizar con tipos locales
      if (tiposResponse.data && tiposResponse.data.length > 0) {
        // Crear un nuevo array para forzar reactividad de Vue
        const nuevosTipos = tiposResponse.data.map((tipo) => {
          const configSla = slaMap[tipo.idTipoSolicitud]

          return {
            id: tipo.idTipoSolicitud,
            nombre: tipo.descripcion,
            descripcion: configSla?.descripcion || tipo.descripcion || '',
            sla: configSla?.diasUmbral || 30, // Usar diasUmbral de ConfigSla o valor por defecto
            icon: getIconForTipo(tipo.descripcion),
            color: getColorForTipo(tipo.descripcion),
            activo: tipo.activo !== undefined ? tipo.activo : true,
            backendId: tipo.idTipoSolicitud,
            configSlaId: configSla?.idSla || null, // Guardar el ID del ConfigSla para edición
          }
        })

        // Reemplazar el array completo para asegurar reactividad
        tiposSolicitud.value = nuevosTipos

        console.log(
          '✅ [loadTiposSolicitudFromBackend] tiposSolicitud después del map:',
          tiposSolicitud.value,
        )
        console.log(
          '📊 [loadTiposSolicitudFromBackend] Total tipos (incluyendo inactivos):',
          tiposSolicitud.value.length,
        )
        console.log(
          '📊 [loadTiposSolicitudFromBackend] Tipos activos:',
          tiposSolicitud.value.filter((t) => t.activo).length,
        )
        console.log(
          '📊 [loadTiposSolicitudFromBackend] Tipos inactivos:',
          tiposSolicitud.value.filter((t) => !t.activo).length,
        )
      }
    } catch (error) {
      console.error('Error cargando tipos de solicitud desde backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Asignar icono basado en el tipo de solicitud
   */
  function getIconForTipo(descripcion) {
    const iconMap = {
      'Nuevo Personal': 'person_add',
      Reemplazo: 'swap_horiz',
      Transferencia: 'transfer_within_a_station',
      Promoción: 'trending_up',
    }
    return iconMap[descripcion] || 'assignment'
  }

  /**
   * Asignar color basado en el tipo de solicitud
   */
  function getColorForTipo(descripcion) {
    const colorMap = {
      'Nuevo Personal': '#1976d2',
      Reemplazo: '#388e3c',
      Transferencia: '#f57c00',
      Promoción: '#9c27b0',
    }
    return colorMap[descripcion] || '#607d8b'
  }

  /**
   * Crear tipo de solicitud en el backend
   */
  async function createTipoSolicitudBackend(tipoData) {
    loading.value = true
    try {
      const tipoDto = {
        codigo: tipoData.nombre.toUpperCase().replace(/\s+/g, '_'),
        descripcion: tipoData.nombre,
      }
      const response = await configService.createTipoSolicitud(tipoDto)

      // Agregar a tipos locales
      tiposSolicitud.value.push({
        id: response.data.idTipoSolicitud,
        nombre: response.data.descripcion,
        descripcion: response.data.descripcion || '',
        sla: tipoData.sla || 30,
        icon: tipoData.icon || 'assignment',
        color: tipoData.color || '#000000',
        activo: true,
        backendId: response.data.idTipoSolicitud,
      })

      return response.data
    } catch (error) {
      console.error('Error creando tipo de solicitud en backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar tipo de solicitud en el backend
   */
  async function updateTipoSolicitudBackend(tipoId, tipoData) {
    loading.value = true
    try {
      const tipo = tiposSolicitud.value.find((t) => t.id === tipoId || t.backendId === tipoId)
      const backendId = tipo?.backendId || tipoId

      const tipoDto = {
        Codigo:
          tipoData.Codigo ||
          tipoData.nombre?.toUpperCase().replace(/\s+/g, '_') ||
          tipo?.nombre.toUpperCase().replace(/\s+/g, '_'),
        Descripcion: tipoData.Descripcion || tipoData.nombre || tipo?.nombre,
        Activo:
          tipoData.Activo !== undefined
            ? tipoData.Activo
            : tipo?.activo !== undefined
              ? tipo.activo
              : true,
      }

      const response = await configService.updateTipoSolicitud(backendId, tipoDto)

      // Recargar tipos de solicitud para sincronizar
      await loadTiposSolicitudFromBackend()

      return response.data
    } catch (error) {
      console.error('Error actualizando tipo de solicitud en backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar tipo de solicitud del backend
   */
  async function deleteTipoSolicitudBackend(tipoId) {
    loading.value = true
    try {
      const tipo = tiposSolicitud.value.find((t) => t.id === tipoId || t.backendId === tipoId)
      const backendId = tipo?.backendId || tipoId

      await configService.deleteTipoSolicitud(backendId)

      // Recargar tipos de solicitud para sincronizar
      await loadTiposSolicitudFromBackend()
    } catch (error) {
      console.error('Error eliminando tipo de solicitud del backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // INTEGRACIÓN CON BACKEND - CONFIG SLA
  // ============================================

  const configSlaList = ref([])

  /**
   * Cargar configuraciones SLA desde el backend
   */
  async function loadConfigSlaFromBackend() {
    loading.value = true
    try {
      const response = await configService.getAllConfigSla()
      // Filtrar solo las configuraciones activas
      configSlaList.value = response.data.filter((config) => config.esActivo !== false)
      return configSlaList.value
    } catch (error) {
      console.error('Error cargando configuraciones SLA desde backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear configuración SLA en el backend
   */
  async function createConfigSlaBackend(configData) {
    loading.value = true
    try {
      const configDto = {
        CodigoSla: configData.codigoSla,
        Descripcion: configData.descripcion,
        IdTipoSolicitud: configData.idTipoSolicitud,
        DiasUmbral: configData.diasUmbral,
        EsActivo: configData.esActivo !== undefined ? configData.esActivo : true,
      }
      await configService.createConfigSla(configDto)

      // Recargar configuraciones SLA para sincronizar
      await loadConfigSlaFromBackend()
    } catch (error) {
      console.error('Error creando configuración SLA en backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar configuración SLA en el backend
   */
  async function updateConfigSlaBackend(id, configData) {
    loading.value = true
    try {
      const configDto = {
        CodigoSla: configData.codigoSla,
        Descripcion: configData.descripcion,
        IdTipoSolicitud: configData.idTipoSolicitud,
        DiasUmbral: configData.diasUmbral,
        EsActivo: configData.esActivo,
      }
      await configService.updateConfigSla(id, configDto)

      // Recargar configuraciones SLA para sincronizar
      await loadConfigSlaFromBackend()
    } catch (error) {
      console.error('Error actualizando configuración SLA en backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar configuración SLA del backend
   */
  async function deleteConfigSlaBackend(id) {
    loading.value = true
    try {
      await configService.deleteConfigSla(id)

      // Recargar configuraciones SLA para sincronizar
      await loadConfigSlaFromBackend()
    } catch (error) {
      console.error('Error eliminando configuración SLA del backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // INTEGRACIÓN CON BACKEND - PRIORIDADES
  // ============================================

  const prioridadesBackend = ref([])

  /**
   * Cargar prioridades desde el backend
   */
  async function loadPrioridadesFromBackend() {
    loading.value = true
    try {
      const response = await configService.getAllPrioridades()
      prioridadesBackend.value = response.data

      console.log('🔍 [loadPrioridadesFromBackend] Datos del backend:', response.data)

      // Sincronizar con prioridades locales
      if (response.data && response.data.length > 0) {
        // Crear un nuevo array para forzar reactividad de Vue
        const nuevasPrioridades = response.data.map((prioridad) => {
          // IMPORTANTE: Usar el CÓDIGO (CRITICA, ALTA, MEDIA, BAJA) como nombre
          // porque es el que se usa en las solicitudes y en el dashboard
          const nombreCodigo = prioridad.codigo

          return {
            id: prioridad.idPrioridad,
            nombre: nombreCodigo, // USAR CÓDIGO para compatibilidad con dashboard y solicitudes
            codigo: prioridad.codigo,
            descripcion: prioridad.descripcion || '',
            nivel: prioridad.nivel,
            slaMultiplier: prioridad.slaMultiplier,
            icon: prioridad.icon || 'label',
            color: prioridad.color || '#607d8b',
            activo: prioridad.activo !== undefined ? prioridad.activo : true,
            backendId: prioridad.idPrioridad,
          }
        })

        // Reemplazar el array completo para asegurar reactividad
        prioridades.value = nuevasPrioridades

        console.log(
          '✅ [loadPrioridadesFromBackend] prioridades después del map:',
          prioridades.value,
        )
        console.log(
          '📊 [loadPrioridadesFromBackend] Total prioridades (incluyendo inactivas):',
          prioridades.value.length,
        )
        console.log(
          '📊 [loadPrioridadesFromBackend] Prioridades activas:',
          prioridades.value.filter((p) => p.activo).length,
        )
        console.log(
          '📊 [loadPrioridadesFromBackend] Prioridades inactivas:',
          prioridades.value.filter((p) => !p.activo).length,
        )
      }
    } catch (error) {
      console.error('Error cargando prioridades desde backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear prioridad en el backend
   */
  async function createPrioridadBackend(prioridadData) {
    loading.value = true
    try {
      const prioridadDto = {
        Codigo: prioridadData.codigo || prioridadData.nombre.toUpperCase().replace(/\s+/g, '_'),
        Descripcion: prioridadData.nombre || prioridadData.descripcion,
        Nivel: prioridadData.nivel,
        SlaMultiplier: prioridadData.slaMultiplier,
        Icon: prioridadData.icon || 'label',
        Color: prioridadData.color || '#607d8b',
      }
      const response = await configService.createPrioridad(prioridadDto)

      // Recargar prioridades para sincronizar
      await loadPrioridadesFromBackend()

      return response.data
    } catch (error) {
      console.error('Error creando prioridad en backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar prioridad en el backend
   */
  async function updatePrioridadBackend(prioridadId, prioridadData) {
    loading.value = true
    try {
      const prioridad = prioridades.value.find(
        (p) => p.id === prioridadId || p.backendId === prioridadId,
      )
      const backendId = prioridad?.backendId || prioridadId

      const prioridadDto = {
        Codigo: prioridadData.Codigo || prioridadData.codigo || prioridad?.codigo,
        Descripcion: prioridadData.Descripcion || prioridadData.nombre || prioridad?.descripcion,
        Nivel: prioridadData.Nivel !== undefined ? prioridadData.Nivel : prioridadData.nivel,
        SlaMultiplier:
          prioridadData.SlaMultiplier !== undefined
            ? prioridadData.SlaMultiplier
            : prioridadData.slaMultiplier,
        Icon: prioridadData.Icon || prioridadData.icon || prioridad?.icon || 'label',
        Color: prioridadData.Color || prioridadData.color || prioridad?.color || '#607d8b',
        Activo:
          prioridadData.Activo !== undefined
            ? prioridadData.Activo
            : prioridad?.activo !== undefined
              ? prioridad.activo
              : true,
      }

      const response = await configService.updatePrioridad(backendId, prioridadDto)

      // Recargar prioridades para sincronizar estado
      await loadPrioridadesFromBackend()

      return response.data
    } catch (error) {
      console.error('Error actualizando prioridad en backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar prioridad del backend
   */
  async function deletePrioridadBackend(prioridadId) {
    loading.value = true
    try {
      const prioridad = prioridades.value.find(
        (p) => p.id === prioridadId || p.backendId === prioridadId,
      )
      const backendId = prioridad?.backendId || prioridadId

      await configService.deletePrioridad(backendId)

      // Recargar prioridades para sincronizar
      await loadPrioridadesFromBackend()
    } catch (error) {
      console.error('Error eliminando prioridad del backend:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    // init
    // init
    // init, // Undefined

    // estado
    bloques,
    prioridades,
    tiposSolicitud,
    estados,
    loading,
    areasBackend,
    tiposSolicitudBackend,
    configSlaList,
    prioridadesBackend,

    // computed
    departamentos,
    bloquesActivos,
    bloquesPorDepartamento,
    bloquesOptions,
    prioridadesOptions,
    tiposSolicitudOptions,
    estadosOptions,

    // fetchers
    // fetchBloquesTech,    // Undefined
    // fetchTiposSolicitud, // Undefined
    // fetchEstados,        // Undefined
    // fetchAllConfig,      // Undefined

    // alert API
    // fetchAlertsForUser, // Undefined
    // fetchUnreadCount,   // Undefined
    // markAlertAsRead,    // Undefined
    // createAlert,        // Undefined

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

    // Integración Backend - Áreas/Bloques
    loadAreasFromBackend,
    createAreaBackend,
    updateAreaBackend,
    deleteAreaBackend,

    // Integración Backend - Tipos de Solicitud
    loadTiposSolicitudFromBackend,
    createTipoSolicitudBackend,
    updateTipoSolicitudBackend,
    deleteTipoSolicitudBackend,

    // Integración Backend - Config SLA
    loadConfigSlaFromBackend,
    createConfigSlaBackend,
    updateConfigSlaBackend,
    deleteConfigSlaBackend,

    // Integración Backend - Prioridades
    loadPrioridadesFromBackend,
    createPrioridadBackend,
    updatePrioridadBackend,
    deletePrioridadBackend,

    // Utilidades
    calcularSLA,
  }
})
