import { defineStore } from 'pinia'
import likeService from '~/services/likeService'

import { useUserStore } from './user'
import { ElMessage } from 'element-plus'

interface LikeState {
  isLiked: boolean
  count: number
  loading: boolean
}

export const useLikeStore = defineStore('like', {
  state: () => ({
    likeStates: {} as Record<number, LikeState>
  }),
  
  getters: {
    // 获取指定说说的点赞状态
    getLikeState: (state) => (talkId: number): LikeState => {
      return state.likeStates[talkId] || {
        isLiked: false,
        count: 0,
        loading: false
      }
    },
    
    // 获取所有点赞状态
    getAllLikeStates: (state) => state.likeStates
  },
  
  actions: {
    // 设置点赞状态
    setLikeState(talkId: number, state: Partial<LikeState>) {
      if (!this.likeStates[talkId]) {
        this.likeStates[talkId] = {
          isLiked: false,
          count: 0,
          loading: false
        }
      }
      Object.assign(this.likeStates[talkId], state)
    },
    
    // 切换点赞状态
    async toggleLike(talkId: number): Promise<boolean> {
      const userStore = useUserStore()
      
      if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        return false
      }
      
      // 设置加载状态
      this.setLikeState(talkId, { loading: true })
      
      try {
        const result = await likeService.toggleLike(userStore.userInfo.id, talkId)
        console.log("切换点赞", result);
        
        // 更新状态
        this.setLikeState(talkId, {
          isLiked: result.isLiked,
          count: result.count,
          loading: false
        })
        
        ElMessage.success(result.isLiked ? '点赞成功' : '取消点赞成功')
        return true
        
      } catch (error) {
        console.error('点赞操作失败:', error)
        this.setLikeState(talkId, { loading: false })
        ElMessage.error('操作失败，请重试')
        return false
      }
    },
    
    // 获取单个说说的点赞状态
    async fetchLikeStatus(talkId: number): Promise<void> {
      const userStore = useUserStore()
      
      if (!userStore.isLoggedIn) {
        return
      }
      
      try {
        const result = await likeService.getLikeStatus(userStore.userInfo.id, talkId)
        
        this.setLikeState(talkId, {
          isLiked: result.isLiked,
          count: result.count
        })
        
      } catch (error) {
        console.error('获取点赞状态失败:', error)
      }
    },
    
    // 批量获取点赞状态
    async fetchBatchLikeStatus(talkIds: number[]): Promise<void> {
      const userStore = useUserStore()
      
      if (!userStore.isLoggedIn || talkIds.length === 0) {
        return
      }
      
      try {
        const result = await likeService.getBatchLikeStatus(userStore.userInfo.id, talkIds)
        
        // 更新所有状态
        Object.entries(result).forEach(([talkId, likeData]) => {
          this.setLikeState(Number(talkId), {
            isLiked: likeData.isLiked,
            count: likeData.count
          })
        })
        
      } catch (error) {
        console.error('批量获取点赞状态失败:', error)
      }
    },
    
    // 清空所有状态
    clearAllStates() {
      this.likeStates = {}
    },
    
    // 移除指定说说的状态
    removeLikeState(talkId: number) {
      delete this.likeStates[talkId]
    }
  }
})