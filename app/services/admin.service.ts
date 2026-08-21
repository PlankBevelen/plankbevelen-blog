import http from "~/utils/http"
import type { ApiResponse } from "~/types/api"

class AdminService {
  async login(account: string, password: string, remember: boolean, captchaId: string, captchaCode: string) {
    return await http.post<ApiResponse>('/admin/login', { account, password, remember, captchaId, captchaCode })
  }
  async logout() {
    return await http.post<ApiResponse>('/admin/logout')
  }
  async session() {
    return await http.get<any>('/admin/session')
  }
  async captcha() {
    return await http.get<any>('/admin/captcha')
  }
}

export default new AdminService()
