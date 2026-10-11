import http from '~/utils/http'
import type {
  PublicSettings,
  RuntimeSettingsAdminView,
  SiteContent,
} from '@/types/data/site'
import type { RuntimeSettingsUpdatePayload, VisitLogQuery } from '@/types/request/site'
import type {
  SiteInfoResponse,
  SiteMetricsResponse,
  VisitLogResponse,
} from '@/types/response/site'

class SiteService {
  getContent() {
    return http.get<SiteContent>('/site/content')
  }

  getPublicSettings() {
    return http.get<PublicSettings>('/site/public-settings')
  }

  getInfo() {
    return http.get<SiteInfoResponse>('/admin/site/info')
  }

  getMetrics() {
    return http.get<SiteMetricsResponse>('/admin/site/data')
  }

  getAdminContent() {
    return http.get<SiteContent>('/admin/site/content')
  }

  updateAdminContent(payload: SiteContent) {
    return http.put<SiteContent>('/admin/site/content', payload)
  }

  getVisitLogs(params?: VisitLogQuery) {
    return http.get<VisitLogResponse>('/admin/site/logs', params)
  }

  getRuntimeSettings() {
    return http.get<RuntimeSettingsAdminView>('/admin/site/settings')
  }

  updateRuntimeSettings(payload: RuntimeSettingsUpdatePayload) {
    return http.put<RuntimeSettingsAdminView>('/admin/site/settings', payload)
  }
}

export default new SiteService()
