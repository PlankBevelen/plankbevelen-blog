import { useAsyncData } from 'nuxt/app'
import siteService from '@/services/site.service'
import type { SiteContent } from '@/types/site'

const EMPTY_SITE_CONTENT: SiteContent = {
  about: {
    zh: '',
    en: ''
  },
  pages: {
    about: { zh: '', en: '' },
    timeline: { zh: '', en: '' },
    project: { zh: '', en: '' }
  },
  timeline: [],
  projects: [],
  updatedAt: null
}

export function useSiteContent() {
  return useAsyncData<SiteContent>('site-content-public', async () => {
    const res: any = await siteService.getContent()
    return res?.data || EMPTY_SITE_CONTENT
  })
}
