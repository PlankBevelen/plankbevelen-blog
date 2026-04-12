export default defineNuxtPlugin(async (nuxtApp) => {
  if (process.client) {
    try {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      return {
        provide: {
          gsap,
          ScrollTrigger
        }
      }
    } catch (e) {
      // 动态加载失败时静默降级
    }
  }
  return {}
})