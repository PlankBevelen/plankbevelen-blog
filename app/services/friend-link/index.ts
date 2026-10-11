import http from '~/utils/http'
import type { FriendLink, FriendLinkSelf } from '@/types/data/friend-link'
import type {
  FriendLinkAdminListQuery,
  FriendLinkAdminWritePayload,
  FriendLinkSelfUpdatePayload,
  FriendLinkSubmitPayload,
} from '@/types/request/friend-link'

class FriendLinkService {
  getPublic() {
    return http.get<FriendLink[]>('/friend-link')
  }

  submit(payload: FriendLinkSubmitPayload) {
    return http.post<FriendLink | null>('/friend-link', payload)
  }

  getSelf() {
    return http.get<FriendLinkSelf>('/friend-link/self')
  }

  adminUpdateSelf(payload: FriendLinkSelfUpdatePayload) {
    return http.put<FriendLinkSelf>('/admin/friend-link/self', payload)
  }

  adminList(params: FriendLinkAdminListQuery = {}) {
    return http.getPage<FriendLink[]>('/admin/friend-link', params)
  }

  adminCreate(payload: FriendLinkAdminWritePayload) {
    return http.post<FriendLink>('/admin/friend-link', payload)
  }

  adminUpdate(id: string | number, payload: FriendLinkAdminWritePayload) {
    return http.put<FriendLink>(`/admin/friend-link/${id}`, payload)
  }

  adminDelete(id: string | number) {
    return http.delete<null>(`/admin/friend-link/${id}`)
  }
}

export default new FriendLinkService()
