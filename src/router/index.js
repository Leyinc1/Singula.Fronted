import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/authStore'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Protección de rutas
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)

    // Rutas públicas
    const publicRoutes = ['/login', '/register']
    if (publicRoutes.includes(to.path)) {
      // Si ya está autenticado y va a login/register, redirigir al dashboard
      if (authStore.isAuthenticated) {
        next('/')
      } else {
        next()
      }
      return
    }

    // Si requiere autenticación
    if (requiresAuth) {
      if (!authStore.isAuthenticated) {
        // Redirigir a login si no está autenticado
        next('/login')
        return
      }

      // Si requiere admin
      if (requiresAdmin && authStore.userRole !== 'admin') {
        // Redirigir al dashboard si no es admin
        next('/')
        return
      }
    }

    next()
  })

  return Router
})
