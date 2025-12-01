import http from '@/utils/http-common'

export default defineNuxtPlugin(() => {
  if (process.server) {
    const origin = useRequestURL().origin
    ;(http as any).defaults.baseURL = origin
  } else {
    const origin = window.location.origin
    ;(http as any).defaults.baseURL = origin
  }
})
