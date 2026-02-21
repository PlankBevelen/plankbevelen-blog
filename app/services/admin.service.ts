import http from "~/utils/http"

class AdminService {
  async login( account: string, password: string, keepAlive?: boolean ) {
    return await http.post('/admin/login', { account, password, keepAlive })
  }
  async logout() {
    return await http.post('/admin/logout')
  }
}

export default new AdminService()
