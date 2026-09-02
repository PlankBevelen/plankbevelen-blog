import http from '~/utils/http'
import type { ApiResponse } from '~/types/api'
import type { FriendLink, FriendLinkSelf, FriendLinkSubmitPayload } from '~/types/friend-link'

class FriendLinkService {
  /** 公开：已通过的友链列表 */
  async getPublic() {
    return await http.get<ApiResponse<FriendLink[]>>('/friend-link')
  }

  /** 公开：申请友链（含验证码） */
  async submit(payload: FriendLinkSubmitPayload) {
    return await http.post<ApiResponse<FriendLink>>('/friend-link', payload)
  }

  /** 获取验证码（复用 /admin/captcha，公开豁免） */
  async captcha() {
    return await http.get<{ status: number; captchaId: string; image: string }>('/admin/captcha')
  }

  /** 公开：本站友链信息 */
  async getSelf() {
    return await http.get<ApiResponse<FriendLinkSelf>>('/friend-link/self')
  }

  /** 管理员：更新本站友链信息 */
  async adminUpdateSelf(payload: Partial<FriendLinkSelf>) {
    return await http.put<ApiResponse<FriendLinkSelf>>('/admin/friend-link/self', payload)
  }

  async adminList(params: { page?: number; limit?: number; status?: string } = {}) {
    return await http.get<ApiResponse<FriendLink[]>>('/admin/friend-link', params)
  }

  async adminCreate(payload: Partial<FriendLink>) {
    return await http.post<ApiResponse<FriendLink>>('/admin/friend-link', payload)
  }

  async adminUpdate(id: string | number, payload: Partial<FriendLink>) {
    return await http.put<ApiResponse<FriendLink>>(`/admin/friend-link/${id}`, payload)
  }

  async adminDelete(id: string | number) {
    return await http.delete<ApiResponse>(`/admin/friend-link/${id}`)
  }
}

export default new FriendLinkService()
