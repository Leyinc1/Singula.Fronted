<template>
  <q-btn
    :label="buttonLabel"
    :icon="buttonIcon"
    :color="buttonColor"
    :loading="generating"
    :disable="disabled || generating"
    @click="generatePdf"
    :unelevated="unelevated"
    :outline="outline"
    :flat="flat"
  >
    <q-tooltip v-if="tooltip">{{ tooltip }}</q-tooltip>
  </q-btn>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { api } from 'src/boot/axios'
import logoUrl from 'src/assets/tata-consultancy-services-logo-png.png'

const $q = useQuasar()

const props = defineProps({
  data: { type: Array, default: () => [] },
  kpiData: { type: Object, default: () => ({}) },
  incumplimientosData: { type: Array, default: () => [] },
  title: { type: String, default: 'Reporte de SLA' },
  slaCode: { type: String, default: 'SLA' }, // Código SLA para BD (ej: "SLA1", "SLA2")
  filename: { type: String, default: 'reporte-sla.pdf' },
  buttonLabel: { type: String, default: 'Exportar PDF' },
  buttonIcon: { type: String, default: 'picture_as_pdf' },
  buttonColor: { type: String, default: 'primary' },
  disabled: { type: Boolean, default: false },
  unelevated: { type: Boolean, default: true },
  outline: { type: Boolean, default: false },
  flat: { type: Boolean, default: false },
  tooltip: { type: String, default: '' },
  saveMetadata: { type: Boolean, default: false },
  filtros: { type: Object, default: () => ({}) },
  generatedBy: { type: Number, default: null },
})

const emit = defineEmits(['pdf-generated', 'pdf-error', 'pdf-uploaded'])

const generating = ref(false)

