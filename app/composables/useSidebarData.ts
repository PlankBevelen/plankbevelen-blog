import { useAsyncData } from 'nuxt/app'
import homeService from '@/services/home'

export function useSidebarData() {
  return useAsyncData('sidebar-data', async () => {
    try {
      return await homeService.getSidebarData()
    } catch {
      return null
    }
  })
}
