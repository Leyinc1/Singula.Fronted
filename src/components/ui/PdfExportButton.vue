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

const $q = useQuasar()

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  kpiData: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: 'Reporte de SLA',
  },
  filename: {
    type: String,
    default: 'reporte-sla.pdf',
  },
  buttonLabel: {
    type: String,
    default: 'Exportar PDF',
  },
  buttonIcon: {
    type: String,
    default: 'picture_as_pdf',
  },
  buttonColor: {
    type: String,
    default: 'primary',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  unelevated: {
    type: Boolean,
    default: true,
  },
  outline: {
    type: Boolean,
    default: false,
  },
  flat: {
    type: Boolean,
    default: false,
  },
  tooltip: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['pdf-generated', 'pdf-error'])

const generating = ref(false)

async function generatePdf() {
  generating.value = true

  try {
    // Crear nuevo documento PDF
    const doc = new jsPDF()

    // Agregar encabezado
    doc.setFontSize(18)
    doc.setTextColor(33, 150, 243) // Color azul
    doc.text(props.title, 14, 20)

    // Agregar fecha del reporte
    doc.setFontSize(10)
    doc.setTextColor(100)
    const fecha = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    doc.text(`Fecha de generación: ${fecha}`, 14, 28)

    // Agregar KPIs si están disponibles
    if (props.kpiData && Object.keys(props.kpiData).length > 0) {
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Indicadores Clave (KPIs)', 14, 40)

      const kpiRows = []
      if (props.kpiData.sla1) {
        kpiRows.push(['Cumplimiento SLA1 (Nuevo Personal)', `${props.kpiData.sla1}%`])
      }
      if (props.kpiData.sla2) {
        kpiRows.push(['Cumplimiento SLA2 (Reemplazo)', `${props.kpiData.sla2}%`])
      }

      autoTable(doc, {
        startY: 45,
        head: [['Indicador', 'Valor']],
        body: kpiRows,
        theme: 'striped',
        headStyles: { fillColor: [33, 150, 243] },
        margin: { left: 14, right: 14 },
      })
    }

    // Agregar tabla de datos
    if (props.data && props.data.length > 0) {
      const startY =
        props.kpiData && Object.keys(props.kpiData).length > 0 ? doc.lastAutoTable.finalY + 15 : 45

      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Detalle de Cumplimiento por Rol', 14, startY)

      const tableData = props.data.map((item) => [
        item.role || 'N/A',
        `${item.sla1Percentage || 0}%`,
        `${item.sla2Percentage || 0}%`,
      ])

      autoTable(doc, {
        startY: startY + 5,
        head: [['BLOQUE TECH', 'SLA1 (%)', 'SLA2 (%)']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [33, 150, 243] },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 50, halign: 'center' },
          2: { cellWidth: 50, halign: 'center' },
        },
      })
    }

    // Agregar pie de página
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `Sistema de Control y Seguimiento de Indicadores SLA - Página ${i} de ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10,
      )
    }

    // Guardar PDF
    doc.save(props.filename)

    emit('pdf-generated', props.filename)

    $q.notify({
      type: 'positive',
      message: 'PDF generado exitosamente',
      icon: 'check_circle',
      position: 'top',
    })
  } catch (error) {
    console.error('Error al generar PDF:', error)

    emit('pdf-error', error)

    $q.notify({
      type: 'negative',
      message: 'Error al generar el PDF',
      caption: error.message,
      icon: 'error',
      position: 'top',
    })
  } finally {
    generating.value = false
  }
}
</script>
