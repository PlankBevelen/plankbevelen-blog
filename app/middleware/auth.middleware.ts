import { useAdminStore } from '~/stores/admin.store'

export default defineNuxtRouteMiddleware(async (to) => {

  if (!to.path.startsWith('/admin')) {
    return
  }
  if (to.path === '/admin/login') {
    // 如果已登录，跳转到控制台
    if (useAdminStore().isAuthenticated) {
      return navigateTo('/admin', { replace: true })
    }
    return
  }
  if(to.path.startsWith('/admin')) {
    // 如果未登录，跳转到登录页
    if (!useAdminStore().isAuthenticated) {
      return navigateTo('/admin/login', { replace: true })
    }
    return
  }
})
