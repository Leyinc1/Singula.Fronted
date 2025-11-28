import api from './api'

/**
 * Servicio para manejar la lógica predictiva y de simulación
 * Implementa US-016 (Predicción) y US-017 (Simulación)
 */

// Datos mock para cuando no hay suficientes datos reales
const MOCK_HISTORY_DATA = [
  { month: 'Jul', compliance: 78.5, fullDate: '2025-07' },
  { month: 'Ago', compliance: 82.3, fullDate: '2025-08' },
  { month: 'Sep', compliance: 79.1, fullDate: '2025-09' },
  { month: 'Oct', compliance: 85.6, fullDate: '2025-10' },
  { month: 'Nov', compliance: 81.2, fullDate: '2025-11' },
]

export const predictiveService = {
  /**
   * Obtiene el historial de solicitudes y configuraciones SLA
   * @returns {Promise<{requests: Array, slaConfig: Array}>}
   */
  async fetchData() {
    try {
      const [requestsResponse, configResponse] = await Promise.all([
        api.get('/solicitud'),
        api.get('/configsla'),
      ])
      return {
        requests: requestsResponse.data || [],
        slaConfig: configResponse.data || [],
      }
    } catch (error) {
      console.error('Error fetching predictive data:', error)
      // Devolver datos vacíos en caso de error para que se usen los mocks
      return {
        requests: [],
        slaConfig: [],
      }
    }
  },

  /**
   * Procesa los datos históricos para agruparlos por mes y calcular cumplimiento
   * @param {Array} requests - Lista de solicitudes
   * @returns {Array} - Datos procesados [{month: 'Ene', compliance: 85}, ...]
   */
  processHistoryData(requests) {
    if (!requests || requests.length === 0) {
      console.log('Sin datos reales, usando datos mock para predicciones')
      return MOCK_HISTORY_DATA
    }

    // 1. Agrupar por mes (YYYY-MM)
    const groupedByMonth = {}
    
    requests.forEach(req => {
      // Soportar tanto camelCase (API) como snake_case
      const fechaSolicitud = req.fechaSolicitud || req.fecha_solicitud
      if (!fechaSolicitud) return
      
      const date = new Date(fechaSolicitud)
      if (isNaN(date.getTime())) return // Fecha inválida
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = {
          total: 0,
          cumplidas: 0,
          monthLabel: date.toLocaleDateString('es-ES', { month: 'short' })
        }
      }
      
      groupedByMonth[monthKey].total++
      
      // Calcular cumplimiento basado en días SLA
      // Si numDiasSla <= umbral (ej: 30 para nuevo, 15 para reemplazo), cumple
      const numDiasSla = req.numDiasSla || req.num_dias_sla || 0
      const resumenSla = (req.resumenSla || req.resumen_sla || '').toLowerCase()
      
      let umbral = 30 // Por defecto, SLA de 30 días
      if (resumenSla.includes('reemplazo')) {
        umbral = 15
      }
      
      if (numDiasSla <= umbral) {
        groupedByMonth[monthKey].cumplidas++
      }
    })

    // 2. Convertir a array y ordenar cronológicamente
    const sortedKeys = Object.keys(groupedByMonth).sort()
    
    // Si no hay suficientes meses, usar datos mock
    if (sortedKeys.length < 2) {
      console.log('Datos insuficientes, combinando con datos mock')
      return MOCK_HISTORY_DATA
    }
    
    // 3. Calcular % y formatear
    return sortedKeys.map(key => {
      const data = groupedByMonth[key]
      const compliance = data.total > 0 ? (data.cumplidas / data.total) * 100 : 0
      
      return {
        month: data.monthLabel.charAt(0).toUpperCase() + data.monthLabel.slice(1), // Capitalizar
        compliance: parseFloat(compliance.toFixed(1)),
        fullDate: key
      }
    })
  },

  /**
   * Calcula la regresión lineal simple para predecir el cumplimiento futuro
   * US-016: Predicción de cumplimiento SLA
   * @param {Array} historyData - Datos históricos agrupados por mes
   * @returns {Object} - Datos para el gráfico (labels, datasets) y predicción del próximo mes
   */
  calculatePrediction(historyData) {
    // Si no hay datos suficientes, devolver estructura vacía
    if (!historyData || historyData.length < 2) {
      return {
        chartData: { labels: [], datasets: [] },
        nextMonthPrediction: 0,
        trend: 0,
      }
    }

    // Preparar datos para regresión (x = índice de mes, y = cumplimiento %)
    const n = historyData.length
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumXX = 0

    const labels = []
    const actualValues = []

    historyData.forEach((item, index) => {
      const x = index
      const y = item.compliance // Asumimos que viene un campo 'compliance' o similar
      
      sumX += x
      sumY += y
      sumXY += x * y
      sumXX += x * x

      labels.push(item.month) // Ej: "Ene", "Feb"
      actualValues.push(y)
    })

    // Calcular pendiente (m) y ordenada al origen (b)
    // y = mx + b
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Predecir el siguiente mes (índice n)
    const nextMonthIndex = n
    const nextMonthPrediction = slope * nextMonthIndex + intercept

    // Generar línea de tendencia para el gráfico
    const trendValues = historyData.map((_, index) => slope * index + intercept)
    trendValues.push(nextMonthPrediction) // Agregar punto futuro

    // Agregar etiqueta para el mes futuro
    labels.push('Próximo Mes')

    return {
      chartData: {
        labels,
        datasets: [
          {
            label: 'Cumplimiento Real',
            backgroundColor: '#000000',
            borderColor: '#000000',
            data: actualValues,
            tension: 0.4,
          },
          {
            label: 'Tendencia (Regresión)',
            backgroundColor: '#e0e0e0',
            borderColor: '#9e9e9e',
            borderDash: [5, 5],
            data: trendValues,
            pointRadius: 0,
          },
        ],
      },
      nextMonthPrediction: parseFloat(nextMonthPrediction.toFixed(1)),
      trend: parseFloat(slope.toFixed(2)), // Pendiente positiva = mejora, negativa = empeora
    }
  },

  /**
   * Simula el cumplimiento basado en variables hipotéticas
   * US-017: Simular escenarios
   * @param {Object} inputs - { volume, priority, baseCompliance }
   * @returns {Object} - Resultados simulados
   */
  runSimulation(inputs) {
    // Usar el promedio histórico como base, o 80% por defecto
    const baseCompliance = inputs.baseCompliance || 80
    
    // Factor base: empezamos con el cumplimiento histórico promedio
    let simulatedCompliance = baseCompliance

    // 1. Impacto del Volumen
    // Cada 10 solicitudes por encima de 50 baja el cumplimiento un 1%
    // Si hay menos de 50, puede mejorar ligeramente
    const volumeImpact = (inputs.volume - 50) / 10
    simulatedCompliance -= volumeImpact

    // 2. Impacto de la Prioridad
    if (inputs.priority === 'Alta Prioridad') {
      simulatedCompliance -= 5 // Mayor presión = menor cumplimiento
    } else if (inputs.priority === 'Baja Prioridad') {
      simulatedCompliance += 3 // Menos presión = mejor cumplimiento
    }

    // Limitar entre 0 y 100
    simulatedCompliance = Math.min(100, Math.max(0, simulatedCompliance))
    
    // SLA2 suele tener mejor cumplimiento (solicitudes menos urgentes)
    const sla2Compliance = Math.min(100, simulatedCompliance + 5)

    // Calcular cambios respecto al promedio histórico
    const sla1Change = simulatedCompliance - baseCompliance
    const sla2Change = sla2Compliance - (baseCompliance + 5) // Base SLA2 es base + 5

    return {
      sla1: parseFloat(simulatedCompliance.toFixed(1)),
      sla1Change: parseFloat(sla1Change.toFixed(1)),
      sla2: parseFloat(sla2Compliance.toFixed(1)),
      sla2Change: parseFloat(sla2Change.toFixed(1)),
    }
  },
}
