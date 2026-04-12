import type { ApiResponse } from '~/types/api'
import http from '~/utils/http'

class SiteService {
  async getInfo() {
    return await http.get<ApiResponse>('/admin/site/info')
  }

  async getMetrics() {
    return await http.get<ApiResponse>('/admin/site/data')
  }
}

export default new SiteService()
