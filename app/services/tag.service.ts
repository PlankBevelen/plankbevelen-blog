import http from "~/utils/http"

class TagService {
  async getTags() {
    return await http.get('/api/tag')
  }
  async syncTags(add: string[] = [], remove: string[] = []) {
    return await http.post('/api/tag/sync', { add, remove })
  }
}

export default new TagService()
