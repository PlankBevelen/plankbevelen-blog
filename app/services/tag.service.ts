import http from "~/utils/http"

class TagService {
  async getTags() {
    return await http.get('/tag')
  }
  async syncTags(add: string[] = [], remove: string[] = []) {
    return await http.post('/tag/sync', { add, remove })
  }
}

export default new TagService()
