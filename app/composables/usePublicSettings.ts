import siteService from '@/services/site'
import type { PublicSettings } from '@/types/data/site'

export type { PublicSettings }

/** 非敏感运行配置（Mongo 配置中心下发） */
export async function fetchPublicSettings(): Promise<PublicSettings | null> {
  try {
    return await siteService.getPublicSettings()
  } catch {
    return null
  }
}

export function usePublicSettings() {
  const config = useRuntimeConfig()
  return useAsyncData(
    'public-settings',
    async () => {
      const data = await fetchPublicSettings()
      if (data) return data
      return {
        cookiePrefix: String(config.public.cookiePrefix || 'plankbevelen_'),
        sessionExpirationSeconds: Number(config.public.expirationTime || 43200),
        sessionKeepAliveSeconds: Number(config.public.keepAliveTime || 604800),
        agentChatUrl: String(config.public.agentChatUrl || ''),
        agentHealthUrl: String(config.public.agentHealthUrl || ''),
        friendLinkApplyEnabled: true,
        baseUrl: String(config.public.baseUrl || '/'),
        turnstileSiteKey: '',
      } satisfies PublicSettings
    },
    { server: true }
  )
}
