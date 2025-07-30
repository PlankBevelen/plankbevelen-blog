import http from '@/utils/http-common'
import type { LikeResponse, BatchLikeStatus } from '~/types/talk';

// 点赞服务类
class LikeService {
  // 切换点赞状态
  async toggleLike(userId: number, talkId: number): Promise<LikeResponse> {
    try {
      const response = await http.post('/like/toggle', {
        user_id: userId,
        talk_id: talkId
      })
      console.log("点赞响应", response.data.data);
      return response.data.data as LikeResponse
    } catch (error) {
      console.error('切换点赞状态失败:', error)
      throw error
    }
  }

  // 获取点赞状态
  async getLikeStatus(userId: number, talkId: number): Promise<LikeResponse> {
    try {
      const response = await http.get('/like/status', {
        params: {
          user_id: userId,
          talk_id: talkId
        }
      })
      return response.data.data as LikeResponse
    } catch (error) {
      console.error('获取点赞状态失败:', error)
      throw error
    }
  }

  // 批量获取点赞状态
  async getBatchLikeStatus(userId: number, talkIds: number[]): Promise<BatchLikeStatus> {
    try {
      const response = await http.post('/like/batch-status', {
        user_id: userId,
        talk_ids: talkIds
      })
      return response.data.data as BatchLikeStatus
    } catch (error) {
      console.error('批量获取点赞状态失败:', error)
      throw error
    }
  }
}

export default new LikeService()