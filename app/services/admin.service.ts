import http from "~/utils/http"
import type { ApiResponse } from "~/types/api"

class AdminService {
  async login( account: string, password: string, keepAlive?: boolean ) {
    return await http.post<ApiResponse<{ token: string }>>('/admin/login', { account, password, keepAlive })
  }
  async logout() {
    return await http.post<ApiResponse>('/admin/logout')
  }
}

export default new AdminService()
