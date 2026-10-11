import http from '~/utils/http'
import type { Tag } from '@/types/data/tag'
import type { TagSyncRequest } from '@/types/request/tag'

class TagService {
  getTags() {
    return http.get<Tag[]>('/tag')
  }

  syncTags(add: string[] = [], remove: string[] = []) {
    const body: TagSyncRequest = { add, remove }
    return http.post<null>('/tag/sync', body)
  }
}

export default new TagService()
