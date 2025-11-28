/**
 * Store de Pinia para gestionar los datos SLA
 * Maneja: datos del dashboard, KPIs, filtros, predicciones
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { slaService } from 'src/services/slaService'

export const useSlaStore = defineStore('sla', () => {
  // Estado reactivo
  const slaData = ref([])
  const allData = ref([]) // Guardamos todos los datos sin filtrar
  const loading = ref(false)
  const error = ref(null)
  
  // Flag para saber si la página de reportes ya fue inicializada
  const isReportsInitialized = ref(false)
  
  // Estado de filtros aplicados en la página de reportes
  const appliedReportFilters = ref({
    selectedSlaType: null,
    appliedSlaType: null,
    startDate: null,
    endDate: null,
    selectedBloquesTech: ['TODOS']
  })

  // Filtros
  const filters = ref({
    startDate: null,
    endDate: null,
    bloqueTech: null,
    tipoSolicitud: null,
    prioridad: null,
    cumpleSla: null,
    dateField: 'fecha_solicitud',
  })

  // Datos filtrados con todos los filtros aplicados
  const filteredData = computed(() => {
    let data = [...allData.value]

    // Filtro por fecha de inicio / fin usando campo seleccionado
    const dateField = filters.value.dateField || 'fecha_solicitud'
    if (filters.value.startDate) {
      data = data.filter((record) => new Date(record[dateField]) >= new Date(filters.value.startDate))
    }

    if (filters.value.endDate) {
      data = data.filter((record) => new Date(record[dateField]) <= new Date(filters.value.endDate))
    }

    // Filtro por BLOQUE TECH (acepta single o array)
    if (filters.value.bloqueTech) {
      if (Array.isArray(filters.value.bloqueTech)) {
        data = data.filter((record) => filters.value.bloqueTech.includes(record.bloque_tech))
      } else {
        data = data.filter((record) => record.bloque_tech === filters.value.bloqueTech)
      }
    }

    // Filtro por tipo de solicitud
    if (filters.value.tipoSolicitud) {
      data = data.filter((record) => record.tipo_solicitud === filters.value.tipoSolicitud)
    }

    // Filtro por prioridad
    if (filters.value.prioridad) {
      data = data.filter((record) => record.prioridad === filters.value.prioridad)
    }

    // Filtro por cumplimiento SLA (dinámico: detecta campo que comienza con 'cumple_')
    if (filters.value.cumpleSla) {
      data = data.filter((record) => {
        const cumpleField = Object.keys(record).find((k) => k.startsWith('cumple_'))
        const cumpleVal = cumpleField ? record[cumpleField] === true : false

        if (filters.value.cumpleSla === 'cumple') return cumpleVal
        if (filters.value.cumpleSla === 'no_cumple') return !cumpleVal
        return true
      })
    }

    return data
  })

  // KPIs calculados usando datos filtrados
  // KPIs dinámicos por tipo de solicitud (SLA types)
  const slaTypes = computed(() => {
    const types = new Set(allData.value.map((r) => r.tipo_solicitud).filter(Boolean))
    return Array.from(types)
  })

  const kpiBySla = computed(() => {
    const result = {}
    const data = filteredData.value || []
    slaTypes.value.forEach((tipo) => {
      const records = data.filter((r) => r.tipo_solicitud === tipo)
      if (records.length === 0) {
        result[tipo] = 0
        return
      }

      // intentar detectar campo de cumplimiento dinámico
      const cumpleField = Object.keys(records[0]).find((k) => k.startsWith('cumple_'))

      if (cumpleField) {
        const cumplidos = records.filter((r) => r[cumpleField] === true).length
        result[tipo] = records.length > 0 ? ((cumplidos / records.length) * 100).toFixed(2) : 0
      } else {
        // fallback: contar como 0
        result[tipo] = 0
      }
    })

    return result
  })

  // KPI de Eficacia: Total de solicitudes que cumplieron SLA / Total de solicitudes
  const kpiEficacia = computed(() => {
    if (!filteredData.value || filteredData.value.length === 0) return 0

    const totalSolicitudes = filteredData.value.length
    const cumplidas = filteredData.value.filter((record) => {
      if (record.tipo_solicitud === 'Nuevo Personal') {
        return record.cumple_sla1 === true
      } else if (record.tipo_solicitud === 'Reemplazo') {
        return record.cumple_sla2 === true
      }
      return false
    }).length

    return ((cumplidas / totalSolicitudes) * 100).toFixed(2)
  })

  // Datos agrupados por BLOQUE TECH para el gráfico (usando datos filtrados)
  const chartDataByRole = computed(() => {
    if (!filteredData.value || filteredData.value.length === 0) return []

    const grouped = {}
    const data = filteredData.value

    data.forEach((record) => {
      const role = record.bloque_tech || 'Sin Especificar'
      if (!grouped[role]) grouped[role] = { role, totals: {}, cumplidos: {} }

      const tipo = record.tipo_solicitud || 'Sin Tipo'
      grouped[role].totals[tipo] = (grouped[role].totals[tipo] || 0) + 1

      // Solución dinámica: buscar CUALQUIER campo cumple_slaX que sea true
      // El backend garantiza que solo el campo correcto estará en true según el tipo
      // Ejemplo: "Nuevo Personal" → solo cumple_sla1 puede ser true
      //          "Reemplazo" → solo cumple_sla2 puede ser true
      const cumpleFields = Object.keys(record).filter(k => k.startsWith('cumple_sla'))
      const cumpleAlguno = cumpleFields.some(field => record[field] === true)
      
      if (cumpleAlguno) {
        grouped[role].cumplidos[tipo] = (grouped[role].cumplidos[tipo] || 0) + 1
      }
    })

    return Object.values(grouped).map((item) => {
      const slaPercentages = {}
      Object.keys(item.totals).forEach((tipo) => {
        const total = item.totals[tipo] || 0
        const cumpl = item.cumplidos[tipo] || 0
        slaPercentages[tipo] = total > 0 ? ((cumpl / total) * 100).toFixed(2) : 0
      })

      return {
        role: item.role,
        slaPercentages,
      }
    })
  })

  // Acciones
  async function fetchSlaData() {
    loading.value = true
    error.value = null

    try {
      // Pasar los filtros actuales al servicio para que la API aplique los mismos criterios
      const response = await slaService.getSlaData(filters.value || {})
      // La API puede devolver { data: [...] } o directamente un arreglo.
      const items = Array.isArray(response) ? response : (response && response.data) ? response.data : []

      // Normalizar campos para coincidir con los nombres usados en la UI (snake_case)
      const normalize = (r) => {
        // soportar distintos estilos de casing: snake_case, camelCase y PascalCase
        return {
          id_solicitud: (r.id ?? r.idSolicitud ?? r.id_solicitud ?? r.Id ?? r.IdSolicitud ?? null),
          bloque_tech: (r.bloqueTech ?? r.BloqueTech ?? r.bloque_tech ?? r.bloque ?? null),
          tipo_solicitud: (r.tipoSolicitud ?? r.TipoSolicitud ?? r.tipo_solicitud ?? r.tipo_solicitud ?? null),
          prioridad: (r.prioridad ?? r.Prioridad ?? null),
          fecha_solicitud: (r.fechaSolicitud ?? r.FechaSolicitud ?? r.fecha_solicitud ?? null),
          fecha_ingreso: (r.fechaIngreso ?? r.FechaIngreso ?? r.fecha_ingreso ?? null),
          num_dias_sla: (r.numDiasSla ?? r.NumDiasSla ?? r.num_dias_sla ?? r.diasTranscurridos ?? r.DiasTranscurridos ?? null),
          cumple_sla1: (r.cumpleSla1 ?? r.CumpleSla1 ?? r.cumple_sla1 ?? false),
          cumple_sla2: (r.cumpleSla2 ?? r.CumpleSla2 ?? r.cumple_sla2 ?? false),
          nombre_personal: (r.nombrePersonal ?? r.NombrePersonal ?? r.nombre_personal ?? ''),
          dias_umbral_sla: (r.diasUmbralSla ?? r.DiasUmbralSla ?? r.dias_umbral_sla ?? 0),
          // Mantener cualquier campo extra
          __raw: r,
        }
      }

      const normalized = items.map(normalize)
      slaData.value = normalized
      allData.value = normalized // Guardamos una copia de los datos originales sin filtrar
    } catch (err) {
      error.value = err.message || 'Error al cargar los datos SLA'
      console.error('Error fetching SLA data:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchDashboardDataForReports(reportFilters = {}) {
    loading.value = true
    error.value = null

    try {
      // Llamar al nuevo endpoint específico de reportes
      const response = await slaService.getDashboardDataForReports(reportFilters)
      const items = Array.isArray(response) ? response : (response && response.data) ? response.data : []

      // Normalizar campos
      const normalize = (r) => {
        return {
          id_solicitud: (r.id ?? r.idSolicitud ?? r.id_solicitud ?? r.Id ?? r.IdSolicitud ?? null),
          bloque_tech: (r.bloqueTech ?? r.BloqueTech ?? r.bloque_tech ?? r.bloque ?? null),
          tipo_solicitud: (r.tipoSolicitud ?? r.TipoSolicitud ?? r.tipo_solicitud ?? null),
          prioridad: (r.prioridad ?? r.Prioridad ?? null),
          fecha_solicitud: (r.fechaSolicitud ?? r.FechaSolicitud ?? r.fecha_solicitud ?? null),
          fecha_ingreso: (r.fechaIngreso ?? r.FechaIngreso ?? r.fecha_ingreso ?? null),
          num_dias_sla: (r.numDiasSla ?? r.NumDiasSla ?? r.num_dias_sla ?? r.diasTranscurridos ?? r.DiasTranscurridos ?? null),
          cumple_sla1: (r.cumpleSla1 ?? r.CumpleSla1 ?? r.cumple_sla1 ?? false),
          cumple_sla2: (r.cumpleSla2 ?? r.CumpleSla2 ?? r.cumple_sla2 ?? false),
          nombre_personal: (r.nombrePersonal ?? r.NombrePersonal ?? r.nombre_personal ?? ''),
          dias_umbral_sla: (r.diasUmbralSla ?? r.DiasUmbralSla ?? r.dias_umbral_sla ?? 0),
          __raw: r,
        }
      }

      const normalized = items.map(normalize)
      slaData.value = normalized
      allData.value = normalized
      
      console.log(`[slaStore] Datos cargados para reportes: ${normalized.length} registros`)
    } catch (err) {
      error.value = err.message || 'Error al cargar datos de reportes'
      console.error('Error fetching dashboard data for reports:', err)
    } finally {
      loading.value = false
    }
  }

  async function uploadExcelFile(file) {
    loading.value = true
    error.value = null

    try {
      const response = await slaService.uploadExcel(file)
      await fetchSlaData() // Recargar datos después de subir
      return response
    } catch (err) {
      error.value = err.message || 'Error al cargar el archivo Excel'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createManualEntry(solicitud) {
    loading.value = true
    error.value = null

    try {
      const response = await slaService.createManualEntry(solicitud)

      // Agregar la solicitud al array local de datos y a allData
      const newEntry = {
        id: response.data?.id || Date.now(),
        ...solicitud,
      }
      slaData.value.push(newEntry)
      allData.value.push(newEntry)

      return response
    } catch (err) {
      error.value = err.message || 'Error al crear la solicitud manual'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters) {
    filters.value = { ...newFilters }
  }

  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function resetFilters() {
    filters.value = {
      startDate: null,
      endDate: null,
      bloqueTech: null,
      tipoSolicitud: null,
      prioridad: null,
      cumpleSla: null,
    }
  }
  
  function markReportsAsInitialized() {
    isReportsInitialized.value = true
  }
  
  function saveReportFilters(reportFilters) {
    appliedReportFilters.value = { ...reportFilters }
  }
  
  function resetReportsInitialization() {
    isReportsInitialized.value = false
    appliedReportFilters.value = {
      selectedSlaType: null,
      appliedSlaType: null,
      startDate: null,
      endDate: null,
      selectedBloquesTech: ['TODOS']
    }
  }

  return {
    // Estado
    slaData,
    loading,
    error,
    filters,
    isReportsInitialized,
    appliedReportFilters,

    // Computados
    slaTypes,
    kpiBySla,
    kpiEficacia,
    chartDataByRole,
    filteredData,

    // Acciones
    fetchSlaData,
    fetchDashboardDataForReports,
    uploadExcelFile,
    createManualEntry,
    setFilters,
    updateFilters,
    resetFilters,
    markReportsAsInitialized,
    saveReportFilters,
    resetReportsInitialization,
  }
})