async function generatePdf() {
  generating.value = true

  try {
    const doc = new jsPDF()

    // Header: logo (left) + title
    let logoData = null
    try {
      const resp = await fetch(logoUrl)
      const blob = await resp.blob()
      logoData = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
    } catch (err) {
      // no bloquear si falla la carga del logo
      console.warn('No se pudo cargar logo para PDF', err)
    }

    // Indicator radius variable (ajustar para tamaño de círculo en PDF)
    const indicatorRadius = 2 // Reducido para que sea más pequeño

    let currentY = 10 // Comenzar más arriba para el logo

    // Logo en la esquina superior izquierda (como encabezado)
    if (logoData) {
      try {
        const logoWidth = 55
        const logoHeight = 20
        doc.addImage(logoData, 'PNG', 14, currentY, logoWidth, logoHeight)
        currentY += logoHeight + 8
      } catch (err) {
        console.warn('addImage falló:', err)
        currentY += 5
      }
    }

    // Título en negro y negrita
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(props.title || 'Reporte SLA', 14, currentY)
    currentY += 8

    // Período y fecha de generación
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    
    // Mostrar período de filtros si existe
    if (props.filtros && props.filtros.startDate && props.filtros.endDate) {
      const formatDate = (dateStr) => {
        if (!dateStr) return ''
        // Usar la fecha como está (YYYY-MM-DD) sin conversiones que cambien el día
        const [year, month, day] = dateStr.split('-')
        const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']
        return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`
      }
      doc.text(`Período: ${formatDate(props.filtros.startDate)} al ${formatDate(props.filtros.endDate)}`, 14, currentY)
      currentY += 5
    }
    
    const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    doc.text(`Fecha de generación: ${fecha}`, 14, currentY)
    currentY += 10

    // KPIs en formato visual (cards style)
    if (props.kpiData && Object.keys(props.kpiData).length > 0) {
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Indicadores Clave (KPIs)', 14, currentY)
      currentY += 8

      // Dibujar KPIs en un grid de 3 columnas
      const kpiEntries = Object.entries(props.kpiData)
      const cardsPerRow = 3
      const cardWidth = 60
      const baseCardHeight = 18 // Altura base reducida
      const cardSpacing = 5
      const startX = 14

      // PRIMERO: Calcular la altura máxima necesaria para todos los cards
      let maxCardHeight = baseCardHeight
      kpiEntries.forEach(([key]) => {
        const maxWidth = cardWidth - 4
        const lines = doc.splitTextToSize(key, maxWidth)
        const cardHeight = baseCardHeight + (lines.length > 1 ? (lines.length - 1) * 2.5 : 0)
        if (cardHeight > maxCardHeight) {
          maxCardHeight = cardHeight
        }
      })

      // SEGUNDO: Dibujar todos los cards con la misma altura máxima
      let cardX = startX
      let cardY = currentY
      let cardCount = 0

      kpiEntries.forEach(([key, val]) => {
        // Usar la altura máxima calculada para todos los cards
        const cardHeight = maxCardHeight
        
        // Dibujar card con borde
        doc.setDrawColor(200, 200, 200)
        doc.setFillColor(250, 250, 250)
        doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 2, 2, 'FD')

        // Título del KPI (ajustar texto si es muy largo)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        
        const maxWidth = cardWidth - 4
        const lines = doc.splitTextToSize(key, maxWidth)
        const startY = cardY + 4
        
        lines.forEach((line, idx) => {
          doc.text(line, cardX + cardWidth / 2, startY + (idx * 2.5), { align: 'center' })
        })

        // Valor del KPI (ajustar posición según número de líneas del título)
        const valueY = startY + (lines.length * 2.5) + 6
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        
        // Color según el valor y tipo de KPI
        const numVal = parseFloat(val)
        if (!isNaN(numVal)) {
          if (key.toLowerCase().includes('cumplimiento')) {
            if (numVal >= 80) doc.setTextColor(76, 175, 80) // Verde
            else if (numVal >= 70) doc.setTextColor(255, 152, 0) // Naranja
            else doc.setTextColor(244, 67, 54) // Rojo
          } else if (key.toLowerCase().includes('incumpl') || key.toLowerCase().includes('retraso')) {
            if (numVal === 0) doc.setTextColor(76, 175, 80) // Verde si no hay incumplimientos
            else doc.setTextColor(244, 67, 54) // Rojo si hay incumplimientos
          } else if (key.toLowerCase().includes('alerta')) {
            if (numVal === 0) doc.setTextColor(76, 175, 80) // Verde si no hay alertas
            else doc.setTextColor(255, 152, 0) // Naranja si hay alertas
          } else {
            doc.setTextColor(33, 150, 243) // Azul para otros
          }
        } else {
          doc.setTextColor(0, 0, 0)
        }
        
        // Formatear el valor correctamente
        let valueText = String(val)
        if (!isNaN(numVal)) {
          if (key.includes('%')) {
            valueText = `${numVal}%`
          } else if (key.toLowerCase().includes('días')) {
            valueText = `${numVal}`
          } else if (key.toLowerCase().includes('solicitudes') || key.toLowerCase().includes('total')) {
            valueText = String(numVal)
          } else {
            valueText = `${numVal}%`
          }
        }
        
        doc.text(valueText, cardX + cardWidth / 2, valueY, { align: 'center' })

        cardCount++
        if (cardCount % cardsPerRow === 0) {
          cardX = startX
          cardY += maxCardHeight + cardSpacing
        } else {
          cardX += cardWidth + cardSpacing
        }
      })

      // Ajustar currentY considerando la última fila
      currentY = cardY + (cardCount % cardsPerRow === 0 ? 5 : maxCardHeight + 10)
    }

    // Tabla de datos (dinámica según data)
    if (props.data && props.data.length > 0) {
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Detalle de Cumplimiento por Rol', 14, currentY)
      currentY += 5

      // Detectar columnas dinámicas
      const first = props.data[0]
      const slaKeys = first.slaPercentages ? Object.keys(first.slaPercentages) : ['SLA1', 'SLA2']

      const head = [
        'BLOQUE TECH', 
        'SOLICITUDES', 
        'TIEMPO PROM.',
        ...slaKeys.map((k) => `${k} (%)`), 
        'INDICADOR'
      ]

      const tableData = props.data.map((item) => {
        const row = []
        row.push(item.role || 'N/A')
        row.push(item.numResources != null ? item.numResources : '0')
        row.push(item.tiempoPromedio != null ? `${item.tiempoPromedio} días` : '0 días')
        slaKeys.forEach((k) => {
          const v = item.slaPercentages ? item.slaPercentages[k] : (item[`${k.toLowerCase()}Percentage`] || null)
          row.push(v != null ? `${v}%` : 'N/A')
        })
        // Para INDICADOR, pasar el valor numérico pero será reemplazado visualmente
        const indicatorValue = item.slaPercentages ? Object.values(item.slaPercentages)[0] : null
        row.push(indicatorValue != null ? indicatorValue : '')
        return row
      })

      autoTable(doc, {
        startY: currentY,
        head: [head],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [96, 125, 139],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          [head.length - 1]: { cellWidth: 25 } // Ancho fijo para columna INDICADOR
        },
        didDrawCell: function (data) {
          const indicatorColIndex = head.length - 1
          if (data.section === 'body' && data.column.index === indicatorColIndex) {
            const raw = data.cell.raw
            const percent = parseFloat(raw)
            let color = [189, 189, 189]
            let text = 'Sin dato'
            
            if (!isNaN(percent)) {
              if (percent >= 80) {
                color = [76, 175, 80]
                text = 'Cumple'
              } else if (percent >= 70) {
                color = [255, 152, 0]
                text = 'Alerta'
              } else {
                color = [244, 67, 54]
                text = 'Incumple'
              }
            }
            
            // Limpiar contenido de la celda primero
            doc.setFillColor(255, 255, 255)
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F')
            
            // Dibujar círculo de color
            const x = data.cell.x + 4
            const y = data.cell.y + data.cell.height / 2
            doc.setFillColor(...color)
            doc.circle(x, y, indicatorRadius, 'F')
            
            // Agregar texto al lado (sin mostrar el porcentaje numérico)
            doc.setFontSize(7)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(...color)
            doc.text(text, x + 4.5, y + 1)
          }
        },
      })

      currentY = doc.lastAutoTable.finalY + 10
    }

    // Tabla de Incumplimientos (si hay datos)
    if (props.incumplimientosData && props.incumplimientosData.length > 0) {
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(211, 47, 47)
      doc.text('Análisis de Incumplimientos', 14, currentY)
      currentY += 5

      const headIncumplimientos = [
        'BLOQUE TECH',
        'INCUMPLIMIENTOS',
        '% DEL TOTAL',
        'RETRASO PROM.'
      ]

      const tableDataIncumplimientos = props.incumplimientosData.map((item) => [
        item.role || 'N/A',
        item.numIncumplimientos || 0,
        `${item.porcentajeIncumplimiento || 0}%`,
        `${item.retrasoPromedio || 0} días`
      ])

      autoTable(doc, {
        startY: currentY,
        head: [headIncumplimientos],
        body: tableDataIncumplimientos,
        theme: 'grid',
        headStyles: { 
          fillColor: [211, 47, 47],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      })

      currentY = doc.lastAutoTable.finalY + 10
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Sistema de Control y Seguimiento de Indicadores SLA - Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 10)
    }

    // Descargar PDF directamente al navegador
    doc.save(props.filename)

    emit('pdf-generated', props.filename)

    // Guardar solo metadata (historial) en BD si se solicitó
    if (props.saveMetadata) {
      // Validar que el usuario esté autenticado
      if (!props.generatedBy || props.generatedBy === 0) {
        console.warn('No se puede guardar historial: usuario no autenticado')
        $q.notify({ 
          type: 'warning', 
          message: 'PDF descargado. No se guardó en el historial (usuario no autenticado)',
          icon: 'warning'
        })
      } else {
        try {
          // Simplificar filtros para evitar JSON muy grande
          const simplifiedFilters = {
            startDate: props.filtros?.startDate || null,
            endDate: props.filtros?.endDate || null,
            tipoSolicitud: props.filtros?.tipoSolicitud || null,
            bloqueTech: props.filtros?.bloqueTech || null
          }
          
          const dto = {
            tipoReporte: props.slaCode || 'SLA', // Usar código SLA corto (ej: "SLA1", "SLA2")
            formato: 'PDF',
            filtrosJson: JSON.stringify({ filtros: simplifiedFilters }),
            generadoPor: props.generatedBy,
            nombreArchivo: props.filename // Nombre del PDF descargado
          }
          
          console.log('[PdfExportButton] Enviando DTO:', dto)
          console.log('[PdfExportButton] Código SLA:', props.slaCode)
          
          await api.post('/Reporte', dto)
          $q.notify({ 
            type: 'positive', 
            message: 'Reporte generado exitosamente',
            icon: 'check_circle',
            position: 'top'
          })
        } catch (metaErr) {
          console.error('Error guardando historial del reporte:', metaErr)
          const errorMsg = metaErr?.response?.data?.message || metaErr?.message || 'Error desconocido'
          $q.notify({ 
            type: 'warning', 
            message: `PDF descargado. Error al guardar historial: ${errorMsg}`,
            icon: 'warning'
          })
        }
      }
    } else {
      $q.notify({ 
        type: 'positive', 
        message: 'PDF descargado exitosamente', 
        icon: 'check_circle', 
        position: 'top' 
      })
    }
  } catch (error) {
    console.error('Error al generar PDF:', error)
    emit('pdf-error', error)
    $q.notify({ type: 'negative', message: 'Error al generar el PDF', caption: error.message, icon: 'error', position: 'top' })
  } finally {
    generating.value = false
  }
}
</script>
