import { defineStore } from 'pinia'
import commentService  from '~/services/commentService'
import { useUserStore } from './user'
import { ElMessage } from 'element-plus'

interface CommentState {
  count: number
  loading: boolean
}

export const useCommentStore = defineStore('comment', {
  state: () => ({
    commentLists: {} as Record<number, any[]>, // 每个说说的评论列表
    commentStates: {} as Record<number, CommentState>
  }),
  
  getters: {
    // 获取指定说说的评论状态
    getCommentState: (state) => (talkId: number): CommentState => {
      return state.commentStates[talkId] || {
        count: 0,
        loading: false
      }
    },
    
    // 获取所有评论状态
    getAllCommentStates: (state) => state.commentStates,
    
    // 获取指定说说的评论列表
    getCommentList: (state) => (talkId: number) => {
        console.log(state.commentLists[talkId]);
      return state.commentLists[talkId] || []
    }
  },
  
  actions: {
    // 设置评论状态
    setCommentState(talkId: number, state: Partial<CommentState>) {
      if (!this.commentStates[talkId]) {
        this.commentStates[talkId] = {
          count: 0,
          loading: false
        }
      }
      Object.assign(this.commentStates[talkId], state)
    },
    
    async addComment(talkId: number, content: string): Promise<{ success: boolean; commentCount?: number } | null> {
      const userStore = useUserStore()
      
      if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        return null
      }
      
      // 设置加载状态
      this.setCommentState(talkId, { loading: true })
      
      try {
        const result = await commentService.comment( userStore.userInfo.id, talkId, content)
        
        if (result && result.commentCount) {
          // 更新评论状态
          this.setCommentState(talkId, {
            count: result.commentCount,
            loading: false
          })
          
          // 添加新评论到评论列表
          if (!this.commentLists[talkId]) {
            this.commentLists[talkId] = []
          }
          this.commentLists[talkId].unshift({
            userId: userStore.userInfo.id,
            avatar: userStore.userInfo?.avatar || '',
            nickname: userStore.userInfo?.nickname || '',
            content,
            created_at: new Date().toISOString()
          })
          
          ElMessage.success('评论成功')
          return {
            success: true,
            commentCount: result.commentCount
          }
        }
        
        this.setCommentState(talkId, { loading: false })
        return null
      } catch (error) {
        console.error('评论失败:', error)
        this.setCommentState(talkId, { loading: false })
        ElMessage.error('评论失败，请重试')
        return null
      }
    },
    
    // 设置评论列表
    setCommentList(talkId: number, comments: any[]) {
      this.commentLists[talkId] = comments
    },
    
    // 清空所有状态
    clearAllStates() {
      this.commentStates = {}
      this.commentLists = {}
    },
    
    // 移除指定说说的状态
    removeCommentState(talkId: number) {
      delete this.commentStates[talkId]
      delete this.commentLists[talkId]
    }
  }
})