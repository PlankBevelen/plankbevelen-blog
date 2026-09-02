import type { ApiResponse } from "~/types/api"
import http from "~/utils/http"

class TagService {
  async getTags() {
    return await http.get<ApiResponse>('/tag')
  }
  async syncTags(add: string[] = [], remove: string[] = []) {
    return await http.post<ApiResponse>('/tag/sync', { add, remove })
  }
}

export default new TagService()
