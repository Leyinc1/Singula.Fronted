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

  // Filtros
  const filters = ref({
    startDate: null,
    endDate: null,
    bloqueTech: null,
    tipoSolicitud: null,
    prioridad: null,
    cumpleSla: null,
  })

  // Datos filtrados con todos los filtros aplicados
  const filteredData = computed(() => {
    let data = [...allData.value]

    // Filtro por fecha de inicio
    if (filters.value.startDate) {
      data = data.filter(
        (record) => new Date(record.fecha_solicitud) >= new Date(filters.value.startDate),
      )
    }

    // Filtro por fecha de fin
    if (filters.value.endDate) {
      data = data.filter(
        (record) => new Date(record.fecha_solicitud) <= new Date(filters.value.endDate),
      )
    }

    // Filtro por BLOQUE TECH
    if (filters.value.bloqueTech) {
      data = data.filter((record) => record.bloque_tech === filters.value.bloqueTech)
    }

    // Filtro por tipo de solicitud
    if (filters.value.tipoSolicitud) {
      data = data.filter((record) => record.tipo_solicitud === filters.value.tipoSolicitud)
    }

    // Filtro por prioridad
    if (filters.value.prioridad) {
      data = data.filter((record) => record.prioridad === filters.value.prioridad)
    }

    // Filtro por cumplimiento SLA
    if (filters.value.cumpleSla) {
      data = data.filter((record) => {
        const cumple =
          (record.tipo_solicitud === 'Nuevo Personal' && record.cumple_sla1 === true) ||
          (record.tipo_solicitud === 'Reemplazo' && record.cumple_sla2 === true)

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
      (record) => record.tipo_solicitud === 'Nuevo Personal',
    )
    const cumplidos = sla1Records.filter((record) => record.cumple_sla1).length

    return sla1Records.length > 0 ? ((cumplidos / sla1Records.length) * 100).toFixed(2) : 0
  })

  const kpiSla2 = computed(() => {
    if (!filteredData.value || filteredData.value.length === 0) return 0

    const sla2Records = filteredData.value.filter((record) => record.tipo_solicitud === 'Reemplazo')
    const cumplidos = sla2Records.filter((record) => record.cumple_sla2).length

    return sla2Records.length > 0 ? ((cumplidos / sla2Records.length) * 100).toFixed(2) : 0
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

    filteredData.value.forEach((record) => {
      const role = record.bloque_tech || 'Sin Especificar'

      if (!grouped[role]) {
        grouped[role] = {
          role,
          totalSla1: 0,
          cumplidosSla1: 0,
          totalSla2: 0,
          cumplidosSla2: 0,
        }
      }

      if (record.tipo_solicitud === 'Nuevo Personal') {
        grouped[role].totalSla1++
        if (record.cumple_sla1) grouped[role].cumplidosSla1++
      } else if (record.tipo_solicitud === 'Reemplazo') {
        grouped[role].totalSla2++
        if (record.cumple_sla2) grouped[role].cumplidosSla2++
      }
    })

    return Object.values(grouped).map((item) => ({
      role: item.role,
      sla1Percentage:
        item.totalSla1 > 0 ? ((item.cumplidosSla1 / item.totalSla1) * 100).toFixed(2) : 0,
      sla2Percentage:
        item.totalSla2 > 0 ? ((item.cumplidosSla2 / item.totalSla2) * 100).toFixed(2) : 0,
    }))
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
      bloqueTech: null,
      tipoSolicitud: null,
      prioridad: null,
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
