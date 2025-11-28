import ElementPlus, { ID_INJECTION_KEY, ZINDEX_INJECTION_KEY } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import enUS from 'element-plus/es/locale/lang/en'
import { i18n } from '@/components/i18n/index'
import { useAuthentication } from '@/composables/useAuthentication'

export default defineNuxtPlugin((nuxtApp) => {  
  nuxtApp.vueApp.provide(ID_INJECTION_KEY, { prefix: 1024, current: 0 })  // 解决element-plus组件id重复问题
  nuxtApp.vueApp.provide(ZINDEX_INJECTION_KEY, { current: 0 })
  const { getI18n } = useAuthentication()
  const cookie = getI18n()
  if (cookie) {
    (i18n.global.locale as any).value = cookie
  }
  const current = (i18n.global.locale as any).value ?? (i18n.global.locale as any)
  nuxtApp.vueApp.use(ElementPlus, { locale: current === 'en' ? enUS : zhCn })
})
