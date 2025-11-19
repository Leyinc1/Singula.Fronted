/**
 * Chart.js Boot File
 * Registra los componentes necesarios de Chart.js para usar en la aplicación
 */
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js'

// Registrar componentes de Chart.js globalmente
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
)

export default () => {
  // Chart.js ya está registrado globalmente
}
