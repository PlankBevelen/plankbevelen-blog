import type { ApiResponse } from '~/types/api'
import type { SiteContent, VisitLogResponse } from '~/types/site'
import http from '~/utils/http'

class SiteService {
  async getContent() {
    return await http.get<ApiResponse<SiteContent>>('/site/content')
  }

  async getInfo() {
    return await http.get<ApiResponse>('/admin/site/info')
  }

  async getMetrics() {
    return await http.get<ApiResponse>('/admin/site/data')
  }

  async getAdminContent() {
    return await http.get<ApiResponse<SiteContent>>('/admin/site/content')
  }

  async updateAdminContent(payload: SiteContent) {
    return await http.put<ApiResponse<SiteContent>>('/admin/site/content', payload)
  }

  async getVisitLogs(params?: Record<string, any>) {
    return await http.get<ApiResponse<VisitLogResponse>>('/admin/site/logs', params)
  }
}

export default new SiteService()
