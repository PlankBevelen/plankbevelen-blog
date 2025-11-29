import { i18n } from '@/components/i18n/index'
import { useAdminStore } from '@/stores/admin.store'

export default defineNuxtPlugin((nuxtApp) => {
  const admin = useAdminStore()
  const cookieLocale = admin.getLocale
  if (cookieLocale) {
    (i18n.global.locale as any).value = cookieLocale
  }
  nuxtApp.vueApp.use(i18n as any)
})

