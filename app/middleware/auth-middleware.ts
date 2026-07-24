import { useAdminStore } from '~/stores/admin.store'

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin')) return

  const adminStore = useAdminStore()
  adminStore.hydrateAuth()

  if (to.path === '/admin/login') {
    if (adminStore.isAuthenticated) {
      return navigateTo('/admin', { replace: true })
    }
    return
  }

  if (!adminStore.isAuthenticated) {
    return navigateTo('/admin/login', { replace: true })
  }
})
