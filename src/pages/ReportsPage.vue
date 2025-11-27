<template>
  <q-page class="reports-page" style="background-color: #fafafa">
    <div class="q-pa-md">
      <!-- Encabezado -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h4 class="text-h4 q-my-none text-weight-bold text-black">
            <q-icon name="assessment" class="q-mr-sm" />
            Reportes
          </h4>
          <p class="text-grey-8 q-mt-sm q-mb-none" style="font-weight: 400">
            Genera y exporta reportes de cumplimiento SLA en formato PDF
          </p>
        </div>
      </div>

      <!-- SECCI\u00d3N 1: FILTROS -->
      <q-card class="q-mb-lg tata-card">
        <q-card-section
          style="background: #f6f6f6; color: #424242; min-height: 40px; padding: 10px 16px;"
          class="flex items-center"
        >
          <div class="text-subtitle1 text-weight-medium">
            <q-icon name="filter_alt" class="q-mr-sm" />
            Filtros del Reporte
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <!-- PRIMER FILTRO: TIPO SLA (obligatorio) -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
              <div class="text-subtitle2 text-weight-bold q-mb-sm">Tipo de SLA *</div>
              <q-select
                v-model="selectedSlaType"
                :options="slaTypeOptions"
                filled
                label="Selecciona tipo de SLA"
                emit-value
                map-options
                bg-color="white"
                :loading="slaTypeOptions.length === 0"
              >
                <template v-slot:prepend>
                  <q-icon name="speed" color="primary" />
                </template>
              </q-select>
              <div class="text-caption text-grey-7 q-mt-xs">Selecciona el tipo de SLA para filtrar</div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- FILTROS RESTANTES -->
          <div class="row q-col-gutter-md">
            <!-- Fecha Inicio -->
            <div class="col-12 col-md-4">
              <q-input
                v-model="reportFilters.startDate"
                filled
                type="date"
                label="Fecha Inicio"
                stack-label
                bg-color="white"
                :max="reportFilters.endDate || maxFechaFin"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-input>
              <div class="text-caption text-grey-7 q-mt-xs">
                Máximo: {{ reportFilters.endDate ? formatDate(reportFilters.endDate) : formatDate(maxFechaFin) }}
              </div>
            </div>

            <!-- Fecha Fin -->
            <div class="col-12 col-md-4">
              <q-input
                v-model="reportFilters.endDate"
                filled
                type="date"
                label="Fecha Fin"
                stack-label
                bg-color="white"
                :max="maxFechaFin"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-input>
              <div class="text-caption text-grey-7 q-mt-xs">
                Máximo: hoy ({{ formatDate(maxFechaFin) }})
              </div>
            </div>

            <!-- Bloque Tech (Multi-select) -->
            <div class="col-12 col-md-4">
              <q-select
                v-model="selectedBloquesTech"
                filled
                label="Bloque Tech (Opcional)"
                :options="bloqueTechMultiOptions"
                multiple
                emit-value
                map-options
                bg-color="white"
                use-chips
                clearable
                @update:model-value="handleBloquesTechChange"
              >
                <template v-slot:prepend>
                  <q-icon name="work" color="primary" />
                </template>
              </q-select>
              <div class="text-caption text-grey-7 q-mt-xs">
                Selecciona 'Todos' o bloques específicos (múltiple)
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Limpiar Filtros" color="grey-7" icon="clear" @click="clearFilters" />
          <q-btn
            unelevated
            label="Aplicar Filtros"
            color="primary"
            icon="filter_alt"
            @click="applyFilters"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>

      <!-- SECCIÓN 2: KPIs - TODOS EN FILA HORIZONTAL -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section
          :style="`background: ${PAGE_STYLES.colors.headerBg}; color: ${PAGE_STYLES.colors.headerText}; min-height: ${PAGE_STYLES.headerHeight}; padding: 12px 16px;`"
          class="flex items-center"
        >
          <div class="text-subtitle1 text-weight-medium">
            <q-icon name="pie_chart" class="q-mr-sm" />
            KPIs - {{ selectedSlaTypeLabel }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- KPI 1: Cumplimiento SLA -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <q-card flat bordered class="full-height" :style="`background: ${PAGE_STYLES.colors.kpiCardBg}; box-shadow: ${PAGE_STYLES.colors.kpiCardShadow};`">
                <q-card-section class="text-center">
                  <div class="text-caption text-weight-bold" :style="`color: ${PAGE_STYLES.colors.secondaryText}`">Cumplimiento</div>
                  <div class="text-h4 text-weight-bold" :class="getKpiColor(filteredKpiValue)">
                    {{ filteredKpiValue }}%
                  </div>
                  <div class="text-caption" :style="`color: ${PAGE_STYLES.colors.captionText}`">{{ selectedSlaTypeLabel }}</div>
                </q-card-section>
              </q-card>
            </div>

            <!-- KPI 2: Total Solicitudes -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <q-card flat bordered class="full-height" :style="`background: ${PAGE_STYLES.colors.kpiCardBg}; box-shadow: ${PAGE_STYLES.colors.kpiCardShadow};`">
                <q-card-section class="text-center">
                  <div class="text-caption text-weight-bold" :style="`color: ${PAGE_STYLES.colors.secondaryText}`">Total Solicitudes</div>
                  <div class="text-h4 text-weight-bold" :style="`color: ${PAGE_STYLES.colors.primaryText}`">{{ filteredDataCount }}</div>
                  <div class="text-caption" :style="`color: ${PAGE_STYLES.colors.captionText}`">Procesadas</div>
                </q-card-section>
              </q-card>
            </div>

            <!-- KPI 3: Tiempo Promedio -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <q-card flat bordered class="full-height" :style="`background: ${PAGE_STYLES.colors.kpiCardBg}; box-shadow: ${PAGE_STYLES.colors.kpiCardShadow};`">
                <q-card-section class="text-center">
                  <div class="text-caption text-weight-bold" :style="`color: ${PAGE_STYLES.colors.secondaryText}`">Tiempo Promedio</div>
                  <div class="text-h4 text-weight-bold text-info">{{ tiempoPromedio }}</div>
                  <div class="text-caption" :style="`color: ${PAGE_STYLES.colors.captionText}`">días (de {{ diasUmbral }})</div>
                  <q-linear-progress 
                    :value="tiempoPromedio / diasUmbral" 
                    :color="tiempoPromedio <= diasUmbral * 0.7 ? 'positive' : tiempoPromedio <= diasUmbral ? 'warning' : 'negative'"
                    size="6px"
                    class="q-mt-xs"
                  />
                </q-card-section>
              </q-card>
            </div>

            <!-- KPI 4: Solicitudes en Alerta -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <q-card flat bordered class="full-height" :style="`background: ${PAGE_STYLES.colors.kpiCardBg}; box-shadow: ${PAGE_STYLES.colors.kpiCardShadow};`">
                <q-card-section class="text-center">
                  <div class="text-caption text-weight-bold" :style="`color: ${PAGE_STYLES.colors.secondaryText}`">En Alerta</div>
                  <div class="text-h4 text-weight-bold text-warning">{{ solicitudesEnAlerta }}</div>
                  <div class="text-caption" :style="`color: ${PAGE_STYLES.colors.captionText}`">Riesgo (70-79%)</div>
                </q-card-section>
              </q-card>
            </div>

            <!-- KPI 5: % Incumplidas -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <q-card flat bordered class="full-height" :style="`background: ${PAGE_STYLES.colors.kpiCardBg}; box-shadow: ${PAGE_STYLES.colors.kpiCardShadow};`">
                <q-card-section class="text-center">
                  <div class="text-caption text-weight-bold" :style="`color: ${PAGE_STYLES.colors.secondaryText}`">% Incumplidas</div>
                  <div class="text-h4 text-weight-bold text-negative">{{ porcentajeIncumplimiento }}%</div>
                  <div class="text-caption" :style="`color: ${PAGE_STYLES.colors.captionText}`">{{ totalIncumplimientos }} solicitudes</div>
                </q-card-section>
              </q-card>
            </div>

            <!-- KPI 6: Período -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <q-card flat bordered class="full-height" :style="`background: ${PAGE_STYLES.colors.kpiCardBg}; box-shadow: ${PAGE_STYLES.colors.kpiCardShadow};`">
                <q-card-section class="text-center">
                  <div class="text-caption text-weight-bold" :style="`color: ${PAGE_STYLES.colors.secondaryText}`">Período</div>
                  <div class="text-body2 text-weight-bold q-mt-sm" :style="`color: ${PAGE_STYLES.colors.primaryText}`">
                    {{ formatDate(reportFilters.startDate) }}
                  </div>
                  <q-icon name="arrow_downward" size="xs" :color="PAGE_STYLES.colors.captionText" />
                  <div class="text-body2 text-weight-bold" :style="`color: ${PAGE_STYLES.colors.primaryText}`">
                    {{ formatDate(reportFilters.endDate) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- SECCIÓN 3: TABLA DETALLE POR ROL -->
      <q-card class="q-mb-lg" flat bordered>
        <q-card-section
          :style="`background: ${PAGE_STYLES.colors.headerBg}; color: ${PAGE_STYLES.colors.headerText}; min-height: ${PAGE_STYLES.headerHeight}; padding: 12px 16px;`"
          class="flex items-center"
        >
          <div class="text-subtitle1 text-weight-medium">
            <q-icon name="table_chart" class="q-mr-sm" />
            Detalle por Rol - {{ selectedSlaTypeLabel }}
          </div>
        </q-card-section>

        <q-separator />

            <q-card-section>
              <q-markup-table flat bordered dense>
                <thead>
                  <tr :style="`background: ${PAGE_STYLES.colors.tableHeaderBg}; color: ${PAGE_STYLES.colors.tableHeaderText};`">
                    <th class="text-left">BLOQUE TECH</th>
                    <th class="text-center">SOLICITUDES</th>
                    <th class="text-center">{{ selectedSlaTypeLabel }} (%)</th>
                    <th class="text-center">TIEMPO PROM.</th>
                    <th class="text-center">INDICADOR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filteredChartDataByRole" :key="item.role">
                    <td>{{ item.role }}</td>
                    <td class="text-center">{{ item.numResources }}</td>
                    <td class="text-center">
                      <q-badge
                        color="grey-4"
                        class="text-black"
                        :label="(item.slaPercentages && item.slaPercentages[appliedSlaTypeDescripcion] != null) ? (item.slaPercentages[appliedSlaTypeDescripcion] + '%') : 'N/A'"
                      />
                    </td>
                    <td class="text-center">
                      <q-badge 
                        color="info" 
                        :label="item.tiempoPromedio + ' días'"
                      />
                    </td>
                    <td class="text-center">
                      <!-- Círculo indicador - tamaño configurable en CIRCLE_CONFIG.tableSize -->
                      <q-avatar :size="CIRCLE_CONFIG.tableSize" :color="getColorGeneric(item.slaPercentages?.[appliedSlaTypeDescripcion] || 0)">
                        <q-tooltip>{{ item.slaPercentages?.[appliedSlaTypeDescripcion] || 0 }}%</q-tooltip>
                      </q-avatar>
                    </td>
                  </tr>
                  <tr v-if="filteredChartDataByRole.length === 0">
                    <td :colspan="4" class="text-center text-grey-6">No hay datos para este SLA</td>
                  </tr>
                </tbody>
              </q-markup-table>

              <!-- Leyenda de colores -->
              <div class="q-mt-md q-pa-md bg-grey-2 rounded-borders">
                <div class="text-subtitle2 text-weight-bold q-mb-sm">Leyenda de Indicador</div>
                <div class="row q-col-gutter-md">
                  <!-- Leyenda - tamaño configurable en CIRCLE_CONFIG.legendSize -->
                  <div class="col-auto items-center">
                    <q-avatar :size="CIRCLE_CONFIG.legendSize" :color="CIRCLE_CONFIG.colors.cumple" class="q-mr-xs" />
                    <span class="text-caption">Cumple (≥80%)</span>
                  </div>
                  <div class="col-auto items-center">
                    <q-avatar :size="CIRCLE_CONFIG.legendSize" :color="CIRCLE_CONFIG.colors.alerta" class="q-mr-xs" />
                    <span class="text-caption">Alerta (70-79%)</span>
                  </div>
                  <div class="col-auto items-center">
                    <q-avatar :size="CIRCLE_CONFIG.legendSize" :color="CIRCLE_CONFIG.colors.incumple" class="q-mr-xs" />
                    <span class="text-caption">Incumple (&lt;70%)</span>
                  </div>
                  <div class="col-auto items-center">
                    <q-avatar :size="CIRCLE_CONFIG.legendSize" :color="CIRCLE_CONFIG.colors.sinDato" class="q-mr-xs" />
                    <span class="text-caption">Sin dato</span>
                  </div>
                </div>
              </div>
            </q-card-section>
      </q-card>

      <!-- SECCIÓN 4: ANÁLISIS DE INCUMPLIMIENTOS -->
      <q-card class="q-mb-lg" flat bordered v-if="totalIncumplimientos > 0">
        <q-card-section
          :style="`background: ${PAGE_STYLES.colors.alertHeaderBg}; color: #c62828; min-height: ${PAGE_STYLES.headerHeight}; padding: 12px 16px;`"
          class="flex items-center"
        >
          <div class="text-subtitle1 text-weight-medium">
            <q-icon name="warning" class="q-mr-sm" />
            Análisis de Incumplimientos - {{ selectedSlaTypeLabel }}
          </div>
        </q-card-section>
        
        <q-separator />
            
            <q-card-section>
              <!-- KPIs de Incumplimientos -->
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-4">
                  <q-card flat bordered>
                    <q-card-section class="text-center">
                      <div class="text-caption text-grey-7">Total Incumplimientos</div>
                      <div class="text-h4 text-negative">{{ totalIncumplimientos }}</div>
                      <div class="text-caption text-grey-6">de {{ filteredDataCount }} solicitudes</div>
                    </q-card-section>
                  </q-card>
                </div>
                
                <div class="col-12 col-md-4">
                  <q-card flat bordered>
                    <q-card-section class="text-center">
                      <div class="text-caption text-grey-7">Retraso Promedio</div>
                      <div class="text-h4 text-warning">{{ retrasoPromedio }} días</div>
                      <div class="text-caption text-grey-6">sobre el umbral de {{ diasUmbral }} días</div>
                    </q-card-section>
                  </q-card>
                </div>
                
                <div class="col-12 col-md-4">
                  <q-card flat bordered>
                    <q-card-section class="text-center">
                      <div class="text-caption text-grey-7">Retraso Máximo</div>
                      <div class="text-h4 text-negative">{{ retrasoMaximo }} días</div>
                      <div class="text-caption text-grey-6">caso más crítico</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
              
              <!-- Tabla de incumplimientos por rol -->
              <div class="text-subtitle2 text-weight-bold q-mb-sm">Incumplimientos por Bloque Tech</div>
              <q-markup-table flat bordered dense>
                <thead>
                  <tr :style="`background: ${PAGE_STYLES.colors.sectionBg}; color: ${PAGE_STYLES.colors.primaryText};`">
                    <th class="text-left">BLOQUE TECH</th>
                    <th class="text-center">INCUMPLIMIENTOS</th>
                    <th class="text-center">% DEL TOTAL</th>
                    <th class="text-center">RETRASO PROM.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in incumplimientosPorRol" :key="item.role">
                    <td>{{ item.role }}</td>
                    <td class="text-center">{{ item.numIncumplimientos }}</td>
                    <td class="text-center">
                      <q-badge color="negative" :label="item.porcentajeIncumplimiento + '%'" />
                    </td>
                    <td class="text-center">{{ item.retrasoPromedio }} días</td>
                  </tr>
                  <tr v-if="incumplimientosPorRol.length === 0">
                    <td :colspan="4" class="text-center text-grey-6">No hay incumplimientos por rol</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-card-section>
      </q-card>

      <!-- SECCIÓN 5: CONFIGURACIÓN Y EXPORTACIÓN -->
      <q-card class="q-mt-lg" flat bordered>
        <q-card-section
          :style="`background: ${PAGE_STYLES.colors.headerBg}; color: ${PAGE_STYLES.colors.headerText}; min-height: ${PAGE_STYLES.headerHeight}; padding: 12px 16px;`"
          class="flex items-center"
        >
          <div class="text-subtitle1 text-weight-medium">
            <q-icon name="settings" class="q-mr-sm" />
            Configuración del Reporte
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <!-- Título del reporte -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12">
              <q-input
                v-model="reportTitle"
                filled
                label="Título del Reporte"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="primary" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Botones de exportación -->
          <div class="row items-center q-gutter-sm justify-center">
                <div>
                  <PdfExportButton
                    :data="filteredChartDataByRoleWithResources"
                    :kpi-data="allKpisForPdf"
                    :incumplimientos-data="incumplimientosDataForPdf"
                    :title="reportTitle"
                    :filename="generateFilename()"
                    button-label="Generar Reporte PDF"
                    button-color="primary"
                    :disabled="filteredChartDataByRole.length === 0"
                    tooltip="Generar, guardar y descargar reporte PDF"
                    class="q-mb-sm"
                    :upload="true"
                    :saveMetadata="true"
                    :filtros="reportFilters"
                    :generatedBy="generatedBy"
                    @pdf-uploaded="(ruta) => { $q.notify({ type: 'positive', message: 'PDF generado y guardado exitosamente' }) }"
                    @pdf-error="(err) => { $q.notify({ type: 'negative', message: 'Error al generar PDF' }); console.error(err) }"
                  />
                </div>

                <div>
                  <q-btn label="Historial" icon="history" color="grey-7" @click="openHistory" />
                </div>
              </div>
            </q-card-section>
      </q-card>

      <!-- Historial embebido: lista de reportes guardados -->
      <q-dialog v-model="showHistory" persistent>
        <q-card style="min-width: 700px; max-width: 95vw;">
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-h6">Historial de Reportes</div>
              <div class="text-caption text-grey-7">Reportes previamente generados y guardados</div>
            </div>
            <div>
              <q-btn icon="close" flat @click="showHistory = false" />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div v-if="historyLoading" class="row justify-center q-pa-md">
              <q-spinner-dots color="primary" />
            </div>

            <div v-else>
              <q-table
                :rows="historyList"
                :columns="[
                  { name: 'titulo', label: 'Título del Reporte', field: 'tipoReporte', align: 'left' },
                  { name: 'fecha', label: 'Fecha de Generación', field: 'fechaGeneracion', align: 'center' },
                  { name: 'formato', label: 'Formato', field: 'formato', align: 'center' },
                  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
                ]"
                row-key="idReporte"
                flat
                bordered
                separator="horizontal"
              >
                <template v-slot:body-cell-acciones="props">
                  <q-td :props="props">
                    <q-btn 
                      size="sm" 
                      flat 
                      icon="download" 
                      color="primary"
                      @click="downloadReport(props.row)"
                    >
                      <q-tooltip>Descargar PDF</q-tooltip>
                    </q-btn>
                    <q-btn 
                      size="sm" 
                      flat 
                      icon="delete" 
                      color="negative" 
                      @click="deleteReport(props.row.idReporte)"
                    >
                      <q-tooltip>Eliminar reporte</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>

              <div v-if="historyList.length === 0" class="text-center text-grey-6 q-pa-md">No hay reportes guardados</div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat label="Cerrar" @click="showHistory = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSlaStore } from 'src/stores/slaStore'
import { useAuthStore } from 'src/stores/authStore'
import PdfExportButton from 'src/components/ui/PdfExportButton.vue'
import { rolService } from 'src/services/rolService'
import catalogoService from 'src/services/catalogoService'
import { useQuasar } from 'quasar'

const slaStore = useSlaStore()
const { loading, chartDataByRole, slaData } = storeToRefs(slaStore)

// kpiBySla y slaTypes no son necesarios aquí (filtrado por SLA en la página)

// ============= CONFIGURACIÓN DE CÍRCULOS INDICADORES =============
// Puedes ajustar estos valores para cambiar el tamaño de los círculos
// IMPORTANTE: En Quasar, el tamaño debe ser una cadena CSS válida (ej: '24px', '1.5rem', '2em')
const CIRCLE_CONFIG = {
  // Tamaño de círculos en la tabla (columna INDICADOR)
  tableSize: '24px',  // Cambia este valor para ajustar el tamaño (ej: '20px', '30px', '1.5rem')
  
  // Tamaño de círculos en la leyenda
  legendSize: '18px', // Cambia este valor para ajustar el tamaño (ej: '15px', '20px', '1rem')
  
  // Colores por porcentaje (usados tanto en tabla como en leyenda)
  colors: {
    cumple: 'positive',     // Verde - Cumple (≥80%)
    alerta: 'warning',      // Naranja - Alerta (70-79%)
    incumple: 'negative',   // Rojo - Incumple (<70%)
    sinDato: 'grey-6'       // Gris - Sin dato
  }
}

// ============= CONFIGURACIÓN DE ESTILOS DE LA PÁGINA =============
const PAGE_STYLES = {
  // Altura de los headers de secciones
  headerHeight: '40px',  // Ajusta este valor para cambiar la altura (ej: '40px', '60px')
  
  // Colores de la paleta (tonos gris claro profesionales)
  colors: {
    // Headers de secciones - gris claro
    headerBg: '#f6f6f6',  // Gris claro profesional
    headerText: '#424242',       // Texto oscuro para contraste
    
    // Cards y fondos
    cardBg: '#fafafa',           // Gris muy claro (casi blanco)
    cardBorder: '#e0e0e0',       // Gris claro para bordes
    sectionBg: '#f5f5f5',        // Gris claro para secciones
    
    // KPIs
    kpiCardBg: '#ffffff',        // Blanco para KPIs
    kpiCardBorder: '#e0e0e0',    // Borde gris claro
    kpiCardShadow: '0 1px 3px rgba(0,0,0,0.08)',  // Sombra suave
    
    // Tablas
    tableHeaderBg: '#e0e0e0',    // Gris claro para headers de tabla
    tableHeaderText: '#424242',  // Texto oscuro
    tableRowHover: '#fafafa',    // Hover en filas
    
    // Sección de incumplimientos - gris claro con toque rojo
    alertHeaderBg: '#ffe0e0',  // Gris-rojo muy claro para alertas
    
    // Textos
    primaryText: '#263238',      // Gris muy oscuro (casi negro)
    secondaryText: '#546e7a',    // Gris medio
    captionText: '#78909c'       // Gris claro
  }
}

// ============= NUEVO: SELECTOR DE TIPO SLA (dinámico desde BD) =============
// Opciones dinámicas: se pueblan desde backend (ConfigSla)
const slaTypeOptions = ref([]) // Opciones del dropdown
const selectedSlaType = ref(null) // Valor en el selector (UI)
const appliedSlaType = ref(null) // Valor APLICADO (usado en cálculos)
// Cargar dinámicamente al montar componente (ver onMounted más abajo)

const selectedSlaTypeLabel = computed(() => {
  // Buscar el SLA APLICADO (no el seleccionado) para mostrar en KPIs y tabla
  const slaOption = slaTypeOptions.value.find(opt => opt.value === appliedSlaType.value)
  if (!slaOption) return 'SLA'
  
  // Retornar el label completo: "SLA1 - Contratación de nuevo personal"
  return slaOption.label || appliedSlaType.value || 'SLA'
})

// Calcular fechas por defecto: hoy y 2 meses antes
const getDefaultDates = () => {
  const today = new Date()
  // Usar fecha local sin conversión a UTC que cambia el día
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`
  
  // Calcular 2 meses antes
  const twoMonthsAgo = new Date(today)
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
  const yearAgo = twoMonthsAgo.getFullYear()
  const monthAgo = String(twoMonthsAgo.getMonth() + 1).padStart(2, '0')
  const dayAgo = String(twoMonthsAgo.getDate()).padStart(2, '0')
  const twoMonthsAgoStr = `${yearAgo}-${monthAgo}-${dayAgo}`
  
  return {
    startDate: twoMonthsAgoStr,
    endDate: todayStr
  }
}

const defaultDates = getDefaultDates()

const reportFilters = ref({
  startDate: defaultDates.startDate,
  endDate: defaultDates.endDate,
  bloqueTech: null, // Se llenará con array de selectedBloquesTech
  tipoSolicitud: null, // Se llena dinámicamente al aplicar filtros
})

// Fecha máxima permitida (hoy - fecha local)
const maxFechaFin = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

// Multi-select para Bloques Tech (por defecto 'Todos')
const selectedBloquesTech = ref(['TODOS'])

// Función para formatear fechas en español
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00')
  const day = date.getDate()
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

// ============= TÍTULO DINÁMICO DEL PDF =============
const dynamicReportTitle = computed(() => {
  const tipoLabel = selectedSlaTypeLabel.value
  return `Reporte Indicadores ${tipoLabel}`
})
// REPORT TITLE editable: por defecto toma el título dinámico, pero el usuario puede editarlo
const reportTitle = ref(dynamicReportTitle.value)
const reportTitleEdited = ref(false)

// Si el usuario APLICA un nuevo SLA, actualizar el título por defecto (sin sobreescribir si ya editó)
watch(appliedSlaType, () => {
  // Solo actualizar si el título no fue editado manualmente
  if (!reportTitleEdited.value) {
    reportTitle.value = dynamicReportTitle.value
  }
})

// Marcar si el usuario editó manualmente el título (simple flag)
watch(reportTitle, (val) => {
  reportTitleEdited.value = val !== dynamicReportTitle.value
})

const showHistory = ref(false)

// Historial embebido (solo en este archivo para evitar tocar otros módulos)
const historyList = ref([])
const historyLoading = ref(false)

const $q = useQuasar()

const apiUrl = (process.env.VUE_APP_API_URL || 'http://localhost:5192/api')

// ============= HISTORIAL Y DESCARGAS =============
async function fetchHistory() {
  try {
    historyLoading.value = true
    const token = localStorage.getItem('token')
    if (!token) {
      $q.notify({ type: 'warning', message: 'No se encontró token. Inicia sesión para ver el historial.' })
      historyList.value = []
      return
    }
    const res = await fetch(`${apiUrl}/Reporte`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('Error fetching history', res.status, text)
      $q.notify({ type: 'negative', message: 'Error al obtener historial de reportes' })
      historyList.value = []
      return
    }
    const data = await res.json()
    historyList.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error de conexión al obtener historial' })
    historyList.value = []
  } finally {
    historyLoading.value = false
  }
}

function openHistory() {
  showHistory.value = true
  fetchHistory()
}

function downloadReport(r) {
  try {
    const ruta = r.rutaArchivo || r.ruta || r.path || ''
    if (!ruta) {
      $q.notify({ type: 'negative', message: 'Ruta de archivo no disponible' })
      return
    }
    const fileBase = apiUrl.replace(/\/api\/?$/, '')
    const url = ruta.startsWith('http') ? ruta : `${fileBase}${ruta}`
    window.open(url, '_blank')
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'No se pudo descargar el reporte' })
  }
}

async function deleteReport(id) {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${apiUrl}/Reporte/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!res.ok) {
      const txt = await res.text()
      console.error('Error delete', res.status, txt)
      $q.notify({ type: 'negative', message: 'Error al eliminar el reporte' })
      return
    }
    $q.notify({ type: 'positive', message: 'Reporte eliminado' })
    fetchHistory()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al eliminar reporte' })
  }
}

// ============= DATOS FILTRADOS POR SLA APLICADO =============
// Filtra TODOS los datos primero por el tipo de SLA APLICADO (solo cambia al presionar botón)
const filteredDataBySlaType = computed(() => {
  // Obtener el SLA option APLICADO para mapear a tipo de solicitud
  const slaOption = slaTypeOptions.value.find(opt => opt.value === appliedSlaType.value)
  
  if (!slaOption) return []
  
  // Mapeo idTipoSolicitud → descripción del tipo (lo que espera el backend)
  const tiposSolicitudMap = {
    1: 'Nuevo Personal',
    2: 'Reemplazo'
  }
  
  const tipoSolicitudParaFiltrar = tiposSolicitudMap[slaOption.idTipoSolicitud]
  
  // IMPORTANTE: usar filteredData del store que ya incluye filtros de fecha y bloques tech
  return slaStore.filteredData.filter(s => s.tipo_solicitud === tipoSolicitudParaFiltrar)
})

// KPI solo para el SLA APLICADO
const filteredKpiValue = computed(() => {
  if (filteredDataBySlaType.value.length === 0) return 0
  
  // Determinar qué campo de cumplimiento usar según el tipo de solicitud
  const slaOption = slaTypeOptions.value.find(opt => opt.value === appliedSlaType.value)
  if (!slaOption) return 0
  
  // idTipoSolicitud: 1 = Nuevo Personal (cumple_sla1), 2 = Reemplazo (cumple_sla2)
  const fieldName = slaOption.idTipoSolicitud === 1 ? 'cumple_sla1' : 'cumple_sla2'
  
  const cumpleCount = filteredDataBySlaType.value.filter(s => s[fieldName] === true).length
  return Math.round((cumpleCount / filteredDataBySlaType.value.length) * 100)
})

const filteredDataCount = computed(() => filteredDataBySlaType.value.length)

// Umbral de días según tipo de SLA
const diasUmbral = computed(() => {
  const slaOption = slaTypeOptions.value.find(opt => opt.value === appliedSlaType.value)
  if (!slaOption) return 35
  
  // SLA1 = 35 días (id 1), SLA2 = 20 días (id 2)
  return slaOption.idTipoSolicitud === 1 ? 35 : 20
})

// Mapeo de código SLA a descripción del tipo (para acceder a slaPercentages)
const tiempoPromedio = computed(() => {
  if (filteredDataBySlaType.value.length === 0) return 0
  
  const total = filteredDataBySlaType.value.reduce((sum, s) => {
    return sum + (s.num_dias_sla || 0)
  }, 0)
  
  return Math.round(total / filteredDataBySlaType.value.length)
})

// Mapeo de código SLA a descripción del tipo (para acceder a slaPercentages)
const appliedSlaTypeDescripcion = computed(() => {
  const slaOption = slaTypeOptions.value.find(opt => opt.value === appliedSlaType.value)
  if (!slaOption) return null
  
  // Mapeo idTipoSolicitud → descripción
  const tiposSolicitudMap = {
    1: 'Nuevo Personal',
    2: 'Reemplazo'
  }
  
  return tiposSolicitudMap[slaOption.idTipoSolicitud]
})

// KPI: Total de incumplimientos
const totalIncumplimientos = computed(() => {
  const slaOption = slaTypeOptions.value.find(opt => opt.value === appliedSlaType.value)
  if (!slaOption) return 0
  
  const fieldName = slaOption.idTipoSolicitud === 1 ? 'cumple_sla1' : 'cumple_sla2'
  return filteredDataBySlaType.value.filter(s => s[fieldName] === false).length
})

// KPI: Porcentaje de incumplimiento
const porcentajeIncumplimiento = computed(() => {
  if (filteredDataCount.value === 0) return 0
  return Math.round((totalIncumplimientos.value / filteredDataCount.value) * 100)
})

// KPI: Solicitudes en Alerta (cumplen pero están entre 70-79% del umbral)
const solicitudesEnAlerta = computed(() => {
  const umbral = diasUmbral.value
  const limiteInferior = Math.floor(umbral * 0.7)
  const limiteSuperior = Math.floor(umbral * 0.79)
  
  return filteredDataBySlaType.value.filter(s => {
    const dias = s.num_dias_sla || 0
    return dias >= limiteInferior && dias <= limiteSuperior
  }).length
})

// Retraso promedio de solicitudes incumplidas
const retrasoPromedio = computed(() => {
  const slaOption = slaTypeOptions.value.find(opt => opt.value === appliedSlaType.value)
  if (!slaOption) return 0
  
  const umbral = diasUmbral.value
  const fieldName = slaOption.idTipoSolicitud === 1 ? 'cumple_sla1' : 'cumple_sla2'
  
  const incumplimientos = filteredDataBySlaType.value.filter(s => s[fieldName] === false)
  if (incumplimientos.length === 0) return 0
  
  const totalRetraso = incumplimientos.reduce((sum, s) => {
    const retraso = (s.num_dias_sla || 0) - umbral
    return sum + (retraso > 0 ? retraso : 0)
  }, 0)
  
  return Math.round(totalRetraso / incumplimientos.length)
})

// Retraso máximo encontrado
const retrasoMaximo = computed(() => {
  const slaOption = slaTypeOptions.value.find(opt => opt.value === appliedSlaType.value)
  if (!slaOption) return 0
  
  const umbral = diasUmbral.value
  const fieldName = slaOption.idTipoSolicitud === 1 ? 'cumple_sla1' : 'cumple_sla2'
  
  const incumplimientos = filteredDataBySlaType.value.filter(s => s[fieldName] === false)
  if (incumplimientos.length === 0) return 0
  
  const retrasos = incumplimientos.map(s => (s.num_dias_sla || 0) - umbral)
  return Math.max(...retrasos, 0)
})

// Incumplimientos por rol
const incumplimientosPorRol = computed(() => {
  const slaOption = slaTypeOptions.value.find(opt => opt.value === appliedSlaType.value)
  if (!slaOption) return []
  
  const fieldName = slaOption.idTipoSolicitud === 1 ? 'cumple_sla1' : 'cumple_sla2'
  const umbral = diasUmbral.value
  const dataFiltered = slaStore.filteredData || []
  
  // Obtener roles únicos
  const roles = [...new Set(dataFiltered.map(s => s.bloque_tech))].filter(Boolean)
  
  return roles.map(role => {
    const solicitudesRol = dataFiltered.filter(s => 
      s.bloque_tech === role && 
      s.tipo_solicitud === appliedSlaTypeDescripcion.value
    )
    
    const incumplimientos = solicitudesRol.filter(s => s[fieldName] === false)
    const numIncumplimientos = incumplimientos.length
    
    const porcentajeIncumplimiento = solicitudesRol.length > 0 
      ? Math.round((numIncumplimientos / solicitudesRol.length) * 100)
      : 0
    
    const retrasoPromedio = numIncumplimientos > 0
      ? Math.round(incumplimientos.reduce((sum, s) => {
          const retraso = (s.num_dias_sla || 0) - umbral
          return sum + (retraso > 0 ? retraso : 0)
        }, 0) / numIncumplimientos)
      : 0
    
    return {
      role,
      numIncumplimientos,
      porcentajeIncumplimiento,
      retrasoPromedio
    }
  }).filter(item => item.numIncumplimientos > 0)
  .sort((a, b) => b.numIncumplimientos - a.numIncumplimientos)
})

// Tabla filtrada: solo roles del SLA seleccionado (CON TIEMPO PROMEDIO)
const filteredChartDataByRole = computed(() => {
  const roles = chartDataByRole.value || []
  
  // Usar filteredData del store que ya tiene las fechas aplicadas
  const dataFiltered = slaStore.filteredData || []
  
  return roles.map(item => {
    const role = item.role
    
    // Filtrar solicitudes por rol y tipo
    const solicitudesRol = dataFiltered.filter(s => 
      s.bloque_tech === role && 
      s.tipo_solicitud === appliedSlaTypeDescripcion.value
    )
    
    const numResources = solicitudesRol.length
    
    // CALCULAR TIEMPO PROMEDIO POR ROL
    const tiempoPromedio = numResources > 0 
      ? Math.round(solicitudesRol.reduce((sum, s) => sum + (s.num_dias_sla || 0), 0) / numResources)
      : 0
    
    return { 
      ...item, 
      numResources,
      tiempoPromedio
    }
  }).filter(item => item.numResources > 0)
})

// Datos para PDF: tabla con recursos enriquecida
const filteredChartDataByRoleWithResources = computed(() => {
  return filteredChartDataByRole.value
})

// Objeto con todos los KPIs para exportar al PDF
const allKpisForPdf = computed(() => {
  return {
    [`Cumplimiento ${selectedSlaTypeLabel.value}`]: filteredKpiValue.value,
    'Total Solicitudes': filteredDataCount.value,
    'Tiempo Promedio (días)': tiempoPromedio.value,
    'Solicitudes en Alerta (70-79%)': solicitudesEnAlerta.value,
    '% Incumplimiento': porcentajeIncumplimiento.value,
    ...(totalIncumplimientos.value > 0 ? {
      'Total Incumplimientos': totalIncumplimientos.value,
      'Retraso Promedio (días)': retrasoPromedio.value,
      'Retraso Máximo (días)': retrasoMaximo.value
    } : {})
  }
})

// Datos de incumplimientos para el PDF
const incumplimientosDataForPdf = computed(() => {
  if (totalIncumplimientos.value === 0) return []
  return incumplimientosPorRol.value
})

const authStore = useAuthStore()
const generatedBy = computed(() => authStore.user?.id || 0)
const rolesList = ref([])

// Opciones para multi-select (sin 'Todos' inicial, se maneja con lógica especial)
const bloqueTechMultiOptions = computed(() => {
  const fromApi = rolesList.value.map((r) => r.bloqueTech || r.bloque_tech).filter(Boolean)
  const fromSla = slaData.value.map((r) => r.bloque_tech || r.bloqueTech).filter(Boolean)
  const roles = [...new Set([...fromApi, ...fromSla])]
  roles.sort((a, b) => a.localeCompare(b))
  
  return [
    { label: 'Todos', value: 'TODOS' }, // Valor especial para 'Todos'
    ...roles.map((role) => ({ label: role, value: role }))
  ]
})

// Manejar cambios en selección de Bloques Tech
function handleBloquesTechChange(newValue) {
  if (!newValue || newValue.length === 0) {
    selectedBloquesTech.value = []
    return
  }
  
  // Si se selecciona 'Todos', limpiar otros y dejar solo 'Todos'
  if (newValue.includes('TODOS')) {
    selectedBloquesTech.value = ['TODOS']
  } else {
    // Si había 'Todos' y se agrega otro, quitar 'Todos'
    selectedBloquesTech.value = newValue.filter(v => v !== 'TODOS')
  }
}

// ============= CARGAR DATOS DE CATÁLOGO (SLA types) =============
async function fetchCatalogData() {
  try {
    // 1. Obtener tipos de solicitud primero (para mapear nombres)
    const tiposSolicitud = await catalogoService.getTiposSolicitud()
    const tiposSolicitudMap = {}
    tiposSolicitud.forEach(tipo => {
      tiposSolicitudMap[tipo.idTipoSolicitud || tipo.id_tipo_solicitud] = tipo.nombreTipo || tipo.nombre_tipo
    })

    // 2. Obtener tipos de SLA desde ConfigSla (ya incluye label y value pre-formateados)
    const slaTypes = await catalogoService.getSlaTypes()
    slaTypeOptions.value = slaTypes
      .filter(sla => sla.esActivo) // Solo SLAs activos
      .map(sla => ({
        label: sla.label,  // "SLA1 - Contratación de nuevo personal"
        value: sla.value,  // "SLA1"
        diasUmbral: sla.diasUmbral,
        idSla: sla.idSla,
        codigoSla: sla.codigoSla,
        descripcion: sla.descripcion,
        idTipoSolicitud: sla.idTipoSolicitud
      }))
    
    // Si hay al menos un SLA, seleccionar el primero por defecto
    if (slaTypeOptions.value.length > 0) {
      selectedSlaType.value = slaTypeOptions.value[0].value // Ahora es "SLA1" en vez de "Nuevo Personal"
    }
  } catch (error) {
    console.error('Error al cargar catálogos:', error)
    $q.notify({
      type: 'warning',
      message: 'No se pudieron cargar algunos filtros dinámicos',
      caption: 'Usando valores por defecto'
    })
    // Fallback: usar valores por defecto si falla
    if (slaTypeOptions.value.length === 0) {
      slaTypeOptions.value = [
        { label: 'SLA1 - Contratación de nuevo personal', value: 'SLA1', diasUmbral: 35, idSla: 1, codigoSla: 'SLA1' },
        { label: 'SLA2 - Reemplazo de personal', value: 'SLA2', diasUmbral: 20, idSla: 2, codigoSla: 'SLA2' }
      ]
      selectedSlaType.value = 'SLA1'
    }
  }
}

function applyFilters() {
  // APLICAR el SLA seleccionado (copiar de selectedSlaType a appliedSlaType)
  appliedSlaType.value = selectedSlaType.value
  
  // Convertir codigoSla (SLA1) a descripción del tipo de solicitud para el backend
  const slaOption = slaTypeOptions.value.find(opt => opt.value === selectedSlaType.value)
  
  // El backend espera la descripción del tipo (por ejemplo, "Nuevo Personal")
  // Obtenerla del mapping idTipoSolicitud
  let tipoSolicitudParaBackend = null
  if (slaOption && slaOption.idTipoSolicitud) {
    // Mapeo hardcoded temporal (lo ideal es obtenerlo dinámicamente)
    // idTipoSolicitud: 1 = "Nuevo Personal", 2 = "Reemplazo"
    const tiposSolicitudMap = {
      1: 'Nuevo Personal',
      2: 'Reemplazo'
    }
    tipoSolicitudParaBackend = tiposSolicitudMap[slaOption.idTipoSolicitud]
  }
  
  // Convertir selectedBloquesTech a formato adecuado
  // El filtro de bloques tech se aplicará en el FRONTEND (store)
  // NO se envía al backend para permitir selección múltiple
  let bloqueTechFiltro = null
  if (selectedBloquesTech.value.length > 0 && !selectedBloquesTech.value.includes('TODOS')) {
    // Si hay selecciones específicas (no 'Todos'), usar array para filtro local
    bloqueTechFiltro = selectedBloquesTech.value
  }
  // Si está vacío o es 'TODOS', dejar null (mostrar todos)
  
  // Actualizar filtros del store (incluye fechas, tipo solicitud y bloques tech)
  reportFilters.value.tipoSolicitud = tipoSolicitudParaBackend
  reportFilters.value.bloqueTech = bloqueTechFiltro
  
  // IMPORTANTE: Pasar filtros al store
  // El store aplicará:
  // - Filtros de backend: fechas + tipo solicitud (para traer datos de BD)
  // - Filtros de frontend: bloques tech (filtrado local después de traer datos)
  slaStore.updateFilters({
    startDate: reportFilters.value.startDate,
    endDate: reportFilters.value.endDate,
    tipoSolicitud: tipoSolicitudParaBackend,
    bloqueTech: bloqueTechFiltro, // Array o null
  })
  
  // Guardar estado de filtros en el store para persistir al navegar
  slaStore.saveReportFilters({
    selectedSlaType: selectedSlaType.value,
    appliedSlaType: appliedSlaType.value,
    startDate: reportFilters.value.startDate,
    endDate: reportFilters.value.endDate,
    selectedBloquesTech: [...selectedBloquesTech.value]
  })
  
  slaStore.fetchSlaData()
}

function clearFilters() {
  const defaultDates = getDefaultDates()
  reportFilters.value = {
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    bloqueTech: null,
    tipoSolicitud: null,
  }
  selectedBloquesTech.value = ['TODOS'] // Por defecto seleccionar 'Todos'
  // Resetear al primer SLA disponible
  if (slaTypeOptions.value.length > 0) {
    selectedSlaType.value = slaTypeOptions.value[0].value
  }
  // Resetear flag de inicialización para forzar recarga con defaults
  slaStore.resetReportsInitialization()
  // Aplicar los filtros por defecto automáticamente
  applyFilters()
  // Marcar como inicializado después de aplicar
  slaStore.markReportsAsInitialized()
}

function generateFilename() {
  const date = new Date().toISOString().split('T')[0]
  // Usar el código SLA directamente (SLA1, SLA2, etc.)
  const codigo = (selectedSlaType.value || 'sla').toLowerCase() // fallback a 'sla' si es null
  return `reporte-${codigo}-${date}.pdf`
}

function getColorGeneric(percentage) {
  const value = parseFloat(percentage)
  if (isNaN(value)) return CIRCLE_CONFIG.colors.sinDato
  if (value >= 80) return CIRCLE_CONFIG.colors.cumple
  if (value >= 70) return CIRCLE_CONFIG.colors.alerta
  return CIRCLE_CONFIG.colors.incumple
}

function getKpiColor(percentage) {
  const value = parseFloat(percentage)
  if (isNaN(value)) return 'text-grey-6'
  if (value >= 80) return 'text-positive'
  if (value >= 70) return 'text-warning'
  return 'text-negative'
}

onMounted(async () => {
  // 1. Cargar catálogos dinámicos primero (SLA types y prioridades)
  await fetchCatalogData()
  
  // 2. Cargar roles usando rolService (usa api client y token)
  try {
    const data = await rolService.getRoles()
    rolesList.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error fetching roles:', err)
    rolesList.value = []
  }

  // 3. Verificar si la página ya fue inicializada previamente
  if (slaStore.isReportsInitialized) {
    // YA FUE INICIALIZADA: restaurar filtros guardados
    const saved = slaStore.appliedReportFilters
    
    if (saved.selectedSlaType) {
      selectedSlaType.value = saved.selectedSlaType
      appliedSlaType.value = saved.appliedSlaType
      reportFilters.value.startDate = saved.startDate
      reportFilters.value.endDate = saved.endDate
      selectedBloquesTech.value = saved.selectedBloquesTech || ['TODOS']
      
      // Refrescar datos con los filtros guardados
      await slaStore.fetchSlaData()
    } else {
      // Si no hay filtros guardados, aplicar defaults
      if (slaTypeOptions.value.length > 0) {
        selectedSlaType.value = slaTypeOptions.value[0].value
        appliedSlaType.value = slaTypeOptions.value[0].value
      }
      applyFilters()
      slaStore.markReportsAsInitialized()
    }
  } else {
    // PRIMERA VEZ: inicializar con valores por defecto
    if (slaTypeOptions.value.length > 0) {
      selectedSlaType.value = slaTypeOptions.value[0].value
      appliedSlaType.value = slaTypeOptions.value[0].value
    }
    applyFilters()
    slaStore.markReportsAsInitialized()
  }
})
</script>

<style scoped lang="scss">
.reports-page {
  background-color: #f5f5f5;
}
</style>
