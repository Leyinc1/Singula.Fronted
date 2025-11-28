/**
 * Store de Pinia para gestionar los datos SLA
 * Maneja: datos del dashboard, KPIs, filtros, predicciones
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { slaService } from 'src/services/slaService'
import { useConfigStore } from './configStore'

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
    area: [], // Array para selección múltiple
    tipoSolicitud: [], // Array para selección múltiple
    prioridad: [], // Array para selección múltiple
    cumpleSla: null,
    dateField: 'fecha_solicitud',
  })

  // Datos filtrados con todos los filtros aplicados
  const filteredData = computed(() => {
    let data = [...allData.value]
    const dateField = filters.value.dateField || 'fecha_solicitud'

    // 1. Filtro Fecha Inicio
    if (filters.value.startDate) {
      data = data.filter((record) => {
        // Soporte para ambos formatos de propiedad por si acaso
        const dateVal = record[dateField] || record.fechaSolicitud
        return new Date(dateVal) >= new Date(filters.value.startDate)
      })
    }

    // 2. Filtro Fecha Fin
    if (filters.value.endDate) {
      data = data.filter((record) => {
        const dateVal = record[dateField] || record.fechaSolicitud
        return new Date(dateVal) <= new Date(filters.value.endDate)
      })
    }

    // 3. Filtro Area (Local)
    if (filters.value.area && filters.value.area.length > 0) {
      // Manejar tanto array como string simple
      const filterVal = filters.value.area
      if (Array.isArray(filterVal)) {
        // Si no está vacío y no incluye TODOS (aunque TODOS suele limpiarse antes)
        if (filterVal.length > 0 && !filterVal.includes('TODOS')) {
          data = data.filter((record) => filterVal.includes(record.area || record.Area))
        }
      } else {
        // String simple
        data = data.filter((record) => (record.area || record.Area) === filterVal)
      }
    }

    // 4. Filtro Tipo Solicitud
    if (filters.value.tipoSolicitud && filters.value.tipoSolicitud.length > 0) {
       // Aceptar array o string
       const tipos = Array.isArray(filters.value.tipoSolicitud) ? filters.value.tipoSolicitud : [filters.value.tipoSolicitud]
       data = data.filter((record) => tipos.includes(record.tipo_solicitud || record.tipoSolicitud))
    }

    // 5. Filtro Prioridad
    if (filters.value.prioridad && filters.value.prioridad.length > 0) {
      data = data.filter((record) => filters.value.prioridad.includes(record.prioridad))
    }

    // 6. Filtro Cumplimiento (Dinámico vs Legacy)
    if (filters.value.cumpleSla) {
      data = data.filter((record) => {
        // Lógica dinámica (Feat): buscar campos cumple_...
        const cumpleField = Object.keys(record).find((k) => k.startsWith('cumple_') || k.startsWith('cumpleSla'))
        let cumpleVal = false

        if (cumpleField) {
          cumpleVal = record[cumpleField] === true
        } else {
          // Lógica Legacy (Master fallback)
          cumpleVal =
            ((record.tipo_solicitud === 'Nuevo Personal' || record.tipoSolicitud === 'Nuevo Personal') && (record.cumple_sla1 || record.cumpleSla1)) ||
            ((record.tipo_solicitud === 'Reemplazo' || record.tipoSolicitud === 'Reemplazo') && (record.cumple_sla2 || record.cumpleSla2))
        }

        if (filters.value.cumpleSla === 'cumple') return cumpleVal
        if (filters.value.cumpleSla === 'no_cumple') return !cumpleVal
        return true
      })
    }

    return data
  })

  // --- KPIs CALCULADOS ---

  // 1. Tipos de SLA disponibles (Dinámico)
  const slaTypes = computed(() => {
    const types = new Set(allData.value.map((r) => r.tipo_solicitud || r.tipoSolicitud).filter(Boolean))
    return Array.from(types)
  })

  // 2. KPI por SLA (Dinámico)
  const kpiBySla = computed(() => {
    const result = {}
    const data = filteredData.value || []

    slaTypes.value.forEach((tipo) => {
      const records = data.filter((r) => (r.tipo_solicitud || r.tipoSolicitud) === tipo)
      if (records.length === 0) {
        result[tipo] = 0
        return
      }

      // Detectar campo de cumplimiento dinámicamente
      // Prioridad: cumple_slaX (snake) -> cumpleSlaX (camel) -> lógica específica
      let fieldName = null

      if (tipo === 'Nuevo Personal') fieldName = ['cumple_sla1', 'cumpleSla1']
      else if (tipo === 'Reemplazo') fieldName = ['cumple_sla2', 'cumpleSla2']

      let cumplidos = 0

      if (fieldName) {
        cumplidos = records.filter(r => r[fieldName[0]] === true || r[fieldName[1]] === true).length
      } else {
        // Fallback genérico
        const genericField = Object.keys(records[0] || {}).find(k => k.startsWith('cumple_') || k.startsWith('cumpleSla'))
        if (genericField) {
           cumplidos = records.filter(r => r[genericField] === true).length
        }
      }

      result[tipo] = records.length > 0 ? ((cumplidos / records.length) * 100).toFixed(2) : 0
    })

    return result
  })

  // 3. Compatibilidad con Master (kpiSla1 / kpiSla2) mapeado a la lógica nueva
  const kpiSla1 = computed(() => kpiBySla.value['Nuevo Personal'] || 0)
  const kpiSla2 = computed(() => kpiBySla.value['Reemplazo'] || 0)

  // 4. KPIs estructurados por Tipo (De Master, adaptado a snake_case)
  const kpisPorTipo = computed(() => {
    if (!filteredData.value || filteredData.value.length === 0) return {}

    const configStore = useConfigStore()
    const tiposActivos = configStore.tiposSolicitud
      .filter(t => t.activo)
      .map(t => t.nombre)

    const kpis = {}

    filteredData.value.forEach((record) => {
      const tipo = record.tipo_solicitud || record.tipoSolicitud
      if (!tipo || !tiposActivos.includes(tipo)) return

      if (!kpis[tipo]) {
        kpis[tipo] = {
          total: 0,
          cumplidos: 0,
          diasUmbral: record.dias_umbral_sla || record.diasUmbralSla || 0
        }
      }

      kpis[tipo].total++

      // Chequeo exhaustivo de cumplimiento
      if (
        record.cumple_sla1 || record.cumpleSla1 ||
        record.cumple_sla2 || record.cumpleSla2 ||
        record.cumpleSla === true
      ) {
        kpis[tipo].cumplidos++
      }
    })

    Object.keys(kpis).forEach(tipo => {
      const kpi = kpis[tipo]
      kpi.porcentaje = kpi.total > 0 ? ((kpi.cumplidos / kpi.total) * 100).toFixed(2) : 0
    })

    return kpis
  })

  // 5. KPI de Eficacia Global
  const kpiEficacia = computed(() => {
    if (!filteredData.value || filteredData.value.length === 0) return 0

    const totalSolicitudes = filteredData.value.length
    const cumplidas = filteredData.value.filter((record) => {
      return (
        record.cumpleSla === true ||
        record.cumple_sla1 === true || record.cumpleSla1 === true ||
        record.cumple_sla2 === true || record.cumpleSla2 === true
      )
    }).length

    return ((cumplidas / totalSolicitudes) * 100).toFixed(2)
  })

  // --- GRÁFICOS ---
  // Datos agrupados por BLOQUE TECH (Versión Feat para Reportes)
  const chartDataByRole = computed(() => {
    if (!filteredData.value || filteredData.value.length === 0) return []

    const grouped = {}
    const data = filteredData.value

    data.forEach((record) => {
      const role = record.area || record.Area || 'Sin Especificar'
      if (!grouped[role]) grouped[role] = { role, totals: {}, cumplidos: {} }

      const tipo = record.tipo_solicitud || record.tipoSolicitud || 'Sin Tipo'
      grouped[role].totals[tipo] = (grouped[role].totals[tipo] || 0) + 1

      // Buscar si cumple alguno de los SLAs asociados
      const cumple =
        record.cumple_sla1 || record.cumpleSla1 ||
        record.cumple_sla2 || record.cumpleSla2 ||
        record.cumpleSla === true

      if (cumple) {
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

      // Retornar formato enriquecido
      return {
        role: item.role,
        slaPercentages,
        // Compatibilidad con Master si algún componente lo necesita plano
        ...slaPercentages
      }
    })
  })

  // --- ACCIONES ---

  async function fetchSlaData() {
    loading.value = true
    error.value = null

    try {
      const response = await slaService.getSlaData(filters.value || {})
      const items = Array.isArray(response) ? response : (response && response.data) ? response.data : []

      // Normalizar a snake_case (preferido por Feat) pero manteniendo compatibilidad
      const normalize = (r) => {
        return {
          id_solicitud: (r.id ?? r.idSolicitud ?? r.id_solicitud ?? r.Id ?? r.IdSolicitud ?? null),
          area: (r.area ?? r.Area ?? null),
          tipo_solicitud: (r.tipoSolicitud ?? r.TipoSolicitud ?? r.tipo_solicitud ?? null),
          prioridad: (r.prioridad ?? r.Prioridad ?? null),
          fecha_solicitud: (r.fechaSolicitud ?? r.FechaSolicitud ?? r.fecha_solicitud ?? null),
          fecha_ingreso: (r.fechaIngreso ?? r.FechaIngreso ?? r.fecha_ingreso ?? null),
          num_dias_sla: (r.numDiasSla ?? r.NumDiasSla ?? r.num_dias_sla ?? r.diasTranscurridos ?? null),
          cumple_sla1: (r.cumpleSla1 ?? r.CumpleSla1 ?? r.cumple_sla1 ?? false),
          cumple_sla2: (r.cumpleSla2 ?? r.CumpleSla2 ?? r.cumple_sla2 ?? false),
          nombre_personal: (r.nombrePersonal ?? r.NombrePersonal ?? r.nombre_personal ?? ''),
          dias_umbral_sla: (r.diasUmbralSla ?? r.DiasUmbralSla ?? r.dias_umbral_sla ?? 0),
          // Mantener raw para seguridad
          ...r
        }
      }

      const normalized = items.map(normalize)
      slaData.value = normalized
      allData.value = normalized
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
      const response = await slaService.getDashboardDataForReports(reportFilters)
      const items = Array.isArray(response) ? response : (response && response.data) ? response.data : []

      // Misma normalización
      const normalize = (r) => {
        return {
          id_solicitud: (r.id ?? r.idSolicitud ?? r.id_solicitud ?? r.Id ?? null),
          area: (r.area ?? r.Area ?? null),
          tipo_solicitud: (r.tipoSolicitud ?? r.TipoSolicitud ?? r.tipo_solicitud ?? null),
          prioridad: (r.prioridad ?? r.Prioridad ?? null),
          fecha_solicitud: (r.fechaSolicitud ?? r.FechaSolicitud ?? r.fecha_solicitud ?? null),
          fecha_ingreso: (r.fechaIngreso ?? r.FechaIngreso ?? r.fecha_ingreso ?? null),
          num_dias_sla: (r.numDiasSla ?? r.NumDiasSla ?? r.num_dias_sla ?? null),
          cumple_sla1: (r.cumpleSla1 ?? r.CumpleSla1 ?? r.cumple_sla1 ?? false),
          cumple_sla2: (r.cumpleSla2 ?? r.CumpleSla2 ?? r.cumple_sla2 ?? false),
          dias_umbral_sla: (r.diasUmbralSla ?? r.DiasUmbralSla ?? r.dias_umbral_sla ?? 0),
          ...r
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
      await fetchSlaData()
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
      area: [],
      tipoSolicitud: [],
      prioridad: [],
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
    kpiSla1, // Legacy support
    kpiSla2, // Legacy support
    kpisPorTipo, // Legacy support
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
