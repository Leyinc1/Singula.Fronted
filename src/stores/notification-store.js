import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    alerts: [],
    loading: false,
  }),

  getters: {
    totalUnread: (state) => state.alerts.length,
    criticalAlerts: (state) => state.alerts.filter((a) => a.idTipoAlerta === 2),
    warnings: (state) => state.alerts.filter((a) => a.idTipoAlerta === 1),

    badgeStatusColor: (state) => {
      if (state.alerts.some((a) => a.idTipoAlerta === 2)) return 'negative'
      if (state.alerts.some((a) => a.idTipoAlerta === 1)) return 'warning'
      return 'grey'
    },
  },

  actions: {
    async fetchAlerts() {
      this.loading = true
      try {
        const { data } = await api.get('/alertum/dashboard-resumen')

        this.alerts = data.map((item) => {
          const isIncump = item.idTipoAlerta === 2

          const hoy = new Date()
          const fechaInicio = new Date(item.fechaCreacionSla || item.fechaSolicitud)
          const diffTime = Math.abs(hoy - fechaInicio)
          const diasTranscurridos = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          let daysVal = 0
          if (isIncump) daysVal = diasTranscurridos - item.diasLimite
          else daysVal = item.diasLimite - diasTranscurridos

          if (isIncump) {
            const match = item.mensaje.match(/(\d+) días/)
            daysVal = match ? parseInt(match[1]) : daysVal > 0 ? daysVal : 0
          }

          return {
            id: item.idAlerta,
            idTipoAlerta: item.idTipoAlerta,
            title: isIncump ? 'Incumplimiento de SLA' : item.mensaje.split(':')[0] || 'Riesgo',
            role: item.rolAfectado,
            requestDate: new Date(item.fechaSolicitud).toLocaleDateString('es-PE'),
            creationDateSla: new Date(item.fechaCreacionSla).toLocaleDateString('es-PE'),
            limit: `${item.diasLimite} días`,
            daysValue: daysVal,
            description: item.mensaje,
            icon: isIncump ? 'error' : 'trending_down',
            color: isIncump ? 'negative' : 'warning',
            daysRemaining: !isIncump ? (daysVal > 0 ? daysVal : 0) : 0,
            daysOverdue: isIncump ? daysVal : 0,
          }
        })
      } catch (error) {
        console.error('Error fetching alerts:', error)
      } finally {
        this.loading = false
      }
    },

    async markAsRead(id) {
      try {
        await api.put(`/alertum/marcar-leida/${id}`)

        const index = this.alerts.findIndex((a) => a.id === id)
        if (index !== -1) this.alerts.splice(index, 1)

        return true
      } catch (error) {
        console.error(error)
        return false
      }
    },

    async markAllIncumplimientosRead() {
      try {
        await api.put('/alertum/marcar-todos-incumplimientos')

        // Filtramos localmente para quitar solo los incumplimientos (ID 2)
        this.alerts = this.alerts.filter((a) => a.idTipoAlerta !== 2)

        return true
      } catch (error) {
        console.error(error)
        return false
      }
    },

    clearAll() {
      this.alerts = []
    },
  },
})
