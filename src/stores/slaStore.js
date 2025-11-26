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

  // Filtros
  const filters = ref({
    startDate: null,
    endDate: null,
    bloqueTech: [], // Array para selección múltiple
    tipoSolicitud: [], // Array para selección múltiple
    prioridad: [], // Array para selección múltiple
    cumpleSla: null,
  })

  // Datos filtrados con todos los filtros aplicados
  const filteredData = computed(() => {
    let data = [...allData.value]

    // Filtro por fecha de inicio
    if (filters.value.startDate) {
      data = data.filter(
        (record) => new Date(record.fechaSolicitud) >= new Date(filters.value.startDate),
      )
    }

    // Filtro por fecha de fin
    if (filters.value.endDate) {
      data = data.filter(
        (record) => new Date(record.fechaSolicitud) <= new Date(filters.value.endDate),
      )
    }

    // Filtro por BLOQUE TECH (múltiple)
    if (filters.value.bloqueTech && filters.value.bloqueTech.length > 0) {
      data = data.filter((record) => filters.value.bloqueTech.includes(record.bloqueTech))
    }

    // Filtro por tipo de solicitud (múltiple)
    if (filters.value.tipoSolicitud && filters.value.tipoSolicitud.length > 0) {
      data = data.filter((record) => filters.value.tipoSolicitud.includes(record.tipoSolicitud))
    }

    // Filtro por prioridad (múltiple)
    if (filters.value.prioridad && filters.value.prioridad.length > 0) {
      data = data.filter((record) => filters.value.prioridad.includes(record.prioridad))
    }

    // Filtro por cumplimiento SLA
    if (filters.value.cumpleSla) {
      data = data.filter((record) => {
        const cumple =
          (record.tipoSolicitud === 'Nuevo Personal' && record.cumpleSla1 === true) ||
          (record.tipoSolicitud === 'Reemplazo' && record.cumpleSla2 === true)

        if (filters.value.cumpleSla === 'cumple') {
          return cumple
        } else if (filters.value.cumpleSla === 'no_cumple') {
          return !cumple
        }
        return true
      })
    }

    return data
  })

  // KPIs calculados usando datos filtrados
  const kpiSla1 = computed(() => {
    if (!filteredData.value || filteredData.value.length === 0) return 0

    const sla1Records = filteredData.value.filter(
      (record) => record.tipoSolicitud === 'Nuevo Personal',
    )
    const cumplidos = sla1Records.filter((record) => record.cumpleSla1 || record.cumpleSla).length

    return sla1Records.length > 0 ? ((cumplidos / sla1Records.length) * 100).toFixed(2) : 0
  })

  const kpiSla2 = computed(() => {
    if (!filteredData.value || filteredData.value.length === 0) return 0

    const sla2Records = filteredData.value.filter((record) => record.tipoSolicitud === 'Reemplazo')
    const cumplidos = sla2Records.filter((record) => record.cumpleSla2 || record.cumpleSla).length

    return sla2Records.length > 0 ? ((cumplidos / sla2Records.length) * 100).toFixed(2) : 0
  })

  // KPIs dinámicos por tipo de solicitud
  const kpisPorTipo = computed(() => {
    if (!filteredData.value || filteredData.value.length === 0) return {}

    const configStore = useConfigStore()
    const tiposActivos = configStore.tiposSolicitud
      .filter(t => t.activo)
      .map(t => t.nombre)

    const kpis = {}

    // Agrupar por tipo de solicitud, solo tipos activos
    filteredData.value.forEach((record) => {
      const tipo = record.tipoSolicitud
      if (!tipo) return

      // Filtrar solo tipos activos
      if (!tiposActivos.includes(tipo)) {
        return
      }

      if (!kpis[tipo]) {
        kpis[tipo] = {
          total: 0,
          cumplidos: 0,
          diasUmbral: record.diasUmbralSla || 0
        }
      }

      kpis[tipo].total++
      if (record.cumpleSla || record.cumpleSla1 || record.cumpleSla2) {
        kpis[tipo].cumplidos++
      }
    })

    // Calcular porcentajes
    Object.keys(kpis).forEach(tipo => {
      const kpi = kpis[tipo]
      kpi.porcentaje = kpi.total > 0 ? ((kpi.cumplidos / kpi.total) * 100).toFixed(2) : 0
    })

    return kpis
  })

  // KPI de Eficacia: Total de solicitudes que cumplieron SLA / Total de solicitudes
  const kpiEficacia = computed(() => {
    if (!filteredData.value || filteredData.value.length === 0) return 0

    const totalSolicitudes = filteredData.value.length
    const cumplidas = filteredData.value.filter((record) => {
      // Usar el campo genérico cumpleSla si está disponible, sino usar la lógica legacy
      if (record.cumpleSla !== undefined) {
        return record.cumpleSla === true
      }
      if (record.tipoSolicitud === 'Nuevo Personal') {
        return record.cumpleSla1 === true
      } else if (record.tipoSolicitud === 'Reemplazo') {
        return record.cumpleSla2 === true
      }
      return false
    }).length

    return ((cumplidas / totalSolicitudes) * 100).toFixed(2)
  })

  // Datos agrupados por BLOQUE TECH para el gráfico (usando datos filtrados)
  const chartDataByRole = computed(() => {
    if (!filteredData.value || filteredData.value.length === 0) return []

    const configStore = useConfigStore()
    const bloquesActivos = configStore.bloques
      .filter(b => b.activo)
      .map(b => b.nombre)

    const tiposActivos = configStore.tiposSolicitud
      .filter(t => t.activo)
      .map(t => t.nombre)

    const grouped = {}
    const tiposSolicitud = new Set()

    // Primera pasada: identificar todos los tipos de solicitud y crear estructura
    // Solo incluir registros de bloques activos Y tipos activos
    filteredData.value.forEach((record) => {
      const role = record.bloqueTech || 'Sin Especificar'
      const tipo = record.tipoSolicitud

      // Filtrar solo bloques activos
      if (role !== 'Sin Especificar' && !bloquesActivos.includes(role)) {
        return
      }

      // Filtrar solo tipos activos
      if (!tipo || !tiposActivos.includes(tipo)) {
        return
      }

      if (tipo) tiposSolicitud.add(tipo)

      if (!grouped[role]) {
        grouped[role] = {
          role,
          porTipo: {}
        }
      }

      if (!grouped[role].porTipo[tipo]) {
        grouped[role].porTipo[tipo] = {
          total: 0,
          cumplidos: 0
        }
      }

      grouped[role].porTipo[tipo].total++
      if (record.cumpleSla || record.cumpleSla1 || record.cumpleSla2) {
        grouped[role].porTipo[tipo].cumplidos++
      }
    })

    // Segunda pasada: calcular porcentajes, solo para tipos activos
    return Object.values(grouped).map((item) => {
      const result = { role: item.role }

      Object.keys(item.porTipo).forEach(tipo => {
        // Verificar que el tipo esté activo
        if (!tiposActivos.includes(tipo)) {
          return
        }

        const data = item.porTipo[tipo]
        const percentage = data.total > 0 ? ((data.cumplidos / data.total) * 100).toFixed(2) : 0
        result[tipo] = percentage
      })

      // Mantener compatibilidad legacy solo si los tipos están activos
      if (tiposActivos.includes('Nuevo Personal')) {
        result.sla1Percentage = result['Nuevo Personal'] || 0
      }
      if (tiposActivos.includes('Reemplazo')) {
        result.sla2Percentage = result['Reemplazo'] || 0
      }

      return result
    })
  })

  // Acciones
  async function fetchSlaData() {
    loading.value = true
    error.value = null

    try {
      const response = await slaService.getSlaData()
      slaData.value = response.data
      allData.value = response.data // Guardamos una copia de los datos originales sin filtrar
    } catch (err) {
      error.value = err.message || 'Error al cargar los datos SLA'
      console.error('Error fetching SLA data:', err)
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
      bloqueTech: [],
      tipoSolicitud: [],
      prioridad: [],
      cumpleSla: null,
    }
  }

  return {
    // Estado
    slaData,
    loading,
    error,
    filters,

    // Computados
    kpiSla1,
    kpiSla2,
    kpisPorTipo,
    kpiEficacia,
    chartDataByRole,
    filteredData,

    // Acciones
    fetchSlaData,
    uploadExcelFile,
    createManualEntry,
    setFilters,
    updateFilters,
    resetFilters,
  }
})
