import { useAsyncData } from 'nuxt/app'
import homeService from '@/services/home'

export function useSidebarData() {
  return useAsyncData('sidebar-data', async () => {
    try {
      return await homeService.getSidebarData()
    } catch {
      return null
    }
  }, {
    getCachedData(key) {
      const cached = useNuxtApp().payload.data[key]
      return cached === undefined ? undefined : cached
    },
  })
}
