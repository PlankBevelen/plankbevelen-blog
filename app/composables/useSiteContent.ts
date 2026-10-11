import { useAsyncData } from 'nuxt/app'
import siteService from '@/services/site'
import type { SiteContent } from '@/types/data/site'

const EMPTY_SITE_CONTENT: SiteContent = {
  about: {
    zh: '',
    en: '',
  },
  pages: {
    about: { zh: '', en: '' },
    timeline: { zh: '', en: '' },
    project: { zh: '', en: '' },
  },
  timeline: [],
  projects: [],
  updatedAt: null,
}

export function useSiteContent() {
  return useAsyncData<SiteContent>('site-content-public', async () => {
    try {
      return await siteService.getContent()
    } catch {
      return EMPTY_SITE_CONTENT
    }
  })
}
