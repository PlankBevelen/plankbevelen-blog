import { i18n } from '@/components/i18n/index'
import { useAdminStore } from '@/stores/admin.store'

export default defineNuxtPlugin((nuxtApp) => {
  function deepMerge(target: any, source: any): any {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {}
        deepMerge(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
    return target
  }
  const modules = import.meta.glob('@/components/i18n/modules/*.json', { eager: true })
  Object.keys(modules).forEach((p) => {
    const m: any = (modules as any)[p]
    if (m?.cn || m?.default?.cn) {
      const cnData = m.cn || m.default.cn
      i18n.global.mergeLocaleMessage('cn', deepMerge({}, cnData))
    }
    if (m?.en || m?.default?.en) {
      const enData = m.en || m.default.en
      i18n.global.mergeLocaleMessage('en', deepMerge({}, enData))
    }
  })
  const admin = useAdminStore()
  const cookieLocale = admin.getLocale
  if (cookieLocale) {
    (i18n.global.locale as any).value = cookieLocale
  }
  nuxtApp.vueApp.use(i18n as any)
})

