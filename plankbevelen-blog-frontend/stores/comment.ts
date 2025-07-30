import { ElMessage } from "element-plus";
import { defineStore } from "pinia";
import commetService from "~/services/commetService";
import type { TalkComment } from "~/types/talk";

export const useCommentStore = defineStore('comment', {
    state: () => ({
        commentList: {} as Record<number, TalkComment[]>
    }),
    getters: {
        // 获取指定说说的所有评论
        getComments: (state) => (talkId: number) => {
            return state.commentList[talkId] || []
        }
    },
    actions: {
        // 添加评论
        async addComment(userId: number, talkId: number, content: string) {
            /* const comment: TalkComment = {
                userId,
                talkId,
                content,
            }
            // 将评论添加到指定说说的评论列表中
            if (!this.commentList[talkId]) {
                this.commentList[talkId] = []
            }
            this.commentList[talkId].push(comment) */
            const userStore = useUserStore()
      
            if (!userStore.isLoggedIn) {
                ElMessage.warning('请先登录')
                return false
            }

            try {
                const res = await commetService.comment(userId, talkId, content);
                console.log(res);
            } catch (err) {
                ElMessage.error('评论失败')
            }
        }
    }
})