import api from './api'

/**
 * Servicio para manejar la lógica predictiva y de simulación
 * Implementa US-016 (Predicción) y US-017 (Simulación)
 */
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
        requests: requestsResponse.data,
        slaConfig: configResponse.data,
      }
    } catch (error) {
      console.error('Error fetching predictive data:', error)
      throw error
    }
  },

  /**
   * Procesa los datos históricos para agruparlos por mes y calcular cumplimiento
   * @param {Array} requests - Lista de solicitudes
   * @returns {Array} - Datos procesados [{month: 'Ene', compliance: 85}, ...]
   */
  processHistoryData(requests) {
    if (!requests || requests.length === 0) return []

    // 1. Agrupar por mes (YYYY-MM)
    const groupedByMonth = {}
    
    requests.forEach(req => {
      if (!req.fecha_solicitud) return
      
      const date = new Date(req.fecha_solicitud)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = {
          total: 0,
          cumplidas: 0,
          monthLabel: date.toLocaleDateString('es-ES', { month: 'short' })
        }
      }
      
      groupedByMonth[monthKey].total++
      
      // Verificar cumplimiento según tipo
      let cumple = false
      if (req.tipo_solicitud === 'Nuevo Personal') {
        cumple = req.cumple_sla1 === true
      } else if (req.tipo_solicitud === 'Reemplazo') {
        cumple = req.cumple_sla2 === true
      }
      
      if (cumple) {
        groupedByMonth[monthKey].cumplidas++
      }
    })

    // 2. Convertir a array y ordenar cronológicamente
    const sortedKeys = Object.keys(groupedByMonth).sort()
    
    // 3. Calcular % y formatear
    return sortedKeys.map(key => {
      const data = groupedByMonth[key]
      const compliance = data.total > 0 ? (data.cumplidas / data.total) * 100 : 0
      
      return {
        month: data.monthLabel, // Ej: "ene"
        compliance: parseFloat(compliance.toFixed(1)),
        fullDate: key // Para ordenamiento interno si fuera necesario
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
   * @param {Object} inputs - { volume, priorityDistribution }
   * @param {Array} slaConfigs - Configuraciones de SLA
   * @returns {Object} - Resultados simulados
   */
  runSimulation(inputs) {
    // Lógica simplificada de simulación
    // En un caso real, esto usaría un modelo más complejo o reglas de negocio específicas
    
    // Factor base: empezamos con un cumplimiento ideal del 100%
    let simulatedCompliance = 100

    // 1. Impacto del Volumen
    // Asumimos que cada 10 solicitudes por encima de 50 bajan el cumplimiento un 1%
    const volumeImpact = Math.max(0, (inputs.volume - 50) / 10)
    simulatedCompliance -= volumeImpact

    // 2. Impacto de la Prioridad
    // Si hay mucha prioridad alta, baja el cumplimiento
    if (inputs.priority === 'Alta Prioridad') {
      simulatedCompliance -= 5
    } else if (inputs.priority === 'Baja Prioridad') {
      simulatedCompliance += 2
    }

    // Limitar entre 0 y 100
    simulatedCompliance = Math.min(100, Math.max(0, simulatedCompliance))

    return {
      sla1: parseFloat(simulatedCompliance.toFixed(1)),
      sla1Change: parseFloat((simulatedCompliance - 80).toFixed(1)), // Comparado con base ficticia de 80%
      sla2: parseFloat((simulatedCompliance + 5).toFixed(1)), // SLA2 suele ser un poco mejor
      sla2Change: parseFloat((simulatedCompliance + 5 - 85).toFixed(1)),
    }
  },
}
