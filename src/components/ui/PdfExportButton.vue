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
  filename: { type: String, default: 'reporte-sla.pdf' },
  buttonLabel: { type: String, default: 'Exportar PDF' },
  buttonIcon: { type: String, default: 'picture_as_pdf' },
  buttonColor: { type: String, default: 'primary' },
  disabled: { type: Boolean, default: false },
  unelevated: { type: Boolean, default: true },
  outline: { type: Boolean, default: false },
  flat: { type: Boolean, default: false },
  tooltip: { type: String, default: '' },
  upload: { type: Boolean, default: false },
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

    const pageWidth = doc.internal.pageSize.getWidth()
    // Indicator radius variable (ajustar para tamaño de círculo en PDF)
    const indicatorRadius = 3 // antes era 4 — reducir para círculos más pequeños

    if (logoData) {
      try {
        const logoWidth = 40
        const logoHeight = 14
        const xLogo = (pageWidth - logoWidth) / 2
        const yLogo = 8
        doc.addImage(logoData, 'PNG', xLogo, yLogo, logoWidth, logoHeight)
        // Title centered debajo del logo
        doc.setFontSize(16)
        doc.setTextColor(33, 150, 243)
        const titleY = yLogo + logoHeight + 10
        doc.text(props.title || 'Reporte SLA', pageWidth / 2, titleY, { align: 'center' })
      } catch (err) {
        console.warn('addImage falló:', err)
        // fallback: title en la izquierda
        doc.setFontSize(18)
        doc.setTextColor(33, 150, 243)
        doc.text(props.title || 'Reporte SLA', 14, 20)
      }
    } else {
      // No logo: título en el centro superior
      doc.setFontSize(18)
      doc.setTextColor(33, 150, 243)
      doc.text(props.title || 'Reporte SLA', pageWidth / 2, 20, { align: 'center' })
    }

    // Fecha
    doc.setFontSize(10)
    doc.setTextColor(100)
    const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    doc.text(`Fecha de generación: ${fecha}`, 14, 28)

    // KPIs (puede ser dinámico)
    if (props.kpiData && Object.keys(props.kpiData).length > 0) {
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Indicadores Clave (KPIs)', 14, 40)

      const kpiRows = Object.entries(props.kpiData).map(([key, val]) => [key, `${val}%`])

      autoTable(doc, {
        startY: 45,
        head: [['Indicador', 'Valor']],
        body: kpiRows,
        theme: 'striped',
        headStyles: { fillColor: [33, 150, 243] },
        margin: { left: 14, right: 14 },
      })
    }

    // Tabla de datos (dinámica según data)
    if (props.data && props.data.length > 0) {
      const startY = props.kpiData && Object.keys(props.kpiData).length > 0 ? doc.lastAutoTable.finalY + 15 : 45

      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Detalle de Cumplimiento por Rol', 14, startY)

      // Detectar columnas dinámicas: role + numResources + tiempoPromedio + claves de slaPercentages + INDICADOR
      const first = props.data[0]
      const slaKeys = first.slaPercentages ? Object.keys(first.slaPercentages) : ['SLA1', 'SLA2']

      // headers: BLOQUE TECH, SOLICITUDES, TIEMPO PROM., <SLA keys>, INDICADOR
      const head = [
        'BLOQUE TECH', 
        'SOLICITUDES', 
        'TIEMPO PROM. (días)',
        ...slaKeys.map((k) => `${k} (%)`), 
        'INDICADOR'
      ]

      const tableData = props.data.map((item) => {
        const row = []
        row.push(item.role || 'N/A')
        row.push(item.numResources != null ? item.numResources : '0')
        row.push(item.tiempoPromedio != null ? item.tiempoPromedio : '0')
        slaKeys.forEach((k) => {
          const v = item.slaPercentages ? item.slaPercentages[k] : (item[`${k.toLowerCase()}Percentage`] || null)
          row.push(v != null ? `${v}%` : 'N/A')
        })
        // indicador (usaremos numeric overallPercent o primer slaPercentage)
        const indicatorValue = item.overallPercent != null ? item.overallPercent : 
          (item.slaPercentages ? Object.values(item.slaPercentages)[0] : null)
        row.push(indicatorValue)
        return row
      })

      // draw table and color the INDICADOR cell
      autoTable(doc, {
        startY: startY + 5,
        head: [head],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [33, 150, 243] },
        margin: { left: 14, right: 14 },
        didParseCell: function (data) {
          // last column is INDICADOR
          const indicatorColIndex = head.length - 1
          if (data.section === 'body' && data.column.index === indicatorColIndex) {
            const raw = data.cell.raw
            const percent = parseFloat(raw)
            let color = [189, 189, 189] // grey default
            if (!isNaN(percent)) {
              if (percent >= 80) color = [76, 175, 80] // green
              else if (percent >= 70) color = [255, 152, 0] // orange
              else color = [244, 67, 54] // red
            }
            // fill a small circle in the cell
            const x = data.cell.x + data.cell.width / 2
            const y = data.cell.y + data.cell.height / 2
            doc.setFillColor(...color)
            // usar variable indicatorRadius para controlar tamaño
            doc.circle(x, y - 1.5, indicatorRadius, 'F')
            // prevent text overlay
            data.cell.text = ['']
          }
        },
      })
    }

    // Tabla de Incumplimientos (si hay datos)
    if (props.incumplimientosData && props.incumplimientosData.length > 0) {
      const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 100

      doc.setFontSize(14)
      doc.setTextColor(244, 67, 54) // Rojo para énfasis
      doc.text('Análisis de Incumplimientos', 14, startY)

      const headIncumplimientos = [
        'BLOQUE TECH',
        'INCUMPLIMIENTOS',
        '% DEL TOTAL',
        'RETRASO PROM. (días)'
      ]

      const tableDataIncumplimientos = props.incumplimientosData.map((item) => [
        item.role || 'N/A',
        item.numIncumplimientos || 0,
        `${item.porcentajeIncumplimiento || 0}%`,
        `${item.retrasoPromedio || 0}`
      ])

      autoTable(doc, {
        startY: startY + 5,
        head: [headIncumplimientos],
        body: tableDataIncumplimientos,
        theme: 'grid',
        headStyles: { fillColor: [244, 67, 54] }, // Rojo
        margin: { left: 14, right: 14 },
      })
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Sistema de Control y Seguimiento de Indicadores SLA - Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 10)
    }

    // Obtener blob para posible subida
    const pdfBlob = doc.output('blob')
    doc.save(props.filename)

    emit('pdf-generated', props.filename)

    // Subir y guardar metadata si se solicitó
    if (props.upload) {
      try {
        const form = new FormData()
        form.append('file', pdfBlob, props.filename)

        const uploadResp = await api.post('/Reporte/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        const ruta = uploadResp.data?.ruta || uploadResp.data?.rutaArchivo

        if (props.saveMetadata && ruta) {
          try {
            const dto = {
              tipoReporte: props.title || 'Indicadores SLA',
              formato: 'PDF',
              filtrosJson: JSON.stringify({ filtros: props.filtros || {} }),
              generadoPor: props.generatedBy || 0,
              rutaArchivo: ruta,
            }
            await api.post('/Reporte', dto)
          } catch (metaErr) {
            console.warn('No se pudo guardar metadata:', metaErr)
          }
        }

        $q.notify({ type: 'positive', message: 'PDF subido al servidor', icon: 'upload' })
        emit('pdf-uploaded', ruta)
      } catch (err) {
        console.error('Error subiendo PDF:', err)
        // Mejor detalle del error si existe response
        let msg = 'Error subiendo PDF al servidor'
        if (err?.response) {
          msg += ` (${err.response.status}): ${JSON.stringify(err.response.data)}`
        } else if (err?.message) {
          msg += `: ${err.message}`
        }
        $q.notify({ type: 'negative', message: msg })
        emit('pdf-error', err)
      }
    }

    $q.notify({ type: 'positive', message: 'PDF generado exitosamente', icon: 'check_circle', position: 'top' })
  } catch (error) {
    console.error('Error al generar PDF:', error)
    emit('pdf-error', error)
    $q.notify({ type: 'negative', message: 'Error al generar el PDF', caption: error.message, icon: 'error', position: 'top' })
  } finally {
    generating.value = false
  }
}
</script>
