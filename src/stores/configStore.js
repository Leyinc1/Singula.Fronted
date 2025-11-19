/**
 * Store de Pinia para gestionar la configuración del sistema
 * Maneja: bloques tecnológicos, prioridades, tipos de solicitud, etc.
 * Este store centraliza toda la configuración escalable del sistema
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useConfigStore = defineStore('config', () => {
  // ============================================
  // CONFIGURACIÓN DE BLOQUES TECNOLÓGICOS
  // ============================================
  const bloques = ref([
    {
      id: 'backend',
      nombre: 'Backend',
      descripcion: 'Desarrollo de servicios y APIs',
      departamento: 'Tech',
      color: '#0066cc',
      icon: 'dns',
      activo: true,
    },
    {
      id: 'frontend',
      nombre: 'Frontend',
      descripcion: 'Desarrollo de interfaces de usuario',
      departamento: 'Tech',
      color: '#ff6600',
      icon: 'web',
      activo: true,
    },
    {
      id: 'qa',
      nombre: 'QA',
      descripcion: 'Aseguramiento de calidad y testing',
      departamento: 'Tech',
      color: '#4caf50',
      icon: 'bug_report',
      activo: true,
    },
    {
      id: 'mobile',
      nombre: 'Mobile',
      descripcion: 'Desarrollo de aplicaciones móviles',
      departamento: 'Tech',
      color: '#9c27b0',
      icon: 'smartphone',
      activo: true,
    },
    {
      id: 'devops',
      nombre: 'DevOps',
      descripcion: 'Infraestructura y despliegue',
      departamento: 'Tech',
      color: '#ff9800',
      icon: 'cloud',
      activo: true,
    },
    {
      id: 'data',
      nombre: 'Data',
      descripcion: 'Ciencia de datos y análisis',
      departamento: 'Tech',
      color: '#00bcd4',
      icon: 'analytics',
      activo: true,
    },
  ])

  // ============================================
  // CONFIGURACIÓN DE PRIORIDADES
  // ============================================
  const prioridades = ref([
    {
      id: 'critica',
      nombre: 'Crítica',
      descripcion: 'Requiere atención inmediata',
      color: '#d32f2f',
      icon: 'emergency',
      nivel: 4,
      slaMultiplier: 0.5, // Reduce el SLA a la mitad
    },
    {
      id: 'alta',
      nombre: 'Alta',
      descripcion: 'Alta prioridad',
      color: '#f57c00',
      icon: 'priority_high',
      nivel: 3,
      slaMultiplier: 0.75,
    },
    {
      id: 'media',
      nombre: 'Media',
      descripcion: 'Prioridad normal',
      color: '#1976d2',
      icon: 'remove',
      nivel: 2,
      slaMultiplier: 1.0,
    },
    {
      id: 'baja',
      nombre: 'Baja',
      descripcion: 'Puede esperar',
      color: '#388e3c',
      icon: 'arrow_downward',
      nivel: 1,
      slaMultiplier: 1.5, // Aumenta el SLA en 50%
    },
  ])

  // ============================================
  // CONFIGURACIÓN DE TIPOS DE SOLICITUD
  // ============================================
  const tiposSolicitud = ref([
    {
      id: 'nuevo_personal',
      nombre: 'Nuevo Personal',
      descripcion: 'Contratación de nuevo personal',
      sla: 35, // días
      icon: 'person_add',
      color: '#1976d2',
    },
    {
      id: 'reemplazo',
      nombre: 'Reemplazo',
      descripcion: 'Reemplazo de personal existente',
      sla: 20, // días
      icon: 'swap_horiz',
      color: '#388e3c',
    },
  ])

  // ============================================
  // CONFIGURACIÓN DE ESTADOS
  // ============================================
  const estados = ref([
    {
      id: 'pendiente',
      nombre: 'Pendiente',
      color: '#9e9e9e',
      icon: 'schedule',
    },
    {
      id: 'en_proceso',
      nombre: 'En Proceso',
      color: '#2196f3',
      icon: 'autorenew',
    },
    {
      id: 'completado',
      nombre: 'Completado',
      color: '#4caf50',
      icon: 'check_circle',
    },
    {
      id: 'rechazado',
      nombre: 'Rechazado',
      color: '#f44336',
      icon: 'cancel',
    },
  ])

  // ============================================
  // COMPUTADOS
  // ============================================

  // Departamentos únicos
  const departamentos = computed(() => {
    const deps = [...new Set(bloques.value.map((b) => b.departamento))]
    return deps.sort()
  })

  // Bloques activos
  const bloquesActivos = computed(() => bloques.value.filter((b) => b.activo))

  // Bloques por departamento
  const bloquesPorDepartamento = computed(() => {
    const grouped = {}
    bloquesActivos.value.forEach((bloque) => {
      const dep = bloque.departamento
      if (!grouped[dep]) {
        grouped[dep] = []
      }
      grouped[dep].push(bloque)
    })
    return grouped
  })

  // Opciones para selects
  const bloquesOptions = computed(() =>
    bloquesActivos.value.map((b) => ({
      label: b.nombre,
      value: b.nombre,
      icon: b.icon,
      color: b.color,
      departamento: b.departamento,
    })),
  )

  const prioridadesOptions = computed(() =>
    prioridades.value.map((p) => ({
      label: p.nombre,
      value: p.nombre,
      icon: p.icon,
      color: p.color,
    })),
  )

  const tiposSolicitudOptions = computed(() =>
    tiposSolicitud.value.map((t) => ({
      label: t.nombre,
      value: t.nombre,
      icon: t.icon,
    })),
  )

  const estadosOptions = computed(() =>
    estados.value.map((e) => ({
      label: e.nombre,
      value: e.id,
      icon: e.icon,
      color: e.color,
    })),
  )

  // ============================================
  // MÉTODOS DE BÚSQUEDA
  // ============================================

  function getBloqueByNombre(nombre) {
    return bloques.value.find((b) => b.nombre === nombre)
  }

  function getPrioridadByNombre(nombre) {
    return prioridades.value.find((p) => p.nombre === nombre)
  }

  function getTipoSolicitudByNombre(nombre) {
    return tiposSolicitud.value.find((t) => t.nombre === nombre)
  }

  function getEstadoById(id) {
    return estados.value.find((e) => e.id === id)
  }

  // ============================================
  // MÉTODOS DE GESTIÓN (para futuro panel admin)
  // ============================================

  function agregarBloque(bloque) {
    bloques.value.push({
      id: bloque.id || bloque.nombre.toLowerCase().replace(/\s+/g, '_'),
      ...bloque,
      activo: true,
    })
  }

  function actualizarBloque(id, datos) {
    const index = bloques.value.findIndex((b) => b.id === id)
    if (index !== -1) {
      bloques.value[index] = { ...bloques.value[index], ...datos }
    }
  }

  function toggleBloqueActivo(id) {
    const bloque = bloques.value.find((b) => b.id === id)
    if (bloque) {
      bloque.activo = !bloque.activo
    }
  }

  function agregarPrioridad(prioridad) {
    prioridades.value.push(prioridad)
    // Ordenar por nivel
    prioridades.value.sort((a, b) => b.nivel - a.nivel)
  }

  function agregarTipoSolicitud(tipo) {
    tiposSolicitud.value.push({
      id: tipo.id || tipo.nombre.toLowerCase().replace(/\s+/g, '_'),
      ...tipo,
    })
  }

  // ============================================
  // CONFIGURACIÓN DE SLA
  // ============================================

  function calcularSLA(tipoSolicitud, prioridad) {
    const tipo = getTipoSolicitudByNombre(tipoSolicitud)
    const prio = getPrioridadByNombre(prioridad)

    if (!tipo) return null

    const slaBase = tipo.sla
    const multiplier = prio?.slaMultiplier || 1.0

    return Math.round(slaBase * multiplier)
  }

  return {
    // Estado
    bloques,
    prioridades,
    tiposSolicitud,
    estados,

    // Computados
    departamentos,
    bloquesActivos,
    bloquesPorDepartamento,
    bloquesOptions,
    prioridadesOptions,
    tiposSolicitudOptions,
    estadosOptions,

    // Métodos de búsqueda
    getBloqueByNombre,
    getPrioridadByNombre,
    getTipoSolicitudByNombre,
    getEstadoById,

    // Métodos de gestión
    agregarBloque,
    actualizarBloque,
    toggleBloqueActivo,
    agregarPrioridad,
    agregarTipoSolicitud,

    // Utilidades
    calcularSLA,
  }
})
