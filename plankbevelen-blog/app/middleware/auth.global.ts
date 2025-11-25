import adminService from "~/services/admin.service"
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') {
    try {
      await adminService.getSession()
      return navigateTo('/admin', { redirectCode: 302 })
    } catch {
      return
    }
  }

  if (to.path.startsWith('/admin')) {
    try {
      await adminService.getSession()
    } catch {
      if (to.path !== '/admin/login') {
        return navigateTo('/admin/login')
      }
    }
  }
})
