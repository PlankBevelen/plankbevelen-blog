import http from "@/utils/http-common"

class AdminService {
  async login( account: string, password: string, keepAlive?: boolean ) {
    return await http.post('/api/admin/login', { account, password, keepAlive })
  }
  async logout() {
    return await http.post('/api/admin/logout')
  }
}

export default new AdminService()
