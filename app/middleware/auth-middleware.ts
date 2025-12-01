import { useAdminStore } from '~/stores/admin.store'

export default defineNuxtRouteMiddleware(async (to) => {

  if (!to.path.startsWith('/admin')) {
    return
  }
  if (to.path === '/admin/login') {
    if (useAdminStore().isAuthenticated) {
      return navigateTo('/admin', { replace: true })
    }
    return
  }
  if(to.path.startsWith('/admin')) {
    if (!useAdminStore().isAuthenticated) {
      return navigateTo('/admin/login', { replace: true })
    }
    return
  }
})
