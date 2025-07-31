import http from '@/utils/http-common'
import type { LikeResponse, BatchLikeStatus } from '~/types/talk';

// 点赞服务类
class LikeService {
  // 切换点赞状态
  async toggleLike(userId: number, talkId: number): Promise<LikeResponse> {
    if (!userId || !talkId) {
      throw new Error('用户ID和说说ID不能为空')
    }
    
    try {
      const response = await http.post('/like/toggle', {
        user_id: userId,
        talk_id: talkId
      })
      
      if (!response.data.success) {
        throw new Error(response.data.message || '操作失败')
      }
      
      return response.data.data as LikeResponse
    } catch (error: any) {
      console.error('切换点赞状态失败:', error)
      throw new Error(error.response?.data?.message || error.message || '网络错误，请重试')
    }
  }

  // 获取点赞状态
  async getLikeStatus(userId: number, talkId: number): Promise<LikeResponse> {
    if (!userId || !talkId) {
      throw new Error('用户ID和说说ID不能为空')
    }
    
    try {
      const response = await http.get('/like/status', {
        params: {
          user_id: userId,
          talk_id: talkId
        }
      })
      
      if (!response.data.success) {
        throw new Error(response.data.message || '获取状态失败')
      }
      
      return response.data.data as LikeResponse
    } catch (error: any) {
      console.error('获取点赞状态失败:', error)
      throw new Error(error.response?.data?.message || error.message || '网络错误，请重试')
    }
  }

  // 批量获取点赞状态
  async getBatchLikeStatus(userId: number, talkIds: number[]): Promise<BatchLikeStatus> {
    if (!userId || !talkIds || !Array.isArray(talkIds) || talkIds.length === 0) {
      throw new Error('参数错误')
    }
    
    try {
      const response = await http.post('/like/batch-status', {
        user_id: userId,
        talk_ids: talkIds
      })
      
      if (!response.data.success) {
        throw new Error(response.data.message || '获取状态失败')
      }
      
      return response.data.data as BatchLikeStatus
    } catch (error: any) {
      console.error('批量获取点赞状态失败:', error)
      throw new Error(error.response?.data?.message || error.message || '网络错误，请重试')
    }
  }
}

export default new LikeService()