import http from '~/utils/http'
import type { AdminDashboardResponse, AdminSessionResponse } from '@/types/response/admin'

class AdminService {
  login(
    account: string,
    password: string,
    remember: boolean,
    _captchaId: string,
    turnstileToken: string
  ) {
    return http.post<null>('/admin/login', {
      account,
      password,
      remember,
      turnstileToken,
    })
  }

  logout() {
    return http.post<null>('/admin/logout')
  }

  session() {
    return http.get<AdminSessionResponse>('/admin/session')
  }

  getDashboard() {
    return http.get<AdminDashboardResponse>('/admin/dashboard')
  }
}

export default new AdminService()
