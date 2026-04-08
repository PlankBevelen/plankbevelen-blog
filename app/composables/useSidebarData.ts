import { useAsyncData } from 'nuxt/app'
import http from '~/utils/http'

export function useSidebarData() {
  return useAsyncData('sidebar-data', async () => {
    const res = await http.get('/sidebar.data') as any
    if (res?.status === 200) {
      return res.data
    }
    return null
  })
}
