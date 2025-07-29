import { defineNuxtPlugin } from '#app'
import ElementPlus, { ZINDEX_INJECTION_KEY, ID_INJECTION_KEY } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

export default defineNuxtPlugin((nuxtApp) => {
  // 提供z-index注入键以支持服务端渲染
  nuxtApp.vueApp.provide(ZINDEX_INJECTION_KEY, { current: 2000 })
  
  // 提供ID注入键以支持服务端渲染
  nuxtApp.vueApp.provide(ID_INJECTION_KEY, {
    prefix: 1024,
    current: 0
  })
  
  nuxtApp.vueApp.use(ElementPlus, {
    locale: zhCn
  })
})
