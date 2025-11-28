<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-black text-white" style="border-bottom: 3px solid #ffffff">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <div class="row items-center">
            <div class="text-h6 text-weight-bold" style="letter-spacing: 1px">SINGULA</div>
            <div class="q-ml-sm text-caption text-grey-4" style="font-weight: 300">
              | Control de Indicadores SLA
            </div>
          </div>
        </q-toolbar-title>

        <q-space />

        <q-btn flat round dense icon="notifications" class="q-mr-sm" @click="goToNotifications">
          <q-badge :color="badgeColor" floating v-if="unreadCount > 0" text-color="white">
            {{ unreadCount }}
          </q-badge>

          <q-tooltip>Notificaciones</q-tooltip>
        </q-btn>

        <q-btn flat dense no-caps class="q-mr-sm" @click="goToProfile">
          <div class="row items-center q-px-sm">
            <q-icon name="person_outline" size="sm" class="q-mr-xs" />
            <span class="text-grey-3">{{ userName }}</span>
          </div>
          <q-tooltip>Ver mi perfil</q-tooltip>
        </q-btn>

        <q-btn flat round dense icon="logout" @click="handleLogout">
          <q-tooltip>Cerrar Sesión</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-white"
      style="border-right: 1px solid #e0e0e0"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item-label
            header
            class="text-weight-bold text-black"
            style="font-size: 0.75rem; letter-spacing: 1px"
          >
            MENÚ
          </q-item-label>

          <q-item
            v-for="link in menuLinks"
            :key="link.title"
            :to="link.link"
            clickable
            v-ripple
            exact
            active-class="bg-black text-white"
            class="q-mb-xs rounded-borders"
            style="margin: 4px 8px"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{ link.title }}</q-item-label>
              <q-item-label caption class="text-grey-7">{{ link.caption }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="absolute-bottom q-pa-md text-center" style="border-top: 1px solid #e0e0e0">
          <div class="text-caption text-grey-7">Powered by</div>
          <div class="text-body2 text-weight-bold text-black">Tata Consultancy Services</div>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useNotificationStore } from 'stores/notification-store'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const leftDrawerOpen = ref(false)

const userName = computed(() => authStore.userName)
const isAdmin = computed(() => authStore.user?.role === 'admin')

// --- VARIABLES DEL STORE ---
const unreadCount = computed(() => notificationStore.totalUnread)
const badgeColor = computed(() => notificationStore.badgeStatusColor) // <--- Color dinámico

onMounted(() => {
  notificationStore.fetchAlerts()
})

const menuLinks = computed(() => {
  const links = [
    { title: 'Dashboard', caption: 'Indicadores y KPIs', icon: 'dashboard', link: '/' },
    {
      title: 'Administrar',
      caption: 'Gestionar bloques y solicitudes',
      icon: 'admin_panel_settings',
      link: '/administrar',
    },
    {
      title: 'Análisis Predictivo',
      caption: 'ML y predicciones',
      icon: 'psychology',
      link: '/predictive',
    },
    {
      title: 'Notificaciones',
      caption: 'Alertas y recomendaciones',
      icon: 'notifications',
      link: '/notifications',
    },
    { title: 'Reportes', caption: 'Generar reportes PDF', icon: 'assessment', link: '/reports' },
  ]

  if (isAdmin.value) {
    links.push(
      {
        title: 'Gestión de Usuarios',
        caption: 'Crear y administrar usuarios',
        icon: 'people',
        link: '/users',
      },
      {
        title: 'Configuración',
        caption: 'Gestionar bloques y opciones',
        icon: 'settings',
        link: '/config',
      },
    )
  }

  return links
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function goToProfile() {
  router.push('/profile')
}

function goToNotifications() {
  router.push('/notifications')
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
