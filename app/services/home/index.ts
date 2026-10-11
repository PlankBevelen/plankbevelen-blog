import http from '~/utils/http'
import type { HomeDataResponse, SidebarDataResponse } from '@/types/response/home'

class HomeService {
  getHomeData() {
    return http.get<HomeDataResponse>('/home.data')
  }

  getSidebarData() {
    return http.get<SidebarDataResponse>('/sidebar.data')
  }
}

export default new HomeService()
