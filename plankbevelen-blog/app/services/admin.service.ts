import http from "@/utils/http-common"

class AdminService {
  async getSession() {
    return await http.get('/api/admin/session')
  }
  async login(username: string, password: string, remember?: boolean) {
    return await http.post('/api/admin/login', { username, password, remember })
  }
  async logout() {
    return await http.post('/api/admin/logout')
  }
}

export default new AdminService()
