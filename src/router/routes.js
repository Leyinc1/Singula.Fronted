const routes = [
  // Ruta de Login (sin layout)
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue'),
  },

  // Rutas protegidas (con layout)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
      },
      {
        path: 'administrar',
        name: 'administrar',
        component: () => import('pages/AdministrarPage.vue'),
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('pages/ReportsPage.vue'),
      },
      {
        path: 'predictive',
        name: 'predictive',
        component: () => import('pages/PredictivePage.vue'),
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: () => import('pages/NotificationsPage.vue'),
      },
      {
        path: 'notification-email',
        name: 'notification-email',
        component: () => import('pages/NotificacionEmailPage.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('pages/ProfilePage.vue'),
      },
      {
        path: 'config',
        name: 'config',
        component: () => import('pages/ConfigPage.vue'),
        meta: { requiresAdmin: true }, // Solo para administradores
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
